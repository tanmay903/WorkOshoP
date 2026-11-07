import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  FileText,
  DollarSign,
  Star,
  Users,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../utils/storage';
import { WorkerCard } from '../components/WorkerCard';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [recommendedWorkers, setRecommendedWorkers] = useState([]);

  useEffect(() => {
    setBookings(storage.getBookings());
    setJobs(storage.getJobs());
    const workers = storage.getWorkers();
    setRecommendedWorkers(workers.slice(0, 3));
  }, []);

  const activeBookings = bookings.filter(b => b.status === 'Pending' || b.status === 'Accepted' || b.status === 'In Progress');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-primary-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'}
            alt={user?.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-primary-400/50 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Welcome back, {user?.name || 'Aarav Singhal'}!
              </h1>
              <span className="hidden sm:inline-block bg-primary-500/20 text-primary-300 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-primary-400/30">
                Customer Account
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Track your service bookings, manage project quotes, and hire on-demand professionals across New Delhi & NCR.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/post-job"
            className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post a Job Free</span>
          </Link>
          <Link
            to="/find-workers"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors"
          >
            Discover Pros
          </Link>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Bookings</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{activeBookings.length}</p>
          <Link to="/bookings" className="text-[11px] font-semibold text-primary-600 hover:underline mt-1 block">
            View booking status &rarr;
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Posted Jobs</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{jobs.length}</p>
          <Link to="/my-jobs" className="text-[11px] font-semibold text-primary-600 hover:underline mt-1 block">
            Manage proposals &rarr;
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Completed Repairs</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {bookings.filter(b => b.status === 'Completed').length}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
            100% Satisfied guarantee
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Spent</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            ₹{bookings.reduce((sum, b) => sum + (Number(b.estimatedAmount) || 0), 0)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Across {bookings.length} reservations
          </span>
        </div>
      </div>

      {/* Active Service Bookings Tracker */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Current Service Bookings</h2>
            <p className="text-xs text-slate-500">Upcoming technician visits and jobs in progress</p>
          </div>
          <Link to="/bookings" className="text-xs font-semibold text-primary-600 hover:underline">
            View All ({bookings.length})
          </Link>
        </div>

        {activeBookings.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {activeBookings.map((b) => (
              <div key={b.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={b.workerAvatar}
                    alt={b.workerName}
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{b.serviceTitle}</h4>
                    <p className="text-xs text-slate-600">
                      With <strong className="text-primary-600">{b.workerName}</strong> &bull; {b.serviceDate} at {b.serviceTime}
                    </p>
                    <span className="text-[10px] text-slate-400">{b.address}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {b.status}
                  </span>
                  <Link
                    to="/bookings"
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-4 text-center">
            No pending bookings right now.
          </p>
        )}
      </div>

      {/* Recommended Verified Workers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Top Recommended Workers Nearby</h2>
            <p className="text-xs text-slate-500">Based on top customer reviews in your area</p>
          </div>
          <Link to="/find-workers" className="text-xs font-semibold text-primary-600 hover:underline">
            Browse All &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedWorkers.map((worker) => (
            <WorkerCard key={worker.id} worker={worker} />
          ))}
        </div>
      </div>
    </div>
  );
};

