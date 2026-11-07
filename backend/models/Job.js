import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a job title'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please select a service category'],
      lowercase: true,
      trim: true,
    },
    categoryName: {
      type: String,
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed job description'],
    },
    location: {
      type: String,
      required: [true, 'Please provide work location'],
      trim: true,
    },
    budget: {
      type: Number,
      required: [true, 'Please set an estimated budget'],
      min: [100, 'Budget must be at least ₹100'],
    },
    paymentType: {
      type: String,
      enum: ['Fixed Price', 'Hourly Rate'],
      default: 'Fixed Price',
    },
    requiredExperience: {
      type: String,
      default: '3+ Years',
    },
    preferredDate: {
      type: String,
      required: [true, 'Please provide preferred date of work'],
    },
    status: {
      type: String,
      enum: ['Open', 'Applications Received', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Open',
    },
    applications: [
      {
        workerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        workerName: String,
        bidAmount: Number,
        message: String,
        status: {
          type: String,
          enum: ['pending', 'accepted', 'rejected'],
          default: 'pending',
        },
        appliedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    assignedWorker: {
      workerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      workerName: String,
      bidAmount: Number,
      assignedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Job', jobSchema);

