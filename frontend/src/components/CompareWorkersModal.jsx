import React from 'react';
import { Link } from 'react-router-dom';
import {
  X, ShieldCheck, Star, MapPin, Clock, Briefcase,
  IndianRupee, CheckCircle2, ArrowRight, Trash2, Wifi
} from 'lucide-react';
import { Avatar } from './Avatar';

/**
 * Side-by-side comparison modal for 2 to 3 shortlisted workers.
 */
export default function CompareWorkersModal({
  isOpen,
  onClose,
  workers = [],
  onRemoveWorker,
  onBookWorker,
}) {
  if (!isOpen) return null;

  const lowestHourly = workers.length > 0
    ? Math.min(...workers.map((w) => Number(w.hourlyRate) || Infinity))
    : Infinity;
  const highestRating = workers.length > 0
    ? Math.max(...workers.map((w) => Number(w.rating) || 0))
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0F172A]/60 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-[#0F172A] text-white shrink-0">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#14B8A6]">
              Side-by-Side Comparison
            </span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight mt-0.5">
              Compare Skilled Professionals ({workers.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close comparison"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-[#F8FAFC]">
          {workers.length < 2 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center max-w-md mx-auto my-6">
              <p className="text-base font-bold text-[#1E293B]">Select at least 2 workers to compare</p>
              <p className="text-sm text-slate-500 mt-1">
                Use the Compare toggle on worker cards to evaluate rates, ratings, and verification side-by-side.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto pb-2">
              <div
                className="grid gap-4 min-w-[640px]"
                style={{ gridTemplateColumns: `repeat(${workers.length}, minmax(220px, 1fr))` }}
              >
                {workers.map((w) => {
                  const isVerified = w.isVerified || w.verified;
                  const isOnline = Boolean(w.isOnline || w.isAvailable || w.available);
                  const isBestValue = Number(w.hourlyRate) === lowestHourly;
                  const isTopRated = Number(w.rating) === highestRating && highestRating > 0;
                  const locText = w.location || w.city || 'Assam, India';
                  const expLabel = w.experience || (w.experienceYears ? `${w.experienceYears}+ Years` : '2+ Years');
                  const jobsCount = w.completedJobs ?? w.jobsDone ?? 0;

                  return (
                    <div
                      key={w.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-soft flex flex-col overflow-hidden"
                    >
                      {/* Worker Identity Header */}
                      <div className="p-5 border-b border-slate-100 relative">
                        {onRemoveWorker && (
                          <button
                            onClick={() => onRemoveWorker(w.id)}
                            title="Remove from compare"
                            className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}

                        <div className="flex items-center gap-3.5 pr-7">
                          <div className="relative shrink-0">
                            <Avatar
                              name={w.name}
                              src={w.avatar || w.profilePhoto}
                              className="w-14 h-14 rounded-xl text-base border border-slate-200"
                            />
                            <span
                              className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                                isOnline ? 'bg-[#16A34A]' : 'bg-slate-300'
                              }`}
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-bold text-[#1E293B] truncate text-base">{w.name}</h3>
                              {isVerified && (
                                <ShieldCheck className="w-4 h-4 text-[#14B8A6] shrink-0" title="Verified" />
                              )}
                            </div>
                            <p className="text-xs font-semibold text-[#2563EB] truncate">{w.profession}</p>
                            <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  isOnline
                                    ? 'bg-green-50 text-[#16A34A] border border-green-200'
                                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                                }`}
                              >
                                <Wifi className="w-2.5 h-2.5" />
                                {isOnline ? 'Online' : 'Offline'}
                              </span>
                              {isTopRated && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                  Top Rated
                                </span>
                              )}
                              {isBestValue && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-[#0D9488] border border-teal-200">
                                  Best Rate
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Key Metrics List */}
                      <div className="p-5 space-y-3.5 text-sm flex-1">
                        <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-500 text-xs font-medium flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 text-amber-500" /> Rating
                          </span>
                          <span className="font-bold text-[#1E293B]">
                            {w.rating || '4.5'} ★ <span className="text-slate-400 font-normal text-xs">({w.reviewsCount || 0})</span>
                          </span>
                        </div>

                        <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-500 text-xs font-medium flex items-center gap-1.5">
                            <IndianRupee className="w-3.5 h-3.5 text-[#2563EB]" /> Hourly Rate
                          </span>
                          <span className="font-extrabold text-[#0F172A]">₹{w.hourlyRate || 350}/hr</span>
                        </div>

                        <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-500 text-xs font-medium flex items-center gap-1.5">
                            <IndianRupee className="w-3.5 h-3.5 text-[#14B8A6]" /> Daily Rate
                          </span>
                          <span className="font-bold text-[#1E293B]">₹{w.dailyRate || 1500}/day</span>
                        </div>

                        <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-500 text-xs font-medium flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Experience
                          </span>
                          <span className="font-semibold text-[#1E293B]">
                            {expLabel} ({jobsCount} jobs)
                          </span>
                        </div>

                        <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-500 text-xs font-medium flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" /> Response
                          </span>
                          <span className="font-semibold text-[#1E293B] text-xs">
                            {w.responseTime || 'Within 30 mins'}
                          </span>
                        </div>

                        <div className="flex items-start justify-between gap-2 py-1.5 border-b border-slate-100">
                          <span className="text-slate-500 text-xs font-medium flex items-center gap-1.5 shrink-0">
                            <MapPin className="w-3.5 h-3.5 text-[#2563EB]" /> Area
                          </span>
                          <span className="font-medium text-[#1E293B] text-xs text-right truncate">
                            {locText}
                          </span>
                        </div>

                        <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-500 text-xs font-medium flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#14B8A6]" /> Verification
                          </span>
                          <span className={`text-xs font-bold ${isVerified ? 'text-[#16A34A]' : 'text-amber-600'}`}>
                            {isVerified ? 'ID & Skill Verified' : 'Standard Member'}
                          </span>
                        </div>

                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                            Top Skills
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {(w.skills || [w.profession]).slice(0, 4).map((skill) => (
                              <span
                                key={skill}
                                className="px-2 py-0.5 rounded-md bg-slate-100 text-[#1E293B] text-[11px] font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                        <Link
                          to={`/worker/${w.id}`}
                          onClick={onClose}
                          className="flex-1 py-2.5 text-center rounded-xl text-xs font-bold text-[#1E293B] bg-white border border-slate-200 hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
                        >
                          Profile
                        </Link>
                        {onBookWorker ? (
                          <button
                            onClick={() => {
                              onClose();
                              onBookWorker(w);
                            }}
                            className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] transition-colors inline-flex items-center justify-center gap-1 shadow-sm"
                          >
                            Book Now <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <Link
                            to={`/worker/${w.id}`}
                            onClick={onClose}
                            className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] transition-colors inline-flex items-center justify-center gap-1 shadow-sm"
                          >
                            Book <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
