import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  MapPin,
  Filter,
  SlidersHorizontal,
  X,
  Star,
  ShieldCheck,
  RotateCcw,
  Users,
  CheckCircle2
} from 'lucide-react';
import { categories } from '../data/categories';
import { WorkerCard } from '../components/WorkerCard';
import { storage } from '../utils/storage';

export const FindWorkers = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [locationQuery, setLocationQuery] = useState(searchParams.get('loc') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');

  // Filter state
  const [minRating, setMinRating] = useState(0);
  const [minExperience, setMinExperience] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);

  // Sorting
  const [sortBy, setSortBy] = useState('rating-desc'); // 'rating-desc' | 'price-asc' | 'price-desc' | 'reviews-desc'

  // Mobile filter drawer state
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Raw workers from storage
  const [allWorkers, setAllWorkers] = useState([]);

  useEffect(() => {
    setAllWorkers(storage.getWorkers());
  }, []);

  // Update when URL search query changes
  useEffect(() => {
    const q = searchParams.get('q');
    const loc = searchParams.get('loc');
    const cat = searchParams.get('category');
    if (q !== null) setSearchQuery(q);
    if (loc !== null) setLocationQuery(loc);
    if (cat !== null) setSelectedCategory(cat);
  }, [searchParams]);

  // Filtering logic
  const filteredWorkers = useMemo(() => {
    return allWorkers.filter((w) => {
      // Profession or Name search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = w.name.toLowerCase().includes(q);
        const matchesProf = w.profession.toLowerCase().includes(q);
        const matchesSkills = w.skills?.some(s => s.toLowerCase().includes(q));
        if (!matchesName && !matchesProf && !matchesSkills) return false;
      }

      // Location search
      if (locationQuery.trim()) {
        const loc = locationQuery.toLowerCase();
        const matchesLoc = w.location?.toLowerCase().includes(loc) || w.city?.toLowerCase().includes(loc);
        if (!matchesLoc) return false;
      }

      // Category filter
      if (selectedCategory && selectedCategory !== 'all') {
        if (w.category !== selectedCategory) return false;
      }

      // Rating filter
      if (minRating > 0 && w.rating < minRating) return false;

      // Experience filter
      if (minExperience > 0 && (w.experienceYears || 0) < minExperience) return false;

      // Price filter
      if (w.hourlyRate > maxPrice) return false;

      // Verified filter
      if (verifiedOnly && !w.verified) return false;

      // Available filter
      if (availableOnly && !w.isAvailable) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating-desc') return b.rating - a.rating;
      if (sortBy === 'price-asc') return a.hourlyRate - b.hourlyRate;
      if (sortBy === 'price-desc') return b.hourlyRate - a.hourlyRate;
      if (sortBy === 'reviews-desc') return (b.reviewsCount || 0) - (a.reviewsCount || 0);
      return 0;
    });
  }, [
    allWorkers,
    searchQuery,
    locationQuery,
    selectedCategory,
    minRating,
    minExperience,
    maxPrice,
    verifiedOnly,
    availableOnly,
    sortBy
  ]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setLocationQuery('');
    setSelectedCategory('all');
    setMinRating(0);
    setMinExperience(0);
    setMaxPrice(500);
    setVerifiedOnly(false);
    setAvailableOnly(false);
    setSortBy('rating-desc');
    setSearchParams({});
  };

  const activeFiltersCount = [
    selectedCategory !== 'all',
    minRating > 0,
    minExperience > 0,
    maxPrice < 500,
    verifiedOnly,
    availableOnly,
    searchQuery.trim().length > 0,
    locationQuery.trim().length > 0
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Find Skilled Workers
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Discover verified electricians, plumbers, carpenters, and technicians ready to assist.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-2"
            >
              <Filter className="w-4 h-4 text-primary-600" />
              <span>Filters ({activeFiltersCount})</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium hidden sm:inline">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="rating-desc">Highest Rating</option>
                <option value="reviews-desc">Most Reviews</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search Bar Inputs inside Header */}
        <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by worker name, skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
            />
          </div>

          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter location (Delhi, Mumbai, etc.)..."
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Service Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 shrink-0 transition-colors"
                title="Reset All Filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Layout: Sidebar + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-6 sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <SlidersHorizontal className="w-4 h-4 text-primary-600" />
              <span>Refine Search</span>
            </div>
            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-rose-600 hover:underline font-semibold"
              >
                Clear all ({activeFiltersCount})
              </button>
            )}
          </div>

          {/* Quick Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300"
              />
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Verified Workers Only
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300"
              />
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Available Today
              </span>
            </label>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Max Hourly Rate</span>
              <span className="text-primary-600 font-bold">₹{maxPrice}/hr</span>
            </div>
            <input
              type="range"
              min="150"
              max="500"
              step="20"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>₹150/hr</span>
              <span>₹500/hr</span>
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700">
              Minimum Rating
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[0, 4.0, 4.5, 4.8].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setMinRating(val)}
                  className={`py-1.5 px-2 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1 transition-all ${
                    minRating === val
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  {val === 0 ? (
                    'Any Rating'
                  ) : (
                    <>
                      <span>{val}+</span>
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Experience Filter */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700">
              Work Experience
            </label>
            <div className="space-y-1.5">
              {[
                { label: 'Any Experience', value: 0 },
                { label: '3+ Years', value: 3 },
                { label: '5+ Years', value: 5 },
                { label: '8+ Years', value: 8 },
              ].map((exp) => (
                <label
                  key={exp.value}
                  className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 hover:text-slate-900"
                >
                  <input
                    type="radio"
                    name="experienceRadio"
                    checked={minExperience === exp.value}
                    onChange={() => setMinExperience(exp.value)}
                    className="w-3.5 h-3.5 text-primary-600 focus:ring-primary-500"
                  />
                  <span>{exp.label}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Workers Grid Area */}
        <main className="lg:col-span-3 space-y-4">
          {/* Results Count bar */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <strong className="text-slate-900">{filteredWorkers.length}</strong> skilled professionals
            </span>
            {activeFiltersCount > 0 && (
              <span className="text-primary-600 font-medium">
                Filtered results active
              </span>
            )}
          </div>

          {filteredWorkers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredWorkers.map((worker) => (
                <WorkerCard key={worker.id} worker={worker} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 shadow-xs space-y-4">
              <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                No matching skilled workers found
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                We couldn't find any professionals matching your exact criteria. Try broadening your search or resetting filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-navy-950/50 backdrop-blur-xs lg:hidden">
          <div className="w-full max-w-xs bg-white h-full p-6 space-y-6 overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Filters</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-primary-600"
                />
                <span>Verified Workers Only</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-primary-600"
                />
                <span>Available Today</span>
              </label>
            </div>

            {/* Price slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>Max Hourly Rate</span>
                <span className="text-primary-600">₹{maxPrice}/hr</span>
              </div>
              <input
                type="range"
                min="150"
                max="500"
                step="20"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-2">
              <button
                onClick={handleResetFilters}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2 text-xs font-semibold text-white bg-primary-600 rounded-xl"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

