import React from 'react';
import { Clock, CheckCircle2, Wrench, Award, XCircle } from 'lucide-react';

const STEPS = [
  { key: 'Pending', label: 'Requested', icon: Clock },
  { key: 'Accepted', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'In Progress', label: 'In Progress', icon: Wrench },
  { key: 'Completed', label: 'Completed', icon: Award },
];

/**
 * Visual booking progress bar displaying the current milestone.
 */
export default function BookingStatusTracker({ status = 'Pending', compact = false }) {
  const normalized = (status || 'Pending').trim();
  const isStopped = normalized === 'Cancelled' || normalized === 'Rejected';

  if (isStopped) {
    return (
      <div className="mt-2.5 px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs font-semibold text-rose-700">
        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
        <span>
          Booking {normalized.toLowerCase()} — you can re-book this professional anytime.
        </span>
      </div>
    );
  }

  const currentIdx = Math.max(
    0,
    STEPS.findIndex((s) => s.key.toLowerCase() === normalized.toLowerCase())
  );

  return (
    <div className={compact ? 'mt-2 pt-2 border-t border-slate-100' : 'mt-3 pt-3 border-t border-slate-100'}>
      <div className="flex items-center justify-between relative">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx < currentIdx || (currentIdx === STEPS.length - 1 && idx === currentIdx);
          const isActive = idx === currentIdx && currentIdx < STEPS.length - 1;
          const isLast = idx === STEPS.length - 1;

          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center relative z-10 min-w-[54px]">
                <div
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCompleted
                      ? 'bg-[#16A34A] border-[#16A34A] text-white shadow-sm'
                      : isActive
                      ? 'bg-[#2563EB] border-[#2563EB] text-white ring-4 ring-blue-100'
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
                {!compact && (
                  <span
                    className={`mt-1 text-[10px] font-bold tracking-tight text-center ${
                      isCompleted
                        ? 'text-[#16A34A]'
                        : isActive
                        ? 'text-[#2563EB]'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                )}
              </div>

              {!isLast && (
                <div className={`flex-1 h-1 mx-1 rounded-full ${compact ? '' : '-mt-4'} transition-colors ${
                  idx < currentIdx ? 'bg-[#16A34A]' : 'bg-slate-200'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

