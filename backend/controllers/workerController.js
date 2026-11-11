import WorkerProfile from '../models/WorkerProfile.js';
import User from '../models/User.js';
import { broadcastEvent } from '../utils/sendNotification.js';

const toRadians = (deg) => (deg * Math.PI) / 180;

const haversineDistanceKm = (lat1, lng1, lat2, lng2) => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const formatDistanceLabel = (km) => {
  if (!Number.isFinite(km)) return '';
  if (km < 1) {
    return `${Math.max(10, Math.round(km * 1000))} m away`;
  }
  return `${km.toFixed(1)} km away`;
};

const extractWorkerCoords = (workerDoc) => {
  const geoCoords = workerDoc?.geoLocation?.coordinates;
  if (Array.isArray(geoCoords) && geoCoords.length === 2) {
    const lng = Number(geoCoords[0]);
    const lat = Number(geoCoords[1]);
    if (Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }
  const lat = Number(workerDoc?.coordinates?.lat);
  const lng = Number(workerDoc?.coordinates?.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
    return { lat, lng };
  }
  return null;
};

// Privacy helper: coarsen coordinates to an approximate ~550m area grid with deterministic jitter
// so exact residential/home coordinates are never exposed in public endpoints or Nearby Workers pins.
const approximatePublicCoords = (lat, lng, seedId = '') => {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  let hash = 0;
  const str = String(seedId);
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  const offsetLat = (((hash & 0xff) / 255) - 0.5) * 0.004;
  const offsetLng = ((((hash >> 8) & 0xff) / 255) - 0.5) * 0.004;
  return {
    lat: Number((Math.round(lat * 200) / 200 + offsetLat).toFixed(4)),
    lng: Number((Math.round(lng * 200) / 200 + offsetLng).toFixed(4)),
  };
};

const formatApproximateArea = (workerDoc) => {
  if (workerDoc?.city && String(workerDoc.city).trim()) {
    return `${String(workerDoc.city).trim()} area`;
  }
  if (workerDoc?.location && String(workerDoc.location).trim()) {
    const parts = String(workerDoc.location).split(',').map((p) => p.trim()).filter(Boolean);
    return parts.length > 1 ? `${parts[parts.length - 2]} area` : `${parts[0]} area`;
  }
  return 'Approximate service area';
};

// @desc    Get nearby online workers with location sharing enabled
// @route   GET /api/workers/nearby
// @access  Public
export const getNearbyWorkers = async (req, res, next) => {
  try {
    const customerLat = Number(req.query.lat);
    const customerLng = Number(req.query.lng);
    const radiusParam = Number(req.query.radius);
    const radiusKm = Number.isFinite(radiusParam) && radiusParam > 0 ? Math.min(radiusParam, 500) : 10;
    const professionFilter = (req.query.profession || req.query.category || '').trim();

    if (
      !Number.isFinite(customerLat) ||
      !Number.isFinite(customerLng) ||
      customerLat < -90 ||
      customerLat > 90 ||
      customerLng < -180 ||
      customerLng > 180
    ) {
      return res.status(400).json({
        success: false,
        message: 'Valid customer latitude (lat) and longitude (lng) query parameters are required.',
      });
    }

    const query = {
      isOnline: true,
      locationSharingEnabled: true,
    };

    if (professionFilter && professionFilter.toLowerCase() !== 'all') {
      query.$or = [
        { category: professionFilter.toLowerCase() },
        { profession: { $regex: professionFilter, $options: 'i' } },
      ];
    }

    const workers = await WorkerProfile.find(query)
      .select('-permanentAddress')
      .populate('userId', 'name email phone profileImage isVerified')
      .lean();

    const nearby = workers
      .map((w) => {
        const coords = extractWorkerCoords(w);
        if (!coords) return null;

        const distanceKm = haversineDistanceKm(customerLat, customerLng, coords.lat, coords.lng);
        if (!Number.isFinite(distanceKm) || distanceKm > radiusKm) return null;

        const user = w.userId || {};
        const publicCoords = approximatePublicCoords(coords.lat, coords.lng, w._id);
        const approxArea = formatApproximateArea(w);
        return {
          id: user._id?.toString() || w._id.toString(),
          _id: w._id,
          workerProfileId: w._id,
          userId: user._id,
          name: user.name || 'Registered Worker',
          email: user.email || '',
          phone: user.phone || '',
          avatar: user.profileImage || '',
          profession: w.profession,
          category: w.category || w.profession?.toLowerCase(),
          verified: w.verificationStatus === 'verified' || Boolean(user.isVerified),
          rating: Number(w.averageRating ?? 5.0),
          reviewsCount: Number(w.totalReviews ?? 0),
          hourlyRate: w.hourlyRate,
          dailyRate: w.dailyRate,
          location: approxArea,
          approximateArea: approxArea,
          city: w.city,
          coordinates: publicCoords,
          isApproximateLocation: true,
          isOnline: Boolean(w.isOnline),
          locationSharingEnabled: Boolean(w.locationSharingEnabled),
          isAvailable: Boolean(w.isAvailable),
          availability: w.availability || (w.isOnline ? 'Online' : 'Offline'),
          lastLocationUpdatedAt: w.lastLocationUpdatedAt || w.updatedAt,
          distanceKm: Number(distanceKm.toFixed(1)),
          distance: formatDistanceLabel(distanceKm),
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    res.status(200).json({
      success: true,
      count: nearby.length,
      totalOnlineSharingCount: workers.length,
      radiusKm,
      center: { lat: customerLat, lng: customerLng },
      data: nearby,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all workers with search, filters, pagination and sorting
// @route   GET /api/workers
// @access  Public
export const getAllWorkers = async (req, res, next) => {
  try {
    const {
      q,
      loc,
      profession,
      category,
      skill,
      minExperience,
      minRating,
      maxPrice,
      verifiedOnly,
      availableOnly,
      sortBy,
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    // Text search query across profession, skills, or tagline
    if (q) {
      query.$or = [
        { profession: { $regex: q, $options: 'i' } },
        { skills: { $in: [new RegExp(q, 'i')] } },
        { tagline: { $regex: q, $options: 'i' } },
        { about: { $regex: q, $options: 'i' } },
      ];
    }

    // Location search
    if (loc) {
      query.$or = [
        ...(query.$or || []),
        { location: { $regex: loc, $options: 'i' } },
        { city: { $regex: loc, $options: 'i' } },
      ];
    }

    // Category / Profession filter
    if (category && category !== 'all') {
      query.category = category.toLowerCase();
    } else if (profession) {
      query.profession = { $regex: profession, $options: 'i' };
    }

    // Skill filter
    if (skill) {
      query.skills = { $in: [new RegExp(skill, 'i')] };
    }

    // Experience filter
    if (minExperience) {
      query.experienceYears = { $gte: Number(minExperience) };
    }

    // Rating filter
    if (minRating) {
      query.averageRating = { $gte: Number(minRating) };
    }

    // Max Price filter
    if (maxPrice) {
      query.hourlyRate = { $lte: Number(maxPrice) };
    }

    // Verified only filter
    if (verifiedOnly === 'true') {
      query.verificationStatus = 'verified';
    }

    // Available only filter
    if (availableOnly === 'true') {
      query.isAvailable = true;
    }

    // Sorting
    let sortOptions = {};
    if (sortBy === 'rating-desc') {
      sortOptions = { averageRating: -1, totalReviews: -1 };
    } else if (sortBy === 'price-asc') {
      sortOptions = { hourlyRate: 1 };
    } else if (sortBy === 'price-desc') {
      sortOptions = { hourlyRate: -1 };
    } else if (sortBy === 'reviews-desc') {
      sortOptions = { totalReviews: -1 };
    } else {
      sortOptions = { averageRating: -1, createdAt: -1 };
    }

    const pageNumber = Math.max(1, parseInt(page));
    const pageSize = Math.max(1, parseInt(limit));
    const skip = (pageNumber - 1) * pageSize;

    const total = await WorkerProfile.countDocuments(query);
    const workers = await WorkerProfile.find(query)
      .select('-permanentAddress')
      .populate('userId', 'name email phone profileImage isVerified')
      .populate('reviews')
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize);

    // Map to frontend-friendly structure while keeping model fields
    const formattedWorkers = workers.map((w) => {
      const user = w.userId || {};
      const publicCoords = w.locationSharingEnabled && w.coordinates
        ? approximatePublicCoords(Number(w.coordinates.lat), Number(w.coordinates.lng), w._id)
        : null;
      return {
        id: w.userId?._id?.toString() || w._id.toString(),
        _id: w._id,
        workerProfileId: w._id,
        userId: user._id,
        name: user.name || 'Skilled Pro',
        email: user.email,
        phone: user.phone,
        avatar: user.profileImage || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80',
        profession: w.profession,
        category: w.category || w.profession?.toLowerCase(),
        verified: w.verificationStatus === 'verified' || user.isVerified || false,
        verificationStatus: w.verificationStatus,
        rating: w.averageRating || 5.0,
        averageRating: w.averageRating || 5.0,
        reviewsCount: w.totalReviews || 0,
        totalReviews: w.totalReviews || 0,
        experience: w.experience,
        experienceYears: w.experienceYears,
        hourlyRate: w.hourlyRate,
        dailyRate: w.dailyRate,
        location: w.location,
        city: w.city,
        coordinates: publicCoords,
        isOnline: Boolean(w.isOnline),
        locationSharingEnabled: Boolean(w.locationSharingEnabled),
        lastLocationUpdatedAt: w.lastLocationUpdatedAt,
        distance: '2.5 km away',
        availability: w.availability,
        isAvailable: w.isAvailable,
        skills: w.skills,
        languages: w.languages,
        about: w.about,
        tagline: w.tagline,
        coverImage: w.coverImage,
        gallery: w.portfolioImages?.length > 0 ? w.portfolioImages : [
          'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80'
        ],
        portfolioImages: w.portfolioImages,
        education: w.education,
        workExperience: w.workExperience,
        certifications: w.certifications,
        services: w.services?.length > 0 ? w.services : [
          { id: 's-1', title: `Standard ${w.profession} Service`, price: w.hourlyRate, duration: '1 hour', description: 'Inspection & diagnosis' }
        ],
        completedJobs: w.completedJobs,
        responseRate: w.responseRate,
        reviews: w.reviews || [],
      };
    });

    res.status(200).json({
      success: true,
      count: formattedWorkers.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageSize),
      data: formattedWorkers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single worker profile by user ID or worker profile ID
// @route   GET /api/workers/:id
// @access  Public
export const getWorkerById = async (req, res, next) => {
  try {
    const id = req.params.id;

    // Search by userId first, then by worker profile _id
    let worker = await WorkerProfile.findOne({ userId: id })
      .select('-permanentAddress')
      .populate('userId', 'name email phone profileImage isVerified')
      .populate('reviews');

    if (!worker) {
      worker = await WorkerProfile.findById(id)
        .select('-permanentAddress')
        .populate('userId', 'name email phone profileImage isVerified')
        .populate('reviews');
    }

    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker profile not found' });
    }

    const user = worker.userId || {};
    const publicCoords = worker.locationSharingEnabled && worker.coordinates
      ? approximatePublicCoords(Number(worker.coordinates.lat), Number(worker.coordinates.lng), worker._id)
      : null;
    const formatted = {
      id: user._id?.toString() || worker._id.toString(),
      _id: worker._id,
      userId: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.profileImage,
      profession: worker.profession,
      category: worker.category,
      verified: worker.verificationStatus === 'verified' || user.isVerified || false,
      verificationStatus: worker.verificationStatus,
      rating: worker.averageRating,
      averageRating: worker.averageRating,
      reviewsCount: worker.totalReviews,
      totalReviews: worker.totalReviews,
      experience: worker.experience,
      experienceYears: worker.experienceYears,
      hourlyRate: worker.hourlyRate,
      dailyRate: worker.dailyRate,
      location: worker.location,
      city: worker.city,
      coordinates: publicCoords,
      isOnline: Boolean(worker.isOnline),
      locationSharingEnabled: Boolean(worker.locationSharingEnabled),
      lastLocationUpdatedAt: worker.lastLocationUpdatedAt,
      distance: '2.5 km away',
      availability: worker.availability,
      isAvailable: worker.isAvailable,
      skills: worker.skills,
      languages: worker.languages,
      about: worker.about,
      tagline: worker.tagline,
      coverImage: worker.coverImage,
      gallery: worker.portfolioImages,
      portfolioImages: worker.portfolioImages,
      education: worker.education,
      workExperience: worker.workExperience,
      certifications: worker.certifications,
      services: worker.services,
      completedJobs: worker.completedJobs,
      responseRate: worker.responseRate,
      reviews: worker.reviews || [],
    };

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update worker profile
// @route   POST /api/workers/profile
// @access  Private (Worker)
export const updateMyProfile = async (req, res, next) => {
  try {
    const updatePayload = { ...req.body };
    if (
      updatePayload.coordinates &&
      Number.isFinite(Number(updatePayload.coordinates.lat)) &&
      Number.isFinite(Number(updatePayload.coordinates.lng))
    ) {
      const lat = Number(updatePayload.coordinates.lat);
      const lng = Number(updatePayload.coordinates.lng);
      updatePayload.coordinates = { lat, lng };
      updatePayload.geoLocation = { type: 'Point', coordinates: [lng, lat] };
      updatePayload.lastLocationUpdatedAt = new Date();
    }
    if (updatePayload.locationSharingEnabled !== undefined) {
      updatePayload.locationSharingEnabled = Boolean(updatePayload.locationSharingEnabled);
      if (updatePayload.locationSharingEnabled && updatePayload.isOnline === undefined) {
        updatePayload.isOnline = true;
        updatePayload.isAvailable = true;
        updatePayload.availability = 'Available Now';
      }
    }
    if (updatePayload.isOnline !== undefined) {
      updatePayload.isOnline = Boolean(updatePayload.isOnline);
      updatePayload.isAvailable = updatePayload.isOnline;
      if (!updatePayload.availability) {
        updatePayload.availability = updatePayload.isOnline ? 'Available Now' : 'Currently Busy';
      }
    }

    let profile = await WorkerProfile.findOne({ userId: req.user.id });

    if (profile) {
      profile = await WorkerProfile.findOneAndUpdate(
        { userId: req.user.id },
        { $set: updatePayload },
        { new: true, runValidators: true }
      );
    } else {
      profile = await WorkerProfile.create({
        userId: req.user.id,
        ...updatePayload,
      });
    }

    broadcastEvent('worker_location_updated', {
      workerProfileId: profile._id,
      userId: req.user.id,
      isOnline: profile.isOnline,
      locationSharingEnabled: profile.locationSharingEnabled,
      updatedAt: new Date().toISOString(),
    });

    res.status(200).json({ success: true, message: 'Worker profile updated', data: profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Update worker live location & location sharing status
// @route   PUT /api/workers/location
// @access  Private (Worker / Admin)
export const updateMyLocation = async (req, res, next) => {
  try {
    const { lat, lng, location, city, locationSharingEnabled, isOnline } = req.body;

    const updates = {};
    if (lat !== undefined && lng !== undefined) {
      const numLat = Number(lat);
      const numLng = Number(lng);
      if (!Number.isFinite(numLat) || !Number.isFinite(numLng) || numLat < -90 || numLat > 90 || numLng < -180 || numLng > 180) {
        return res.status(400).json({ success: false, message: 'Invalid latitude or longitude coordinates' });
      }
      updates.coordinates = { lat: numLat, lng: numLng };
      updates.geoLocation = { type: 'Point', coordinates: [numLng, numLat] };
      updates.lastLocationUpdatedAt = new Date();
    }

    if (typeof location === 'string' && location.trim()) {
      updates.location = location.trim();
    }
    if (typeof city === 'string' && city.trim()) {
      updates.city = city.trim();
    }
    if (locationSharingEnabled !== undefined) {
      updates.locationSharingEnabled = Boolean(locationSharingEnabled);
      if (updates.locationSharingEnabled && isOnline === undefined) {
        updates.isOnline = true;
        updates.isAvailable = true;
        updates.availability = 'Available Now';
      }
    }
    if (isOnline !== undefined) {
      updates.isOnline = Boolean(isOnline);
      updates.isAvailable = Boolean(isOnline);
      updates.availability = Boolean(isOnline) ? 'Available Now' : 'Currently Busy';
    }

    let profile = await WorkerProfile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!profile) {
      profile = await WorkerProfile.create({
        userId: req.user.id,
        profession: 'Tradesperson',
        category: 'more-services',
        hourlyRate: 300,
        location: updates.location || req.user?.city || 'Guwahati, Assam',
        city: updates.city || req.user?.city || 'Guwahati',
        ...updates,
      });
    }

    broadcastEvent('worker_location_updated', {
      workerProfileId: profile._id,
      userId: req.user.id,
      isOnline: profile.isOnline,
      locationSharingEnabled: profile.locationSharingEnabled,
      updatedAt: new Date().toISOString(),
    });

    res.status(200).json({ success: true, message: 'Location sharing updated', data: profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Get authenticated worker's own profile (includes private permanentAddress)
// @route   GET /api/workers/me/profile
// @access  Private (Worker / Admin)
export const getMyWorkerProfile = async (req, res, next) => {
  try {
    const profile = await WorkerProfile.findOne({ userId: req.user.id }).populate(
      'userId',
      'name email phone profileImage isVerified'
    );
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Worker profile not found' });
    }
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Update worker's private permanent address (separate from live location tracking)
// @route   PUT /api/workers/permanent-address
// @access  Private (Worker / Admin)
export const updateMyPermanentAddress = async (req, res, next) => {
  try {
    const { address, state, country, lat, lng, coordinates } = req.body;
    const rawLat = coordinates?.lat ?? lat;
    const rawLng = coordinates?.lng ?? lng;

    const nextPermAddress = {
      address: typeof address === 'string' ? address.trim() : '',
      state: typeof state === 'string' && state.trim() ? state.trim() : 'Assam',
      country: typeof country === 'string' && country.trim() ? country.trim() : 'India',
      coordinates: { lat: null, lng: null },
    };

    if (rawLat !== undefined && rawLat !== null && rawLat !== '' && rawLng !== undefined && rawLng !== null && rawLng !== '') {
      const numLat = Number(rawLat);
      const numLng = Number(rawLng);
      if (!Number.isFinite(numLat) || !Number.isFinite(numLng) || numLat < -90 || numLat > 90 || numLng < -180 || numLng > 180) {
        return res.status(400).json({ success: false, message: 'Invalid permanent address latitude or longitude' });
      }
      nextPermAddress.coordinates = { lat: numLat, lng: numLng };
    }

    const profile = await WorkerProfile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { permanentAddress: nextPermAddress } },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Worker profile not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Permanent address updated securely',
      data: profile.permanentAddress,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload portfolio images
// @route   POST /api/workers/portfolio-images
// @access  Private (Worker)
export const uploadPortfolioImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload at least one image' });
    }

    const imagePaths = req.files.map((file) => `/uploads/${file.filename}`);

    const profile = await WorkerProfile.findOneAndUpdate(
      { userId: req.user.id },
      { $push: { portfolioImages: { $each: imagePaths } } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Portfolio images uploaded successfully',
      portfolioImages: profile?.portfolioImages || imagePaths,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update worker availability
// @route   PUT /api/workers/availability
// @access  Private (Worker)
export const updateAvailability = async (req, res, next) => {
  try {
    const { isAvailable, availability, isOnline, locationSharingEnabled } = req.body;

    const updates = {
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      availability: availability || (isAvailable ? 'Available Now' : 'Currently Busy'),
      isOnline: isOnline !== undefined ? Boolean(isOnline) : Boolean(isAvailable !== undefined ? isAvailable : true),
    };
    if (locationSharingEnabled !== undefined) {
      updates.locationSharingEnabled = Boolean(locationSharingEnabled);
    }

    let profile = await WorkerProfile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: updates },
      { new: true }
    );

    if (!profile) {
      profile = await WorkerProfile.create({
        userId: req.user.id,
        profession: 'Tradesperson',
        category: 'more-services',
        hourlyRate: 300,
        location: req.user?.city || 'Guwahati, Assam',
        city: req.user?.city || 'Guwahati',
        ...updates,
      });
    }

    broadcastEvent('worker_location_updated', {
      workerProfileId: profile._id,
      userId: req.user.id,
      isOnline: profile.isOnline,
      locationSharingEnabled: profile.locationSharingEnabled,
      updatedAt: new Date().toISOString(),
    });

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete worker profile
// @route   DELETE /api/workers/:id
// @access  Private (Admin / Owner)
export const deleteWorkerProfile = async (req, res, next) => {
  try {
    const profile = await WorkerProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    if (profile.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this profile' });
    }

    await profile.deleteOne();
    res.status(200).json({ success: true, message: 'Worker profile deleted' });
  } catch (error) {
    next(error);
  }
};

