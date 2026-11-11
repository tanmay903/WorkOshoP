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
  CheckCircle2,
  Map as MapIcon,
  Heart,
  Scale,
  ArrowRight
} from 'lucide-react';
import { categories } from '../data/categories';
import { ASSAM_DISTRICTS } from '../data/workers';
import { WorkerCard } from '../components/WorkerCard';
import { storage } from '../utils/storage';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCustomerLocation } from '../context/LocationContext';
import { MapPickerModal } from '../components/MapPickerModal';
import CompareWorkersModal from '../components/CompareWorkersModal';
import { BookingModal } from '../components/BookingModal';

export const FindWorkers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { customerLocation, defaultMapLocation, setSiteLocation, clearSiteLocation } = useCustomerLocation();

  // Search state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [locationQuery, setLocationQuery] = useState(
    searchParams.get('loc') ||
      (customerLocation.isSet ? customerLocation.district || customerLocation.label : '')
  );
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');

  // Filter state
  const { user } = useAuth();
  const [minRating, setMinRating] = useState(0);
  const [minExperience, setMinExperience] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);
  const [savedIds, setSavedIds] = useState(() => storage.getSavedWorkerIds());
  const [compareWorkers, setCompareWorkers] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [bookingTargetWorker, setBookingTargetWorker] = useState(null);

  // Sorting
  const [sortBy, setSortBy] = useState('rating-desc'); // 'rating-desc' | 'price-asc' | 'price-desc' | 'reviews-desc'

  // Mobile filter drawer state
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

  // Raw workers from storage
  const [allWorkers, setAllWorkers] = useState([]);

  useEffect(() => {
    let active = true;
    const localWorkers = storage.getWorkers();
    setAllWorkers(localWorkers);

    api.getWorkers({ limit: 100 }).then((res) => {
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
      setAllWorkers(merged);
    });

    setSavedIds(storage.getSavedWorkerIds(user?.id));
    const onSavedChanged = (e) => {
      setSavedIds(e?.detail?.ids || storage.getSavedWorkerIds(user?.id));
    };
    window.addEventListener('hw-saved-workers-changed', onSavedChanged);
    return () => {
      active = false;
      window.removeEventListener('hw-saved-workers-changed', onSavedChanged);
    };
  }, [user?.id]);

  const handleToggleCompare = (worker) => {
    setCompareWorkers((prev) => {
      const exists = prev.some((w) => w.id === worker.id);
      if (exists) return prev.filter((w) => w.id !== worker.id);
      if (prev.length >= 3) {
        return [...prev.slice(1), worker];
      }
      return [...prev, worker];
    });
  };

  // Update when URL search query or site-wide customer location changes
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const urlLoc = searchParams.get('loc');
    const loc =
      urlLoc !== null && urlLoc !== ''
        ? urlLoc
        : customerLocation.isSet
          ? customerLocation.district || customerLocation.label || ''
          : '';
    const cat = searchParams.get('category') || 'all';
    setSearchQuery(q);
    setLocationQuery(loc);
    setSelectedCategory(cat);
  }, [
    searchParams,
    customerLocation.isSet,
    customerLocation.district,
    customerLocation.label,
  ]);

  // Filtering logic
  const filteredWorkers = useMemo(() => {
    return allWorkers.filter((w) => {
      // Profession or Name search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (w.name || '').toLowerCase().includes(q);
        const matchesProf = (w.profession || '').toLowerCase().includes(q);
        const matchesSkills = w.skills?.some(s => (s || '').toLowerCase().includes(q));
        if (!matchesName && !matchesProf && !matchesSkills) return false;
      }

      // Location search
      if (locationQuery.trim()) {
        const loc = locationQuery.toLowerCase();
        const matchesLoc = (w.location || '').toLowerCase().includes(loc) || (w.city || '').toLowerCase().includes(loc);
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

      // Saved / Favourite filter
      if (savedOnly && !savedIds.includes(String(w.id))) return false;

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
    savedOnly,
    savedIds,
    sortBy
  ]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setLocationQuery('');
    setSelectedCategory('all');
    clearSiteLocation();
    setMinRating(0);
    setMinExperience(0);
    setMaxPrice(500);
    setVerifiedOnly(false);
    setAvailableOnly(false);
    setSavedOnly(false);
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
    savedOnly,
    searchQuery.trim().length > 0,
    locationQuery.trim().length > 0
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Find Skilled Workers
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Discover verified electricians, plumbers, carpenters, and technicians ready to assist.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#1E293B] text-xs font-semibold rounded-xl flex items-center gap-2"
            >
              <Filter className="w-4 h-4 text-[#2563EB]" />
              <span>Filters ({activeFiltersCount})</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium hidden sm:inline">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
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
              list="assam-districts"
              placeholder="Filter Assam district (Guwahati, Dibrugarh...)"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              className="w-full pl-10 pr-16 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
            />
            <button
              type="button"
              onClick={() => setShowMapPicker(true)}
              className="absolute right-2 top-1.5 px-2 py-1 text-[11px] font-bold text-primary-600 hover:bg-primary-50 rounded-lg inline-flex items-center gap-1 transition-colors"
              title="Set location using map"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map</span>
            </button>
            <datalist id="assam-districts">
              {ASSAM_DISTRICTS.map((d) => (
                <option key={d.district} value={d.district}>
                  {d.town !== d.district ? `${d.town} (${d.district})` : d.district}
                </option>
              ))}
            </datalist>
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
                <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                Available Today
              </span>
            </label>

            <label className="flex items-center justify-between gap-2.5 cursor-pointer text-xs font-semibold text-slate-700 pt-1">
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={savedOnly}
                  onChange={(e) => setSavedOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
                />
                <span className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  Saved Favourites
                </span>
              </span>
              {savedIds.length > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                  {savedIds.length}
                </span>
              )}
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
                <WorkerCard
                  key={worker.id}
                  worker={worker}
                  isCompared={compareWorkers.some((w) => w.id === worker.id)}
                  onToggleCompare={handleToggleCompare}
                />
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
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={savedOnly}
                  onChange={(e) => setSavedOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600"
                />
                <span>Saved Favourites ({savedIds.length})</span>
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
        title="Pick District or Location on Map"
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

      {/* Sticky Compare Bar */}
      {compareWorkers.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-2xl bg-[#0F172A] text-white rounded-2xl shadow-2xl border border-slate-700 px-4 py-3 flex items-center justify-between gap-3 animate-scale-in">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center shrink-0">
              <Scale className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold truncate">
                Compare Workers ({compareWorkers.length}/3)
              </p>
              <p className="text-[11px] text-slate-300 truncate">
                {compareWorkers.map((w) => w.name).join(' • ')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setCompareWorkers([])}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              disabled={compareWorkers.length < 2}
              onClick={() => setShowCompareModal(true)}
              className="px-3.5 py-2 bg-[#14B8A6] hover:bg-[#0D9488] disabled:opacity-50 disabled:cursor-not-allowed text-[#0F172A] font-extrabold text-xs rounded-xl inline-flex items-center gap-1 transition-all"
            >
              <span>Compare</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <CompareWorkersModal
        isOpen={showCompareModal}
        onClose={() => setShowCompareModal(false)}
        workers={compareWorkers}
        onRemoveWorker={(wid) => setCompareWorkers((prev) => prev.filter((w) => w.id !== wid))}
        onBookWorker={(worker) => setBookingTargetWorker(worker)}
      />

      {bookingTargetWorker && (
        <BookingModal
          worker={bookingTargetWorker}
          isOpen={Boolean(bookingTargetWorker)}
          onClose={() => setBookingTargetWorker(null)}
        />
      )}
    </div>
  );
};

