import Booking from '../models/Booking.js';
import User from '../models/User.js';
import { sendNotification } from '../utils/sendNotification.js';

// @desc    Create a new booking (hire worker)
// @route   POST /api/bookings
// @access  Private (Customer)
export const createBooking = async (req, res, next) => {
  try {
    const {
      workerId,
      jobId,
      serviceTitle,
      serviceDate,
      serviceTime,
      location,
      instructions,
      amount,
      estimatedAmount,
    } = req.body;

    if (!location || !location.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Work location / address is required to hire a worker.',
      });
    }

    const worker = await User.findById(workerId);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    const booking = await Booking.create({
      customerId: req.user.id,
      workerId,
      jobId: jobId || undefined,
      serviceTitle: serviceTitle || 'General Service',
      serviceDate,
      serviceTime: serviceTime || '10:00 AM',
      location: location.trim(),
      instructions,
      amount: Number(amount || estimatedAmount) || 500,
      status: 'Pending',
    });

    // Notify worker
    await sendNotification({
      userId: workerId,
      title: 'New Service Booking Request',
      message: `${req.user.name} booked "${booking.serviceTitle}" for ${serviceDate} at ${serviceTime}.`,
      type: 'booking',
      link: '/bookings',
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bookings (role-aware: customer gets their bookings, worker gets their orders, admin gets all)
// @route   GET /api/bookings
// @access  Private
export const getBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = {};

    if (req.user.role === 'customer') {
      query.customerId = req.user.id;
    } else if (req.user.role === 'worker') {
      query.workerId = req.user.id;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('customerId', 'name email phone profileImage')
      .populate('workerId', 'name email phone profileImage')
      .sort({ createdAt: -1 });

    const formatted = bookings.map((b) => ({
      id: b._id.toString(),
      _id: b._id,
      bookingNumber: b.bookingNumber,
      serviceTitle: b.serviceTitle,
      serviceDate: b.serviceDate,
      serviceTime: b.serviceTime,
      address: b.location,
      location: b.location,
      instructions: b.instructions,
      estimatedAmount: b.amount,
      amount: b.amount,
      status: b.status,
      reviewed: b.reviewed,
      createdAt: b.createdAt,
      customerId: b.customerId?._id,
      customerName: b.customerId?.name,
      customerPhone: b.customerId?.phone,
      workerId: b.workerId?._id,
      workerName: b.workerId?.name,
      workerAvatar: b.workerId?.profileImage,
      workerPhone: b.workerId?.phone,
    }));

    res.status(200).json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking details
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customerId', 'name email phone profileImage')
      .populate('workerId', 'name email phone profileImage');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Authorization check: participant or admin
    if (
      booking.customerId._id.toString() !== req.user.id &&
      booking.workerId._id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status (Accept, Reject, Start, Complete, Cancel)
// @route   PUT /api/bookings/:id/status
// @access  Private
export const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isCustomer = booking.customerId.toString() === req.user.id;
    const isWorker = booking.workerId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isWorker && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this booking' });
    }

    // Role specific action validation
    if (['Accepted', 'Rejected'].includes(status) && !isWorker && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Only assigned worker can Accept or Reject booking.' });
    }

    booking.status = status;
    await booking.save();

    // Trigger alerts to opposing party
    const targetUserId = isWorker ? booking.customerId : booking.workerId;
    await sendNotification({
      userId: targetUserId,
      title: `Booking ${status}`,
      message: `Booking #${booking.bookingNumber} for "${booking.serviceTitle}" is now ${status}.`,
      type: 'booking',
      link: '/bookings',
    });

    res.status(200).json({ success: true, message: `Booking status changed to ${status}`, data: booking });
  } catch (error) {
    next(error);
  }
};

