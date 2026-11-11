import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  MapPin,
  LocateFixed,
  Plus,
  Minus,
  Check,
  Search,
  Navigation
} from 'lucide-react';
import { DEFAULT_STATE, DEFAULT_COUNTRY, getStateConfig } from '../config/states';
import { useAuth } from '../context/AuthContext';
import { useCustomerLocation } from '../context/LocationContext';

export const ASSAM_DISTRICT_COORDS = [
  { district: 'Kamrup Metropolitan', town: 'Guwahati', lat: 26.1445, lng: 91.7362 },
  { district: 'Dibrugarh', town: 'Dibrugarh', lat: 27.4728, lng: 94.9120 },
  { district: 'Jorhat', town: 'Jorhat', lat: 26.7509, lng: 94.2037 },
  { district: 'Cachar', town: 'Silchar', lat: 24.8333, lng: 92.7789 },
  { district: 'Sonitpur', town: 'Tezpur', lat: 26.6528, lng: 92.7926 },
  { district: 'Nagaon', town: 'Nagaon', lat: 26.3480, lng: 92.6838 },
  { district: 'Tinsukia', town: 'Tinsukia', lat: 27.4922, lng: 95.3468 },
  { district: 'Sivasagar', town: 'Sivasagar', lat: 26.9826, lng: 94.6425 },
  { district: 'Barpeta', town: 'Barpeta', lat: 26.3229, lng: 91.0063 },
  { district: 'Bongaigaon', town: 'Bongaigaon', lat: 26.4765, lng: 90.5582 },
  { district: 'Goalpara', town: 'Goalpara', lat: 26.1641, lng: 90.6252 },
  { district: 'Dhubri', town: 'Dhubri', lat: 26.0188, lng: 89.9857 },
  { district: 'Kamrup', town: 'Amingaon', lat: 26.1856, lng: 91.6695 },
  { district: 'Nalbari', town: 'Nalbari', lat: 26.4446, lng: 91.4414 },
  { district: 'Kokrajhar', town: 'Kokrajhar', lat: 26.4015, lng: 90.2667 },
  { district: 'Golaghat', town: 'Golaghat', lat: 26.5239, lng: 93.9623 },
  { district: 'Lakhimpur', town: 'North Lakhimpur', lat: 27.2361, lng: 94.1038 },
  { district: 'Dhemaji', town: 'Dhemaji', lat: 27.4820, lng: 94.5579 },
  { district: 'Darrang', town: 'Mangaldoi', lat: 26.4410, lng: 92.0294 },
  { district: 'Morigaon', town: 'Morigaon', lat: 26.2512, lng: 92.3408 },
  { district: 'Karimganj', town: 'Karimganj', lat: 24.8693, lng: 92.3574 },
  { district: 'Hailakandi', town: 'Hailakandi', lat: 24.6847, lng: 92.5646 },
  { district: 'Karbi Anglong', town: 'Diphu', lat: 25.8407, lng: 93.4310 },
  { district: 'West Karbi Anglong', town: 'Hamren', lat: 25.8975, lng: 92.5878 },
  { district: 'Dima Hasao', town: 'Haflong', lat: 25.1674, lng: 93.0176 },
  { district: 'Baksa', town: 'Mushalpur', lat: 26.5784, lng: 91.4237 },
  { district: 'Chirang', town: 'Kajalgaon', lat: 26.5173, lng: 90.4898 },
  { district: 'Udalguri', town: 'Udalguri', lat: 26.7453, lng: 92.0962 },
  { district: 'Biswanath', town: 'Biswanath Chariali', lat: 26.7267, lng: 93.1481 },
  { district: 'Charaideo', town: 'Sonari', lat: 27.0241, lng: 95.0165 },
  { district: 'Hojai', town: 'Hojai', lat: 26.0017, lng: 92.8473 },
  { district: 'Majuli', town: 'Garamur', lat: 26.9547, lng: 94.1672 },
  { district: 'South Salmara-Mankachar', town: 'Hatsingimari', lat: 25.8548, lng: 89.8938 },
  { district: 'Bajali', town: 'Pathsala', lat: 26.4981, lng: 91.1795 },
  { district: 'Tamulpur', town: 'Tamulpur', lat: 26.6317, lng: 91.5778 },
];

const TILE_SIZE = 256;

const lon2tile = (lon, z) => ((lon + 180) / 360) * Math.pow(2, z);
const lat2tile = (lat, z) => {
  const rad = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * Math.pow(2, z);
};
const tile2lon = (x, z) => (x / Math.pow(2, z)) * 360 - 180;
const tile2lat = (y, z) => {
  const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z);
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
};

