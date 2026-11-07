import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Star,
  ShieldCheck,
  User,
  MapPin,
  TrendingUp,
  Settings,
  Eye,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../utils/storage';
import { RatingStars } from '../components/RatingStars';

export const WorkerDashboard = () => {
  const { user } = useAuth();
  const [workerData, setWorkerData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    // If logged in as worker, get that worker; otherwise default to Rohit Kumar (w-1)
    const currentWorker = (user?.role === 'worker' && storage.getWorkerById(user.id)) || storage.getWorkerById('w-1');
    setWorkerData(currentWorker);
    setIsAvailable(currentWorker?.isAvailable ?? true);
    setBookings(storage.getBookings());
  }, [user]);

  const handleStatusChange = (bookingId, newStatus) => {
    const updated = storage.updateBookingStatus(bookingId, newStatus);
    setBookings(updated);
  };

  const handleToggleAvailability = () => {
    const nextVal = !isAvailable;
    setIsAvailable(nextVal);
    if (workerData) {
      storage.saveWorker({
        ...workerData,
        isAvailable: nextVal,
        availability: nextVal ? 'Available Now' : 'Currently Busy',
      });
    }
  };

  if (!workerData) return null;

  const incomingRequests = bookings.filter(b => b.status === 'Pending');
  const activeJobs = bookings.filter(b => b.status === 'Accepted' || b.status === 'In Progress');
  const completedJobs = bookings.filter(b => b.status === 'Completed');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Worker Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={workerData.avatar}
              alt={workerData.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-primary-500 shadow-sm"
            />
            {isAvailable && (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {workerData.name}
              </h1>
              {workerData.verified && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 fill-emerald-600 text-white" />
                  Verified Pro
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm font-semibold text-primary-600 mt-0.5">
              {workerData.profession} &bull; {workerData.experience}
            </p>
            <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
              <RatingStars rating={workerData.rating} count={workerData.reviewsCount} size="xs" />
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {workerData.location}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Availability Toggle */}
          <button
            onClick={handleToggleAvailability}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all ${
              isAvailable
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-slate-100 border-slate-300 text-slate-600'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span>{isAvailable ? 'Status: Accepting Jobs' : 'Status: Paused'}</span>
          </button>

          <Link
            to={`/worker/${workerData.id}`}
            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4" />
            <span>View Public Profile</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">New Requests</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
              {incomingRequests.length}
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-600 mt-2">{incomingRequests.length}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Awaiting your response</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Jobs</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{activeJobs.length}</p>
          <span className="text-[11px] text-blue-600 font-medium mt-1 block">In progress</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Completed Orders</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{completedJobs.length + 34}</p>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">99.2% positive</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Est. Month Earnings</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">₹42,800</p>
          <span className="text-[11px] text-slate-400 mt-1 block">+18% from last month</span>
        </div>
      </div>

      {/* Incoming Requests Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-soft space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Incoming Booking Requests</h2>
            <p className="text-xs text-slate-500">Respond quickly to secure customer contracts</p>
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            {incomingRequests.length} Pending
          </span>
        </div>

        {incomingRequests.length > 0 ? (
          <div className="space-y-3">
            {incomingRequests.map((b) => (
              <div
                key={b.id}
                className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{b.serviceTitle}</span>
                    <span className="font-bold text-primary-600 text-sm">₹{b.estimatedAmount}</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Customer: <strong>{b.customerName}</strong> ({b.customerPhone})
                  </p>
                  <p className="text-xs text-slate-500">
                    Schedule: {b.serviceDate} at {b.serviceTime} &bull; {b.address}
                  </p>
                  {b.instructions && (
                    <p className="text-xs text-slate-500 italic">"{b.instructions}"</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleStatusChange(b.id, 'Accepted')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    Accept Request
                  </button>
                  <button
                    onClick={() => handleStatusChange(b.id, 'Rejected')}
                    className="px-3.5 py-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-semibold text-xs rounded-xl transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-6 text-center">
            No pending requests at this moment. You'll receive instant alerts when a customer books your service.
          </p>
        )}
      </div>

      {/* Active Jobs in Progress */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-soft space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Current Work Queue</h2>
        {activeJobs.length > 0 ? (
          <div className="space-y-3">
            {activeJobs.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4"
              >
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{b.serviceTitle}</h4>
                  <p className="text-xs text-slate-500">{b.customerName} &bull; {b.address} &bull; {b.serviceDate}</p>
                </div>

                <div className="flex items-center gap-2">
                  {b.status === 'Accepted' && (
                    <button
                      onClick={() => handleStatusChange(b.id, 'In Progress')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl"
                    >
                      Start Work
                    </button>
                  )}
                  {b.status === 'In Progress' && (
                    <button
                      onClick={() => handleStatusChange(b.id, 'Completed')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl"
                    >
                      Mark Completed
                    </button>
                  )}
                  <Link
                    to="/messages"
                    className="p-2 text-slate-600 hover:text-primary-600 border border-slate-200 rounded-xl"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-4 text-center">No jobs currently in progress.</p>
        )}
      </div>
    </div>
  );
};

