import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Search,
  LocateFixed,
  Plus,
  Minus,
  Navigation,
  Star,
  ShieldCheck,
  Briefcase,
  X,
  RefreshCw,
  AlertCircle,
  Radio,
  Filter,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { categories } from '../data/categories';
import { ASSAM_DISTRICT_COORDS } from '../components/MapPickerModal';
import { Avatar } from '../components/Avatar';
import { RatingStars } from '../components/RatingStars';
import { BookingModal } from '../components/BookingModal';
import { useAuth } from '../context/AuthContext';
import { useCustomerLocation } from '../context/LocationContext';

const TILE_SIZE = 256;
const MIN_ZOOM = 5;
const MAX_ZOOM = 18;
const DEFAULT_CENTER = { lat: 26.1445, lng: 91.7362 }; // Guwahati, Assam
const RADIUS_OPTIONS = [2, 5, 10, 25, 50, 100];

const lon2tile = (lon, zoom) => ((lon + 180) / 360) * Math.pow(2, zoom);
const lat2tile = (lat, zoom) => {
  const rad = (lat * Math.PI) / 180;
  return (
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) *
    Math.pow(2, zoom)
  );
};
const tile2lon = (x, zoom) => (x / Math.pow(2, zoom)) * 360 - 180;
const tile2lat = (y, zoom) => {
  const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, zoom);
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
};

const getIdealZoomForRadius = (radiusKm) => {
  if (radiusKm <= 2) return 14;
  if (radiusKm <= 5) return 13;
  if (radiusKm <= 10) return 12;
  if (radiusKm <= 25) return 11;
  if (radiusKm <= 50) return 10;
  return 9;
};

