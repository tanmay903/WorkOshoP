import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Briefcase,
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
  MessageSquare,
  LocateFixed,
  Map as MapIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../utils/storage';
import { api } from '../services/api';
import { RatingStars } from '../components/RatingStars';
import { Avatar } from '../components/Avatar';
import { MapPickerModal } from '../components/MapPickerModal';

const broadcastLiveLocationUpdate = (payload = {}) => {
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel('workoshop-live-location');
      bc.postMessage({ type: 'worker_location_updated', ts: Date.now(), ...payload });
      bc.close();
    }
  } catch {
    // Non-fatal
  }
};

export const WorkerDashboard = () => {
  const { user } = useAuth();
  const [workerData, setWorkerData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [locationSharing, setLocationSharing] = useState(false);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [locationNotice, setLocationNotice] = useState(null);
  const [showWorkMapPicker, setShowWorkMapPicker] = useState(false);

  useEffect(() => {
    // Detect worker data and ensure it reflects the exact authenticated login identity
    let currentWorker = (user?.role === 'worker' && storage.getWorkerById(user.id)) ||
      (user?.email && storage.getWorkers().find(w => w.email?.toLowerCase() === user.email?.toLowerCase())) ||
      (user?.role === 'worker'
        ? {
            id: user.backendUserId || user.id,
            name: user.name || 'Registered Worker',
            email: user.email || '',
            profession: user.profession || 'Tradesperson',
            experience: user.experience || '1+ Years',
            location: user.location || user.city || 'Guwahati, Assam',
            rating: user.rating || 5.0,
            reviewsCount: user.reviewsCount || 0,
            hourlyRate: user.hourlyRate || 300,
            avatar: user.avatar || '',
            verified: Boolean(user.verified),
            isAvailable: true,
            locationSharingEnabled: false,
          }
        : null);

    if (currentWorker && user?.name) {
      currentWorker = {
        ...currentWorker,
        name: user.name,
        email: user.email || currentWorker.email,
        avatar: user.avatar !== undefined ? user.avatar : currentWorker.avatar,
      };
    }

    setWorkerData(currentWorker);
    setIsAvailable(currentWorker?.isAvailable ?? true);
    setLocationSharing(Boolean(currentWorker?.locationSharingEnabled));
    setBookings(storage.getBookingsForUser(user));

    // Sync real online / location-sharing state directly from MongoDB when authenticated
    if (user?.token) {
      api.getMyWorkerProfile().then((res) => {
        const dbProfile = res?.data;
        if (dbProfile) {
          setIsAvailable(Boolean(dbProfile.isAvailable ?? dbProfile.isOnline));
          setLocationSharing(Boolean(dbProfile.locationSharingEnabled));
          if (currentWorker) {
            storage.saveWorker({
              ...currentWorker,
              isAvailable: Boolean(dbProfile.isAvailable ?? dbProfile.isOnline),
              isOnline: Boolean(dbProfile.isOnline),
              locationSharingEnabled: Boolean(dbProfile.locationSharingEnabled),
              coordinates: dbProfile.coordinates || currentWorker.coordinates,
            });
          }
        }
      });
    }
  }, [user]);

  const handleStatusChange = (bookingId, newStatus) => {
    storage.updateBookingStatus(bookingId, newStatus);
    setBookings(storage.getBookingsForUser(user));
  };

  const handleToggleAvailability = async () => {
    const nextVal = !isAvailable;
    setIsAvailable(nextVal);
    if (workerData) {
      storage.saveWorker({
        ...workerData,
        isAvailable: nextVal,
        isOnline: nextVal,
        availability: nextVal ? 'Available Now' : 'Currently Busy',
      });
    }

    if (!user?.token) {
      setLocationNotice({
        type: 'error',
        text: 'Not authenticated with the backend server. Sign in again with a registered worker account so online status updates in MongoDB.',
      });
      return;
    }

    const res = await api.updateWorkerAvailability({
      isAvailable: nextVal,
      isOnline: nextVal,
      availability: nextVal ? 'Available Now' : 'Currently Busy',
    });
    if (!res?.success) {
      setLocationNotice({
        type: 'error',
        text: res?.message || 'Could not update online status in MongoDB. Check that the backend server is running.',
      });
    } else {
      broadcastLiveLocationUpdate({ isOnline: nextVal });
      setLocationNotice({
        type: 'success',
        text: nextVal ? 'You are now marked Online in MongoDB.' : 'Your online status is paused in MongoDB.',
      });
    }
  };

  const saveWorkCoordinatesToServer = async ({ lat, lng, location, city }) => {
    setIsUpdatingLocation(true);
    const res = await api.updateWorkerLocation({
      lat,
      lng,
      ...(location ? { location } : {}),
      ...(city ? { city } : {}),
      locationSharingEnabled: true,
      isOnline: true,
    });
    setIsUpdatingLocation(false);

    if (res?.success) {
      setLocationSharing(true);
      setIsAvailable(true);
      if (workerData) {
        const updatedWorker = {
          ...workerData,
          ...(location ? { location } : {}),
          ...(city ? { city } : {}),
          coordinates: { lat, lng },
          locationSharingEnabled: true,
          isOnline: true,
          isAvailable: true,
        };
        setWorkerData(updatedWorker);
        storage.saveWorker(updatedWorker);
      }
      broadcastLiveLocationUpdate({ isOnline: true, locationSharingEnabled: true, lat, lng });
      setLocationNotice({
        type: 'success',
        text: `Live location saved to MongoDB (${lat.toFixed(4)}, ${lng.toFixed(4)}). Your approximate area is now live on Nearby Workers.`,
      });
    } else {
      setLocationSharing(false);
      setLocationNotice({
        type: 'error',
        text: res?.message || 'Failed to save live location to MongoDB. Ensure backend and MongoDB are running.',
      });
    }
  };

  const handleToggleLocationSharing = async () => {
    const nextShare = !locationSharing;
    setLocationNotice(null);

    if (!user?.token) {
      setLocationSharing(false);
      setLocationNotice({
        type: 'error',
        text: 'Backend authentication token missing. Please log in with a registered worker account (e.g. demo Rohit or register as a worker) to save live location in MongoDB.',
      });
      return;
    }

    if (!nextShare) {
      const res = await api.updateWorkerLocation({ locationSharingEnabled: false, isOnline: isAvailable });
      if (res?.success) {
        setLocationSharing(false);
        if (workerData) {
          storage.saveWorker({ ...workerData, locationSharingEnabled: false });
        }
        broadcastLiveLocationUpdate({ locationSharingEnabled: false });
        setLocationNotice({ type: 'success', text: 'Live location sharing paused in MongoDB.' });
      } else {
        setLocationNotice({
          type: 'error',
          text: res?.message || 'Unable to reach backend to turn off location sharing.',
        });
      }
      return;
    }

    if (!navigator.geolocation) {
      setLocationNotice({
        type: 'error',
        text: 'Browser geolocation is unavailable. Use "Set Work Area on Map" instead.',
      });
      setShowWorkMapPicker(true);
      return;
    }

    setIsUpdatingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        await saveWorkCoordinatesToServer({ lat, lng });
      },
      () => {
        setIsUpdatingLocation(false);
        setLocationNotice({
          type: 'error',
          text: 'Unable to access browser GPS permission. Click "Set Work Location on Map" to pick your service area and go live.',
        });
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleMapLocationPicked = async (locLabel, nearestDistrict, exactCoords) => {
    setShowWorkMapPicker(false);
    if (!user?.token) {
      setLocationNotice({
        type: 'error',
        text: 'Backend authentication token missing. Sign in again with your registered worker account so location updates save to MongoDB.',
      });
      return;
    }
    const lat = Number((exactCoords?.lat ?? nearestDistrict?.lat ?? 26.1445).toFixed(6));
    const lng = Number((exactCoords?.lng ?? nearestDistrict?.lng ?? 91.7362).toFixed(6));
    await saveWorkCoordinatesToServer({
      lat,
      lng,
      location: locLabel || undefined,
      city: nearestDistrict?.district || undefined,
    });
  };

  if (!workerData) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-extrabold text-slate-900">Worker profile not found</h2>
        <p className="text-sm text-slate-600">
          Complete your worker profile setup or switch to a worker account to view your dashboard.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/register-worker"
            className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl shadow-md transition-colors"
          >
            Create Worker Profile
          </Link>
          <Link
            to="/home"
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold rounded-xl transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const incomingRequests = bookings.filter(b => b.status === 'Pending');
  const activeJobs = bookings.filter(b => b.status === 'Accepted' || b.status === 'In Progress');
  const completedJobs = bookings.filter(b => b.status === 'Completed');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Worker Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar
              name={workerData.name}
              src={workerData.avatar}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl text-xl sm:text-2xl ring-2 ring-primary-500 shadow-sm shrink-0"
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

        <div className="flex items-center gap-3 flex-wrap">
          {/* Availability Toggle */}
          <button
            onClick={handleToggleAvailability}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all ${
              isAvailable
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span>{isAvailable ? 'Status: Accepting Jobs' : 'Status: Paused'}</span>
          </button>

          {/* Live Location Sharing Toggle */}
          <button
            onClick={handleToggleLocationSharing}
            disabled={isUpdatingLocation}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all ${
              locationSharing
                ? 'bg-primary-50 border-primary-300 text-primary-700'
                : 'bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <LocateFixed className={`w-4 h-4 ${isUpdatingLocation ? 'animate-spin' : ''}`} />
            <span>
              {isUpdatingLocation
                ? 'Sharing GPS...'
                : locationSharing
                ? 'Live Location: ON'
                : 'Share Live Location'}
            </span>
          </button>

          {/* Select Work Location on Map (GPS fallback / manual live area pin) */}
          <button
            type="button"
            onClick={() => setShowWorkMapPicker(true)}
            disabled={isUpdatingLocation}
            className="px-4 py-2.5 rounded-xl text-xs font-bold border bg-teal-50 hover:bg-teal-100 border-teal-300 text-teal-800 flex items-center gap-2 transition-all"
          >
            <MapIcon className="w-4 h-4 text-teal-600" />
            <span>Set Work Area on Map</span>
          </button>

          <Link
            to="/available-works"
            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Briefcase className="w-4 h-4" />
            <span>Find Works</span>
          </Link>

          <Link
            to="/worker/certificates"
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Certificates</span>
          </Link>
        </div>
      </div>

      {locationNotice && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm font-medium flex items-center justify-between gap-3 ${
            locationNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
        >
          <span>{locationNotice.text}</span>
          <button
            type="button"
            onClick={() => setLocationNotice(null)}
            className="text-xs font-bold underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

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
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{completedJobs.length}</p>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
            {completedJobs.length > 0 ? 'Verified completions' : 'Ready for first order'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Earnings</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            ₹{completedJobs.reduce((sum, b) => sum + (Number(b.estimatedAmount) || 0), 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            From {completedJobs.length} completed {completedJobs.length === 1 ? 'hire' : 'hires'}
          </span>
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
      <MapPickerModal
        isOpen={showWorkMapPicker}
        onClose={() => setShowWorkMapPicker(false)}
        initialValue={workerData?.location || ''}
        initialCoords={
          workerData?.coordinates?.lat !== undefined && workerData?.coordinates?.lng !== undefined
            ? workerData.coordinates
            : null
        }
        title="Set Live Work Location on Map (Online Status)"
        onSelectLocation={handleMapLocationPicked}
      />
    </div>
  );
};

