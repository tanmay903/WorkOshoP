import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Lock,
  ArrowRight,
  AlertCircle,
  LocateFixed,
  DollarSign
} from 'lucide-react';
import { storage } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const BookingModal = ({ worker, initialService, isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [serviceDate, setServiceDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [serviceTime, setServiceTime] = useState('10:00 AM');
  
  // Real location only — no fake default dummy addresses
  const [address, setAddress] = useState(user?.address || '');
  const [locationError, setLocationError] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [instructions, setInstructions] = useState('');
  
  const [selectedService, setSelectedService] = useState(
    initialService || worker.services?.[0] || {
      title: `General ${worker.profession} Service`,
      price: worker.hourlyRate || 300,
    }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);

  if (!isOpen) return null;

  // Handle location detection via Geolocation API
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser. Please type your address.');
      return;
    }
    setIsDetectingLocation(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingLocation(false);
        const lat = pos.coords.latitude.toFixed(4);
        const lng = pos.coords.longitude.toFixed(4);
        const detected = `GPS Location (${lat}, ${lng}) - ${user?.city || worker.city || 'Nearby'}`;
        setAddress(detected);
      },
      () => {
        setIsDetectingLocation(false);
        setLocationError('Unable to detect location. Please type your street/house address manually.');
      },
      { timeout: 7000 }
    );
  };

  const handleRedirectToLogin = () => {
    onClose();
    navigate('/login', {
      state: {
        from: window.location.pathname,
        message: `Please sign in or create an account to hire ${worker.name}.`,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Enforce user authentication
    if (!user) {
      handleRedirectToLogin();
      return;
    }

    // 2. Enforce valid, non-empty work location / address
    const trimmedAddress = address.trim();
    if (!trimmedAddress || trimmedAddress.length < 5) {
      setLocationError('Please provide your complete work location/address (House/Flat No., Street, Landmark, City).');
      return;
    }

    setIsSubmitting(true);
    setLocationError('');

    const bookingPayload = {
      workerId: worker.id,
      workerName: worker.name,
      workerProfession: worker.profession,
      workerAvatar: worker.avatar,
      customerId: user.id,
      customerName: user.name,
      customerPhone: user.phone || '',
      customerEmail: user.email || '',
      serviceTitle: selectedService.title,
      serviceDate,
      serviceTime,
      address: trimmedAddress,
      location: trimmedAddress,
      instructions: instructions.trim(),
      estimatedAmount: selectedService.price,
      amount: selectedService.price,
      status: 'Pending',
    };

    // Try posting to backend API first
    try {
      await api.postBooking(bookingPayload);
    } catch {
      // Graceful offline handling
    }

    // Persist in local storage
    try {
      const saved = storage.saveBooking(bookingPayload);
      setCreatedBooking(saved);
      setIsSubmitting(false);
      setIsConfirmed(true);
    } catch (err) {
      setIsSubmitting(false);
      setLocationError(err.message || 'Failed to create booking. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100 transition-colors">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={worker.avatar}
              alt={worker.name}
              className="w-11 h-11 rounded-full object-cover border-2 border-white/40 shadow-sm"
            />
            <div>
              <h3 className="font-bold text-lg leading-tight flex items-center gap-2">
                Book {worker.name}
                {worker.verified && (
                  <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full font-medium">Verified</span>
                )}
              </h3>
              <p className="text-primary-100 text-xs">{worker.profession} &bull; ₹{worker.hourlyRate}/hr</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CASE 1: USER IS NOT LOGGED IN -> BLOCK BOOKING & SHOW LOGIN GATEWAY */}
        {!user ? (
          <div className="p-8 text-center space-y-5 animate-fadeIn">
            <div className="w-16 h-16 mx-auto bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center shadow-inner">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-3 py-1 rounded-full">
                Sign In Required
              </span>
              <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-3">
                Log In to Hire {worker.name}
              </h4>
              <p className="text-slate-600 dark:text-slate-300 text-sm mt-2 max-w-md mx-auto leading-relaxed">
                You must have an active HireWorker account to book skilled tradespeople, receive guaranteed on-site arrival, and track your work orders.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-4 text-left text-xs space-y-2 text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                <ShieldCheck className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <span>Why is login required to hire?</span>
              </div>
              <ul className="space-y-1 pl-6 list-disc text-slate-500 dark:text-slate-400">
                <li>Guaranteed arrival confirmation by verified worker</li>
                <li>Live status tracking and in-app chat</li>
                <li>Zero advance payments — pay safely after job satisfaction</li>
              </ul>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                onClick={onClose}
                className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-xl transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleRedirectToLogin}
                className="flex-1 py-3 px-5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-primary-500/25 flex items-center justify-center gap-2 text-sm"
              >
                <span>Sign In / Register to Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : isConfirmed ? (
          /* CASE 2: BOOKING CONFIRMED SCREEN */
          <div className="p-8 text-center space-y-5 animate-fadeIn">
            <div className="w-16 h-16 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                Booking Requested
              </span>
              <h4 className="text-2xl font-bold text-slate-800 mt-2">
                Booking #{createdBooking?.bookingNumber} Confirmed!
              </h4>
              <p className="text-slate-600 text-sm mt-1 max-w-md mx-auto">
                Your request has been sent to <strong>{worker.name}</strong>. You will receive real-time updates under your Bookings dashboard.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-100 text-xs space-y-2 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Service:</span>
                <span className="font-semibold text-slate-900">{selectedService.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Scheduled Time:</span>
                <span className="font-semibold text-slate-900">{serviceDate} at {serviceTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Work Location:</span>
                <span className="font-semibold text-slate-900 truncate max-w-[240px]">{address}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm">
                <span className="font-medium text-slate-700">Estimated Cost:</span>
                <span className="font-bold text-primary-600">₹{selectedService.price}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  onClose();
                  navigate('/bookings');
                }}
                className="flex-1 py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-primary-500/25"
              >
                View My Bookings
              </button>
              <button
                onClick={onClose}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* CASE 3: ACTIVE BOOKING FORM WITH STRICT LOCATION VALIDATION */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Service Selection */}
            {worker.services && worker.services.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Choose Service Package
                </label>
                <div className="space-y-2">
                  {worker.services.map((srv) => {
                    const isSelected = selectedService.id === srv.id || selectedService.title === srv.title;
                    return (
                      <div
                        key={srv.id || srv.title}
                        onClick={() => setSelectedService(srv)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/40 ring-1 ring-primary-500'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                        }`}
                      >
                        <div>
                          <p className="font-medium text-sm text-slate-900 dark:text-white">{srv.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{srv.duration || 'Standard'} &bull; {srv.description?.slice(0, 50)}...</p>
                        </div>
                        <span className="font-bold text-primary-600 dark:text-primary-400 text-sm">
                          ₹{srv.price}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Date & Time Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Service Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="date"
                    required
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Preferred Time Slot <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <select
                    value={serviceTime}
                    onChange={(e) => setServiceTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                  >
                    <option value="09:00 AM">09:00 AM - 11:00 AM</option>
                    <option value="11:00 AM">11:00 AM - 01:00 PM</option>
                    <option value="02:00 PM">02:00 PM - 04:00 PM</option>
                    <option value="04:00 PM">04:00 PM - 06:00 PM</option>
                    <option value="06:00 PM">06:00 PM - 08:00 PM</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Work Location / Address - STRICTLY REQUIRED */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  <span>Work Location / Address</span>
                  <span className="text-rose-500 font-bold">* Required</span>
                </label>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isDetectingLocation}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 font-semibold flex items-center gap-1 hover:underline"
                >
                  <LocateFixed className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                  <span>{isDetectingLocation ? 'Detecting...' : 'Use My GPS'}</span>
                </button>
              </div>

              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="Enter house/flat number, street, landmark, city"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (locationError) setLocationError('');
                  }}
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl outline-none transition-all ${
                    locationError
                      ? 'border-2 border-rose-500 bg-rose-50/30 dark:bg-rose-950/20 focus:ring-2 focus:ring-rose-400'
                      : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-100'
                  }`}
                />
              </div>

              {locationError ? (
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1.5 flex items-center gap-1 font-semibold animate-fadeIn">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{locationError}</span>
                </p>
              ) : (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  The professional will travel directly to this address. Please ensure it is accurate.
                </p>
              )}
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Additional Instructions (Optional)
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <textarea
                  rows="2"
                  placeholder="e.g. Bring step ladder, switchboard sparking since morning..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>
            </div>

            {/* Price Guarantee Banner */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                <strong>HireWorker Guarantee:</strong> Pay after service satisfaction. No hidden advance charges.
              </span>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Total Estimate</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white">₹{selectedService.price}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 active:scale-95 transition-all rounded-xl shadow-md hover:shadow-primary-500/25 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
