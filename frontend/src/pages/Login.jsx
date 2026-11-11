import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  Phone,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  X,
  CheckCircle2,
  Sparkles,
  Globe,
  Clock,
  Star,
  Users,
  AlertCircle,
  Map as MapIcon,
  MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { categories } from '../data/categories';
import { ASSAM_DISTRICTS } from '../data/workers';
import { CONFIGURABLE_STATES, DEFAULT_STATE, DEFAULT_COUNTRY } from '../config/states';
import { detectNameFromEmail } from '../utils/detectName';
import { Avatar } from '../components/Avatar';
import { MapPickerModal } from '../components/MapPickerModal';

export const Login = () => {
  const { user, login, loginWithGoogle, registerCustomer, registerWorker, waitForBackendSync, switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const redirectNotice = location.state?.message;
  const requiredRole = location.state?.requiredRole || searchParams.get('role');
  const initialRole = requiredRole === 'worker' ? 'worker' : 'customer';

  const getDestinationUrl = (userRole) => {
    if (
      location.state?.from &&
      (!location.state?.requiredRole || userRole === location.state.requiredRole)
    ) {
      return location.state.from;
    }
    if (userRole === 'worker') return '/worker-dashboard';
    if (userRole === 'admin') return '/admin';
    return '/home';
  };

  // Mode: 'signin' or 'register'
  const [authMode, setAuthMode] = useState(searchParams.get('mode') === 'register' ? 'register' : 'signin');

  // Role: 'customer' or 'worker'
  const [role, setRole] = useState(initialRole);

  // Sign In State (empty by default so only placeholder suggestions show)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginName, setLoginName] = useState('');
  const [nameManuallyEdited, setNameManuallyEdited] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Register State
  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    state: DEFAULT_STATE,
    city: 'Kamrup Metropolitan',
    permanentAddress: '',
    permanentLat: null,
    permanentLng: null,
    profession: 'Electrician',
    hourlyRate: '300',
    agreeTerms: true,
  });
  const [showPermanentMapPicker, setShowPermanentMapPicker] = useState(false);

  // Loading & Modals
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  // Synchronize when URL changes
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'register') {
      setAuthMode('register');
    } else if (mode === 'signin') {
      setAuthMode('signin');
    }
    const urlRole = location.state?.requiredRole || searchParams.get('role');
    if (urlRole === 'worker' || urlRole === 'customer') {
      handleRoleToggle(urlRole);
    }
  }, [searchParams, location.state]);

  // Handle role switch in login
  const handleRoleToggle = (selectedRole) => {
    setRole(selectedRole);
    setAuthError('');
  };

  // Handle email change with automatic name detection
  const handleEmailChange = (newEmail) => {
    setLoginEmail(newEmail);
    if (!nameManuallyEdited) {
      const detected = detectNameFromEmail(newEmail);
      setLoginName(detected || '');
    }
  };

  // Google Authentication handler -> Enters the website
  const handleGoogleAuth = () => {
    setIsGoogleLoading(true);
    setTimeout(() => {
      loginWithGoogle(role, loginName, loginEmail);
      setIsGoogleLoading(false);
      navigate(getDestinationUrl(role));
    }, 700);
  };

  // Sign In Submit -> Enters the website with detected profile name
  const handleSignInSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    setIsSubmitting(true);

    setTimeout(async () => {
      login(loginEmail, loginPassword, role, loginName);
      const syncRes = await waitForBackendSync();
      setIsSubmitting(false);
      if (syncRes && syncRes.success === false && !syncRes.offline) {
        setAuthError(syncRes.message || 'Invalid email or password. Please check your credentials or register first.');
        return;
      }
      navigate(getDestinationUrl(role));
    }, 450);
  };

  // Register Submit -> Enters the website
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    setIsSubmitting(true);

    setTimeout(async () => {
      if (role === 'worker') {
        const selectedState = registerData.state || DEFAULT_STATE;
        registerWorker({
          fullName: registerData.fullName,
          email: registerData.email,
          phone: registerData.phone,
          password: registerData.password,
          profession: registerData.profession,
          hourlyRate: registerData.hourlyRate,
          location: `${registerData.city}, ${selectedState}, ${DEFAULT_COUNTRY}`,
          city: registerData.city,
          locationSharingEnabled: true,
          isOnline: true,
          permanentAddress: {
            address: registerData.permanentAddress,
            state: selectedState,
            country: DEFAULT_COUNTRY,
            coordinates: {
              lat: registerData.permanentLat,
              lng: registerData.permanentLng,
            },
          },
          experience: '3',
        });
      } else {
        registerCustomer({
          fullName: registerData.fullName,
          email: registerData.email,
          phone: registerData.phone,
          password: registerData.password,
          city: registerData.city,
        });
      }
      const syncRes = await waitForBackendSync();
      setIsSubmitting(false);
      if (syncRes && syncRes.success === false && !syncRes.offline) {
        setAuthError(syncRes.message || 'Registration failed on server. Please review your details.');
        return;
      }
      navigate(getDestinationUrl(role));
    }, 500);
  };

  // Quick 1-click Demo Persona Logins -> Enters the website
  const handleQuickDemoLogin = async (demoRole) => {
    if (demoRole === 'admin') {
      login('admin@workoshop.com', 'password123', 'admin');
    } else if (demoRole === 'worker') {
      login('rohit.kumar@example.com', 'password123', 'worker');
    } else {
      login('aarav.singhal@example.com', 'password123', 'customer');
    }
    await waitForBackendSync();
    navigate(getDestinationUrl(demoRole));
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col lg:flex-row">
      {/* ========================================================
          LEFT COLUMN: BRAND HERO BANNER (Desktop Showcase)
         ======================================================== */}
      <div className="lg:w-1/2 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#1D4ED8] p-8 sm:p-12 lg:p-16 text-white flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
        {/* Glow Effects with gentle floating ambient drift */}
        <div className="absolute top-0 -left-12 w-96 h-96 bg-[#14B8A6]/20 rounded-full blur-3xl pointer-events-none animate-float-slow" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#2563EB]/25 rounded-full blur-3xl pointer-events-none animate-float-reverse" />

        <div className="relative z-10 space-y-6 animate-fade-in-up">
          {/* Logo Brand Header */}
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-[#0F172A] flex items-center justify-center text-white shadow-xl shadow-[#2563EB]/30 ring-2 ring-white/25 shrink-0 group-hover:scale-105 group-hover:rotate-1 transition-transform duration-300">
              <img
                src="/logo.jpg"
                alt="WorkOshop Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="font-extrabold text-2xl sm:text-3xl tracking-tight text-white block group-hover:text-[#14B8A6] transition-colors">
                Work<span className="text-[#14B8A6]">Oshop</span>
              </span>
              <span className="block text-[11px] font-bold uppercase tracking-widest text-teal-300 mt-0.5">
                Official Gateway Portal
              </span>
            </div>
          </div>

          <div className="pt-6 space-y-4 max-w-lg">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-teal-200 text-xs font-semibold backdrop-blur-xs border border-white/15 shimmer-badge hover:scale-105 transition-transform duration-300 cursor-default">
              <Sparkles className="w-3.5 h-3.5 text-[#14B8A6]" />
              Welcome to India's Premier Skilled Marketplace
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Find Skilled People. <br />
              <span className="bg-gradient-to-r from-[#14B8A6] via-blue-200 to-white bg-clip-text text-transparent">
                Get Work Done.
              </span>
            </h2>

            <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
              Connect with certified electricians, plumbers, carpenters, mechanics, cleaners, and construction technicians with guaranteed workmanship.
            </p>
          </div>

          {/* Value Highlights */}
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#16A34A]/20 text-green-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-white block">100% Verified</span>
                <span className="text-slate-300">Aadhaar & police cleared</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#14B8A6]/20 text-teal-300 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-white block">Fast Response</span>
                <span className="text-slate-300">Arrives in &lt; 30 mins</span>
              </div>
            </div>
          </div>
        </div>

        {/* Guest direct entry action */}
        <div className="relative z-10 pt-8 mt-6 border-t border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-300">Want to explore without logging in first?</p>
            <Link
              to="/home"
              className="inline-flex items-center gap-2 mt-1 text-sm font-bold text-[#14B8A6] hover:text-teal-200 transition-colors group"
            >
              <span>Enter Website as Guest</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Users className="w-4 h-4 text-[#14B8A6]" />
            <span>12,500+ Active Pros</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          RIGHT COLUMN: AUTHENTICATION FORM CARD
         ======================================================== */}
      <div className="lg:w-1/2 bg-surface dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex items-center justify-center p-6 sm:p-10 lg:p-12 overflow-y-auto relative transition-colors duration-200">
        <div className="w-full max-w-md space-y-5">
          {/* If already logged in, show quick welcome banner (unless switching to a different required role) */}
          {user && (!requiredRole || user.role === requiredRole) && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-3">
                <Avatar
                  name={user.name}
                  src={user.role === 'worker' ? user.avatar : ''}
                  className="w-10 h-10 rounded-xl text-xs ring-2 ring-emerald-500 shrink-0"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Signed in as {user.name}</p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 capitalize font-medium">{user.role} Account</p>
                </div>
              </div>
              <button
                onClick={() => navigate(getDestinationUrl(user.role))}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {user && requiredRole && user.role !== requiredRole && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3 text-slate-800 animate-fadeIn">
              <Avatar
                name={user.name}
                src={user.role === 'worker' ? user.avatar : ''}
                className="w-10 h-10 rounded-xl text-xs ring-2 ring-blue-500 shrink-0"
              />
              <div className="text-xs">
                <p className="font-bold text-slate-900">
                  Signed in as {user.name} (<span className="capitalize">{user.role}</span>)
                </p>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Please log in with a <strong className="capitalize">{requiredRole}</strong> account below to switch profiles.
                </p>
              </div>
            </div>
          )}

          {/* Redirect Notice Banner (e.g. Please log in to hire this worker) */}
          {redirectNotice && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl flex items-center gap-3 text-amber-900 dark:text-amber-200 shadow-sm animate-fadeIn">
              <div className="w-9 h-9 bg-amber-100 dark:bg-amber-900/60 rounded-xl flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400 font-bold">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold">Authentication Required</p>
                <p className="text-amber-800 dark:text-amber-300 text-[11px] mt-0.5">{redirectNotice}</p>
              </div>
            </div>
          )}

          {/* Main Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-soft-lg space-y-5 transition-colors animate-scale-in">
            {/* Mobile Brand Header */}
            <div className="flex items-center justify-center gap-2.5 pb-1 lg:hidden">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-black flex items-center justify-center ring-1 ring-slate-200 shadow-xs">
                <img
                  src="/logo.jpg"
                  alt="WorkOshop Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-extrabold text-xl text-slate-900 tracking-tight">
                Work<span className="text-primary-600">Oshop</span>
              </span>
            </div>

            {/* Tab Switcher: Sign In vs Register */}
            <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl flex text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setSearchParams({ mode: 'signin' });
                }}
                className={`flex-1 py-2.5 rounded-xl transition-all ${
                  authMode === 'signin'
                    ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setSearchParams({ mode: 'register' });
                }}
                className={`flex-1 py-2.5 rounded-xl transition-all ${
                  authMode === 'register'
                    ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Register / Sign Up
              </button>
            </div>

            {/* Role Selector: Customer vs Worker */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Select Your Persona
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleRoleToggle('customer')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                    role === 'customer'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 ring-1 ring-primary-500'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/50'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-primary-600" />
                  <span>Customer (Hire)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleToggle('worker')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                    role === 'worker'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 ring-1 ring-primary-500'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/50'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5 text-primary-600" />
                  <span>Skilled Worker</span>
                </button>
              </div>
            </div>

            {/* Google Authentication Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isGoogleLoading}
              className="w-full py-2.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-98 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 shadow-xs transition-all flex items-center justify-center gap-3 relative"
            >
              {isGoogleLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                  <span>Connecting with Google...</span>
                </>
              ) : (
                <>
                  {/* Official Multi-colored Google SVG Icon */}
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>
                    {authMode === 'signin' ? 'Sign in with Google' : 'Sign up with Google'}
                  </span>
                  <span className="text-[10px] text-slate-400 capitalize hidden sm:inline font-normal">
                    ({role})
                  </span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700" />
              <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
                or with email
              </span>
              <div className="w-full border-t border-slate-200 dark:border-slate-700" />
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {/* ========================================================
                A. SIGN IN FORM
               ======================================================== */}
            {authMode === 'signin' ? (
              <form onSubmit={handleSignInSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {role === 'customer' ? 'Customer Email' : 'Worker Email'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder={role === 'customer' ? 'e.g. kuddus@example.com' : 'e.g. rohit.kumar@example.com'}
                      value={loginEmail}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Profile Name
                    </label>
                    <span className="text-[10px] text-primary-600 font-semibold bg-primary-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-primary-600" />
                      Auto-detected from login
                    </span>
                  </div>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={loginName}
                      onChange={(e) => {
                        setLoginName(e.target.value);
                        setNameManuallyEdited(true);
                      }}
                      placeholder="e.g. Kuddus Haque"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    This exact name will be imported and shown on your profile, dashboard, and bookings.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
                    <button
                      type="button"
                      onClick={() => setForgotModalOpen(true)}
                      className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="password"
                      required
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 text-primary-600 rounded border-slate-300"
                    />
                    <span>Remember me</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-primary-600 hover:bg-primary-700 active:scale-98 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-primary-500/25 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Enter Website as {role === 'customer' ? 'Customer' : 'Worker'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* ========================================================
                  B. REGISTER FORM
                 ======================================================== */
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aarav Singhal"
                      value={registerData.fullName}
                      onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                      <input
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone *</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                        className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none"
                      />
                    </div>
                  </div>
                </div>

                {role === 'worker' && (
                  <div className="space-y-3 p-3 bg-primary-50/60 rounded-xl border border-primary-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-primary-800 mb-1">Trade Profession</label>
                        <select
                          value={registerData.profession}
                          onChange={(e) => setRegisterData({ ...registerData, profession: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-primary-300 rounded-lg outline-none font-semibold text-slate-800"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-primary-800 mb-1">Hourly Rate (₹)</label>
                        <input
                          type="number"
                          min="150"
                          value={registerData.hourlyRate}
                          onChange={(e) => setRegisterData({ ...registerData, hourlyRate: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-primary-300 rounded-lg outline-none font-bold text-slate-800"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold text-primary-800">
                          Permanent Address (Private)
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowPermanentMapPicker(true)}
                          className="text-[11px] font-bold text-primary-700 hover:underline inline-flex items-center gap-1"
                        >
                          <MapIcon className="w-3 h-3" />
                          <span>Select on Map</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder={`House/Street, Locality, ${registerData.state}, ${DEFAULT_COUNTRY}`}
                        value={registerData.permanentAddress}
                        onChange={(e) => setRegisterData({ ...registerData, permanentAddress: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-primary-300 rounded-lg outline-none text-slate-800"
                      />
                      {registerData.permanentLat !== null && registerData.permanentLng !== null && (
                        <p className="text-[10px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>
                            Pinned privately: {Number(registerData.permanentLat).toFixed(4)}, {Number(registerData.permanentLng).toFixed(4)}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {role === 'worker' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">State *</label>
                    <select
                      value={registerData.state}
                      onChange={(e) => {
                        const nextState = e.target.value;
                        setRegisterData({
                          ...registerData,
                          state: nextState,
                          city: nextState === 'Assam' ? 'Kamrup Metropolitan' : '',
                        });
                      }}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      {CONFIGURABLE_STATES.map((st) => (
                        <option key={st.id} value={st.name}>
                          {st.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {registerData.state === 'Assam' ? 'District (Assam)' : `City / District (${registerData.state})`}
                    </label>
                    {registerData.state === 'Assam' ? (
                      <select
                        value={registerData.city}
                        onChange={(e) => setRegisterData({ ...registerData, city: e.target.value })}
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                      >
                        {ASSAM_DISTRICTS.map((d) => (
                          <option key={d.district} value={d.district}>
                            {d.town !== d.district ? `${d.town} (${d.district})` : d.district}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        required
                        placeholder={`Enter city in ${registerData.state}`}
                        value={registerData.city}
                        onChange={(e) => setRegisterData({ ...registerData, city: e.target.value })}
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        placeholder="Min 6 chars"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                    <input
                      type="checkbox"
                      required
                      checked={registerData.agreeTerms}
                      onChange={(e) => setRegisterData({ ...registerData, agreeTerms: e.target.checked })}
                      className="w-3.5 h-3.5 text-primary-600 rounded border-slate-300"
                    />
                    <span>I agree to Terms of Service & Privacy Policy</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-primary-600 hover:bg-primary-700 active:scale-98 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-primary-500/25 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Register & Enter Website</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* 1-Click Instant Demo Login Bar */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block text-center mb-2">
                1-Click Demo Evaluation (Instant Enter)
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('customer')}
                  className="py-1.5 px-2 bg-slate-50 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-950/60 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors text-center"
                >
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('worker')}
                  className="py-1.5 px-2 bg-slate-50 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-950/60 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors text-center"
                >
                  Worker
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('admin')}
                  className="py-1.5 px-2 bg-slate-50 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-950/60 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors text-center"
                >
                  Admin
                </button>
              </div>
            </div>

            {/* Direct Guest Link */}
            <div className="text-center pt-2">
              <Link
                to="/home"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
              >
                <span>Or Enter Directly as Guest &rarr;</span>
              </Link>
            </div>
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
              <button
                onClick={() => { setForgotModalOpen(false); setForgotSent(false); }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotSent ? (
              <div className="text-center py-4 space-y-2">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-800">Reset Link Sent!</p>
                <p className="text-xs text-slate-500">
                  We've sent recovery instructions to <strong>{forgotEmail || 'your email'}</strong>.
                </p>
                <button
                  onClick={() => { setForgotModalOpen(false); setForgotSent(false); }}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl mt-2 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setForgotSent(true);
                }}
                className="space-y-3"
              >
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enter your registered email address and we will send you a secure link to create a new password.
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
                  className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all"
                >
                  Send Reset Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}
      <MapPickerModal
        isOpen={showPermanentMapPicker}
        onClose={() => setShowPermanentMapPicker(false)}
        initialValue={registerData.permanentAddress}
        initialCoords={
          registerData.permanentLat !== null && registerData.permanentLng !== null
            ? { lat: registerData.permanentLat, lng: registerData.permanentLng }
            : null
        }
        defaultState={registerData.state || DEFAULT_STATE}
        defaultCountry={DEFAULT_COUNTRY}
        title="Select Permanent Address on Map (Private)"
        onSelectLocation={(loc, _nearest, exactCoords) =>
          setRegisterData((prev) => ({
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
