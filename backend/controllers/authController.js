import crypto from 'crypto';
import User from '../models/User.js';
import WorkerProfile from '../models/WorkerProfile.js';
import { sendTokenResponse } from '../utils/generateToken.js';

const ASSAM_FALLBACK_COORDS = [
  { key: 'guwahati', lat: 26.1445, lng: 91.7362 },
  { key: 'kamrup metropolitan', lat: 26.1445, lng: 91.7362 },
  { key: 'kamrup', lat: 26.3167, lng: 91.5983 },
  { key: 'dibrugarh', lat: 27.4728, lng: 94.912 },
  { key: 'jorhat', lat: 26.7509, lng: 94.2037 },
  { key: 'silchar', lat: 24.8333, lng: 92.7789 },
  { key: 'cachar', lat: 24.8333, lng: 92.7789 },
  { key: 'tezpur', lat: 26.6528, lng: 92.7926 },
  { key: 'sonitpur', lat: 26.6528, lng: 92.7926 },
  { key: 'nagaon', lat: 26.348, lng: 92.6838 },
  { key: 'tinsukia', lat: 27.4922, lng: 95.3468 },
  { key: 'sivasagar', lat: 26.9826, lng: 94.6425 },
  { key: 'bongaigaon', lat: 26.4824, lng: 90.5588 },
  { key: 'barpeta', lat: 26.3216, lng: 91.0041 },
  { key: 'nalbari', lat: 26.4446, lng: 91.441 },
  { key: 'dhubri', lat: 26.0185, lng: 89.9856 },
  { key: 'goalpara', lat: 26.1641, lng: 90.6252 },
  { key: 'golaghat', lat: 26.5239, lng: 93.9623 },
  { key: 'lakhimpur', lat: 27.236, lng: 94.1038 },
  { key: 'kokrajhar', lat: 26.4014, lng: 90.2667 },
  { key: 'diphu', lat: 25.8406, lng: 93.4319 },
  { key: 'karimganj', lat: 24.8691, lng: 92.3554 },
  { key: 'mangaldoi', lat: 26.4417, lng: 92.0298 },
  { key: 'hailakandi', lat: 24.6826, lng: 92.5646 },
];

const resolveWorkAreaCoordinates = (coordinates, city, location) => {
  if (
    coordinates &&
    Number.isFinite(Number(coordinates.lat)) &&
    Number.isFinite(Number(coordinates.lng))
  ) {
    const lat = Number(coordinates.lat);
    const lng = Number(coordinates.lng);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }
  const haystack = `${city || ''} ${location || ''}`.toLowerCase();
  const matched = ASSAM_FALLBACK_COORDS.find((item) => haystack.includes(item.key));
  return matched ? { lat: matched.lat, lng: matched.lng } : { lat: 26.1445, lng: 91.7362 };
};

// @desc    Register a new customer
// @route   POST /api/auth/register-customer
// @access  Public
export const registerCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, password, city } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      phone,
      password,
      city: city || 'Guwahati',
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
      permanentAddress,
      coordinates,
      locationSharingEnabled,
      isOnline,
    } = req.body;

    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const resolvedState = (permanentAddress?.state || 'Assam').trim();
    const resolvedCountry = (permanentAddress?.country || 'India').trim();
    const resolvedPermAddr = (permanentAddress?.address || '').trim();
    const rawPermLat = permanentAddress?.coordinates?.lat ?? permanentAddress?.lat;
    const rawPermLng = permanentAddress?.coordinates?.lng ?? permanentAddress?.lng;
    const permLat = rawPermLat !== undefined && rawPermLat !== null && rawPermLat !== '' ? Number(rawPermLat) : null;
    const permLng = rawPermLng !== undefined && rawPermLng !== null && rawPermLng !== '' ? Number(rawPermLng) : null;

    const workCity = (city || location?.split(',')[0] || 'Guwahati').trim();
    const workCoords = resolveWorkAreaCoordinates(coordinates, workCity, location);
    const onlineState = Boolean(isOnline || locationSharingEnabled);

    const user = await User.create({
      name,
      email: normalizedEmail,
      phone,
      password,
      city: workCity,
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
      location: location || `${workCity}, ${resolvedState}, ${resolvedCountry}`,
      city: workCity,
      permanentAddress: {
        address: resolvedPermAddr,
        state: resolvedState,
        country: resolvedCountry,
        coordinates: {
          lat: Number.isFinite(permLat) && permLat >= -90 && permLat <= 90 ? permLat : null,
          lng: Number.isFinite(permLng) && permLng >= -180 && permLng <= 180 ? permLng : null,
        },
      },
      coordinates: workCoords,
      geoLocation: {
        type: 'Point',
        coordinates: [workCoords.lng, workCoords.lat],
      },
      lastLocationUpdatedAt: new Date(),
      locationSharingEnabled: Boolean(locationSharingEnabled),
      isOnline: onlineState,
      isAvailable: onlineState,
      availability: onlineState ? 'Available Now' : 'Currently Busy',
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
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+password');
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

