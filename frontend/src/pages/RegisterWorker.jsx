import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  DollarSign,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Upload,
  ArrowRight,
  Map as MapIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { categories } from '../data/categories';
import { ASSAM_DISTRICTS } from '../data/workers';
import { CONFIGURABLE_STATES, DEFAULT_STATE, DEFAULT_COUNTRY } from '../config/states';
import { Avatar } from '../components/Avatar';
import { readImageAsDataUrl } from '../utils/imageUpload';
import { MapPickerModal } from '../components/MapPickerModal';

export const RegisterWorker = () => {
  const { registerWorker, waitForBackendSync } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    profession: 'Electrician',
    category: 'electrician',
    skills: 'Circuit Breakers, Inverter Setup, Home Rewiring',
    experience: '5',
    location: 'Guwahati, Kamrup Metropolitan, Assam',
    city: 'Kamrup Metropolitan',
    workLat: 26.1445,
    workLng: 91.7362,
    locationSharingEnabled: true,
    isOnline: true,
    permanentState: DEFAULT_STATE,
    permanentAddress: '',
    permanentLat: null,
    permanentLng: null,
    hourlyRate: '300',
    dailyRate: '2200',
    languages: 'Hindi, English',
    about: 'Experienced trade professional with proven track record in installations and repairs.',
    avatar: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [showPermanentMapPicker, setShowPermanentMapPicker] = useState(false);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError('');
    try {
      const dataUrl = await readImageAsDataUrl(file, 400);
      setFormData((prev) => ({ ...prev, avatar: dataUrl }));
    } catch (err) {
      setPhotoError(err.message || 'Could not process selected image.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'profession'
        ? { category: categories.find(c => c.name.toLowerCase() === value.toLowerCase())?.id || 'electrician' }
        : {})
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setRegisterError('');
    setIsSubmitting(true);

    setTimeout(async () => {
      registerWorker({
        ...formData,
        coordinates:
          formData.workLat !== null && formData.workLng !== null
            ? { lat: Number(formData.workLat), lng: Number(formData.workLng) }
            : undefined,
        locationSharingEnabled: Boolean(formData.locationSharingEnabled),
        isOnline: Boolean(formData.isOnline),
        permanentAddress: {
          address: formData.permanentAddress,
          state: formData.permanentState || DEFAULT_STATE,
          country: DEFAULT_COUNTRY,
          coordinates: {
            lat: formData.permanentLat,
            lng: formData.permanentLng,
          },
        },
      });
      const syncRes = await waitForBackendSync();
      setIsSubmitting(false);
      if (syncRes && syncRes.success === false && !syncRes.offline) {
        setRegisterError(syncRes.message || 'Could not complete registration on server.');
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        navigate('/worker-dashboard');
      }, 1500);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#00033D] py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/60 px-3 py-1 rounded-full border border-primary-200 dark:border-primary-800">
            Tradesperson Registration
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
            Join as a Skilled Worker
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Grow your daily client base, get direct bookings and earn fair hourly/daily rates.
          </p>
        </div>

        <div className="bg-white dark:bg-[#0600AB]/20 rounded-3xl p-6 sm:p-10 border border-slate-200/90 dark:border-[#0600AB]/40 shadow-soft">
          {success ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Registration Successful!</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                Welcome to WorkOshop, <strong>{formData.fullName}</strong>. Redirecting you to your Worker Dashboard to manage your bookings and services...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Basic Information */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-[#0600AB]/30 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  1. Personal & Contact Information
                </h3>

                {/* Profile Photo Upload */}
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <Avatar
                    name={formData.fullName || 'Worker'}
                    src={formData.avatar}
                    className="w-16 h-16 rounded-2xl text-lg ring-2 ring-primary-500 shrink-0"
                  />
                  <div className="flex-1 space-y-1.5">
                    <p className="text-xs font-bold text-slate-800">Upload Profile Photo (Optional)</p>
                    <p className="text-[11px] text-slate-500">Show customers a clear headshot on your worker card.</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <label className="cursor-pointer px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all inline-flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{formData.avatar ? 'Change Photo' : 'Upload Photo'}</span>
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
                          onClick={() => setFormData((prev) => ({ ...prev, avatar: '' }))}
                          className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 text-xs font-semibold rounded-xl transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {photoError && <p className="text-xs font-medium text-rose-600">{photoError}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      placeholder="e.g. Rohit Kumar"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-[#00033D] border border-slate-200 dark:border-[#0600AB]/40 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-[#00033D] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="rohit@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-[#00033D] border border-slate-200 dark:border-[#0600AB]/40 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-[#00033D] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number (WhatsApp) *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-[#00033D] border border-slate-200 dark:border-[#0600AB]/40 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-[#00033D] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Set Account Password *</label>
                    <input
                      type="password"
                      name="password"
                      required
                      placeholder="Minimum 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-[#00033D] border border-slate-200 dark:border-[#0600AB]/40 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-[#00033D] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Profession & Trade Experience */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-[#0600AB]/30 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  2. Trade & Skill Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Profession *</label>
                    <select
                      name="profession"
                      value={formData.profession}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-[#00033D] border border-slate-200 dark:border-[#0600AB]/40 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-[#00033D] outline-none font-medium"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Years of Experience *</label>
                    <input
                      type="number"
                      name="experience"
                      required
                      min="1"
                      max="40"
                      placeholder="e.g. 5"
                      value={formData.experience}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-[#00033D] border border-slate-200 dark:border-[#0600AB]/40 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-[#00033D] outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Assam District / Work Area *</label>
                      <button
                        type="button"
                        onClick={() => setShowMapPicker(true)}
                        className="text-xs font-semibold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1 hover:underline"
                      >
                        <MapIcon className="w-3.5 h-3.5" />
                        <span>Pick on Map</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      name="location"
                      list="worker-reg-assam-districts"
                      required
                      placeholder="e.g. Guwahati, Kamrup Metropolitan, Assam"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-[#00033D] border border-slate-200 dark:border-[#0600AB]/40 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-[#00033D] outline-none"
                    />
                    <datalist id="worker-reg-assam-districts">
                      {ASSAM_DISTRICTS.map((d) => (
                        <option
                          key={d.district}
                          value={d.town !== d.district ? `${d.town}, ${d.district}, Assam` : `${d.district}, Assam`}
                        />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Skills (comma separated) *</label>
                    <input
                      type="text"
                      name="skills"
                      required
                      placeholder="e.g. MCB Wiring, Inverter Setup, LED profiling"
                      value={formData.skills}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-[#00033D] border border-slate-200 dark:border-[#0600AB]/40 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-[#00033D] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Languages Spoken *</label>
                    <input
                      type="text"
                      name="languages"
                      required
                      placeholder="e.g. Hindi, English, Punjabi"
                      value={formData.languages}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-[#00033D] border border-slate-200 dark:border-[#0600AB]/40 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-[#00033D] outline-none"
                    />
                  </div>
                </div>

                {/* Permanent Residential Address (Private - Separate from Live Location Tracking) */}
                <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#00033D]/80 border border-slate-200 dark:border-[#0600AB]/40 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary-600" />
                        <span>Permanent Address *</span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Private
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Saved privately for verification. Only your approximate area appears on public maps, never your exact home coordinates.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        State *
                      </label>
                      <select
                        name="permanentState"
                        value={formData.permanentState}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 text-sm bg-white dark:bg-[#00033D] border border-slate-200 dark:border-[#0600AB]/40 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-medium"
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
                          Permanent Residential Address *
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
                        name="permanentAddress"
                        required
                        placeholder={`House/Street, Locality, ${formData.permanentState}, ${DEFAULT_COUNTRY}`}
                        value={formData.permanentAddress}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#00033D] border border-slate-200 dark:border-[#0600AB]/40 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                      {formData.permanentLat !== null && formData.permanentLng !== null && (
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
                          Coordinates pinned privately: {Number(formData.permanentLat).toFixed(4)}, {Number(formData.permanentLng).toFixed(4)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Pricing & Rates */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-[#0600AB]/30 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  3. Pricing & Rates
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Hourly Rate (₹) *</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        name="hourlyRate"
                        required
                        min="100"
                        placeholder="300"
                        value={formData.hourlyRate}
                        onChange={handleChange}
                        className="w-full pl-8 pr-3.5 py-2.5 text-sm bg-slate-50 dark:bg-[#00033D] border border-slate-200 dark:border-[#0600AB]/40 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-[#00033D] outline-none font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Day Rate (₹) *</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        name="dailyRate"
                        required
                        min="800"
                        placeholder="2200"
                        value={formData.dailyRate}
                        onChange={handleChange}
                        className="w-full pl-8 pr-3.5 py-2.5 text-sm bg-slate-50 dark:bg-[#00033D] border border-slate-200 dark:border-[#0600AB]/40 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-[#00033D] outline-none font-semibold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Bio / About Me */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-[#0600AB]/30 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  4. Professional Bio
                </h3>
                <div className="mt-4">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">About Your Work Experience & Specializations *</label>
                  <textarea
                    name="about"
                    rows="3"
                    required
                    value={formData.about}
                    onChange={handleChange}
                    className="w-full p-3 text-sm bg-slate-50 dark:bg-[#00033D] border border-slate-200 dark:border-[#0600AB]/40 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-[#00033D] outline-none"
                  />
                </div>
              </div>

              <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Go Online &amp; Share Work Area on Nearby Workers Map
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Allows nearby customers to see your approximate work area immediately after signup.
                  </p>
                </div>
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
                  className="w-4 h-4 text-primary-600 rounded border-slate-300 shrink-0"
                />
              </div>

              {registerError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium">
                  {registerError}
                </div>
              )}

              <div className="p-4 bg-primary-50/70 dark:bg-primary-950/50 rounded-2xl border border-primary-200 dark:border-primary-800 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-primary-600 dark:text-primary-400 shrink-0 mt-0.5" />
                <p className="text-xs text-primary-800 dark:text-primary-200 leading-relaxed">
                  <strong>Verification Notice:</strong> After submitting, your profile will be listed and submitted to the Admin portal for verification. You can start receiving job proposals right away.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 bg-primary-600 hover:bg-primary-700 active:scale-98 text-white font-bold text-sm rounded-xl shadow-lg shadow-primary-500/25 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating Worker Profile...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Worker Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center text-xs text-slate-500 dark:text-slate-400">
                Already registered?{' '}
                <Link to="/login" className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                  Log in to your worker account
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>

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
        title="Pick Your Service Location on Map"
        onSelectLocation={(loc, nearest, exactCoords) =>
          setFormData((prev) => ({
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
          setFormData((prev) => ({
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