export const NearbyWorkers = () => {
  const { user } = useAuth();
  const { customerLocation, defaultMapLocation, setSiteLocation } = useCustomerLocation();
  const navigate = useNavigate();

  const resolvedDefault = useMemo(() => {
    if (
      customerLocation.isSet &&
      Number.isFinite(customerLocation.lat) &&
      Number.isFinite(customerLocation.lng)
    ) {
      return {
        lat: customerLocation.lat,
        lng: customerLocation.lng,
        label: customerLocation.label || defaultMapLocation?.label || 'Guwahati, Assam',
      };
    }
    if (
      defaultMapLocation &&
      Number.isFinite(defaultMapLocation.lat) &&
      Number.isFinite(defaultMapLocation.lng)
    ) {
      return {
        lat: defaultMapLocation.lat,
        lng: defaultMapLocation.lng,
        label: defaultMapLocation.label || 'Guwahati, Assam',
      };
    }
    return { ...DEFAULT_CENTER, label: 'Guwahati, Assam' };
  }, [customerLocation, defaultMapLocation]);

  // Customer search & location state
  const [locationInput, setLocationInput] = useState(resolvedDefault.label);
  const [customerCoords, setCustomerCoords] = useState({
    lat: resolvedDefault.lat,
    lng: resolvedDefault.lng,
  });
  const [mapCenter, setMapCenter] = useState({
    lat: resolvedDefault.lat,
    lng: resolvedDefault.lng,
  });
  const [zoom, setZoom] = useState(12);
  const wasSiteLocationSetRef = useRef(customerLocation.isSet);

  // Keep NearbyWorkers synced whenever customer default/site-wide location updates or clears
  useEffect(() => {
    const nextCoords = { lat: resolvedDefault.lat, lng: resolvedDefault.lng };
    if (
      customerLocation.isSet ||
      defaultMapLocation?.source === 'profile' ||
      wasSiteLocationSetRef.current
    ) {
      setCustomerCoords((prev) =>
        Math.abs(prev.lat - nextCoords.lat) > 1e-5 || Math.abs(prev.lng - nextCoords.lng) > 1e-5
          ? nextCoords
          : prev
      );
      setMapCenter((prev) =>
        Math.abs(prev.lat - nextCoords.lat) > 1e-5 || Math.abs(prev.lng - nextCoords.lng) > 1e-5
          ? nextCoords
          : prev
      );
      if (resolvedDefault.label) {
        setLocationInput(resolvedDefault.label);
      }
      wasSiteLocationSetRef.current = Boolean(customerLocation.isSet);
    }
  }, [
    customerLocation.isSet,
    defaultMapLocation?.source,
    resolvedDefault.lat,
    resolvedDefault.lng,
    resolvedDefault.label,
  ]);

  // Filters
  const [selectedProfession, setSelectedProfession] = useState('all');
  const [radiusKm, setRadiusKm] = useState(10);

  // Real workers from MongoDB API (no fake/mock fallback)
  const [workers, setWorkers] = useState([]);
  const [totalOnlineSharingCount, setTotalOnlineSharingCount] = useState(0);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [bookingWorker, setBookingWorker] = useState(null);

  // Status & loading
  const [isLoadingWorkers, setIsLoadingWorkers] = useState(false);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [apiError, setApiError] = useState('');
  const [geoNotice, setGeoNotice] = useState('');

  // Map container sizing & drag tracking
  const mapContainerRef = useRef(null);
  const [mapSize, setMapSize] = useState({ width: 960, height: 560 });
  const dragStateRef = useRef(null);

  useEffect(() => {
    const updateSize = () => {
      if (mapContainerRef.current) {
        const rect = mapContainerRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setMapSize({ width: rect.width, height: rect.height });
        }
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Fetch nearby online, location-sharing workers strictly from MongoDB backend
  const fetchNearbyWorkers = useCallback(
    async (coords = customerCoords, radius = radiusKm, profession = selectedProfession) => {
      setIsLoadingWorkers(true);
      setApiError('');

      const res = await api.getNearbyWorkers({
        lat: coords.lat,
        lng: coords.lng,
        radius,
        profession,
      });

      setIsLoadingWorkers(false);

      if (!res?.success) {
        setWorkers([]);
        setTotalOnlineSharingCount(0);
        setSelectedWorker(null);
        setApiError(res?.message || 'Unable to load nearby workers from the server.');
        return;
      }

      const list = Array.isArray(res.data) ? res.data : [];
      setWorkers(list);
      setTotalOnlineSharingCount(Number(res.totalOnlineSharingCount ?? list.length));
      setSelectedWorker((prev) => (prev ? list.find((w) => w.id === prev.id) || null : null));
    },
    [customerCoords, radiusKm, selectedProfession]
  );

  useEffect(() => {
    fetchNearbyWorkers(customerCoords, radiusKm, selectedProfession);
  }, [customerCoords, radiusKm, selectedProfession, fetchNearbyWorkers]);

  // Real-time sync when worker updates location or online status in another tab or window
  useEffect(() => {
    let channel = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel('workoshop-live-location');
        channel.onmessage = () => {
          fetchNearbyWorkers(customerCoords, radiusKm, selectedProfession);
        };
      }
    } catch {
      // Non-fatal
    }

    const handleFocus = () => {
      fetchNearbyWorkers(customerCoords, radiusKm, selectedProfession);
    };
    window.addEventListener('focus', handleFocus);

    const intervalId = window.setInterval(() => {
      fetchNearbyWorkers(customerCoords, radiusKm, selectedProfession);
    }, 20000);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('focus', handleFocus);
      window.clearInterval(intervalId);
    };
  }, [customerCoords, radiusKm, selectedProfession, fetchNearbyWorkers]);

  // Reverse geocode lat/lng -> readable address
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`
      );
      if (res.ok) {
        const data = await res.json();
        const addr = data?.address || {};
        const parts = [
          addr.suburb || addr.neighbourhood || addr.road || addr.town || addr.village || addr.city,
          addr.state_district || addr.county || addr.state,
        ].filter(Boolean);
        if (parts.length > 0) {
          const resolvedLabel = parts.join(', ');
          setLocationInput(resolvedLabel);
          setSiteLocation({
            label: resolvedLabel,
            district: addr.state_district || addr.county || '',
            lat,
            lng,
          });
          return;
        }
      }
    } catch {
      // Fallback to coordinate label if Nominatim is offline
    }
    const coordLabel = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    setLocationInput(coordLabel);
    setSiteLocation({ label: coordLabel, lat, lng });
  };

  // Search typed location -> coordinates
  const handleLocationSearch = async (e) => {
    e.preventDefault();
    const query = locationInput.trim();
    if (!query) return;

    setGeoNotice('');
    setIsGeocoding(true);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`
      );
      if (res.ok) {
        const results = await res.json();
        if (Array.isArray(results) && results.length > 0) {
          const lat = Number(results[0].lat);
          const lng = Number(results[0].lon);
          if (Number.isFinite(lat) && Number.isFinite(lng)) {
            const nextCoords = { lat, lng };
            setCustomerCoords(nextCoords);
            setMapCenter(nextCoords);
            setZoom(getIdealZoomForRadius(radiusKm));
            setSiteLocation({ label: locationInput.trim(), lat, lng });
            setIsGeocoding(false);
            return;
          }
        }
      }
    } catch {
      // Fall through to local Assam district gazetteer lookup
    }

    const qLower = query.toLowerCase();
    const tokens = qLower
      .split(/[\s,]+/)
      .map((t) => t.trim())
      .filter((t) => t.length >= 3 && t !== 'assam' && t !== 'india');

    const matchedDistrict = ASSAM_DISTRICT_COORDS.find((d) => {
      const dist = d.district.toLowerCase();
      const town = d.town.toLowerCase();
      return (
        dist.includes(qLower) ||
        town.includes(qLower) ||
        qLower.includes(dist) ||
        qLower.includes(town) ||
        tokens.some((tok) => dist.includes(tok) || town.includes(tok))
      );
    });

    setIsGeocoding(false);

    if (matchedDistrict) {
      const nextCoords = { lat: matchedDistrict.lat, lng: matchedDistrict.lng };
      const resolvedLabel =
        matchedDistrict.town === matchedDistrict.district
          ? `${matchedDistrict.district}, Assam`
          : `${matchedDistrict.town}, ${matchedDistrict.district}, Assam`;
      setCustomerCoords(nextCoords);
      setMapCenter(nextCoords);
      setZoom(getIdealZoomForRadius(radiusKm));
      setLocationInput(resolvedLabel);
      setSiteLocation({
        label: resolvedLabel,
        district: matchedDistrict.district,
        lat: matchedDistrict.lat,
        lng: matchedDistrict.lng,
      });
    } else {
      setGeoNotice(`Could not find coordinates for "${query}". Try a city/district name or click directly on the map.`);
    }
  };

  // Browser GPS button
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoNotice('Geolocation is not supported by your browser.');
      return;
    }

    setGeoNotice('');
    setIsLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        const nextCoords = { lat, lng };
        setCustomerCoords(nextCoords);
        setMapCenter(nextCoords);
        setZoom(getIdealZoomForRadius(radiusKm));
        setIsLocatingUser(false);
        reverseGeocode(lat, lng);
      },
      () => {
        setIsLocatingUser(false);
        setGeoNotice('Location access denied or unavailable. Please search an address or click on the map.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Project lat/lng to screen pixel relative to current map viewport
  const projectToScreen = useCallback(
    (lat, lng) => {
      const cx = lon2tile(mapCenter.lng, zoom);
      const cy = lat2tile(mapCenter.lat, zoom);
      return {
        x: mapSize.width / 2 + (lon2tile(lng, zoom) - cx) * TILE_SIZE,
        y: mapSize.height / 2 + (lat2tile(lat, zoom) - cy) * TILE_SIZE,
      };
    },
    [mapCenter, zoom, mapSize]
  );

  // Convert pixel radius on Mercator tile plane for the customer's selected radiusKm
  const radiusPixels = useMemo(() => {
    const metersPerPixel =
      (40075016.686 * Math.cos((customerCoords.lat * Math.PI) / 180)) /
      (TILE_SIZE * Math.pow(2, zoom));
    return (radiusKm * 1000) / Math.max(metersPerPixel, 0.01);
  }, [customerCoords.lat, radiusKm, zoom]);

  // Visible OSM slippy tiles
  const tiles = useMemo(() => {
    const cx = lon2tile(mapCenter.lng, zoom);
    const cy = lat2tile(mapCenter.lat, zoom);
    const maxTile = Math.pow(2, zoom);
    const halfCols = Math.ceil(mapSize.width / (2 * TILE_SIZE)) + 1;
    const halfRows = Math.ceil(mapSize.height / (2 * TILE_SIZE)) + 1;

    const list = [];
    const baseTx = Math.floor(cx);
    const baseTy = Math.floor(cy);

    for (let dx = -halfCols; dx <= halfCols; dx += 1) {
      for (let dy = -halfRows; dy <= halfRows; dy += 1) {
        const tx = baseTx + dx;
        const ty = baseTy + dy;
        if (ty < 0 || ty >= maxTile) continue;
        const wrappedX = ((tx % maxTile) + maxTile) % maxTile;
        const left = mapSize.width / 2 + (tx - cx) * TILE_SIZE;
        const top = mapSize.height / 2 + (ty - cy) * TILE_SIZE;
        list.push({
          key: `${zoom}-${tx}-${ty}`,
          left,
          top,
          src: `https://tile.openstreetmap.org/${zoom}/${wrappedX}/${ty}.png`,
        });
      }
    }
    return list;
  }, [mapCenter, zoom, mapSize]);

  // Pointer pan & click-to-move-customer-pin
  const handlePointerDown = (e) => {
    if (e.target.closest('[data-map-control="true"]') || e.target.closest('[data-map-marker="true"]')) {
      return;
    }
    dragStateRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startCx: lon2tile(mapCenter.lng, zoom),
      startCy: lat2tile(mapCenter.lat, zoom),
      moved: false,
    };
  };

  const handlePointerMove = (e) => {
    const drag = dragStateRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      drag.moved = true;
    }
    if (drag.moved) {
      const nextLng = tile2lon(drag.startCx - dx / TILE_SIZE, zoom);
      const nextLat = Math.max(-85, Math.min(85, tile2lat(drag.startCy - dy / TILE_SIZE, zoom)));
      setMapCenter({ lat: nextLat, lng: nextLng });
    }
  };

  const handlePointerUp = (e) => {
    const drag = dragStateRef.current;
    dragStateRef.current = null;
    if (!drag || drag.moved || !mapContainerRef.current) return;

    const rect = mapContainerRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const cx = lon2tile(mapCenter.lng, zoom);
    const cy = lat2tile(mapCenter.lat, zoom);
    const clickLng = tile2lon(cx + (px - mapSize.width / 2) / TILE_SIZE, zoom);
    const clickLat = Math.max(-85, Math.min(85, tile2lat(cy + (py - mapSize.height / 2) / TILE_SIZE, zoom)));

    const nextCoords = { lat: Number(clickLat.toFixed(6)), lng: Number(clickLng.toFixed(6)) };
    setSelectedWorker(null);
    setCustomerCoords(nextCoords);
    reverseGeocode(nextCoords.lat, nextCoords.lng);
  };

  const handleRadiusChange = (nextRadius) => {
    setRadiusKm(nextRadius);
    setZoom(getIdealZoomForRadius(nextRadius));
    setMapCenter(customerCoords);
  };

  const handleBookWorker = (worker) => {
    if (!user) {
      navigate('/login', {
        state: {
          from: '/nearby-workers',
          message: `Please log in or create an account to hire ${worker.name}.`,
        },
      });
      return;
    }
    setBookingWorker(worker);
  };

  const customerPinPos = projectToScreen(customerCoords.lat, customerCoords.lng);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-16 transition-colors">
      {/* Top Header + Search & Filters */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                Live MongoDB Worker Radar
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1.5">
                Nearby Workers
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                View real-time online workers who have enabled location sharing near your selected area.
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchNearbyWorkers(customerCoords, radiusKm, selectedProfession)}
              disabled={isLoadingWorkers}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingWorkers ? 'animate-spin' : ''}`} />
              <span>Refresh Live Map</span>
            </button>
          </div>

          {/* Search Bar & Use Current Location Button */}
          <form onSubmit={handleLocationSearch} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1 flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="Enter your location"
                aria-label="Enter your location"
                className="w-full pl-10 pr-24 py-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#1E293B] dark:text-white rounded-2xl focus:ring-2 focus:ring-[#2563EB] outline-none"
              />
              <button
                type="submit"
                disabled={isGeocoding}
                className="absolute right-2 px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl transition-colors"
              >
                {isGeocoding ? 'Searching...' : 'Search'}
              </button>
            </div>

            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isLocatingUser}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-emerald-600/20 transition-all inline-flex items-center justify-center gap-2 shrink-0"
            >
              <LocateFixed className={`w-4 h-4 ${isLocatingUser ? 'animate-spin' : ''}`} />
              <span>{isLocatingUser ? 'Detecting GPS...' : 'Use Current Location'}</span>
            </button>
          </form>

          {/* Profession & Distance Radius Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
            {/* Profession Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 inline-flex items-center gap-1 mr-1">
                <Filter className="w-3.5 h-3.5 text-primary-600" />
                Profession:
              </span>
              <select
                value={selectedProfession}
                onChange={(e) => setSelectedProfession(e.target.value)}
                aria-label="Filter by profession"
                className="px-3.5 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="all">All Professions</option>
                {categories
                  .filter((c) => c.id !== 'more-services')
                  .map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
              </select>

              <div className="hidden xl:flex items-center gap-1.5 ml-2">
                {['all', 'Electrician', 'Plumber', 'Carpenter', 'Painter', 'Mechanic'].map((prof) => (
                  <button
                    key={prof}
                    type="button"
                    onClick={() => setSelectedProfession(prof)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      selectedProfession === prof
                        ? 'bg-primary-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {prof === 'all' ? 'All' : prof}
                  </button>
                ))}
              </div>
            </div>

            {/* Distance Radius Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 inline-flex items-center gap-1 mr-1">
                <Navigation className="w-3.5 h-3.5 text-primary-600" />
                Radius:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {RADIUS_OPTIONS.map((km) => (
                  <button
                    key={km}
                    type="button"
                    onClick={() => handleRadiusChange(km)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      radiusKm === km
                        ? 'bg-primary-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {km} km
                  </button>
                ))}
              </div>
            </div>
          </div>

          {geoNotice && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between gap-2">
              <span>{geoNotice}</span>
              <button type="button" onClick={() => setGeoNotice('')} className="p-0.5 hover:bg-amber-100 rounded">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Map + Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {/* Large Interactive Map */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft overflow-hidden">
          <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="inline-flex items-center gap-1.5 font-semibold text-[#1E293B] dark:text-slate-200">
                <span className="w-3 h-3 rounded-full bg-[#2563EB] ring-2 ring-blue-200 inline-block" />
                Your Selected Location
              </span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-[#1E293B] dark:text-slate-200">
                <span className="w-3 h-3 rounded-full bg-[#16A34A] ring-2 ring-green-200 inline-block" />
                Online Worker ({workers.length}) &bull; Approximate Area Only
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                Click anywhere on the map to move your pin or click a worker marker to inspect details
              </span>
            </div>
            <span className="font-mono text-[11px] text-slate-500">
              {customerCoords.lat.toFixed(4)}, {customerCoords.lng.toFixed(4)} &bull; {radiusKm} km radius
            </span>
          </div>

          <div
            ref={mapContainerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={() => {
              dragStateRef.current = null;
            }}
            className="relative w-full h-[460px] sm:h-[540px] lg:h-[620px] bg-slate-200 overflow-hidden cursor-grab active:cursor-grabbing select-none touch-none"
          >
            {/* OpenStreetMap Slippy Tiles */}
            {tiles.map((t) => (
              <img
                key={t.key}
                src={t.src}
                alt=""
                draggable={false}
                className="absolute w-64 h-64 max-w-none pointer-events-none"
                style={{ left: `${t.left}px`, top: `${t.top}px` }}
              />
            ))}

            {/* Distance Radius Overlay Circle around Customer Location */}
            <div
              className="absolute rounded-full border-2 border-[#2563EB]/45 bg-[#2563EB]/10 pointer-events-none transition-all duration-200"
              style={{
                width: `${radiusPixels * 2}px`,
                height: `${radiusPixels * 2}px`,
                left: `${customerPinPos.x - radiusPixels}px`,
                top: `${customerPinPos.y - radiusPixels}px`,
              }}
            />

            {/* Customer Location Marker */}
            <div
              data-map-marker="true"
              className="absolute z-10 -translate-x-1/2 -translate-y-full pointer-events-none"
              style={{ left: `${customerPinPos.x}px`, top: `${customerPinPos.y}px` }}
            >
              <div className="flex flex-col items-center">
                <span className="mb-1 px-2 py-0.5 rounded-full bg-[#0F172A]/90 text-white text-[10px] font-bold shadow whitespace-nowrap">
                  Your Location
                </span>
                <div className="relative flex items-center justify-center">
                  <span className="absolute w-8 h-8 rounded-full bg-[#2563EB]/30 animate-ping" />
                  <div className="w-9 h-9 rounded-full bg-[#2563EB] text-white border-2 border-white shadow-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Real Registered Online Workers Markers */}
            {workers.map((worker) => {
              if (!worker.coordinates) return null;
              const pos = projectToScreen(worker.coordinates.lat, worker.coordinates.lng);
              const isSelected = selectedWorker?.id === worker.id;

              return (
                <button
                  key={worker.id}
                  type="button"
                  data-map-marker="true"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedWorker(worker);
                  }}
                  title={`${worker.name} • ${worker.profession} (${worker.distance})`}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-150 ${
                    isSelected ? 'z-30 scale-125' : 'z-20 hover:scale-110'
                  }`}
                  style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
                >
                  <div className="relative flex flex-col items-center">
                    <div
                      className={`w-11 h-11 rounded-full p-0.5 shadow-lg border-2 ${
                        isSelected
                          ? 'bg-primary-600 border-white ring-4 ring-primary-500/40'
                          : 'bg-emerald-500 border-white'
                      }`}
                    >
                      <Avatar
                        name={worker.name}
                        src={worker.avatar}
                        className="w-full h-full rounded-full text-xs"
                      />
                    </div>
                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                    <span className="mt-0.5 px-1.5 py-0.5 rounded bg-white/95 text-slate-900 text-[10px] font-bold shadow border border-slate-200 whitespace-nowrap max-w-[110px] truncate">
                      {worker.profession}
                    </span>
                  </div>
                </button>
              );
            })}

            {/* Map Zoom & Recenter Controls */}
            <div
              data-map-control="true"
              className="absolute top-3 right-3 z-30 flex flex-col gap-1.5"
            >
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + 1))}
                className="w-9 h-9 bg-white hover:bg-slate-50 text-slate-800 rounded-xl shadow-md border border-slate-200 flex items-center justify-center"
                title="Zoom In"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - 1))}
                className="w-9 h-9 bg-white hover:bg-slate-50 text-slate-800 rounded-xl shadow-md border border-slate-200 flex items-center justify-center"
                title="Zoom Out"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setMapCenter(customerCoords);
                  setZoom(getIdealZoomForRadius(radiusKm));
                }}
                className="w-9 h-9 bg-white hover:bg-slate-50 text-primary-600 rounded-xl shadow-md border border-slate-200 flex items-center justify-center"
                title="Center on Selected Location"
              >
                <LocateFixed className="w-4 h-4" />
              </button>
            </div>

            {/* Selected Worker Marker Popup Card */}
            {selectedWorker && (
              <div
                data-map-control="true"
                className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-[350px] z-40 bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-2xl border border-slate-200 dark:border-slate-700 animate-fadeIn"
              >
                <button
                  type="button"
                  onClick={() => setSelectedWorker(null)}
                  className="absolute top-3 right-3 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                  aria-label="Close worker popup"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-start gap-3.5 pr-6">
                  <div className="relative shrink-0">
                    <Avatar
                      name={selectedWorker.name}
                      src={selectedWorker.avatar}
                      className="w-14 h-14 rounded-2xl text-lg ring-2 ring-emerald-500"
                    />
                    <span
                      className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"
                      title="Online"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                        {selectedWorker.name}
                      </h3>
                      {selectedWorker.verified && (
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                      {selectedWorker.profession}
                    </p>
                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                      <RatingStars
                        rating={selectedWorker.rating}
                        count={selectedWorker.reviewsCount}
                        size="xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      {selectedWorker.isOnline ? 'Online' : 'Offline'}
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-slate-700 dark:text-slate-200">
                      <MapPin className="w-3.5 h-3.5 text-primary-500" />
                      {selectedWorker.distance}
                    </span>
                  </div>
                  {(selectedWorker.approximateArea || selectedWorker.location) && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Approximate area: <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedWorker.approximateArea || selectedWorker.location}</span>
                    </p>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleBookWorker(selectedWorker)}
                    className="py-2 px-3 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Hire Now</span>
                  </button>
                  <Link
                    to={`/worker/${selectedWorker.id}`}
                    className="py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-colors"
                  >
                    <span>Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* OpenStreetMap Attribution */}
            <div className="absolute bottom-1.5 left-2 z-10 px-2 py-0.5 rounded bg-white/85 text-[10px] text-slate-600 pointer-events-none">
              &copy; OpenStreetMap contributors
            </div>
          </div>
        </div>

        {/* Live MongoDB Worker Directory Below Map */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Online Workers Within {radiusKm} km
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Showing verified live coordinates from MongoDB for workers who are online and sharing location
              </p>
            </div>
            <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200">
              {workers.length} {workers.length === 1 ? 'Worker' : 'Workers'} Found
            </span>
          </div>

          {apiError ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-rose-200 dark:border-rose-900/60 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Live Backend Connection Required
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
                {apiError}
              </p>
              <button
                type="button"
                onClick={() => fetchNearbyWorkers(customerCoords, radiusKm, selectedProfession)}
                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Retry Connection
              </button>
            </div>
          ) : isLoadingWorkers ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-200 dark:border-slate-800 text-center space-y-2">
              <RefreshCw className="w-7 h-7 text-primary-600 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Scanning MongoDB for online workers nearby...
              </p>
            </div>
          ) : workers.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <MapPin className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No online workers sharing location within {radiusKm} km
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {totalOnlineSharingCount > 0
                  ? `${totalOnlineSharingCount} online ${totalOnlineSharingCount === 1 ? 'worker is' : 'workers are'} currently sharing location outside your ${radiusKm} km radius. Expand the radius or click "Use Current Location" to center near them.`
                  : 'Only real workers from the database who are currently online and have enabled live location sharing appear here. Log in as a worker and enable "Share Live Location" on the Worker Dashboard to test.'}
              </p>
              {radiusKm < 100 && (
                <button
                  type="button"
                  onClick={() => handleRadiusChange(totalOnlineSharingCount > 0 ? 100 : 50)}
                  className="px-4 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-bold rounded-xl border border-primary-200 transition-colors"
                >
                  {totalOnlineSharingCount > 0 ? 'Expand Search Radius to 100 km' : 'Expand Search Radius to 50 km'}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workers.map((worker) => (
                <div
                  key={worker.id}
                  onClick={() => {
                    setSelectedWorker(worker);
                    if (worker.coordinates) {
                      setMapCenter(worker.coordinates);
                    }
                  }}
                  className={`bg-white dark:bg-slate-900 rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    selectedWorker?.id === worker.id
                      ? 'border-primary-500 ring-2 ring-primary-500/20 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 hover:border-primary-300'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="relative shrink-0">
                      <Avatar
                        name={worker.name}
                        src={worker.avatar}
                        className="w-14 h-14 rounded-2xl text-lg ring-2 ring-slate-100"
                      />
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {worker.name}
                        </h3>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                          Online
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 mt-0.5">
                        {worker.profession}
                      </p>
                      <div className="mt-1.5 flex items-center justify-between gap-2">
                        <RatingStars rating={worker.rating} count={worker.reviewsCount} size="xs" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 shrink-0">
                          <MapPin className="w-3.5 h-3.5 text-primary-500" />
                          {worker.distance}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">
                      ₹{worker.hourlyRate}/hr
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookWorker(worker);
                        }}
                        className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors"
                      >
                        Hire
                      </button>
                      <Link
                        to={`/worker/${worker.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-lg transition-colors"
                      >
                        Profile
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {bookingWorker && (
        <BookingModal
          worker={bookingWorker}
          isOpen={!!bookingWorker}
          onClose={() => setBookingWorker(null)}
        />
      )}
    </div>
  );
};
