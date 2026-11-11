import React from 'react';
import { Star } from 'lucide-react';

export const RatingStars = ({ rating = 0, count, showCount = true, size = 'sm', interactive = false, onRatingChange }) => {
  const stars = [1, 2, 3, 4, 5];
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center text-amber-400">
        {stars.map((starIndex) => {
          const filled = starIndex <= Math.round(rating);
          return (
            <button
              type="button"
              key={starIndex}
              disabled={!interactive}
              onClick={() => interactive && onRatingChange && onRatingChange(starIndex)}
              className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
            >
              <Star
                className={`${sizeClasses[size] || 'w-4 h-4'} ${
                  filled ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700 fill-slate-100 dark:fill-slate-800'
                }`}
              />
            </button>
          );
        })}
      </div>
      <span className="font-semibold text-slate-800 dark:text-white text-xs sm:text-sm">
        {Number(rating).toFixed(1)}
      </span>
      {showCount && count !== undefined && (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          ({count})
        </span>
      )}
    </div>
  );
};

