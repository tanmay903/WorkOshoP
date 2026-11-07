import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import WorkerProfile from '../models/WorkerProfile.js';
import { sendNotification } from '../utils/sendNotification.js';

// @desc    Submit review for a completed booking
// @route   POST /api/reviews
// @access  Private (Customer)
export const createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Booking ID, rating (1-5), and written comment are required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify caller is the customer who made the booking
    if (booking.customerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the customer of this booking can leave a review' });
    }

    // Enforce booking must be 'Completed'
    if (booking.status !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'You can only review a service after the booking is marked as Completed.',
      });
    }

    // Enforce duplicate prevention
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already submitted a review for this booking' });
    }

    const review = await Review.create({
      customerId: req.user.id,
      workerId: booking.workerId,
      bookingId,
      rating: Number(rating),
      comment,
    });

    // Mark booking as reviewed
    booking.reviewed = true;
    await booking.save();

    // Notify worker
    await sendNotification({
      userId: booking.workerId,
      title: 'New Customer Review Received!',
      message: `${req.user.name} rated your service ${rating} stars: "${comment.slice(0, 50)}..."`,
      type: 'review',
      link: '/worker-dashboard',
    });

    res.status(201).json({ success: true, message: 'Review submitted successfully', data: review });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews for a worker
// @route   GET /api/reviews/worker/:workerId
// @access  Public
export const getWorkerReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ workerId: req.params.workerId })
      .populate('customerId', 'name profileImage')
      .sort({ createdAt: -1 });

    const formatted = reviews.map((r) => ({
      id: r._id.toString(),
      customerName: r.customerId?.name || 'Customer',
      customerAvatar: r.customerId?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      rating: r.rating,
      date: r.createdAt?.toISOString().split('T')[0],
      comment: r.comment,
    }));

    res.status(200).json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    next(error);
  }
};

