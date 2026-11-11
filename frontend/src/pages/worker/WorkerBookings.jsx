import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Phone,
  MessageSquare,
  DollarSign,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Filter,
  User
} from 'lucide-react';
import { storage } from '../../utils/storage';
import { useAuth } from '../../context/AuthContext';

export const WorkerBookings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    setBookings(storage.getBookingsForUser(user));
  }, [user]);

  const handleStatusChange = (bookingId, newStatus) => {
    storage.updateBookingStatus(bookingId, newStatus);
    setBookings(storage.getBookingsForUser(user));
  };

  const handleMessageCustomer = (b) => {
    const conv = storage.startOrGetConversationWithCustomer(
      {
        id: b.customerId,
        name: b.customerName,
      },
      {
        id: b.workerId || user?.id,
        name: b.workerName || user?.name,
        profession: b.workerProfession || user?.profession,
        avatar: b.workerAvatar || user?.avatar,
      }
    );
    navigate(`/messages?conv=${conv.id}`);
  };

  const statuses = ['All', 'Pending', 'Accepted', 'In Progress', 'Completed', 'Cancelled', 'Rejected'];

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus === 'All') return true;
    return b.status === filterStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Accepted':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'In Progress':
        return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'Completed':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Cancelled':
      case 'Rejected':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-[#0600AB]/20 rounded-2xl p-6 border border-slate-200/90 dark:border-[#0600AB]/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-2.5 py-0.5 rounded-full border border-primary-200 dark:border-primary-800">
            Worker Service Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1.5">
            Customer Bookings & Job Dispatch
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Accept or schedule incoming customer requests, review job site locations, and collect completed service earnings.
          </p>
        </div>

        <Link
          to="/available-works"
          className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-primary-500/25 transition-all inline-flex items-center gap-1.5"
        >
          <span>Find Available Works</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-semibold">
        {statuses.map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              filterStatus === st
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-white dark:bg-[#0600AB]/20 hover:bg-slate-100 dark:hover:bg-[#0600AB]/40 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#0600AB]/40'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Bookings Feed */}
      {filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="bg-white dark:bg-[#0600AB]/20 rounded-2xl p-6 border border-slate-200/90 dark:border-[#0600AB]/40 shadow-xs hover:border-primary-300 dark:hover:border-primary-400 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[10px] font-bold text-slate-400 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {b.bookingNumber}
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(b.status)}`}>
                    {b.status}
                  </span>
                  <span className="text-xs text-slate-400">
                    Created {new Date(b.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  {b.serviceTitle}
                </h3>

                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <User className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                  <span>Customer: <strong className="text-slate-900 dark:text-white">{b.customerName || 'Aarav Singhal'}</strong> ({b.customerPhone || '+91 98711 22334'})</span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap pt-1">
                  <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-200">
                    <Calendar className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                    Slot: {b.serviceDate} at {b.serviceTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {b.address}
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    Fee: ₹{b.estimatedAmount}
                  </span>
                </div>

                {b.instructions && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-1 bg-slate-50 dark:bg-[#00033D]/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    Client Instructions: "{b.instructions}"
                  </p>
                )}
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-2.5 flex-wrap lg:flex-nowrap border-t border-slate-100 dark:border-[#0600AB]/30 lg:border-t-0 pt-3 lg:pt-0 shrink-0">
                {b.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(b.id, 'Accepted')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
                    >
                      Accept Booking
                    </button>
                    <button
                      onClick={() => handleStatusChange(b.id, 'Rejected')}
                      className="px-3.5 py-2 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-semibold text-xs rounded-xl border border-rose-200 dark:border-rose-800 transition-colors"
                    >
                      Decline
                    </button>
                  </>
                )}

                {b.status === 'Accepted' && (
                  <button
                    onClick={() => handleStatusChange(b.id, 'In Progress')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
                  >
                    Start Service Job
                  </button>
                )}

                {b.status === 'In Progress' && (
                  <button
                    onClick={() => handleStatusChange(b.id, 'Completed')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
                  >
                    Mark Job Completed
                  </button>
                )}

                <button
                  onClick={() => handleMessageCustomer(b)}
                  className="p-2 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
                  title="Message customer"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>

                <a
                  href={`tel:${b.customerPhone || '9871122334'}`}
                  className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-xl border border-emerald-200 dark:border-emerald-800 transition-colors"
                  title="Call customer"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0600AB]/20 rounded-3xl p-12 text-center border border-slate-200/90 dark:border-[#0600AB]/40 shadow-xs space-y-3">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">No bookings found for "{filterStatus}"</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            You currently have no customer appointments under this status tab.
          </p>
        </div>
      )}
    </div>
  );
};

