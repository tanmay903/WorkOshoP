import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  ShieldCheck,
  Zap,
  Headphones,
  CheckCircle2,
  ArrowRight,
  Star,
  Users,
  Briefcase,
  TrendingUp,
  Award,
  Sparkles,
  Map as MapIcon
} from 'lucide-react';
import { categories } from '../data/categories';
import { CategoryCard } from '../components/CategoryCard';
import { WorkerCard } from '../components/WorkerCard';
import { storage } from '../utils/storage';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCustomerLocation } from '../context/LocationContext';
import { ASSAM_DISTRICTS } from '../data/workers';
import { MapPickerModal } from '../components/MapPickerModal';

export const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { customerLocation, defaultMapLocation, setSiteLocation } = useCustomerLocation();
  const [professionQuery, setProfessionQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState(
    customerLocation.isSet ? (customerLocation.district || customerLocation.label) : ''
  );
  const [allWorkersPool, setAllWorkersPool] = useState([]);
  const [showMapPicker, setShowMapPicker] = useState(false);

  useEffect(() => {
    if (customerLocation.isSet) {
      setLocationQuery(customerLocation.district || customerLocation.label || '');
    } else {
      setLocationQuery('');
    }
  }, [customerLocation.isSet, customerLocation.district, customerLocation.label]);

  useEffect(() => {
    let active = true;
    const localWorkers = storage.getWorkers();
    setAllWorkersPool(localWorkers);

    api.getWorkers({ limit: 24 }).then((res) => {
      if (!active || !res?.success || !Array.isArray(res.data)) return;
      const merged = [...res.data];
      const seen = new Set(merged.map((w) => String(w.email || w.id).toLowerCase()));
      for (const lw of localWorkers) {
        const key = String(lw.email || lw.id).toLowerCase();
        if (!seen.has(key)) {
          merged.push(lw);
          seen.add(key);
        }
      }
      setAllWorkersPool(merged);
    });

    return () => {
      active = false;
    };
  }, []);

  const featuredWorkers = useMemo(() => {
    const filterKey = String(
      customerLocation.isSet ? (customerLocation.district || customerLocation.label) : ''
    )
      .trim()
      .toLowerCase();

    const sorted = [...allWorkersPool].sort((a, b) => {
      if (filterKey) {
        const aMatch =
          String(a.district || '').toLowerCase().includes(filterKey) ||
          String(a.location || '').toLowerCase().includes(filterKey)
            ? 0
            : 1;
        const bMatch =
          String(b.district || '').toLowerCase().includes(filterKey) ||
          String(b.location || '').toLowerCase().includes(filterKey)
            ? 0
            : 1;
        if (aMatch !== bMatch) return aMatch - bMatch;
      }
      return (b.verified ? 1 : 0) - (a.verified ? 1 : 0);
    });

    return sorted.slice(0, 6);
  }, [allWorkersPool, customerLocation.isSet, customerLocation.district, customerLocation.label]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (professionQuery) params.append('q', professionQuery);
    if (locationQuery) params.append('loc', locationQuery);
    navigate(`/find-workers?${params.toString()}`);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 sm:pt-16 pb-12 sm:pb-20 bg-gradient-to-b from-blue-50/70 via-[#F8FAFC] to-[#F8FAFC]">
        {/* Floating decorative ambient glow orbs */}
        <div className="absolute top-6 left-12 w-72 h-72 bg-gradient-to-tr from-[#14B8A6]/15 to-[#2563EB]/15 rounded-full blur-3xl -z-10 pointer-events-none animate-float-slow" />
        <div className="absolute top-16 right-12 w-80 h-80 bg-gradient-to-bl from-[#2563EB]/15 to-[#14B8A6]/15 rounded-full blur-3xl -z-10 pointer-events-none animate-float-reverse" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in-up">
          {/* Trust Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700 shadow-xs mb-6 shimmer-badge hover:scale-105 transition-transform duration-300 cursor-default">
            <span className="flex h-2 w-2 rounded-full bg-[#16A34A] animate-ping" />
            <span className="text-xs font-semibold text-[#1E293B] dark:text-slate-200">
              India's Most Trusted Skilled Worker Marketplace
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-xs font-bold text-[#2563EB] dark:text-blue-400">10,000+ Pros</span>
          </div>

          {/* Headings */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F172A] dark:text-white tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            Find Skilled Workers <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#2563EB] via-[#1D4ED8] to-[#14B8A6] bg-clip-text text-transparent">
              For Every Need
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Connect with trusted professionals and get your work done quickly, safely and affordably.
          </p>

          {/* Search Form */}
          <div className="mt-8 sm:mt-10 max-w-3xl mx-auto">
            <form
              onSubmit={handleSearch}
              className="bg-white dark:bg-slate-900 p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/70 dark:shadow-none border border-slate-200/90 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-2 sm:gap-3"
            >
              {/* Profession search input */}
              <div className="relative flex-1 w-full">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. Electrician, Plumber, Painter..."
                  value={professionQuery}
                  onChange={(e) => setProfessionQuery(e.target.value)}
                  className="w-full pl-11 pr-3 py-3 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl sm:rounded-2xl bg-transparent focus:outline-none focus:bg-slate-50/80 dark:focus:bg-slate-800/80 transition-colors"
                />
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-slate-700" />

              {/* Location search input */}
              <div className="relative flex-1 w-full">
                <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  list="home-assam-districts"
                  placeholder="Assam district (e.g. Guwahati, Dibrugarh...)"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  className="w-full pl-11 pr-16 py-3 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl sm:rounded-2xl bg-transparent focus:outline-none focus:bg-slate-50/80 dark:focus:bg-slate-800/80 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowMapPicker(true)}
                  className="absolute right-2 top-2 px-2.5 py-1.5 text-xs font-bold text-primary-600 hover:bg-primary-50 rounded-lg inline-flex items-center gap-1 transition-colors"
                  title="Pick location on map"
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>Map</span>
                </button>
                <datalist id="home-assam-districts">
                  {ASSAM_DISTRICTS.map((d) => (
                    <option key={d.district} value={d.district} />
                  ))}
                </datalist>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="submit"
                  className="flex-1 sm:flex-initial px-6 py-3 bg-primary-600 hover:bg-primary-700 active:scale-95 text-white font-bold text-sm rounded-xl sm:rounded-2xl shadow-md shadow-primary-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>

                <Link
                  to="/find-workers"
                  className="hidden md:inline-flex px-5 py-3 bg-navy-900 dark:bg-slate-800 hover:bg-navy-800 dark:hover:bg-slate-700 active:scale-95 text-white font-semibold text-sm rounded-xl sm:rounded-2xl transition-all"
                >
                  Hire Now
                </Link>
              </div>
            </form>

            {/* Quick search chips */}
            <div className="mt-4 flex items-center justify-center gap-2 flex-wrap text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Popular:</span>
              {['Electrician', 'Plumber', 'Carpenter', 'Deep Cleaner', 'House Painter'].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setProfessionQuery(item);
                    navigate(`/find-workers?q=${encodeURIComponent(item)}`);
                  }}
                  className="px-2.5 py-1 bg-white dark:bg-slate-900 hover:bg-primary-50 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-200 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition-colors shadow-2xs"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <p className="text-2xl sm:text-3xl font-extrabold text-primary-600 dark:text-primary-400">12,500+</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">Verified Workers</p>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">45,000+</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">Completed Jobs</p>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-500 flex items-center justify-center gap-1">
                4.8 <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">Customer Rating</p>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">&lt; 15m</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">Average Response</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-3 py-1 rounded-full mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Service Catalog
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Popular Skilled Categories
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Browse top categories or hire on-demand professionals in your neighborhood
            </p>
          </div>
          <Link
            to="/find-workers"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 10 Category Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-5">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="bg-navy-900 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-400 bg-primary-950/80 px-3 py-1 rounded-full border border-primary-500/30">
              Why Choose WorkOshop
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-4 tracking-tight">
              Safety, Transparency & Guaranteed Workmanship
            </h2>
            <p className="mt-3 text-slate-300 text-sm sm:text-base">
              We eliminate the stress of finding reliable handymen by vetting every tradesperson thoroughly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-navy-800/80 p-8 rounded-3xl border border-slate-700/60 hover:border-primary-500/50 transition-all flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-primary-600/20 border border-primary-500/30 text-primary-400 flex items-center justify-center mb-6">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Verified Workers</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Every professional undergoes multi-step verification including government photo ID authentication, trade qualification reviews, and police background clearance.
                </p>
              </div>
              <ul className="mt-6 pt-6 border-t border-slate-700/60 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Aadhaar & Police Background Checked</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Skill-tested & Certified</span>
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-navy-800/80 p-8 rounded-3xl border border-slate-700/60 hover:border-primary-500/50 transition-all flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-6">
                  <Zap className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Flexible Hiring</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Hire on your terms! Choose pay-per-hour for quick minor fixes or post a custom project contract with a fixed lump-sum budget.
                </p>
              </div>
              <ul className="mt-6 pt-6 border-t border-slate-700/60 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Standardized Hourly Rates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Free Job Posting & Bidding</span>
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-navy-800/80 p-8 rounded-3xl border border-slate-700/60 hover:border-primary-500/50 transition-all flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-amber-600/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-6">
                  <Headphones className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">24/7 Support & Warranty</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Rest easy with our 30-day service satisfaction warranty. In case of any dispute or rework needed, our customer support team is always on call.
                </p>
              </div>
              <ul className="mt-6 pt-6 border-t border-slate-700/60 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>30-Day Workmanship Warranty</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Escrow & Secure Post-Service Pay</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Workers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full mb-2">
              <Award className="w-3.5 h-3.5" />
              Top Rated Professionals
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Featured Verified Workers
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Top reviewed technicians and artisans available for instant booking
            </p>
          </div>
          <Link
            to="/find-workers"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors"
          >
            <span>Explore Registered Workers</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Worker Cards Grid */}
        {featuredWorkers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredWorkers.map((worker) => (
              <WorkerCard key={worker.id} worker={worker} />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-slate-200 dark:border-slate-800 space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              No registered workers yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Real skilled professionals who sign up and create their profile will appear here automatically.
            </p>
            <Link
              to="/register-worker"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors"
            >
              <span>Register as a Worker</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section className="bg-slate-100/70 dark:bg-slate-900/60 border border-transparent dark:border-slate-800/80 py-16 sm:py-20 rounded-3xl max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-3 py-1 rounded-full">
            Simple 3-Step Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-3">
            How WorkOshop Works
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Hiring a skilled technician has never been smoother
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 text-center relative">
            <div className="w-12 h-12 bg-primary-600 text-white font-bold text-xl rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md shadow-primary-500/25">
              1
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">Search or Post a Job</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Search vetted profiles by profession & location or post your job requirement with your preferred budget and date.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 text-center relative">
            <div className="w-12 h-12 bg-primary-600 text-white font-bold text-xl rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md shadow-primary-500/25">
              2
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">Compare & Chat</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Review verified badges, customer ratings, portfolio photos, and rates. Direct message workers to clarify project requirements.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 text-center relative">
            <div className="w-12 h-12 bg-primary-600 text-white font-bold text-xl rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md shadow-primary-500/25">
              3
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">Hire & Pay Safely</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Book your preferred time slot. Once the work is completed to your 100% satisfaction, pay the worker and share your verified review.
            </p>
          </div>
        </div>
      </section>

      {/* Call To Action Dual Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* For Customers */}
          <div className="bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#0F172A] rounded-3xl p-8 sm:p-10 text-white flex flex-col justify-between shadow-xl shadow-[#2563EB]/20 card-lift group">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold bg-white/20 px-3 py-1 rounded-full shimmer-badge">
                For Homeowners & Businesses
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold mt-4">
                Need urgent repair work done today?
              </h3>
              <p className="text-blue-100 text-sm mt-3 leading-relaxed">
                Post your job in under 2 minutes and receive competitive quotes from top rated local pros in your area.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-3">
              <Link
                to="/post-job"
                className="px-6 py-3 bg-white text-[#2563EB] hover:bg-blue-50 font-bold text-sm rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 group/btn"
              >
                <span>Post a Job Free</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/find-workers"
                className="px-5 py-3 bg-white/15 hover:bg-white/25 text-white font-semibold text-sm rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                Browse Workers
              </Link>
            </div>
          </div>

          {/* For Workers */}
          <div className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0D9488] rounded-3xl p-8 sm:p-10 text-white flex flex-col justify-between shadow-xl border border-slate-700/60 card-lift group">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full shimmer-badge">
                For Skilled Tradespeople
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold mt-4">
                Are you an electrician, plumber or mechanic?
              </h3>
              <p className="text-slate-300 text-sm mt-3 leading-relaxed">
                Join WorkOshop to get high-paying daily customer bookings with zero commission on your first 10 jobs.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-3">
              <Link
                to="/register-worker"
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-500/25 flex items-center gap-2 group/btn"
              >
                <span>Join as a Worker</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
              <Link
                to={user?.role === 'worker' ? '/worker-dashboard' : '/login?role=worker'}
                state={
                  user?.role === 'worker'
                    ? undefined
                    : {
                        from: '/worker-dashboard',
                        requiredRole: 'worker',
                        message: 'Please log in with a Worker account first to open the Worker Portal.',
                      }
                }
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                Worker Portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      <MapPickerModal
        isOpen={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        initialValue={
          locationQuery ||
          (customerLocation.isSet ? customerLocation.label : defaultMapLocation.label)
        }
        initialCoords={
          customerLocation.isSet
            ? { lat: customerLocation.lat, lng: customerLocation.lng }
            : !locationQuery
              ? { lat: defaultMapLocation.lat, lng: defaultMapLocation.lng }
              : undefined
        }
        title="Select Your Location on Map"
        onSelectLocation={(loc, nearest, exactCoords) => {
          const nextVal = nearest?.district || loc;
          setLocationQuery(nextVal);
          setSiteLocation({
            label: loc || nextVal,
            district: nearest?.district || '',
            lat: exactCoords?.lat ?? nearest?.lat,
            lng: exactCoords?.lng ?? nearest?.lng,
          });
        }}
      />
    </div>
  );
};

