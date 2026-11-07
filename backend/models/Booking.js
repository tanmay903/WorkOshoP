import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      unique: true,
      default: function () {
        return `HW-BK-${Math.floor(1000 + Math.random() * 9000)}`;
      },
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
    },
    serviceTitle: {
      type: String,
      required: [true, 'Please specify service title'],
      default: 'General Trade Service',
    },
    serviceDate: {
      type: String,
      required: [true, 'Please select service date'],
    },
    serviceTime: {
      type: String,
      required: [true, 'Please select service time slot'],
    },
    location: {
      type: String,
      required: [true, 'Please provide work address'],
      trim: true,
    },
    instructions: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please specify amount / estimate'],
      min: [100, 'Amount must be at least ₹100'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    reviewed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Booking', bookingSchema);

