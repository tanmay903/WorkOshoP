import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Briefcase,
  DollarSign,
  Plus,
  Trash2,
  CheckCircle2,
  MapPin,
  Clock,
  Award,
  Globe,
  Camera,
  Save,
  Sparkles,
  Map as MapIcon,
  ShieldCheck,
  LocateFixed,
  AlertCircle
} from 'lucide-react';
import { storage } from '../../utils/storage';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../../components/Avatar';
import { readImageAsDataUrl } from '../../utils/imageUpload';
import { MapPickerModal, ASSAM_DISTRICT_COORDS } from '../../components/MapPickerModal';
import { CONFIGURABLE_STATES, DEFAULT_STATE, DEFAULT_COUNTRY } from '../../config/states';

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

export const WorkerMyProfile = () => {
  const { user, updateUserProfile } = useAuth();
  const workerId = user?.id || 'w-1';
  const [worker, setWorker] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [showPermanentMapPicker, setShowPermanentMapPicker] = useState(false);

  // Editable Profile fields
  const [formData, setFormData] = useState({
    name: '',
    profession: '',
    avatar: '',
    hourlyRate: 300,
    dailyRate: 2200,
    experience: '',
    location: '',
    city: 'Guwahati',
    workLat: null,
    workLng: null,
    locationSharingEnabled: true,
    isOnline: true,
    permanentState: DEFAULT_STATE,
    permanentAddress: '',
    permanentLat: null,
    permanentLng: null,
    tagline: '',
    about: '',
    skills: '',
    languages: '',
    services: [],
  });

  // New service package form
  const [newService, setNewService] = useState({
    title: '',
    price: '',
    duration: '1 hour',
    description: '',
  });

  useEffect(() => {
    let data = storage.getWorkerById(workerId);
    if (!data && user?.email) {
      data = storage.getWorkers().find(w => w.email?.toLowerCase() === user.email?.toLowerCase());
    }
    if (!data && user?.role === 'worker') {
      data = {
        id: user.backendUserId || workerId,
        name: user.name || '',
        email: user.email || '',
        profession: user.profession || 'Electrician',
        hourlyRate: user.hourlyRate || 300,
        dailyRate: user.dailyRate || 2200,
        experience: user.experience || '1+ Years',
        location: user.location || 'Guwahati, Kamrup Metropolitan, Assam',
        city: user.city || 'Guwahati',
        skills: [],
        languages: ['Hindi', 'English'],
        services: [],
      };
    }
    if (data) {
      // Guarantee the profile name always matches the login info
      const resolvedName = user?.name || data.name || '';
      const resolvedEmail = user?.email || data.email || '';
      const resolvedAvatar = user?.avatar !== undefined ? user.avatar : (data.avatar || '');
      const synchronizedWorker = { ...data, name: resolvedName, email: resolvedEmail, avatar: resolvedAvatar };
      const savedPermAddr = user?.permanentAddress || storage.getPermanentAddress(synchronizedWorker.id);
      setWorker(synchronizedWorker);
      setFormData({
        name: resolvedName,
        profession: data.profession || 'Electrician',
        avatar: resolvedAvatar,
        hourlyRate: data.hourlyRate || 300,
        dailyRate: data.dailyRate || 2200,
        experience: data.experience || '5+ Years',
        location: data.location || 'Guwahati, Kamrup Metropolitan, Assam',
        city: data.city || 'Guwahati',
        workLat: data.coordinates?.lat ?? null,
        workLng: data.coordinates?.lng ?? null,
        locationSharingEnabled: data.locationSharingEnabled ?? true,
        isOnline: data.isOnline ?? true,
        permanentState: savedPermAddr?.state || DEFAULT_STATE,
        permanentAddress: savedPermAddr?.address || '',
        permanentLat: savedPermAddr?.coordinates?.lat ?? null,
        permanentLng: savedPermAddr?.coordinates?.lng ?? null,
        tagline: data.tagline || '',
        about: data.about || '',
        skills: (data.skills || []).join(', '),
        languages: (data.languages || []).join(', '),
        services: data.services || [],
      });
    }

    // Fetch latest profile + private permanentAddress from MongoDB when authenticated
    if (user?.token) {
      api.getMyWorkerProfile().then((res) => {
        const dbProfile = res?.data;
        if (!dbProfile) return;
        const perm = dbProfile.permanentAddress;
        setFormData((prev) => ({
          ...prev,
          location: dbProfile.location || prev.location,
          city: dbProfile.city || prev.city,
          workLat: dbProfile.coordinates?.lat ?? prev.workLat,
          workLng: dbProfile.coordinates?.lng ?? prev.workLng,
          locationSharingEnabled: dbProfile.locationSharingEnabled ?? prev.locationSharingEnabled,
          isOnline: dbProfile.isOnline ?? prev.isOnline,
          ...(perm
            ? {
                permanentState: perm.state || DEFAULT_STATE,
                permanentAddress: perm.address || '',
                permanentLat: perm.coordinates?.lat ?? null,
                permanentLng: perm.coordinates?.lng ?? null,
              }
            : {}),
        }));
      });
    }
  }, [workerId, user]);

  const handleAddService = (e) => {
    e.preventDefault();
    if (!newService.title || !newService.price) return;

    const updatedServices = [
      ...formData.services,
      {
        id: `srv-${Date.now()}`,
        title: newService.title,
        price: Number(newService.price),
        duration: newService.duration,
        description: newService.description || 'Standard on-demand service package.',
      }
    ];

    setFormData(prev => ({ ...prev, services: updatedServices }));
    setNewService({ title: '', price: '', duration: '1 hour', description: '' });
  };

  const handleDeleteService = (srvId) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter(s => s.id !== srvId)
    }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError('');
    try {
      const dataUrl = await readImageAsDataUrl(file, 400);
      setFormData(prev => ({ ...prev, avatar: dataUrl }));
    } catch (err) {
      setPhotoError(err.message || 'Could not process selected image.');
    }
  };

  const handleUseCurrentGpsForWorkArea = () => {
    if (!navigator.geolocation) {
      setSaveError('Browser geolocation is unavailable. Use "Set on Map" to pick your service area.');
      return;
    }
    setSaveError('');
    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setFormData((prev) => ({
          ...prev,
          workLat: lat,
          workLng: lng,
          locationSharingEnabled: true,
          isOnline: true,
        }));
        setIsDetectingGps(false);
      },
      () => {
        setIsDetectingGps(false);
        setSaveError('Location permission denied or unavailable. Click "Set on Map" instead.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!worker) return;
    setSaveError('');
    setSaveSuccess(false);
    setIsSaving(true);

    // Resolve work area coordinates (explicit map pin/GPS -> Assam district fallback; NEVER private permanentAddress)
    let resolvedLat = formData.workLat !== null && formData.workLat !== '' ? Number(formData.workLat) : null;
    let resolvedLng = formData.workLng !== null && formData.workLng !== '' ? Number(formData.workLng) : null;
    if (!Number.isFinite(resolvedLat) || !Number.isFinite(resolvedLng)) {
      const locLower = String(formData.location || formData.city || '').toLowerCase();
      const matched = ASSAM_DISTRICT_COORDS.find(
        (d) => locLower.includes(d.district.toLowerCase()) || locLower.includes(d.town.toLowerCase())
      );
      resolvedLat = matched ? matched.lat : 26.1445;
      resolvedLng = matched ? matched.lng : 91.7362;
    }

    const derivedCity =
      (formData.city && String(formData.city).trim()) ||
      String(formData.location || 'Guwahati').split(',')[0].trim() ||
      'Guwahati';

    const updated = {
      ...worker,
      name: formData.name,
      profession: formData.profession,
      avatar: formData.avatar,
      hourlyRate: Number(formData.hourlyRate),
      dailyRate: Number(formData.dailyRate),
      experience: formData.experience,
      location: formData.location,
      city: derivedCity,
      coordinates: { lat: resolvedLat, lng: resolvedLng },
      locationSharingEnabled: Boolean(formData.locationSharingEnabled),
      isOnline: Boolean(formData.isOnline),
      isAvailable: Boolean(formData.isOnline),
      tagline: formData.tagline,
      about: formData.about,
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
      languages: formData.languages.split(',').map(l => l.trim()).filter(Boolean),
      services: formData.services,
    };

    const permanentAddressPayload = {
      address: formData.permanentAddress.trim(),
      state: formData.permanentState || DEFAULT_STATE,
      country: DEFAULT_COUNTRY,
      coordinates: {
        lat: formData.permanentLat,
        lng: formData.permanentLng,
      },
    };

    storage.saveWorker(updated);
    storage.savePermanentAddress(updated.id, permanentAddressPayload);
    setWorker(updated);
    if (updateUserProfile) {
      updateUserProfile({
        name: formData.name,
        profession: formData.profession,
        avatar: formData.avatar,
        permanentAddress: permanentAddressPayload,
      });
    }

    if (user?.token) {
      const [profileRes, locationRes, permRes] = await Promise.all([
        api.updateMyWorkerProfile({
          profession: formData.profession,
          hourlyRate: Number(formData.hourlyRate),
          dailyRate: Number(formData.dailyRate),
          experience: formData.experience,
          location: formData.location,
          city: derivedCity,
          tagline: formData.tagline,
          about: formData.about,
          skills: updated.skills,
          languages: updated.languages,
          services: formData.services,
          coordinates: { lat: resolvedLat, lng: resolvedLng },
          locationSharingEnabled: Boolean(formData.locationSharingEnabled),
          isOnline: Boolean(formData.isOnline),
        }),
        api.updateWorkerLocation({
          lat: resolvedLat,
          lng: resolvedLng,
          location: formData.location,
          city: derivedCity,
          locationSharingEnabled: Boolean(formData.locationSharingEnabled),
          isOnline: Boolean(formData.isOnline),
        }),
        api.updatePermanentAddress(permanentAddressPayload),
      ]);

      setIsSaving(false);
      if (!locationRes?.success || !profileRes?.success) {
        setSaveError(
          locationRes?.message ||
            profileRes?.message ||
            permRes?.message ||
            'Saved locally, but could not sync to MongoDB server.'
        );
        return;
      }
      broadcastLiveLocationUpdate({
        isOnline: Boolean(formData.isOnline),
        locationSharingEnabled: Boolean(formData.locationSharingEnabled),
      });
    } else {
      setIsSaving(false);
      setSaveError('Profile saved locally only — sign in with a registered worker account to sync to MongoDB.');
      return;
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  if (!worker) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-extrabold text-slate-900">Worker profile unavailable</h2>
        <p className="text-sm text-slate-600">
          We couldn&apos;t load your worker profile settings. You can register a worker profile or return to the dashboard.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/register-worker"
            className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl shadow-md transition-colors"
          >
            Register as Worker
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-[#0600AB]/20 rounded-2xl p-6 border border-slate-200/90 dark:border-[#0600AB]/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-2.5 py-0.5 rounded-full border border-primary-200 dark:border-primary-800">
            Worker Profile Settings
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1.5">
            Manage Public Profile & Rates
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Customize your service rates, add bookable service packages, and highlight your craftmanship.
          </p>
        </div>

        <button
          onClick={handleSaveProfile}
          className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-primary-500/25 transition-all flex items-center gap-1.5"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm animate-fadeIn shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Profile changes and service packages successfully updated! Live across customer search.</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Core Identity & Rates */}
        <div className="bg-white dark:bg-[#0600AB]/20 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-[#0600AB]/40 shadow-soft space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-[#0600AB]/30 flex items-center gap-2">
            <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            1. Professional Identity & Rates
          </h3>

          {/* Worker Profile Photo Upload */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <Avatar
              name={formData.name || 'Worker'}
              src={formData.avatar}
              className="w-20 h-20 rounded-2xl text-2xl ring-2 ring-primary-500 shrink-0"
            />
            <div className="flex-1 space-y-2">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">Profile Photo</h4>
                <p className="text-[11px] text-slate-500">
                  Customers see your photo on search cards and your public profile. Upload a clear headshot (JPG, PNG, WEBP).
                </p>
              </div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <label className="cursor-pointer px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all inline-flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" />
                  <span>{formData.avatar ? 'Change Profile Photo' : 'Upload Profile Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                {formData.avatar && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, avatar: '' }))}
                    className="px-3 py-2 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 text-xs font-semibold rounded-xl transition-colors"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
              {photoError && (
                <p className="text-xs font-medium text-rose-600">{photoError}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-[#00033D] border border-slate-200 dark:border-[#0600AB]/40 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Primary Profession</label>
              <input
                type="text"
                required
                value={formData.profession}
                onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-[#00033D] border border-slate-200 dark:border-[#0600AB]/40 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Standard Hourly Rate (₹) *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  required
                  min="100"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                  className="w-full pl-8 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-[#00033D] border border-slate-200 dark:border-[#0600AB]/40 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Day Rate (₹) *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  required
                  min="500"
                  value={formData.dailyRate}
                  onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
                  className="w-full pl-8 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-[#00033D] border border-slate-200 dark:border-[#0600AB]/40 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Total Experience</label>
              <input
                type="text"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-[#00033D] border border-slate-200 dark:border-[#0600AB]/40 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Service Area & City</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleUseCurrentGpsForWorkArea}
                    disabled={isDetectingGps}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 hover:underline"
                  >
                    <LocateFixed className={`w-3.5 h-3.5 ${isDetectingGps ? 'animate-spin' : ''}`} />
                    <span>{isDetectingGps ? 'Detecting...' : 'Use GPS'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMapPicker(true)}
                    className="text-xs font-semibold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1 hover:underline"
                  >
                    <MapIcon className="w-3.5 h-3.5" />
                    <span>Set on Map</span>
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-[#00033D] border border-slate-200 dark:border-[#0600AB]/40 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
              />
              {formData.workLat !== null && formData.workLng !== null && (
                <p className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>Work area pinned: {Number(formData.workLat).toFixed(4)}, {Number(formData.workLng).toFixed(4)}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-primary-50/70 dark:bg-primary-950/40 border border-primary-200/80 dark:border-primary-800/60">
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Share live work location & appear Online on Nearby Workers
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Shows your approximate service area to nearby customers while keeping your permanent home address private.
              </p>
            </div>
            <label className="inline-flex items-center gap-2 cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={Boolean(formData.locationSharingEnabled && formData.isOnline)}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    locationSharingEnabled: e.target.checked,
                    isOnline: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-primary-600 rounded border-slate-300"
              />
              <span className="text-xs font-bold text-primary-700 dark:text-primary-300">
                {formData.locationSharingEnabled && formData.isOnline ? 'Online & Sharing' : 'Hidden'}
              </span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Short Tagline</label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-[#00033D] border border-slate-200 dark:border-[#0600AB]/40 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">About Me & Experience Summary</label>
            <textarea
              rows="3"
              value={formData.about}
              onChange={(e) => setFormData({ ...formData, about: e.target.value })}
              className="w-full p-3 text-xs sm:text-sm bg-slate-50 dark:bg-[#00033D] border border-slate-200 dark:border-[#0600AB]/40 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 outline-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Skills (comma-separated)</label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-[#00033D] border border-slate-200 dark:border-[#0600AB]/40 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Languages Spoken</label>
              <input
                type="text"
                value={formData.languages}
                onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-[#00033D] border border-slate-200 dark:border-[#0600AB]/40 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Permanent Residential Address (Private — Separate from Live Location Tracking) */}
        <div className="bg-white dark:bg-[#0600AB]/20 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-[#0600AB]/40 shadow-soft space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-[#0600AB]/30">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>2. Permanent Address (Private &amp; Not Shown Publicly)</span>
            </h3>
            <span className="self-start sm:self-auto text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Separate from Live GPS
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Your permanent address and exact coordinates are stored privately in MongoDB for verification only. Customers only see your approximate service area on the Nearby Workers map.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">State</label>
              <select
                value={formData.permanentState}
                onChange={(e) => setFormData({ ...formData, permanentState: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-[#00033D] border border-slate-200 dark:border-[#0600AB]/40 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-medium"
              >
                {CONFIGURABLE_STATES.map((st) => (
                  <option key={st.id} value={st.name}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Permanent Residential Address
                </label>
                <button
                  type="button"
                  onClick={() => setShowPermanentMapPicker(true)}
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1 hover:underline"
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>Select on Map</span>
                </button>
              </div>
              <input
                type="text"
                placeholder={`House/Street, Locality, ${formData.permanentState}, ${DEFAULT_COUNTRY}`}
                value={formData.permanentAddress}
                onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-[#00033D] border border-slate-200 dark:border-[#0600AB]/40 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
              />
              {formData.permanentLat !== null && formData.permanentLng !== null && (
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
                  Private coordinates saved: {Number(formData.permanentLat).toFixed(4)}, {Number(formData.permanentLng).toFixed(4)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bookable Service Packages */}
        <div className="bg-white dark:bg-[#0600AB]/20 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-[#0600AB]/40 shadow-soft space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#0600AB]/30">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              3. Fixed-Rate Service Packages (Instant Booking)
            </h3>
            <span className="text-xs text-slate-400">{formData.services.length} active packages</span>
          </div>

          <div className="space-y-3">
            {formData.services.map((srv) => (
              <div
                key={srv.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-[#0600AB]/40 bg-slate-50/50 dark:bg-[#00033D]/60 flex items-center justify-between gap-4"
              >
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{srv.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Duration: {srv.duration} &bull; {srv.description}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="font-bold text-base text-primary-600 dark:text-primary-400">₹{srv.price}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteService(srv.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Service Package Form */}
          <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/30 dark:bg-[#00033D]/30 space-y-3">
            <span className="text-xs font-bold text-slate-900 dark:text-white block">Add New Service Offering</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Service title (e.g. Inverter Wiring)"
                value={newService.title}
                onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                className="px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none"
              />
              <input
                type="number"
                placeholder="Fixed Price (₹)"
                value={newService.price}
                onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                className="px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none"
              />
              <input
                type="text"
                placeholder="Duration (e.g. 1.5 hours)"
                value={newService.duration}
                onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                className="px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none"
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <input
                type="text"
                placeholder="Service description & included materials..."
                value={newService.description}
                onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none"
              />
              <button
                type="button"
                onClick={handleAddService}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Package</span>
              </button>
            </div>
          </div>
        </div>

        {saveError && (
          <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 text-xs sm:text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 active:scale-95 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-lg shadow-primary-500/25 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving to MongoDB...' : 'Save All Profile Updates'}</span>
          </button>
        </div>
      </form>

      <MapPickerModal
        isOpen={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        useCustomerDefault={false}
        initialValue={formData.location}
        initialCoords={
          formData.workLat !== null && formData.workLng !== null
            ? { lat: formData.workLat, lng: formData.workLng }
            : null
        }
        title="Set Your Work Area on Map"
        onSelectLocation={(loc, nearest, exactCoords) =>
          setFormData(prev => ({
            ...prev,
            location: loc,
            city: nearest?.district || prev.city,
            workLat: exactCoords?.lat ?? nearest?.lat ?? prev.workLat,
            workLng: exactCoords?.lng ?? nearest?.lng ?? prev.workLng,
          }))
        }
      />

      <MapPickerModal
        isOpen={showPermanentMapPicker}
        onClose={() => setShowPermanentMapPicker(false)}
        useCustomerDefault={false}
        initialValue={formData.permanentAddress}
        initialCoords={
          formData.permanentLat !== null && formData.permanentLng !== null
            ? { lat: formData.permanentLat, lng: formData.permanentLng }
            : null
        }
        defaultState={formData.permanentState || DEFAULT_STATE}
        defaultCountry={DEFAULT_COUNTRY}
        title="Select Permanent Address on Map (Private)"
        onSelectLocation={(loc, _nearest, exactCoords) =>
          setFormData(prev => ({
            ...prev,
            permanentAddress: loc,
            permanentLat: exactCoords?.lat ?? prev.permanentLat,
            permanentLng: exactCoords?.lng ?? prev.permanentLng,
          }))
        }
      />
    </div>
  );
};

