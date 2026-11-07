import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
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
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true, // Prevents duplicate reviews for the same booking
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5'],
      min: [1, 'Minimum rating is 1'],
      max: [5, 'Maximum rating is 5'],
    },
    comment: {
      type: String,
      required: [true, 'Please provide a written review comment'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Post-save hook to recalculate Worker averageRating and totalReviews
reviewSchema.post('save', async function () {
  const Review = this.constructor;
  const stats = await Review.aggregate([
    { $match: { workerId: this.workerId } },
    {
      $group: {
        _id: '$workerId',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    const WorkerProfile = mongoose.model('WorkerProfile');
    await WorkerProfile.findOneAndUpdate(
      { userId: this.workerId },
      {
        averageRating: parseFloat(stats[0].averageRating.toFixed(1)),
        totalReviews: stats[0].totalReviews,
      }
    );
  }
});

export default mongoose.model('Review', reviewSchema);

