import Job from '../models/Job.js';
import { sendNotification } from '../utils/sendNotification.js';

// @desc    Post a new job
// @route   POST /api/jobs
// @access  Private (Customer)
export const createJob = async (req, res, next) => {
  try {
    const jobData = {
      ...req.body,
      customerId: req.user.id,
    };

    const job = await Job.create(jobData);

    await sendNotification({
      userId: req.user.id,
      title: 'Job Successfully Posted',
      message: `Your job "${job.title}" is now open for tradesperson bids.`,
      type: 'job',
      link: '/my-jobs',
    });

    res.status(201).json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs (public/marketplace) with filters
// @route   GET /api/jobs
// @access  Public
export const getJobs = async (req, res, next) => {
  try {
    const { category, status, q } = req.query;
    const query = {};

    if (category && category !== 'all') {
      query.category = category.toLowerCase();
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
      ];
    }

    const jobs = await Job.find(query)
      .populate('customerId', 'name email phone profileImage')
      .sort({ createdAt: -1 });

    const formatted = jobs.map((j) => ({
      id: j._id.toString(),
      _id: j._id,
      title: j.title,
      category: j.category,
      categoryName: j.categoryName || j.category,
      description: j.description,
      location: j.location,
      budget: j.budget,
      paymentType: j.paymentType,
      experienceRequired: j.requiredExperience,
      preferredDate: j.preferredDate,
      status: j.status,
      postedDate: j.createdAt?.toISOString().split('T')[0],
      customerId: j.customerId?._id,
      customerName: j.customerId?.name,
      customerEmail: j.customerId?.email,
      customerPhone: j.customerId?.phone,
      applicationsCount: j.applications?.length || 0,
      proposals: j.applications || [],
      assignedWorker: j.assignedWorker,
    }));

    res.status(200).json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job details
// @route   GET /api/jobs/:id
// @access  Public
export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('customerId', 'name email phone profileImage')
      .populate('applications.workerId', 'name email phone profileImage');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.status(200).json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

// @desc    Get jobs posted by current customer
// @route   GET /api/jobs/my-jobs
// @access  Private (Customer)
export const getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ customerId: req.user.id })
      .populate('applications.workerId', 'name email phone profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: jobs.length, data: jobs });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private (Owner / Admin)
export const updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.customerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this job' });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, message: 'Job updated', data: job });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (Owner / Admin)
export const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.customerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this job' });
    }

    await job.deleteOne();
    res.status(200).json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply for a job (worker)
// @route   POST /api/jobs/:id/apply
// @access  Private (Worker)
export const applyForJob = async (req, res, next) => {
  try {
    const { bidAmount, message } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Check if worker already applied
    const alreadyApplied = job.applications.some(
      (app) => app.workerId.toString() === req.user.id
    );

    if (alreadyApplied) {
      return res.status(400).json({ success: false, message: 'You have already applied for this job' });
    }

    job.applications.push({
      workerId: req.user.id,
      workerName: req.user.name,
      bidAmount: Number(bidAmount) || job.budget,
      message,
    });

    job.status = 'Applications Received';
    await job.save();

    // Notify customer
    await sendNotification({
      userId: job.customerId,
      title: 'New Job Application',
      message: `${req.user.name} submitted a bid of ₹${bidAmount || job.budget} for "${job.title}".`,
      type: 'job',
      link: '/my-jobs',
    });

    res.status(201).json({ success: true, message: 'Application submitted successfully', data: job });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept worker application
// @route   PUT /api/jobs/:id/applications/:appId/accept
// @access  Private (Customer)
export const acceptApplication = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.customerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const application = job.applications.id(req.params.appId);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    application.status = 'accepted';
    job.assignedWorker = {
      workerId: application.workerId,
      workerName: application.workerName,
      bidAmount: application.bidAmount,
      assignedAt: new Date(),
    };
    job.status = 'In Progress';

    await job.save();

    // Notify worker
    await sendNotification({
      userId: application.workerId,
      title: 'Bid Accepted!',
      message: `Your quote for "${job.title}" was accepted! You may now begin coordination.`,
      type: 'job',
      link: '/worker-dashboard',
    });

    res.status(200).json({ success: true, message: 'Application accepted', data: job });
  } catch (error) {
    next(error);
  }
};

