import mongoose from 'mongoose';

const workerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    profession: {
      type: String,
      required: [true, 'Please specify a profession'],
      trim: true,
    },
    category: {
      type: String,
      lowercase: true,
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    experience: {
      type: String,
      default: '3+ Years',
    },
    experienceYears: {
      type: Number,
      default: 3,
    },
    hourlyRate: {
      type: Number,
      required: [true, 'Please set an hourly rate'],
      min: [50, 'Hourly rate must be at least ₹50'],
    },
    dailyRate: {
      type: Number,
      default: function () {
        return (this.hourlyRate || 300) * 7;
      },
    },
    location: {
      type: String,
      required: [true, 'Please provide a location / service city'],
      trim: true,
    },
    city: {
      type: String,
      default: 'New Delhi',
    },
    coordinates: {
      lat: { type: Number, default: 28.6139 },
      lng: { type: Number, default: 77.2090 },
    },
    languages: {
      type: [String],
      default: ['Hindi', 'English'],
    },
    about: {
      type: String,
      default: 'Skilled trade professional with proven track record in installation and maintenance.',
    },
    tagline: {
      type: String,
      default: 'Certified professional dedicated to quality craftsmanship.',
    },
    portfolioImages: {
      type: [String],
      default: [],
    },
    coverImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200&auto=format&fit=crop&q=80',
    },
    availability: {
      type: String,
      enum: ['Available Now', 'Available Tomorrow', 'Available Next Week', 'Currently Busy'],
      default: 'Available Now',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    averageRating: {
      type: Number,
      default: 5.0,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    education: {
      type: String,
      default: 'Vocational Trade Certification (ITI / Skill India)',
    },
    workExperience: [
      {
        title: String,
        company: String,
        duration: String,
        description: String,
      },
    ],
    certifications: {
      type: [String],
      default: ['Skill India Certified'],
    },
    services: [
      {
        id: String,
        title: String,
        price: Number,
        duration: String,
        description: String,
      },
    ],
    completedJobs: {
      type: Number,
      default: 0,
    },
    responseRate: {
      type: String,
      default: '98%',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for reviews on this worker
workerProfileSchema.virtual('reviews', {
  ref: 'Review',
  localField: 'userId',
  foreignField: 'workerId',
  justOne: false,
});

export default mongoose.model('WorkerProfile', workerProfileSchema);

