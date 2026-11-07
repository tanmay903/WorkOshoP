import React, { useState } from 'react';
import { X, Star, CheckCircle2 } from 'lucide-react';
import { RatingStars } from './RatingStars';
import { storage } from '../utils/storage';
import { useAuth } from '../context/AuthContext';

export const ReviewModal = ({ worker, bookingId, isOpen, onClose, onReviewAdded }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const reviewObj = {
        id: `r-${Date.now()}`,
        customerName: user?.name || 'Aarav Singhal',
        customerAvatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        rating,
        date: new Date().toISOString().split('T')[0],
        comment: comment.trim(),
      };

      storage.addWorkerReview(worker.id, reviewObj);

      if (bookingId) {
        storage.updateBookingStatus(bookingId, 'Completed');
      }

      setIsSubmitting(false);
      setSubmitted(true);
      if (onReviewAdded) onReviewAdded(reviewObj);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <h3 className="font-bold text-base">Write a Review</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-800 text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-slate-800">Thank you for your feedback!</h4>
            <p className="text-sm text-slate-600">Your verified review helps others find skilled professionals.</p>
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="text-center space-y-2">
              <img
                src={worker.avatar}
                alt={worker.name}
                className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-primary-500 shadow-md"
              />
              <h4 className="font-bold text-slate-900">{worker.name}</h4>
              <p className="text-xs text-slate-500">{worker.profession}</p>

              <div className="py-2 flex justify-center">
                <RatingStars
                  rating={rating}
                  size="lg"
                  showCount={false}
                  interactive={true}
                  onRatingChange={(newVal) => setRating(newVal)}
                />
              </div>
              <p className="text-xs text-amber-600 font-medium">Click stars to rate (1 to 5)</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Your Experience
              </label>
              <textarea
                required
                rows="4"
                placeholder="How was the work quality, punctuality, and behavior?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 text-sm text-slate-700 font-medium bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-md transition-all"
              >
                {isSubmitting ? 'Submitting...' : 'Post Review'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

