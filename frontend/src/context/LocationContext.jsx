import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { ASSAM_DISTRICT_COORDS } from '../components/MapPickerModal';

const SITE_LOCATION_KEY = 'hw_customer_site_location';

const DEFAULT_SITE_LOCATION = {
  label: 'All Assam',
  district: '',
  lat: 26.1445,
  lng: 91.7362,
  isSet: false,
};

const matchAssamDistrict = (text = '') => {
  const lower = String(text || '').trim().toLowerCase();
  if (!lower) return null;
  const tokens = lower
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3 && t !== 'assam' && t !== 'india');

  return (
    ASSAM_DISTRICT_COORDS.find((d) => {
      const dist = d.district.toLowerCase();
      const town = d.town.toLowerCase();
      return (
        dist.includes(lower) ||
        town.includes(lower) ||
        lower.includes(dist) ||
        lower.includes(town) ||
        tokens.some((tok) => dist.includes(tok) || town.includes(tok))
      );
    }) || null
  );
};

const readStoredSiteLocation = () => {
  try {
    const raw = localStorage.getItem(SITE_LOCATION_KEY);
    if (!raw) return DEFAULT_SITE_LOCATION;
    const parsed = JSON.parse(raw);
    const lat = Number(parsed?.lat);
    const lng = Number(parsed?.lng);
    if (
      parsed &&
      parsed.isSet &&
      Number.isFinite(lat) &&
      Number.isFinite(lng)
    ) {
      return {
        label: parsed.label || parsed.district || 'Selected Location',
        district: parsed.district || '',
        lat,
        lng,
        isSet: true,
      };
    }
  } catch {
    // Ignore storage parse error
  }
  return DEFAULT_SITE_LOCATION;
};

const LocationContext = createContext(null);

export const LocationProvider = ({ children }) => {
  const { user, updateUserProfile } = useAuth();
  const [customerLocation, setCustomerLocation] = useState(() => readStoredSiteLocation());

  // Sync across tabs when customer changes location
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === SITE_LOCATION_KEY) {
        setCustomerLocation(readStoredSiteLocation());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setSiteLocation = useCallback(
    ({ label, district, lat, lng }) => {
      const matched = matchAssamDistrict(district || label);
      const resolvedLat = Number.isFinite(Number(lat))
        ? Number(lat)
        : matched?.lat ?? 26.1445;
      const resolvedLng = Number.isFinite(Number(lng))
        ? Number(lng)
        : matched?.lng ?? 91.7362;
      const resolvedDistrict =
        (district && String(district).trim()) ||
        matched?.district ||
        String(label || '').split(',')[0].trim();
      const resolvedLabel =
        (label && String(label).trim()) ||
        (matched
          ? matched.town === matched.district
            ? `${matched.district}, Assam`
            : `${matched.town}, ${matched.district}, Assam`
          : resolvedDistrict || 'Selected Location');

      const next = {
        label: resolvedLabel,
        district: resolvedDistrict,
        lat: resolvedLat,
        lng: resolvedLng,
        isSet: true,
      };

      try {
        localStorage.setItem(SITE_LOCATION_KEY, JSON.stringify(next));
      } catch {
        // Non-fatal
      }
      setCustomerLocation(next);

      if (user?.role === 'customer' && updateUserProfile && resolvedDistrict) {
        updateUserProfile({ city: resolvedDistrict });
      }
      return next;
    },
    [user?.role, updateUserProfile]
  );

  const clearSiteLocation = useCallback(() => {
    try {
      localStorage.removeItem(SITE_LOCATION_KEY);
    } catch {
      // Non-fatal
    }
    setCustomerLocation(DEFAULT_SITE_LOCATION);
  }, []);

  const defaultMapLocation = useMemo(() => {
    if (
      customerLocation.isSet &&
      Number.isFinite(customerLocation.lat) &&
      Number.isFinite(customerLocation.lng)
    ) {
      return {
        label: customerLocation.label,
        district: customerLocation.district,
        lat: customerLocation.lat,
        lng: customerLocation.lng,
        source: 'selected',
      };
    }

    if (user && user.role !== 'worker' && user.role !== 'admin') {
      const profileText = user.location || user.address || user.city || '';
      const matched = matchAssamDistrict(profileText);
      const profileLat = Number(user.lat ?? user.latitude);
      const profileLng = Number(user.lng ?? user.longitude);

      if (Number.isFinite(profileLat) && Number.isFinite(profileLng)) {
        return {
          label:
            String(profileText).trim() ||
            (matched
              ? matched.town === matched.district
                ? `${matched.district}, Assam`
                : `${matched.town}, ${matched.district}, Assam`
              : 'Selected Location'),
          district: matched?.district || String(user.city || '').trim(),
          lat: profileLat,
          lng: profileLng,
          source: 'profile',
        };
      }

      if (matched) {
        return {
          label:
            matched.town === matched.district
              ? `${matched.district}, Assam`
              : `${matched.town}, ${matched.district}, Assam`,
          district: matched.district,
          lat: matched.lat,
          lng: matched.lng,
          source: 'profile',
        };
      }
    }

    return {
      label: 'Guwahati, Assam',
      district: 'Kamrup Metropolitan',
      lat: DEFAULT_SITE_LOCATION.lat,
      lng: DEFAULT_SITE_LOCATION.lng,
      source: 'fallback',
    };
  }, [customerLocation, user]);

  return (
    <LocationContext.Provider
      value={{
        customerLocation,
        defaultMapLocation,
        setSiteLocation,
        clearSiteLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useCustomerLocation = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    return {
      customerLocation: DEFAULT_SITE_LOCATION,
      defaultMapLocation: {
        label: 'Guwahati, Assam',
        district: 'Kamrup Metropolitan',
        lat: DEFAULT_SITE_LOCATION.lat,
        lng: DEFAULT_SITE_LOCATION.lng,
        source: 'fallback',
      },
      setSiteLocation: () => DEFAULT_SITE_LOCATION,
      clearSiteLocation: () => {},
    };
  }
  return ctx;
};

