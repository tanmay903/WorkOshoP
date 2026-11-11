import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Sparkles,
  Heart,
  Zap,
  RefreshCw,
  MapPin,
  Navigation
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCustomerLocation } from '../context/LocationContext';
import { storage } from '../utils/storage';
import { api } from '../services/api';
import { WorkerCard } from '../components/WorkerCard';
import { Avatar } from '../components/Avatar';
import BookingStatusTracker from '../components/BookingStatusTracker';
import { ASSAM_DISTRICT_COORDS } from '../components/MapPickerModal';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const { customerLocation } = useCustomerLocation();
  const [bookings, setBookings] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [recommendedWorkers, setRecommendedWorkers] = useState([]);
  const [savedWorkers, setSavedWorkers] = useState([]);
  const [onlineWorkers, setOnlineWorkers] = useState([]);
  const [totalOnlineCount, setTotalOnlineCount] = useState(0);
  const [isLoadingOnline, setIsLoadingOnline] = useState(true);
  const [onlineError, setOnlineError] = useState('');

  const customerCenter = useMemo(() => {
    if (
      customerLocation.isSet &&
      Number.isFinite(customerLocation.lat) &&
      Number.isFinite(customerLocation.lng)
    ) {
      return {
        lat: customerLocation.lat,
        lng: customerLocation.lng,
        label: customerLocation.district || customerLocation.label || 'Selected Location',
      };
    }
    const cityText = String(user?.city || '').toLowerCase();
    const matched = ASSAM_DISTRICT_COORDS.find(
      (d) => cityText.includes(d.district.toLowerCase()) || cityText.includes(d.town.toLowerCase())
    );
    return matched ? { lat: matched.lat, lng: matched.lng, label: matched.town } : { lat: 26.1445, lng: 91.7362, label: 'Guwahati' };
  }, [
    customerLocation.isSet,
    customerLocation.lat,
    customerLocation.lng,
    customerLocation.district,
    customerLocation.label,
    user?.city,
  ]);

  const fetchOnlineWorkers = useCallback(async () => {
    setIsLoadingOnline(true);
    setOnlineError('');
    const [nearbyRes, allRes] = await Promise.all([
      api.getNearbyWorkers({
        lat: customerCenter.lat,
        lng: customerCenter.lng,
        radius: 50,
        profession: 'all',
      }),
      api.getWorkers({ limit: 6 }),
    ]);

    if (nearbyRes?.success) {
      const liveList = Array.isArray(nearbyRes.data) ? nearbyRes.data : [];
      setOnlineWorkers(liveList);
      setTotalOnlineCount(Number(nearbyRes.totalOnlineSharingCount ?? liveList.length));
    } else {
      setOnlineWorkers([]);
      setTotalOnlineCount(0);
      setOnlineError(nearbyRes?.message || 'Unable to fetch live online workers.');
    }

    if (allRes?.success && Array.isArray(allRes.data) && allRes.data.length > 0) {
      const targetLoc = String(customerCenter.label || '').toLowerCase();
      const sorted = targetLoc
        ? [...allRes.data].sort((a, b) => {
            const aMatch = String(a.district || a.location || '').toLowerCase().includes(targetLoc) ? 0 : 1;
            const bMatch = String(b.district || b.location || '').toLowerCase().includes(targetLoc) ? 0 : 1;
            return aMatch - bMatch;
          })
        : allRes.data;
      setRecommendedWorkers(sorted.slice(0, 3));
    }
    setIsLoadingOnline(false);
  }, [customerCenter.lat, customerCenter.lng, customerCenter.label]);

  useEffect(() => {
    setBookings(storage.getBookingsForUser(user));
    setJobs(storage.getJobsForCustomer(user));
    const workers = storage.getWorkers();
    setRecommendedWorkers(workers.slice(0, 3));
    const loadSaved = () => {
      const savedIds = storage.getSavedWorkerIds(user?.id);
      setSavedWorkers(workers.filter((w) => savedIds.includes(String(w.id))));
    };
    loadSaved();
    window.addEventListener('hw-saved-workers-changed', loadSaved);
    return () => window.removeEventListener('hw-saved-workers-changed', loadSaved);
  }, [user]);

  useEffect(() => {
    fetchOnlineWorkers();

    let channel = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel('workoshop-live-location');
        channel.onmessage = () => fetchOnlineWorkers();
      }
    } catch {
      // Non-fatal
    }

    const handleFocus = () => fetchOnlineWorkers();
    window.addEventListener('focus', handleFocus);

    const intervalId = window.setInterval(fetchOnlineWorkers, 25000);
    return () => {
      if (channel) channel.close();
      window.removeEventListener('focus', handleFocus);
      window.clearInterval(intervalId);
    };
  }, [fetchOnlineWorkers]);

  const activeBookings = bookings.filter(b => b.status === 'Pending' || b.status === 'Accepted' || b.status === 'In Progress');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#1D4ED8] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Avatar
            name={user?.name || 'Customer'}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl text-xl sm:text-2xl ring-2 ring-primary-400/50 shadow-md shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Welcome back, {user?.name || 'Valued Customer'}!
              </h1>
              <span className="hidden sm:inline-block bg-primary-500/20 text-primary-300 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-primary-400/30">
                Customer Account
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Track your service bookings, manage project quotes, and hire on-demand professionals across all 35 districts of Assam.
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
              <div key={b.id} className="py-4 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={b.workerName}
                      src={b.workerAvatar}
                      className="w-12 h-12 rounded-xl text-sm shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-[#1E293B]">{b.serviceTitle}</h4>
                        {b.isEmergency && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                            <Zap className="w-3 h-3" /> Emergency Priority
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600">
                        With <strong className="text-[#2563EB]">{b.workerName}</strong> &bull; {b.serviceDate} at {b.serviceTime}
                      </p>
                      <span className="text-[10px] text-slate-400">{b.address}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200">
                      {b.status}
                    </span>
                    <Link
                      to="/bookings"
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#1E293B] text-xs font-semibold rounded-xl transition-colors"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
                <BookingStatusTracker status={b.status} compact />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center space-y-2">
            <p className="text-xs text-slate-500">
              You haven't hired any workers yet. Browse top-rated professionals to get started.
            </p>
            <Link
              to="/find-workers"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:underline"
            >
              Find Workers to Hire &rarr;
            </Link>
          </div>
        )}
      </div>

      {/* Saved / Favourite Workers */}
      {savedWorkers.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                <Heart className="w-4 h-4 fill-rose-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0F172A]">Saved Professionals ({savedWorkers.length})</h2>
                <p className="text-xs text-slate-500">Quick access to your bookmarked trusted workers</p>
              </div>
            </div>
            <Link to="/find-workers" className="text-xs font-semibold text-[#2563EB] hover:underline">
              Explore More &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedWorkers.slice(0, 3).map((worker) => (
              <WorkerCard key={worker.id} worker={worker} />
            ))}
          </div>
        </div>
      )}

      {/* Live Online Workers Nearby */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-900">
                  Live Online Workers Near {customerCenter.label}
                </h2>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {onlineWorkers.length} Online
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Real-time workers currently online and sharing approximate area within 50 km
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={fetchOnlineWorkers}
              disabled={isLoadingOnline}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 inline-flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingOnline ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <Link
              to="/nearby-workers"
              className="px-3.5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Open Live Map</span>
            </Link>
          </div>
        </div>

        {onlineError ? (
          <div className="py-5 px-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>{onlineError}</span>
            <button
              type="button"
              onClick={fetchOnlineWorkers}
              className="font-bold underline self-start sm:self-auto"
            >
              Try Again
            </button>
          </div>
        ) : isLoadingOnline ? (
          <div className="py-6 text-center text-xs text-slate-500">
            Checking MongoDB for online workers near {customerCenter.label}...
          </div>
        ) : onlineWorkers.length === 0 ? (
          <div className="py-6 text-center space-y-2 bg-slate-50 rounded-2xl border border-slate-200/70">
            <p className="text-xs font-semibold text-slate-600">
              {totalOnlineCount > 0
                ? `${totalOnlineCount} online ${totalOnlineCount === 1 ? 'worker is' : 'workers are'} active outside your 50 km default center.`
                : 'No online workers have shared a live location in your area yet.'}
            </p>
            <Link
              to="/nearby-workers"
              className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:underline"
            >
              <span>Search any location on Nearby Workers Map &rarr;</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {onlineWorkers.slice(0, 6).map((worker) => (
              <div
                key={worker.id}
                className="p-4 rounded-2xl border border-slate-200 hover:border-primary-300 bg-slate-50/50 hover:bg-white transition-all flex flex-col justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    <Avatar
                      name={worker.name}
                      src={worker.avatar}
                      className="w-12 h-12 rounded-xl text-sm ring-2 ring-emerald-400/50"
                    />
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <h4 className="font-bold text-sm text-slate-900 truncate">{worker.name}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                        Online
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-primary-600">{worker.profession}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{worker.approximateArea || worker.location}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/70">
                  <span className="font-bold text-slate-700">{worker.distance}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">₹{worker.hourlyRate}/hr</span>
                    <Link
                      to={`/worker/${worker.id}`}
                      className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white text-[11px] font-bold rounded-lg transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
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

