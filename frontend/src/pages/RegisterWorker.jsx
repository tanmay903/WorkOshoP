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
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { categories } from '../data/categories';

export const RegisterWorker = () => {
  const { registerWorker } = useAuth();
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
    location: 'New Delhi, India',
    hourlyRate: '300',
    dailyRate: '2200',
    languages: 'Hindi, English',
    about: 'Experienced trade professional with proven track record in installations and repairs.',
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

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
    setIsSubmitting(true);

    setTimeout(() => {
      registerWorker(formData);
      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        navigate('/worker-dashboard');
      }, 1500);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-600 bg-primary-50 px-3 py-1 rounded-full border border-primary-200">
            Tradesperson Registration
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-3">
            Join as a Skilled Worker
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Grow your daily client base, get direct bookings and earn fair hourly/daily rates.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-soft">
          {success ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Registration Successful!</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Welcome to HireWorker, <strong>{formData.fullName}</strong>. Redirecting you to your Worker Dashboard to manage your bookings and services...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Basic Information */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary-600" />
                  1. Personal & Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      placeholder="e.g. Rohit Kumar"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="rohit@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (WhatsApp) *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Set Account Password *</label>
                    <input
                      type="password"
                      name="password"
                      required
                      placeholder="Minimum 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Profession & Trade Experience */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary-600" />
                  2. Trade & Skill Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Profession *</label>
                    <select
                      name="profession"
                      value={formData.profession}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none font-medium"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Years of Experience *</label>
                    <input
                      type="number"
                      name="experience"
                      required
                      min="1"
                      max="40"
                      placeholder="e.g. 5"
                      value={formData.experience}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Work City / Area *</label>
                    <input
                      type="text"
                      name="location"
                      required
                      placeholder="e.g. New Delhi, India"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Skills (comma separated) *</label>
                    <input
                      type="text"
                      name="skills"
                      required
                      placeholder="e.g. MCB Wiring, Inverter Setup, LED profiling"
                      value={formData.skills}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Languages Spoken *</label>
                    <input
                      type="text"
                      name="languages"
                      required
                      placeholder="e.g. Hindi, English, Punjabi"
                      value={formData.languages}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Pricing & Rates */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary-600" />
                  3. Pricing & Rates
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Hourly Rate (₹) *</label>
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
                        className="w-full pl-8 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Day Rate (₹) *</label>
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
                        className="w-full pl-8 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none font-semibold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Bio / About Me */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary-600" />
                  4. Professional Bio
                </h3>
                <div className="mt-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">About Your Work Experience & Specializations *</label>
                  <textarea
                    name="about"
                    rows="3"
                    required
                    value={formData.about}
                    onChange={handleChange}
                    className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div className="p-4 bg-primary-50/70 rounded-2xl border border-primary-200 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                <p className="text-xs text-primary-800 leading-relaxed">
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

              <div className="text-center text-xs text-slate-500">
                Already registered?{' '}
                <Link to="/login" className="font-semibold text-primary-600 hover:underline">
                  Log in to your worker account
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

