import WorkerProfile from '../models/WorkerProfile.js';
import User from '../models/User.js';

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
      .populate('userId', 'name email phone profileImage isVerified')
      .populate('reviews')
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize);

    // Map to frontend-friendly structure while keeping model fields
    const formattedWorkers = workers.map((w) => {
      const user = w.userId || {};
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
        coordinates: w.coordinates,
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
      .populate('userId', 'name email phone profileImage isVerified')
      .populate('reviews');

    if (!worker) {
      worker = await WorkerProfile.findById(id)
        .populate('userId', 'name email phone profileImage isVerified')
        .populate('reviews');
    }

    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker profile not found' });
    }

    const user = worker.userId || {};
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
      coordinates: worker.coordinates,
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
    let profile = await WorkerProfile.findOne({ userId: req.user.id });

    if (profile) {
      profile = await WorkerProfile.findOneAndUpdate(
        { userId: req.user.id },
        { $set: req.body },
        { new: true, runValidators: true }
      );
    } else {
      profile = await WorkerProfile.create({
        userId: req.user.id,
        ...req.body,
      });
    }

    res.status(200).json({ success: true, message: 'Worker profile updated', data: profile });
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
    const { isAvailable, availability } = req.body;

    const profile = await WorkerProfile.findOneAndUpdate(
      { userId: req.user.id },
      {
        isAvailable: isAvailable !== undefined ? isAvailable : true,
        availability: availability || (isAvailable ? 'Available Now' : 'Currently Busy'),
      },
      { new: true }
    );

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

