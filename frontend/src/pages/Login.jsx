import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck, UserCheck, KeyRound, X, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('customer'); // 'customer' | 'worker'
  const [email, setEmail] = useState('aarav.singhal@example.com');
  const [password, setPassword] = useState('password123');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const handleRoleToggle = (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole === 'customer') {
      setEmail('aarav.singhal@example.com');
    } else {
      setEmail('rohit.kumar@example.com');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      login(email, password, role);
      setIsSubmitting(false);
      if (role === 'worker') {
        navigate('/worker-dashboard');
      } else {
        navigate('/customer-dashboard');
      }
    }, 600);
  };

  const handleQuickLogin = (asRole) => {
    if (asRole === 'admin') {
      login('admin@hireworker.com', 'admin123', 'admin');
      navigate('/admin');
    } else if (asRole === 'worker') {
      login('rohit.kumar@example.com', 'worker123', 'worker');
      navigate('/worker-dashboard');
    } else {
      login('aarav.singhal@example.com', 'cust123', 'customer');
      navigate('/customer-dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-block font-extrabold text-2xl text-slate-900 tracking-tight">
            Hire<span className="text-primary-600">Worker</span>
          </Link>
          <h2 className="text-2xl font-bold text-slate-900 mt-3">
            Welcome Back
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your bookings, messages, and job proposals
          </p>
        </div>

        {/* Role Toggle Tabs */}
        <div className="bg-slate-200/80 p-1 rounded-2xl flex text-xs font-bold">
          <button
            type="button"
            onClick={() => handleRoleToggle('customer')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              role === 'customer'
                ? 'bg-white text-primary-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Customer Login
          </button>
          <button
            type="button"
            onClick={() => handleRoleToggle('worker')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              role === 'worker'
                ? 'bg-white text-primary-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Worker Login
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-soft space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {role === 'customer' ? 'Customer Email' : 'Registered Worker Email'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(true)}
                  className="text-xs text-primary-600 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 active:scale-98 text-white font-bold text-sm rounded-xl shadow-md shadow-primary-500/25 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                'Signing In...'
              ) : (
                <>
                  <span>Sign In as {role === 'customer' ? 'Customer' : 'Worker'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins Bar */}
          <div className="pt-4 border-t border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block text-center mb-2">
              Instant 1-Click Demo Login
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('customer')}
                className="py-1.5 px-2 bg-slate-50 hover:bg-primary-50 text-[11px] font-semibold text-slate-700 hover:text-primary-600 border border-slate-200 rounded-lg transition-colors text-center"
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('worker')}
                className="py-1.5 px-2 bg-slate-50 hover:bg-primary-50 text-[11px] font-semibold text-slate-700 hover:text-primary-600 border border-slate-200 rounded-lg transition-colors text-center"
              >
                Worker
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="py-1.5 px-2 bg-slate-50 hover:bg-primary-50 text-[11px] font-semibold text-slate-700 hover:text-primary-600 border border-slate-200 rounded-lg transition-colors text-center"
              >
                Admin
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 pt-1">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-primary-600 hover:underline">
              Sign up free
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-primary-600" />
                Reset Password
              </h3>
              <button onClick={() => { setForgotModalOpen(false); setForgotSent(false); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotSent ? (
              <div className="text-center py-4 space-y-2">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-800">Password Reset Link Sent!</p>
                <p className="text-xs text-slate-500">Check your inbox for instructions to reset your account access.</p>
                <button
                  onClick={() => { setForgotModalOpen(false); setForgotSent(false); }}
                  className="w-full py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl mt-2"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setForgotSent(true); }} className="space-y-3">
                <p className="text-xs text-slate-500">
                  Enter your registered email address and we will send you a one-time link to create a new password.
                </p>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs rounded-xl transition-all"
                >
                  Send Reset Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

