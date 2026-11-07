import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, MapPin, MessageSquare, Briefcase, Clock, Calendar, CheckCircle, ArrowRight } from 'lucide-react';
import { RatingStars } from './RatingStars';
import { BookingModal } from './BookingModal';
import { storage } from '../utils/storage';
import { useAuth } from '../context/AuthContext';

export const WorkerCard = ({ worker, compact = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showBooking, setShowBooking] = useState(false);

  const handleStartChat = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const conv = storage.startOrGetConversationWithWorker(worker, user);
    navigate(`/messages?conv=${conv.id}`);
  };

  const handleHireClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowBooking(true);
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-primary-300 hover:shadow-soft-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group">
        <div>
          {/* Card Header & Avatar */}
          <div className="p-5 pb-3">
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <img
                  src={worker.avatar}
                  alt={worker.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-slate-100 group-hover:scale-105 transition-transform duration-300"
                />
                {worker.isAvailable && (
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full title='Available Now'" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Link
                    to={`/worker/${worker.id}`}
                    className="font-bold text-slate-900 text-base sm:text-lg hover:text-primary-600 transition-colors truncate"
                  >
                    {worker.name}
                  </Link>
                  {worker.verified && (
                    <span className="inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200" title="Verified Worker">
                      <ShieldCheck className="w-3.5 h-3.5 fill-emerald-600 text-white" />
                      Verified
                    </span>
                  )}
                </div>

                <p className="text-primary-600 font-medium text-xs sm:text-sm mt-0.5">
                  {worker.profession}
                </p>

                <div className="mt-2 flex items-center justify-between">
                  <RatingStars rating={worker.rating} count={worker.reviewsCount} size="xs" />
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {worker.distance || worker.city}
                  </span>
                </div>
              </div>
            </div>

            {/* Tagline / Brief Bio */}
            {!compact && (
              <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                {worker.tagline || worker.about}
              </p>
            )}

            {/* Skills Badges */}
            {!compact && worker.skills && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {worker.skills.slice(0, 3).map((skill, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg"
                  >
                    {skill}
                  </span>
                ))}
                {worker.skills.length > 3 && (
                  <span className="text-[11px] font-medium bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-lg">
                    +{worker.skills.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Pricing & Actions */}
        <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 mt-2">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-medium">Hourly Rate</span>
              <span className="text-base sm:text-lg font-bold text-slate-900">₹{worker.hourlyRate}</span>
              <span className="text-xs text-slate-500">/hr</span>
            </div>
            {worker.dailyRate && (
              <div className="text-right">
                <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-medium">Full Day</span>
                <span className="text-sm font-semibold text-slate-700">₹{worker.dailyRate}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleHireClick}
              className="w-full py-2 px-3 bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Briefcase className="w-3.5 h-3.5" />
              Hire Now
            </button>
            <button
              onClick={handleStartChat}
              className="w-full py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              Chat
            </button>
          </div>

          <div className="mt-2 text-center">
            <Link
              to={`/worker/${worker.id}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-800 transition-colors py-1"
            >
              View Full Profile
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      <BookingModal
        worker={worker}
        isOpen={showBooking}
        onClose={() => setShowBooking(false)}
      />
    </>
  );
};