const findNearestAssamPlace = (lat, lng) => {
  let best = ASSAM_DISTRICT_COORDS[0];
  let bestDist = Infinity;
  for (const d of ASSAM_DISTRICT_COORDS) {
    const dist = Math.hypot(d.lat - lat, d.lng - lng);
    if (dist < bestDist) {
      bestDist = dist;
      best = d;
    }
  }
  return best;
};

const formatDistrictText = (d) =>
  d.town.toLowerCase() === d.district.toLowerCase()
    ? `${d.district}, Assam`
    : `${d.town}, ${d.district}, Assam`;

export const MapPickerModal = ({
  isOpen,
  onClose,
  onSelectLocation,
  initialValue = '',
  initialCoords = null,
  defaultState = DEFAULT_STATE,
  defaultCountry = DEFAULT_COUNTRY,
  title = 'Set Location on Map',
  useCustomerDefault = true,
}) => {
  const { user } = useAuth();
  const { customerLocation, defaultMapLocation } = useCustomerLocation();
  const mapContainerRef = useRef(null);
  const dragStateRef = useRef(null);

  const [mapSize, setMapSize] = useState({ width: 560, height: 300 });
  const [zoom, setZoom] = useState(11);
  const [center, setCenter] = useState({ lat: 26.1445, lng: 91.7362 });
  const [pin, setPin] = useState({ lat: 26.1445, lng: 91.7362 });
  const [selectedAddress, setSelectedAddress] = useState(initialValue || 'Guwahati, Kamrup Metropolitan, Assam');
  const [searchText, setSearchText] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Click anywhere on the map or pick an Assam district to drop the pin.');

  // Sync initial location when modal opens
  useEffect(() => {
    if (!isOpen) return;
    const trimmedInitial = String(initialValue || '').trim();
    const meaningfulInitial =
      trimmedInitial && trimmedInitial.toLowerCase() !== 'all assam' ? trimmedInitial : '';

    if (
      initialCoords &&
      Number.isFinite(Number(initialCoords.lat)) &&
      Number.isFinite(Number(initialCoords.lng))
    ) {
      const target = { lat: Number(initialCoords.lat), lng: Number(initialCoords.lng) };
      setCenter(target);
      setPin(target);
      setZoom(13);
      setSelectedAddress(meaningfulInitial || defaultMapLocation?.label || `${defaultState}, ${defaultCountry}`);
      setSearchText('');
      return;
    }

    const lowered = meaningfulInitial.toLowerCase();
    const matched = lowered
      ? ASSAM_DISTRICT_COORDS.find(
          (d) =>
            lowered.includes(d.district.toLowerCase()) ||
            lowered.includes(d.town.toLowerCase())
        )
      : null;

    if (matched) {
      setCenter({ lat: matched.lat, lng: matched.lng });
      setPin({ lat: matched.lat, lng: matched.lng });
      setZoom(11);
      setSelectedAddress(meaningfulInitial || formatDistrictText(matched));
      setSearchText('');
      return;
    }

    const canUseCustomerLoc =
      useCustomerDefault &&
      (!user || (user.role !== 'worker' && user.role !== 'admin')) &&
      Number.isFinite(Number(defaultMapLocation?.lat)) &&
      Number.isFinite(Number(defaultMapLocation?.lng));

    if (canUseCustomerLoc) {
      const target = {
        lat: Number(defaultMapLocation.lat),
        lng: Number(defaultMapLocation.lng),
      };
      setCenter(target);
      setPin(target);
      setZoom(customerLocation?.isSet || defaultMapLocation?.source === 'profile' ? 12 : 11);
      setSelectedAddress(meaningfulInitial || defaultMapLocation.label || `${defaultState}, ${defaultCountry}`);
      setSearchText('');
      return;
    }

    const stateCfg = getStateConfig(defaultState);
    const target = stateCfg?.defaultCenter || ASSAM_DISTRICT_COORDS[0];
    setCenter({ lat: target.lat, lng: target.lng });
    setPin({ lat: target.lat, lng: target.lng });
    setZoom(7);
    setSelectedAddress(meaningfulInitial || `${stateCfg?.name || defaultState}, ${defaultCountry}`);
    setSearchText('');
  }, [
    isOpen,
    initialValue,
    initialCoords,
    defaultState,
    defaultCountry,
    useCustomerDefault,
    user,
    customerLocation?.isSet,
    defaultMapLocation,
  ]);

  // Measure container width/height when open
  useEffect(() => {
    if (!isOpen) return;
    const measure = () => {
      if (mapContainerRef.current) {
        setMapSize({
          width: mapContainerRef.current.clientWidth || 560,
          height: mapContainerRef.current.clientHeight || 300,
        });
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [isOpen]);

  const resolveCoordsToAddress = async (lat, lng) => {
    const nearest = findNearestAssamPlace(lat, lng);
    const fallbackAddr = `${formatDistrictText(nearest)} (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    setSelectedAddress(fallbackAddr);
    setStatusMessage(`Pinned near ${nearest.town} (${nearest.district}) • Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}`);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        { headers: { Accept: 'application/json' } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data?.display_name) {
          const shortParts = data.display_name.split(',').slice(0, 4).map(s => s.trim()).filter(Boolean);
          setSelectedAddress(shortParts.join(', '));
        }
      }
    } catch {
      // Offline / blocked network fallback already applied cleanly
    }
  };

  const handleDistrictJump = (d) => {
    setCenter({ lat: d.lat, lng: d.lng });
    setPin({ lat: d.lat, lng: d.lng });
    setZoom(12);
    const formatted = formatDistrictText(d);
    setSelectedAddress(formatted);
    setStatusMessage(`Centered on ${formatted}`);
  };

  const handleSearchJump = async (e) => {
    e.preventDefault();
    const q = searchText.trim().toLowerCase();
    if (!q) return;

    const localMatch = ASSAM_DISTRICT_COORDS.find(
      (d) =>
        d.district.toLowerCase().includes(q) ||
        d.town.toLowerCase().includes(q)
    );
    if (localMatch) {
      handleDistrictJump(localMatch);
      return;
    }

    try {
      const queryWithRegion =
        defaultState && !q.includes(defaultState.toLowerCase())
          ? `${searchText.trim()}, ${defaultState}, ${defaultCountry}`
          : searchText.trim();
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(queryWithRegion)}`
      );
      if (res.ok) {
        const results = await res.json();
        if (Array.isArray(results) && results.length > 0) {
          const lat = parseFloat(results[0].lat);
          const lng = parseFloat(results[0].lon);
          setCenter({ lat, lng });
          setPin({ lat, lng });
          setZoom(13);
          const shortAddr = results[0].display_name.split(',').slice(0, 4).map(s => s.trim()).join(', ');
          setSelectedAddress(shortAddr);
          setStatusMessage(`Found: ${shortAddr}`);
          return;
        }
      }
    } catch {
      // Offline fallback below
    }
    setStatusMessage('No matching district found. Try clicking directly on the map.');
  };

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      setStatusMessage('Geolocation is not supported in this browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCenter({ lat, lng });
        setPin({ lat, lng });
        setZoom(14);
        resolveCoordsToAddress(lat, lng);
      },
      () => {
        setIsLocating(false);
        setStatusMessage('GPS permission denied. Please click on the map or pick an Assam district.');
      },
      { timeout: 6000 }
    );
  };

  const handlePointerDown = (e) => {
    if (e.button !== 0) return;
    dragStateRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startCenterLat: center.lat,
      startCenterLng: center.lng,
      moved: false,
    };
  };

  const handlePointerMove = (e) => {
    const drag = dragStateRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (Math.hypot(dx, dy) > 4) {
      drag.moved = true;
      const startCx = lon2tile(drag.startCenterLng, zoom);
      const startCy = lat2tile(drag.startCenterLat, zoom);
      const nextLng = tile2lon(startCx - dx / TILE_SIZE, zoom);
      const nextLat = Math.max(-85, Math.min(85, tile2lat(startCy - dy / TILE_SIZE, zoom)));
      setCenter({ lat: nextLat, lng: nextLng });
    }
  };

  const handlePointerUp = (e) => {
    const drag = dragStateRef.current;
    dragStateRef.current = null;
    if (!drag || drag.moved || !mapContainerRef.current) return;

    const rect = mapContainerRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const cx = lon2tile(center.lng, zoom);
    const cy = lat2tile(center.lat, zoom);
    const clickLng = tile2lon(cx + (px - mapSize.width / 2) / TILE_SIZE, zoom);
    const clickLat = Math.max(-85, Math.min(85, tile2lat(cy + (py - mapSize.height / 2) / TILE_SIZE, zoom)));

    setPin({ lat: clickLat, lng: clickLng });
    resolveCoordsToAddress(clickLat, clickLng);
  };

  const tiles = useMemo(() => {
    const cx = lon2tile(center.lng, zoom);
    const cy = lat2tile(center.lat, zoom);
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
  }, [center, zoom, mapSize]);

  const pinScreenPos = useMemo(() => {
    const cx = lon2tile(center.lng, zoom);
    const cy = lat2tile(center.lat, zoom);
    const px = mapSize.width / 2 + (lon2tile(pin.lng, zoom) - cx) * TILE_SIZE;
    const py = mapSize.height / 2 + (lat2tile(pin.lat, zoom) - cy) * TILE_SIZE;
    return { x: px, y: py };
  }, [center, pin, zoom, mapSize]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/65 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#0033FF] to-[#0600AB] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <Navigation className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">{title}</h3>
              <p className="text-[11px] text-blue-100">Click anywhere on the map or drag to pan</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/15 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Search + GPS Bar */}
          <form onSubmit={handleSearchJump} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search Assam town or district (e.g. Guwahati, Dibrugarh, Jorhat...)"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Find
              </button>
              <button
                type="button"
                onClick={handleUseGPS}
                disabled={isLocating}
                className="px-3.5 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5"
              >
                <LocateFixed className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Locating...' : 'My GPS'}</span>
              </button>
            </div>
          </form>

          {/* Interactive Map Canvas */}
          <div
            ref={mapContainerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={() => { dragStateRef.current = null; }}
            className="relative w-full h-72 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 select-none cursor-crosshair shadow-inner"
            style={{
              backgroundImage:
                'radial-gradient(#cbd5e1 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          >
            {/* OpenStreetMap Slippy Tiles */}
            {tiles.map((t) => (
              <img
                key={t.key}
                src={t.src}
                alt=""
                draggable={false}
                onError={(e) => { e.currentTarget.style.opacity = '0'; }}
                style={{
                  position: 'absolute',
                  left: `${t.left}px`,
                  top: `${t.top}px`,
                  width: `${TILE_SIZE}px`,
                  height: `${TILE_SIZE}px`,
                  maxWidth: 'none',
                  pointerEvents: 'none',
                }}
              />
            ))}

            {/* Selected Location Pin */}
            <div
              style={{
                left: `${pinScreenPos.x}px`,
                top: `${pinScreenPos.y}px`,
                transform: 'translate(-50%, -100%)',
              }}
              className="absolute z-10 pointer-events-none flex flex-col items-center"
            >
              <div className="bg-rose-600 text-white p-2 rounded-full shadow-lg ring-4 ring-white/90 animate-bounce-soft">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="w-2.5 h-2.5 bg-rose-600/40 rounded-full blur-[1px] -mt-1" />
            </div>

            {/* Zoom Controls */}
            <div className="absolute right-3 top-3 z-20 flex flex-col bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setZoom(z => Math.min(16, z + 1)); }}
                className="p-2 hover:bg-slate-100 text-slate-700 border-b border-slate-200 transition-colors"
                title="Zoom in"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setZoom(z => Math.max(6, z - 1)); }}
                className="p-2 hover:bg-slate-100 text-slate-700 transition-colors"
                title="Zoom out"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>

            {/* Coordinates Pill */}
            <div className="absolute left-3 bottom-3 z-20 px-2.5 py-1 bg-white/90 backdrop-blur-xs rounded-lg border border-slate-200 text-[10px] font-semibold text-slate-700 shadow-xs pointer-events-none">
              {pin.lat.toFixed(4)}° N, {pin.lng.toFixed(4)}° E
            </div>
          </div>

          {/* Quick Assam District Pills */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Quick Jump — Assam Districts
            </p>
            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
              {ASSAM_DISTRICT_COORDS.slice(0, 14).map((d) => (
                <button
                  key={d.district}
                  type="button"
                  onClick={() => handleDistrictJump(d)}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-primary-50 hover:text-primary-700 text-slate-700 rounded-lg border border-slate-200 transition-colors"
                >
                  {d.town !== d.district ? `${d.town} (${d.district})` : d.district}
                </button>
              ))}
            </div>
          </div>

          {/* Editable Selected Address & Confirm */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>{statusMessage}</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={selectedAddress}
                onChange={(e) => setSelectedAddress(e.target.value)}
                placeholder="Selected location address..."
                className="flex-1 px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  const nearest = findNearestAssamPlace(pin.lat, pin.lng);
                  const exactCoords = {
                    lat: Number(pin.lat.toFixed(6)),
                    lng: Number(pin.lng.toFixed(6)),
                  };
                  onSelectLocation(
                    selectedAddress.trim() || formatDistrictText(nearest),
                    nearest,
                    exactCoords
                  );
                  onClose();
                }}
                className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all inline-flex items-center justify-center gap-1.5 shrink-0"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Location</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
