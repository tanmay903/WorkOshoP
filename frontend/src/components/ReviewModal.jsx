import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Star, CheckCircle2, Lock } from 'lucide-react';
import { RatingStars } from './RatingStars';
import { storage } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './Avatar';

export const ReviewModal = ({ worker, bookingId, isOpen, onClose, onReviewAdded }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fadeIn">
        <div className="relative w-full max-w-md bg-white dark:bg-[#00033D] rounded-2xl shadow-2xl border border-slate-100 dark:border-[#0600AB]/40 p-6 text-center space-y-4 transition-colors">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 rounded-xl mx-auto flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Sign In Required</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300">Please sign in or register to submit a verified rating and review.</p>
          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                navigate('/login', {
                  state: {
                    from: `/worker/${worker.id}`,
                    message: `Please sign in to review ${worker.name}.`,
                  },
                });
              }}
              className="flex-1 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-all"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const reviewObj = {
        id: `r-${Date.now()}`,
        customerName: user?.name || 'Customer',
        customerAvatar: '',
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
      <div className="relative w-full max-w-md bg-white dark:bg-[#00033D] rounded-2xl shadow-2xl border border-slate-100 dark:border-[#0600AB]/40 overflow-hidden transition-colors animate-scale-in">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <h3 className="font-bold text-base">Write a Review</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-800 text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 mx-auto bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-slate-800 dark:text-white">Thank you for your feedback!</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300">Your verified review helps others find skilled professionals.</p>
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
              <Avatar
                name={worker.name}
                src={worker.avatar}
                className="w-16 h-16 rounded-full mx-auto text-xl border-2 border-primary-500 shadow-md"
              />
              <h4 className="font-bold text-slate-900 dark:text-white">{worker.name}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">{worker.profession}</p>

              <div className="py-2 flex justify-center">
                <RatingStars
                  rating={rating}
                  size="lg"
                  showCount={false}
                  interactive={true}
                  onRatingChange={(newVal) => setRating(newVal)}
                />
              </div>
              <p className="text-xs text-amber-500 font-medium">Click stars to rate (1 to 5)</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Your Experience
              </label>
              <textarea
                required
                rows="4"
                placeholder="How was the work quality, punctuality, and behavior?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 text-sm bg-slate-50 dark:bg-[#0600AB]/20 border border-slate-200 dark:border-[#0600AB]/50 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-[#00033D] text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 text-sm text-slate-700 dark:text-slate-300 font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
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

