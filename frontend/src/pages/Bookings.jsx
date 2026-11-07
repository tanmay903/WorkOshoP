import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Star,
  MessageSquare,
  ChevronRight,
  Filter
} from 'lucide-react';
import { storage } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { ReviewModal } from '../components/ReviewModal';

export const Bookings = () => {
  const { user, isWorker } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [reviewBooking, setReviewBooking] = useState(null);

  useEffect(() => {
    setBookings(storage.getBookings());
  }, []);

  const handleStatusChange = (bookingId, newStatus) => {
    const updated = storage.updateBookingStatus(bookingId, newStatus);
    setBookings(updated);
  };

  const statuses = ['All', 'Pending', 'Accepted', 'In Progress', 'Completed', 'Cancelled', 'Rejected'];

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus === 'All') return true;
    return b.status === filterStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Accepted':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'In Progress':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Cancelled':
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Service Bookings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your service reservations, arrival schedules, and completion sign-offs.
          </p>
        </div>

        <Link
          to="/find-workers"
          className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-primary-500/25 transition-all inline-flex items-center gap-1.5"
        >
          Book Another Service
        </Link>
      </div>

      {/* Status filter bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-semibold">
        {statuses.map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              filterStatus === st
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:border-primary-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              {/* Left Column: Worker info & service info */}
              <div className="flex items-start gap-4">
                <img
                  src={b.workerAvatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80'}
                  alt={b.workerName}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover shrink-0 ring-1 ring-slate-200"
                />

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {b.bookingNumber}
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(b.status)}`}>
                      {b.status}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                    {b.serviceTitle}
                  </h3>

                  <p className="text-xs text-slate-600">
                    Assigned Tradesperson:{' '}
                    <Link to={`/worker/${b.workerId}`} className="font-semibold text-primary-600 hover:underline">
                      {b.workerName} ({b.workerProfession})
                    </Link>
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap pt-1">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-primary-600" />
                      {b.serviceDate} at {b.serviceTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {b.address}
                    </span>
                    <span className="font-bold text-slate-900">
                      Est. ₹{b.estimatedAmount}
                    </span>
                  </div>

                  {b.instructions && (
                    <p className="text-xs text-slate-500 italic mt-1">
                      Note: "{b.instructions}"
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column: Dynamic Action Controls based on status and persona */}
              <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap border-t lg:border-t-0 pt-3 lg:pt-0 shrink-0">
                {/* Actions for Worker persona */}
                {isWorker && b.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(b.id, 'Accepted')}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs"
                    >
                      Accept Booking
                    </button>
                    <button
                      onClick={() => handleStatusChange(b.id, 'Rejected')}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-xl border border-rose-200"
                    >
                      Decline
                    </button>
                  </>
                )}

                {/* Status progression buttons */}
                {b.status === 'Accepted' && (
                  <button
                    onClick={() => handleStatusChange(b.id, 'In Progress')}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs"
                  >
                    Start Service
                  </button>
                )}

                {b.status === 'In Progress' && (
                  <button
                    onClick={() => handleStatusChange(b.id, 'Completed')}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs"
                  >
                    Mark as Completed
                  </button>
                )}

                {/* Completed review trigger */}
                {b.status === 'Completed' && (
                  <button
                    onClick={() => setReviewBooking(b)}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                  >
                    <Star className="w-3.5 h-3.5 fill-white" />
                    <span>Rate & Review</span>
                  </button>
                )}

                {/* Cancel option for pending bookings */}
                {b.status === 'Pending' && (
                  <button
                    onClick={() => handleStatusChange(b.id, 'Cancelled')}
                    className="px-3 py-2 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                )}

                <Link
                  to={`/messages?conv=conv-1`}
                  className="p-2 text-slate-600 hover:text-primary-600 hover:bg-slate-100 rounded-xl border border-slate-200"
                  title="Message worker"
                >
                  <MessageSquare className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 shadow-xs space-y-4">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No bookings in this category</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don't have any bookings with status "{filterStatus}". Discover skilled workers and book a slot anytime.
          </p>
          <Link
            to="/find-workers"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs rounded-xl shadow-sm"
          >
            Find Workers Now
          </Link>
        </div>
      )}

      {/* Review Modal */}
      {reviewBooking && (
        <ReviewModal
          worker={{
            id: reviewBooking.workerId,
            name: reviewBooking.workerName,
            profession: reviewBooking.workerProfession,
            avatar: reviewBooking.workerAvatar,
          }}
          bookingId={reviewBooking.id}
          isOpen={true}
          onClose={() => setReviewBooking(null)}
          onReviewAdded={() => {
            setBookings(storage.getBookings());
          }}
        />
      )}
    </div>
  );
};

