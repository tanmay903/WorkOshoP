import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  DollarSign,
  Calendar,
  MapPin,
  Briefcase,
  Phone,
  Mail,
  User,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Lock,
  Map as MapIcon
} from 'lucide-react';
import { categories } from '../data/categories';
import { storage } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { useCustomerLocation } from '../context/LocationContext';
import { MapPickerModal } from '../components/MapPickerModal';

export const PostJob = () => {
  const { user } = useAuth();
  const { customerLocation, defaultMapLocation } = useCustomerLocation();
  const navigate = useNavigate();
  const [showMapPicker, setShowMapPicker] = useState(false);
  const lastSyncedSiteLabelRef = useRef(customerLocation.isSet ? customerLocation.label : '');

  const [formData, setFormData] = useState({
    title: '',
    category: 'electrician',
    description: '',
    location:
      (customerLocation.isSet && customerLocation.label) ||
      user?.location ||
      user?.address ||
      (user?.city ? `Sector 21, ${user.city}` : ''),
    budget: '',
    paymentType: 'Fixed Price',
    experienceRequired: '3+ Years',
    preferredDate: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 3);
      return d.toISOString().split('T')[0];
    })(),
    customerName: user?.name || '',
    customerPhone: user?.phone || '',
    customerEmail: user?.email || '',
  });

  const [locationError, setLocationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#00033D] py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center transition-colors">
        <div className="max-w-md w-full bg-white dark:bg-[#0600AB]/20 rounded-3xl p-8 border border-slate-200/90 dark:border-[#0600AB]/40 shadow-soft-lg text-center space-y-5 animate-fadeIn">
          <div className="w-16 h-16 mx-auto bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center border border-amber-200 dark:border-amber-800">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Sign In to Post a Job</h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Please log in or create a customer account to post job requests, compare verified tradesperson bids, and hire securely.
          </p>
          <button
            onClick={() =>
              navigate('/login', {
                state: { from: '/post-job', message: 'Please log in or create an account to post a job.' },
              })
            }
            className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Sign In / Register</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (e.target.name === 'location' && locationError) {
      setLocationError('');
    }
  };

  useEffect(() => {
    const nextSiteLabel = customerLocation.isSet ? customerLocation.label : '';
    setFormData((prev) => {
      if (!nextSiteLabel) return prev;
      if (!prev.location || prev.location === lastSyncedSiteLabelRef.current) {
        return { ...prev, location: nextSiteLabel };
      }
      return prev;
    });
    lastSyncedSiteLabelRef.current = nextSiteLabel;
  }, [customerLocation.isSet, customerLocation.label]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.location || !formData.location.trim() || formData.location.trim().length < 5) {
      setLocationError('Please provide your complete job location / address (at least 5 characters).');
      return;
    }

    setIsSubmitting(true);
    setLocationError('');

    const categoryObj = categories.find(c => c.id === formData.category);

    setTimeout(() => {
      const createdJob = storage.saveJob({
        title: formData.title,
        category: formData.category,
        categoryName: categoryObj?.name || 'Skilled Trade',
        description: formData.description,
        location: formData.location,
        budget: Number(formData.budget) || 1500,
        paymentType: formData.paymentType,
        experienceRequired: formData.experienceRequired,
        preferredDate: formData.preferredDate,
        customerId: user?.id || 'cust-1',
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        status: 'Open',
        applicationsCount: 0,
        proposals: [],
      });

      storage.addNotification({
        type: 'job',
        title: 'Job Successfully Posted',
        message: `Your job "${formData.title}" is now live! Skilled workers in your area will be notified.`,
        link: '/my-jobs',
      });

      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        navigate('/my-jobs');
      }, 1200);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#00033D] py-10 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/60 px-3 py-1 rounded-full border border-primary-200 dark:border-primary-800">
            Free Job Posting
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
            Post a Job & Receive Worker Quotes
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Describe your repair or renovation work. Certified workers will review your job and send bids.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#0600AB]/20 rounded-3xl p-6 sm:p-10 border border-slate-200/90 dark:border-[#0600AB]/40 shadow-soft">
          {success ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Job Posted Successfully!</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                Your job listing is active. Redirecting you to <strong>My Jobs</strong> where you can review incoming quotes and messages.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Job Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-[#0600AB]/30 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  1. Job Specifications
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="e.g. Master Bedroom Wall Seepage Repair & Tile Waterproofing"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-[#00033D] border border-slate-200 dark:border-[#0600AB]/40 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-[#00033D] outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Service Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-[#00033D] border border-slate-200 dark:border-[#0600AB]/40 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-[#00033D] outline-none font-medium"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Required Worker Experience
                    </label>
                    <select
                      name="experienceRequired"
                      value={formData.experienceRequired}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-[#00033D] border border-slate-200 dark:border-[#0600AB]/40 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-[#00033D] outline-none font-medium"
                    >
                      <option value="Any Experience">Any Experience</option>
                      <option value="1-2 Years">1-2 Years</option>
                      <option value="3+ Years">3+ Years (Recommended)</option>
                      <option value="5+ Years">5+ Years (Expert only)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Detailed Job Description *
                  </label>
                  <textarea
                    name="description"
                    rows="4"
                    required
                    placeholder="Describe the problem, materials available or required, dimensions, and specific requirements..."
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full p-3 text-sm bg-slate-50 dark:bg-[#00033D] border border-slate-200 dark:border-[#0600AB]/40 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-[#00033D] outline-none"
                  />
                </div>
              </div>

              {/* Location & Schedule */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-[#0600AB]/30 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  2. Location & Date
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Work Location (City & Area) *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowMapPicker(true)}
                        className="text-xs font-semibold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1 hover:underline"
                      >
                        <MapIcon className="w-3.5 h-3.5" />
                        <span>Set on Map</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      name="location"
                      required
                      placeholder="e.g. Zoo Road, Guwahati or Dibrugarh, Assam"
                      value={formData.location}
                      onChange={handleChange}
                      className={`w-full px-3.5 py-2.5 text-sm rounded-xl outline-none transition-all ${locationError
                          ? 'border-2 border-rose-500 bg-rose-50/30 text-rose-900 dark:text-rose-200 focus:ring-2 focus:ring-rose-400'
                          : 'bg-slate-50 dark:bg-[#00033D] border border-slate-200 dark:border-[#0600AB]/40 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-[#00033D]'
                        }`}
                    />
                    {locationError && (
                      <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{locationError}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Preferred Service Date *
                    </label>
                    <input
                      type="date"
                      name="preferredDate"
                      required
                      value={formData.preferredDate}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-[#00033D] border border-slate-200 dark:border-[#0600AB]/40 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-[#00033D] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Budget & Payment Type */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-[#0600AB]/30 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  3. Budget & Payment Type
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Payment Model
                    </label>
                    <select
                      name="paymentType"
                      value={formData.paymentType}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-[#00033D] border border-slate-200 dark:border-[#0600AB]/40 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-[#00033D] outline-none font-medium"
                    >
                      <option value="Fixed Price">Fixed Total Budget</option>
                      <option value="Hourly Rate">Hourly Payment</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Estimated Budget (₹) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        name="budget"
                        required
                        min="200"
                        placeholder="e.g. 2500"
                        value={formData.budget}
                        onChange={handleChange}
                        className="w-full pl-8 pr-3.5 py-2.5 text-sm bg-slate-50 dark:bg-[#00033D] border border-slate-200 dark:border-[#0600AB]/40 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-[#00033D] outline-none font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-[#0600AB]/30 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  4. Contact Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Your Name</label>
                    <input
                      type="text"
                      name="customerName"
                      required
                      value={formData.customerName}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-[#00033D] border border-slate-200 dark:border-[#0600AB]/40 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-[#00033D] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="customerPhone"
                      required
                      value={formData.customerPhone}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-[#00033D] border border-slate-200 dark:border-[#0600AB]/40 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-[#00033D] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                    <input
                      type="email"
                      name="customerEmail"
                      required
                      value={formData.customerEmail}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-[#00033D] border border-slate-200 dark:border-[#0600AB]/40 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-[#00033D] outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  Posting jobs on WorkOshop is 100% free with no obligation to hire. You choose the best worker quote.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 active:scale-98 text-white font-bold text-sm rounded-xl shadow-lg shadow-primary-500/25 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Publishing Job Listing...</span>
                  </>
                ) : (
                  <>
                    <span>Post Job Free Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      <MapPickerModal
        isOpen={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        initialValue={formData.location || defaultMapLocation.label}
        initialCoords={
          !formData.location ||
          (customerLocation.isSet && formData.location === customerLocation.label)
            ? { lat: defaultMapLocation.lat, lng: defaultMapLocation.lng }
            : null
        }
        title="Select Job Location on Map"
        onSelectLocation={(loc) => {
          setFormData(prev => ({ ...prev, location: loc }));
          if (locationError) setLocationError('');
        }}
      />
    </div>
  );
};

