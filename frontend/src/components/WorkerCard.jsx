import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, MapPin, MessageSquare, Briefcase,
  ArrowRight, Heart, Scale, Check
} from 'lucide-react';
import { RatingStars } from './RatingStars';
import { BookingModal } from './BookingModal';
import { storage } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './Avatar';

export const WorkerCard = ({
  worker,
  compact = false,
  isCompared = false,
  onToggleCompare = null,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showBooking, setShowBooking] = useState(false);
  const [isSaved, setIsSaved] = useState(() => storage.isWorkerSaved(worker?.id, user?.id));

  useEffect(() => {
    setIsSaved(storage.isWorkerSaved(worker?.id, user?.id));
    const handleSync = (e) => {
      const ids = e?.detail?.ids;
      if (Array.isArray(ids)) {
        setIsSaved(ids.includes(String(worker?.id)));
      } else {
        setIsSaved(storage.isWorkerSaved(worker?.id, user?.id));
      }
    };
    window.addEventListener('hw-saved-workers-changed', handleSync);
    return () => window.removeEventListener('hw-saved-workers-changed', handleSync);
  }, [worker?.id, user?.id]);

  const handleToggleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const res = storage.toggleSavedWorker(worker, user);
    setIsSaved(res.saved);
  };

  const handleStartChat = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login', {
        state: {
          from: `/worker/${worker.id}`,
          message: `Please sign in or create an account to chat with ${worker.name}.`,
        },
      });
      return;
    }
    const conv = storage.startOrGetConversationWithWorker(worker, user);
    navigate(`/messages?conv=${conv.id}`);
  };

  const handleHireClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login', {
        state: {
          from: `/worker/${worker.id}`,
          message: `Please sign in or create an account to hire ${worker.name}.`,
        },
      });
      return;
    }
    setShowBooking(true);
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-[#2563EB]/60 dark:hover:border-[#2563EB] card-lift flex flex-col justify-between overflow-hidden group shadow-soft relative">
        {/* Top-Right Save & Compare Quick Actions */}
        <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-1.5">
          {onToggleCompare && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleCompare(worker);
              }}
              title={isCompared ? 'Remove from comparison' : 'Compare worker'}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                isCompared
                  ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-sm'
                  : 'bg-white/95 text-slate-600 border-slate-200 hover:border-[#2563EB] hover:text-[#2563EB]'
              }`}
            >
              {isCompared ? <Check className="w-3 h-3 text-[#14B8A6]" /> : <Scale className="w-3 h-3" />}
              <span className="hidden sm:inline">{isCompared ? 'Added' : 'Compare'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleToggleSave}
            title={isSaved ? 'Remove from saved workers' : 'Save worker'}
            aria-label={isSaved ? 'Remove from saved workers' : 'Save worker'}
            className={`p-1.5 rounded-lg border transition-all active:scale-90 ${
              isSaved
                ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-xs'
                : 'bg-white/95 text-slate-400 border-slate-200 hover:text-rose-500 hover:border-rose-200'
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>

        <div>
          {/* Card Header & Avatar */}
          <div className="p-5 pb-3">
            <div className="flex items-start gap-3.5">
              <div className="relative shrink-0">
                <Avatar
                  name={worker.name}
                  src={worker.avatar}
                  className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl text-xl sm:text-2xl ring-2 ring-slate-100 dark:ring-slate-800 group-hover:scale-105 transition-transform duration-300"
                />
                {worker.isAvailable && (
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4" title="Online & Available">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-60" />
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-[#16A34A] border-2 border-white dark:border-slate-900" />
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0 pr-14 sm:pr-20">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Link
                    to={`/worker/${worker.id}`}
                    className="font-bold text-[#1E293B] dark:text-white text-base sm:text-[17px] hover:text-[#2563EB] dark:hover:text-blue-400 transition-colors truncate"
                  >
                    {worker.name}
                  </Link>
                  {worker.verified && (
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-[#0D9488] dark:text-teal-300 border border-teal-200 dark:border-teal-800" title="Verified Worker">
                      <ShieldCheck className="w-3.5 h-3.5 fill-[#14B8A6] text-white" />
                      Verified
                    </span>
                  )}
                </div>

                <p className="text-[#2563EB] dark:text-blue-400 font-semibold text-xs sm:text-sm mt-0.5">
                  {worker.profession}
                </p>

                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <RatingStars rating={worker.rating} count={worker.reviewsCount} size="xs" />
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    worker.isAvailable
                      ? 'bg-green-50 text-[#16A34A] border border-green-200/80'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {worker.isAvailable ? 'Online' : 'Offline'}
                  </span>
                  {worker.distance && (
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
                      {worker.distance}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Worker Address */}
            {(worker.location || worker.city) && (
              <div
                className="mt-3 flex items-start gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300"
                title={worker.location || worker.city}
              >
                <MapPin className="w-3.5 h-3.5 text-primary-500 shrink-0 mt-0.5" />
                <span className="font-medium leading-snug line-clamp-1">
                  {worker.location || worker.city}
                </span>
              </div>
            )}

            {/* Tagline / Brief Bio */}
            {!compact && (
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 line-clamp-2 leading-relaxed">
                {worker.tagline || worker.about}
              </p>
            )}

            {/* Skills Badges */}
            {!compact && worker.skills && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {worker.skills.slice(0, 3).map((skill, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-lg"
                  >
                    {skill}
                  </span>
                ))}
                {worker.skills.length > 3 && (
                  <span className="text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-lg">
                    +{worker.skills.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Pricing & Actions */}
        <div className="px-5 py-3.5 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 mt-2">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-medium">Hourly Rate</span>
              <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">₹{worker.hourlyRate}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">/hr</span>
            </div>
            {worker.dailyRate && (
              <div className="text-right">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-medium">Full Day</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">₹{worker.dailyRate}</span>
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
              className="w-full py-2 px-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              Chat
            </button>
          </div>

          <div className="mt-2 text-center">
            <Link
              to={`/worker/${worker.id}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors py-1"
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

