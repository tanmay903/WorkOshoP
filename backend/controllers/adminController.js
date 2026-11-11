import User from '../models/User.js';
import WorkerProfile from '../models/WorkerProfile.js';
import Job from '../models/Job.js';
import Booking from '../models/Booking.js';
import { sendNotification } from '../utils/sendNotification.js';

// @desc    Get complete administrative statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalWorkers = await User.countDocuments({ role: 'worker' });
    const verifiedWorkers = await WorkerProfile.countDocuments({ verificationStatus: 'verified' });
    const pendingVerifications = await WorkerProfile.countDocuments({ verificationStatus: 'pending' });
    const totalJobs = await Job.countDocuments();
    const totalBookings = await Booking.countDocuments();

    // Financial calculations
    const bookings = await Booking.find({ status: 'Completed' });
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);
    const platformCommission = Math.round(totalRevenue * 0.1);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalCustomers,
        totalWorkers,
        verifiedWorkers,
        pendingVerifications,
        totalJobs,
        totalBookings,
        totalRevenue,
        platformCommission,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify or revoke worker badge
// @route   PUT /api/admin/workers/:id/verify
// @access  Private (Admin)
export const toggleWorkerVerification = async (req, res, next) => {
  try {
    const { status } = req.body; // 'verified' | 'pending' | 'rejected'

    const worker = await WorkerProfile.findById(req.params.id);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker profile not found' });
    }

    const nextStatus = status || (worker.verificationStatus === 'verified' ? 'pending' : 'verified');
    worker.verificationStatus = nextStatus;
    await worker.save();

    // Update user isVerified flag
    await User.findByIdAndUpdate(worker.userId, {
      isVerified: nextStatus === 'verified',
    });

    // Notify worker
    await sendNotification({
      userId: worker.userId,
      title: nextStatus === 'verified' ? 'Worker Profile Verified!' : 'Verification Status Updated',
      message:
        nextStatus === 'verified'
          ? 'Congratulations! Your trade profile has been verified by WorkOshop Council.'
          : `Your verification status has been changed to '${nextStatus}'.`,
      type: 'verification',
      link: '/worker-dashboard',
    });

    res.status(200).json({
      success: true,
      message: `Worker verification status updated to '${nextStatus}'`,
      data: worker,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users for admin management
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const query = role ? { role } : {};

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active/deactive status
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private (Admin)
export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User is now ${user.isActive ? 'Active' : 'Deactivated'}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

