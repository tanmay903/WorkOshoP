import crypto from 'crypto';
import User from '../models/User.js';
import WorkerProfile from '../models/WorkerProfile.js';
import { sendTokenResponse } from '../utils/generateToken.js';

// @desc    Register a new customer
// @route   POST /api/auth/register-customer
// @access  Public
export const registerCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, password, city } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      city: city || 'New Delhi',
      role: 'customer',
      isVerified: true,
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new worker
// @route   POST /api/auth/register-worker
// @access  Public
export const registerWorker = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      city,
      profession,
      category,
      skills,
      experience,
      experienceYears,
      hourlyRate,
      dailyRate,
      location,
      languages,
      about,
      tagline,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      city: city || location?.split(',')[0] || 'New Delhi',
      role: 'worker',
      isVerified: false,
    });

    // Create associated Worker Profile
    const workerProfile = await WorkerProfile.create({
      userId: user._id,
      profession: profession || 'Electrician',
      category: (category || profession || 'electrician').toLowerCase(),
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map((s) => s.trim()) : []),
      experience: experience || '3+ Years',
      experienceYears: Number(experienceYears) || 3,
      hourlyRate: Number(hourlyRate) || 300,
      dailyRate: Number(dailyRate) || (Number(hourlyRate) || 300) * 7,
      location: location || `${city || 'New Delhi'}, India`,
      city: city || 'New Delhi',
      languages: Array.isArray(languages) ? languages : (languages ? languages.split(',').map((l) => l.trim()) : ['Hindi', 'English']),
      about: about || `Dedicated ${profession || 'trade'} professional with proven track record.`,
      tagline: tagline || `Certified ${profession || 'trade'} specialist.`,
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Role check if explicitly requested
    if (role && user.role !== role && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: `Account is registered as a '${user.role}', not '${role}'. Please switch role tabs.`,
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Log out user & clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'User successfully logged out',
  });
};

// @desc    Get currently logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let workerProfile = null;

    if (user.role === 'worker') {
      workerProfile = await WorkerProfile.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      user,
      workerProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password - generate token
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes

    await user.save({ validateBeforeSave: false });

    // In a production environment, send email via nodemailer/SendGrid. For now return token:
    res.status(200).json({
      success: true,
      message: 'Password reset link sent to email.',
      resetToken, // Available for development/testing
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password with token
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Change Password (authenticated)
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

