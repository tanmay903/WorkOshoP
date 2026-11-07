import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Register = () => {
  const { registerCustomer } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    city: 'New Delhi',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      registerCustomer(formData);
      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        navigate('/customer-dashboard');
      }, 1200);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Logo and Headings */}
        <div className="text-center">
          <Link to="/" className="inline-block font-extrabold text-2xl text-slate-900 tracking-tight">
            Hire<span className="text-primary-600">Worker</span>
          </Link>
          <h2 className="text-2xl font-bold text-slate-900 mt-3">
            Create Customer Account
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Hire verified tradespeople, track repairs & rate services
          </p>
        </div>

        {/* Tab switch between Customer and Worker registration */}
        <div className="bg-slate-200/80 p-1 rounded-2xl flex text-xs font-bold">
          <button
            type="button"
            className="flex-1 py-2 rounded-xl bg-white text-primary-600 shadow-xs"
          >
            I Need Work Done (Customer)
          </button>
          <Link
            to="/register-worker"
            className="flex-1 py-2 text-center text-slate-600 hover:text-slate-900"
          >
            I Provide Services (Worker)
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-soft">
          {success ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Account Created!</h3>
              <p className="text-xs text-slate-500">
                Welcome, {formData.fullName}. Taking you to your dashboard...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    name="fullName"
                    required
                    placeholder="e.g. Aarav Singhal"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="aarav@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="+91 98711 22334"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="Create a secure password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none font-medium"
                >
                  <option value="New Delhi">New Delhi (NCR)</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Pune">Pune</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Kolkata">Kolkata</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 active:scale-98 text-white font-bold text-sm rounded-xl shadow-md shadow-primary-500/25 transition-all flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? 'Creating Account...' : 'Sign Up as Customer'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center text-xs text-slate-500 pt-2">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-primary-600 hover:underline">
                  Log In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

