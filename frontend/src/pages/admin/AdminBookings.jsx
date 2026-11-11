import React, { useState, useEffect } from 'react';
import {
  Calendar,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  ShieldCheck,
  RefreshCw,
  Clock,
  ArrowRight
} from 'lucide-react';
import { storage } from '../../utils/storage';

export const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    setBookings(storage.getBookings());
  }, []);

  const handleUpdateStatus = (bookingId, newStatus) => {
    const updated = storage.updateBookingStatus(bookingId, newStatus);
    setBookings(updated);

    setNotice(`Booking status updated to ${newStatus}. Client & worker notified.`);
    setTimeout(() => setNotice(null), 3500);
  };

  const filtered = bookings.filter(b => {
    const matchesStatus = filterStatus === 'All' || b.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchesSearch = (b.bookingNumber || '').toLowerCase().includes(q) ||
                          (b.serviceTitle || '').toLowerCase().includes(q) ||
                          (b.workerName || '').toLowerCase().includes(q) ||
                          (b.customerName || '').toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const totalRevenue = bookings.reduce((sum, b) => sum + (Number(b.estimatedAmount) || 0), 0);
  const platformCommission = Math.round(totalRevenue * 0.1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 mb-2">
            <DollarSign className="w-3.5 h-3.5" />
            Financial & Booking Ledger
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Platform Booking Transactions
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Audit customer reservations, monitor milestone completions, manage escrow fund releases, and resolve customer disputes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-800 rounded-xl border border-slate-700 text-xs">
            <span className="text-slate-400 block text-[10px] uppercase">Gross Transaction Volume</span>
            <strong className="text-emerald-400 text-base">₹{totalRevenue.toLocaleString()}</strong>
          </div>
          <div className="px-4 py-2 bg-slate-800 rounded-xl border border-slate-700 text-xs">
            <span className="text-slate-400 block text-[10px] uppercase">Platform Revenue (10%)</span>
            <strong className="text-primary-400 text-base">₹{platformCommission.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      {notice && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="bg-white dark:bg-[#0600AB]/20 rounded-2xl p-4 border border-slate-200/90 dark:border-[#0600AB]/40 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by booking #, service name, worker or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-[#00033D] border border-slate-200 dark:border-[#0600AB]/40 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Pending', 'Accepted', 'In Progress', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus === st
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white dark:bg-[#0600AB]/20 rounded-3xl border border-slate-200/90 dark:border-[#0600AB]/40 shadow-soft overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/60">
        {filtered.map((b) => (
          <div key={b.id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-slate-50/50 dark:hover:bg-[#00033D]/40 transition-colors">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded">
                  {b.bookingNumber}
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  b.status === 'Completed'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : b.status === 'In Progress'
                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                    : b.status === 'Accepted'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                }`}>
                  {b.status}
                </span>
                <span className="text-xs text-slate-400">
                  Scheduled: {b.serviceDate} at {b.serviceTime}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {b.serviceTitle}
              </h3>

              <div className="flex items-center gap-6 text-xs text-slate-600 dark:text-slate-300 flex-wrap pt-1">
                <span>Customer: <strong className="text-slate-900 dark:text-white">{b.customerName || 'Aarav Singhal'}</strong></span>
                <span>Assigned Pro: <strong className="text-slate-900 dark:text-white">{b.workerName}</strong> ({b.workerProfession})</span>
                <span>Location: <strong className="text-slate-900 dark:text-white">{b.address}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 border-t border-slate-100 dark:border-[#0600AB]/30 lg:border-t-0 pt-3 lg:pt-0">
              <div className="text-right">
                <span className="text-[10px] uppercase text-slate-400 block font-semibold">Service Fee</span>
                <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">₹{b.estimatedAmount}</span>
              </div>

              <div className="flex items-center gap-2">
                {b.status !== 'Completed' && (
                  <button
                    onClick={() => handleUpdateStatus(b.id, 'Completed')}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Release Payout
                  </button>
                )}

                {b.status !== 'Cancelled' && (
                  <button
                    onClick={() => handleUpdateStatus(b.id, 'Cancelled')}
                    className="px-3 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-semibold text-xs rounded-xl border border-rose-200 dark:border-rose-800"
                  >
                    Refund Escrow
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

