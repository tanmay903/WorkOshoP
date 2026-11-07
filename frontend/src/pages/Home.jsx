import React, { useState, useEffect } from 'react';
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
  Sparkles
} from 'lucide-react';
import { categories } from '../data/categories';
import { CategoryCard } from '../components/CategoryCard';
import { WorkerCard } from '../components/WorkerCard';
import { storage } from '../utils/storage';

export const Home = () => {
  const navigate = useNavigate();
  const [professionQuery, setProfessionQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [featuredWorkers, setFeaturedWorkers] = useState([]);

  useEffect(() => {
    const workers = storage.getWorkers();
    // Pick top verified workers with rating >= 4.7
    const top = workers.filter(w => w.verified).slice(0, 6);
    setFeaturedWorkers(top.length > 0 ? top : workers.slice(0, 6));
  }, []);

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
      <section className="relative overflow-hidden pt-10 sm:pt-16 pb-12 sm:pb-20 bg-gradient-to-b from-primary-50/60 via-surface to-surface">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-primary-200/40 via-blue-100/30 to-transparent blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Trust Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-primary-200 shadow-xs mb-6 animate-fadeIn">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-semibold text-slate-800">
              India's Most Trusted Skilled Worker Marketplace
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-bold text-primary-600">10,000+ Pros</span>
          </div>

          {/* Headings */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            Find Skilled Workers <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-indigo-600 bg-clip-text text-transparent">
              For Every Need
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Connect with trusted professionals and get your work done quickly, safely and affordably.
          </p>

          {/* Search Form */}
          <div className="mt-8 sm:mt-10 max-w-3xl mx-auto">
            <form
              onSubmit={handleSearch}
              className="bg-white p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/70 border border-slate-200/90 flex flex-col sm:flex-row items-center gap-2 sm:gap-3"
            >
              {/* Profession search input */}
              <div className="relative flex-1 w-full">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. Electrician, Plumber, Painter..."
                  value={professionQuery}
                  onChange={(e) => setProfessionQuery(e.target.value)}
                  className="w-full pl-11 pr-3 py-3 text-sm text-slate-800 placeholder-slate-400 rounded-xl sm:rounded-2xl bg-transparent focus:outline-none focus:bg-slate-50/80 transition-colors"
                />
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-8 bg-slate-200" />

              {/* Location search input */}
              <div className="relative flex-1 w-full">
                <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Location (e.g. Delhi, Mumbai...)"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  className="w-full pl-11 pr-3 py-3 text-sm text-slate-800 placeholder-slate-400 rounded-xl sm:rounded-2xl bg-transparent focus:outline-none focus:bg-slate-50/80 transition-colors"
                />
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
                  className="hidden md:inline-flex px-5 py-3 bg-navy-900 hover:bg-navy-800 active:scale-95 text-white font-semibold text-sm rounded-xl sm:rounded-2xl transition-all"
                >
                  Hire Now
                </Link>
              </div>
            </form>

            {/* Quick search chips */}
            <div className="mt-4 flex items-center justify-center gap-2 flex-wrap text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Popular:</span>
              {['Electrician', 'Plumber', 'Carpenter', 'Deep Cleaner', 'House Painter'].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setProfessionQuery(item);
                    navigate(`/find-workers?q=${encodeURIComponent(item)}`);
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 border border-slate-200 rounded-lg text-slate-600 transition-colors shadow-2xs"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <p className="text-2xl sm:text-3xl font-extrabold text-primary-600">12,500+</p>
              <p className="text-xs text-slate-600 font-medium mt-1">Verified Workers</p>
            </div>
            <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">45,000+</p>
              <p className="text-xs text-slate-600 font-medium mt-1">Completed Jobs</p>
            </div>
            <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-500 flex items-center justify-center gap-1">
                4.8 <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </p>
              <p className="text-xs text-slate-600 font-medium mt-1">Customer Rating</p>
            </div>
            <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">&lt; 15m</p>
              <p className="text-xs text-slate-600 font-medium mt-1">Average Response</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-3 py-1 rounded-full mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Service Catalog
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Popular Skilled Categories
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Browse top categories or hire on-demand professionals in your neighborhood
            </p>
          </div>
          <Link
            to="/find-workers"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors"
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
              Why Choose HireWorker
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
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full mb-2">
              <Award className="w-3.5 h-3.5" />
              Top Rated Professionals
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Featured Verified Workers
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Top reviewed technicians and artisans available for instant booking
            </p>
          </div>
          <Link
            to="/find-workers"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors"
          >
            <span>Explore All 12+ Workers</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Worker Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredWorkers.map((worker) => (
            <WorkerCard key={worker.id} worker={worker} />
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-slate-100/70 py-16 sm:py-20 rounded-3xl max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
            Simple 3-Step Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-3">
            How HireWorker Works
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Hiring a skilled technician has never been smoother
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 text-center relative">
            <div className="w-12 h-12 bg-primary-600 text-white font-bold text-xl rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md shadow-primary-500/25">
              1
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-2">Search or Post a Job</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Search vetted profiles by profession & location or post your job requirement with your preferred budget and date.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 text-center relative">
            <div className="w-12 h-12 bg-primary-600 text-white font-bold text-xl rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md shadow-primary-500/25">
              2
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-2">Compare & Chat</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Review verified badges, customer ratings, portfolio photos, and rates. Direct message workers to clarify project requirements.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 text-center relative">
            <div className="w-12 h-12 bg-primary-600 text-white font-bold text-xl rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md shadow-primary-500/25">
              3
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-2">Hire & Pay Safely</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Book your preferred time slot. Once the work is completed to your 100% satisfaction, pay the worker and share your verified review.
            </p>
          </div>
        </div>
      </section>

      {/* Call To Action Dual Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* For Customers */}
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-8 sm:p-10 text-white flex flex-col justify-between shadow-xl shadow-primary-600/20">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold bg-white/20 px-3 py-1 rounded-full">
                For Homeowners & Businesses
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold mt-4">
                Need urgent repair work done today?
              </h3>
              <p className="text-primary-100 text-sm mt-3 leading-relaxed">
                Post your job in under 2 minutes and receive competitive quotes from top rated local pros in your area.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-3">
              <Link
                to="/post-job"
                className="px-6 py-3 bg-white text-primary-700 hover:bg-primary-50 font-bold text-sm rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2"
              >
                <span>Post a Job Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/find-workers"
                className="px-5 py-3 bg-primary-700/80 hover:bg-primary-700 text-white font-semibold text-sm rounded-xl transition-all"
              >
                Browse Workers
              </Link>
            </div>
          </div>

          {/* For Workers */}
          <div className="bg-gradient-to-br from-navy-900 to-navy-950 rounded-3xl p-8 sm:p-10 text-white flex flex-col justify-between shadow-xl">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full">
                For Skilled Tradespeople
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold mt-4">
                Are you an electrician, plumber or mechanic?
              </h3>
              <p className="text-slate-300 text-sm mt-3 leading-relaxed">
                Join HireWorker to get high-paying daily customer bookings with zero commission on your first 10 jobs.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-3">
              <Link
                to="/register-worker"
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-500/25 flex items-center gap-2"
              >
                <span>Join as a Worker</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/worker-dashboard"
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl transition-all"
              >
                Worker Portal
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

