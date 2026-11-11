import React, { createContext, useContext, useState, useRef } from 'react';
import { storage } from '../utils/storage';
import { detectNameFromEmail } from '../utils/detectName';
import { api } from '../services/api';
import { ASSAM_DISTRICT_COORDS } from '../components/MapPickerModal';

const AuthContext = createContext(null);

const resolveDistrictWorkCoords = (explicitCoords, cityOrLocation = '') => {
  if (
    explicitCoords &&
    Number.isFinite(Number(explicitCoords.lat)) &&
    Number.isFinite(Number(explicitCoords.lng))
  ) {
    return { lat: Number(explicitCoords.lat), lng: Number(explicitCoords.lng) };
  }
  const text = String(cityOrLocation || '').toLowerCase();
  const matched = ASSAM_DISTRICT_COORDS.find(
    (d) =>
      text.includes(d.district.toLowerCase()) ||
      text.includes(d.town.toLowerCase())
  );
  return matched ? { lat: matched.lat, lng: matched.lng } : { lat: 26.1445, lng: 91.7362 };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => storage.getAuthUser());
  const pendingAuthSyncRef = useRef(null);
  const lastBackendAuthRef = useRef({ success: true });

  const waitForBackendSync = async () => {
    if (pendingAuthSyncRef.current) {
      try {
        const result = await pendingAuthSyncRef.current;
        return result || lastBackendAuthRef.current;
      } catch {
        return { success: false, offline: true };
      }
    }
    return lastBackendAuthRef.current;
  };

  const applyBackendSession = (emailToMatch, res) => {
    if (!res?.success || !res?.token) {
      lastBackendAuthRef.current = {
        success: false,
        offline: Boolean(res?.offline),
        message: res?.message || 'Unable to authenticate with backend server.',
      };
      return false;
    }

    const current = storage.getAuthUser();
    if (!current || current.email?.toLowerCase() !== emailToMatch?.toLowerCase()) {
      return false;
    }

    const synced = {
      ...current,
      name: res.user?.name || current.name,
      city: res.user?.city || current.city,
      avatar: res.user?.profileImage || current.avatar || '',
      token: res.token,
      backendUserId: res.user?.id || res.user?._id || current.backendUserId,
    };

    // Persist synchronously first so immediately-mounted dashboards always read the JWT token
    storage.setAuthUser(synced);
    setUser(synced);
    lastBackendAuthRef.current = { success: true, token: res.token, user: res.user };
    return true;
  };

  // Demo user profiles
  const demoProfiles = {
    customer: {
      id: 'cust-1',
      name: 'Aarav Singhal',
      email: 'aarav.singhal@example.com',
      role: 'customer',
      avatar: '',
      phone: '+91 98711 22334',
      city: 'Guwahati, Assam',
    },
    worker: {
      id: 'w-1',
      name: 'Rohit Kumar',
      email: 'rohit.kumar@example.com',
      role: 'worker',
      profession: 'Electrician',
      rating: 4.8,
      verified: true,
      avatar: '',
      phone: '+91 98765 43210',
      city: 'Guwahati, Assam',
    },
    admin: {
      id: 'admin-1',
      name: 'Vikramaditya (Admin)',
      email: 'admin@workoshop.com',
      role: 'admin',
      avatar: '',
      phone: '+91 99999 88888',
      city: 'Headquarters',
    }
  };

  const login = (email, password, role = 'customer', customName = '') => {
    // 1. Detect name from the login info
    const detectedName = (customName && customName.trim()) ||
      detectNameFromEmail(email) ||
      (role === 'worker' ? 'Rohit Kumar' : role === 'admin' ? 'Vikramaditya (Admin)' : 'Aarav Singhal');

    let profile;

    if (role === 'worker') {
      const workers = storage.getWorkers();
      const existing = workers.find(w => w.email?.toLowerCase() === email?.toLowerCase());
      if (existing) {
        profile = {
          ...existing,
          name: detectedName || existing.name,
          email: email,
          role: 'worker',
        };
        storage.saveWorker(profile);
      } else {
        const newWorkerId = `w-${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
        profile = {
          id: newWorkerId,
          name: detectedName,
          email: email,
          role: 'worker',
          profession: 'Tradesperson',
          hourlyRate: 300,
          dailyRate: 2200,
          location: 'Guwahati, Kamrup Metropolitan, Assam',
          city: 'Kamrup Metropolitan',
          avatar: '',
        };
      }
    } else if (role === 'admin') {
      profile = {
        ...demoProfiles.admin,
        name: detectedName || demoProfiles.admin.name,
        email: email,
      };
    } else {
      // Customer Account: exactly match the login email & detected name
      profile = {
        id: `cust-${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
        name: detectedName,
        email: email,
        role: 'customer',
        avatar: '',
        phone: '+91 98711 22334',
        city: 'Guwahati, Assam',
      };
    }

    storage.setAuthUser(profile);
    setUser(profile);

    // Synchronize JWT token with backend/MongoDB when running
    if (email && password && password !== 'google-oauth-token') {
      const syncPromise = (async () => {
        let res = await api.login(email, password, role);
        // If quick demo customer logs in against an unseeded MongoDB, bootstrap demo customer once
        if (
          !res?.success &&
          !res?.offline &&
          role === 'customer' &&
          email.toLowerCase() === 'aarav.singhal@example.com' &&
          password === 'password123'
        ) {
          res = await api.registerCustomer({
            name: profile.name,
            email,
            phone: profile.phone || '+91 98711 22334',
            password,
            city: 'Guwahati',
          });
        }

        const applied = applyBackendSession(email, res);
        if (!applied && res && !res.offline) {
          // Clear unauthenticated optimistic profile when real backend rejects login
          storage.clearAuthUser();
          setUser(null);
        }
        return lastBackendAuthRef.current;
      })();
      pendingAuthSyncRef.current = syncPromise;
    }

    return profile;
  };

  const loginWithGoogle = (role = 'customer', customName = '', customEmail = '') => {
    const defaultEmail = role === 'worker' ? 'rohit.google@workoshop.com' : (role === 'admin' ? 'admin@workoshop.com' : 'aarav.google@workoshop.com');
    const email = customEmail || defaultEmail;
    const name = customName || detectNameFromEmail(email) || (role === 'worker' ? 'Rohit Kumar (Google)' : 'Aarav Singhal (Google)');

    const googleUser = login(email, 'google-oauth-token', role, name);
    googleUser.authProvider = 'google';
    storage.setAuthUser(googleUser);
    setUser(googleUser);
    return googleUser;
  };

  const updateUserProfile = (updatedData) => {
    setUser(prev => {
      const merged = { ...prev, ...updatedData };
      storage.setAuthUser(merged);
      if (merged.role === 'worker') {
        storage.saveWorker(merged);
      }
      return merged;
    });
  };

  const registerCustomer = (data) => {
    const newCustomer = {
      id: `cust-${Date.now()}`,
      name: data.fullName,
      email: data.email,
      phone: data.phone,
      city: data.city || 'Kamrup Metropolitan',
      role: 'customer',
      avatar: '',
    };
    storage.setAuthUser(newCustomer);
    setUser(newCustomer);

    const safePassword = data.password && String(data.password).length >= 6 ? data.password : 'password123';
    const registerSyncPromise = (async () => {
      let res = await api.registerCustomer({
        name: data.fullName,
        email: data.email,
        phone: data.phone || '+91 98711 22334',
        password: safePassword,
        city: data.city || 'Guwahati',
      });
      if (!res?.success && !res?.offline) {
        const loginAttempt = await api.login(data.email, safePassword, 'customer');
        if (loginAttempt?.success) res = loginAttempt;
      }
      const applied = applyBackendSession(data.email, res);
      if (!applied && res && !res.offline) {
        storage.clearAuthUser();
        setUser(null);
      }
      return lastBackendAuthRef.current;
    })();
    pendingAuthSyncRef.current = registerSyncPromise;

    return newCustomer;
  };

  const registerWorker = (data) => {
    const newWorker = {
      id: `w-${Date.now()}`,
      name: data.fullName,
      email: data.email,
      phone: data.phone,
      profession: data.profession,
      category: data.category?.toLowerCase() || 'electrician',
      verified: false, // Pending admin verification
      rating: 5.0,
      reviewsCount: 0,
      experience: `${data.experience} Years`,
      experienceYears: Number(data.experience) || 3,
      hourlyRate: Number(data.hourlyRate) || 300,
      dailyRate: Number(data.dailyRate) || 2000,
      location: data.location,
      city: data.city || data.location?.split(',')[0] || 'New Delhi',
      distance: '1.0 km away',
      availability: 'Available Now',
      isAvailable: true,
      avatar: data.avatar || '',
      coverImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200&auto=format&fit=crop&q=80',
      tagline: data.tagline || `Certified ${data.profession} with high dedication and skill.`,
      about: data.about || `Experienced professional providing top quality ${data.profession} services.`,
      skills: data.skills ? data.skills.split(',').map(s => s.trim()) : [data.profession],
      languages: data.languages ? data.languages.split(',').map(l => l.trim()) : ['Hindi', 'English'],
      education: data.education || 'Vocational Trade Certification',
      certifications: ['Skill India Certified (Under Review)'],
      completedJobs: 0,
      responseRate: '100%',
      responseTime: '< 15 mins',
      services: [
        { id: `s-${Date.now()}`, title: `Standard ${data.profession} Service`, price: Number(data.hourlyRate) || 300, duration: '1 hour', description: 'General diagnosis and repair service.' }
      ],
      gallery: [
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80'
      ],
      reviews: [],
    };

    const permLatRaw = data.permanentAddress?.coordinates?.lat ?? data.permanentLat;
    const permLngRaw = data.permanentAddress?.coordinates?.lng ?? data.permanentLng;
    const permLat = permLatRaw !== undefined && permLatRaw !== null && permLatRaw !== '' ? Number(permLatRaw) : null;
    const permLng = permLngRaw !== undefined && permLngRaw !== null && permLngRaw !== '' ? Number(permLngRaw) : null;
    const permanentAddressPayload = {
      address: (data.permanentAddress?.address ?? data.permanentAddressText ?? '').trim(),
      state: (data.permanentAddress?.state || data.state || 'Assam').trim(),
      country: (data.permanentAddress?.country || data.country || 'India').trim(),
      coordinates: {
        lat: Number.isFinite(permLat) ? permLat : null,
        lng: Number.isFinite(permLng) ? permLng : null,
      },
    };

    // Save public worker directory entry (without private permanent address)
    storage.saveWorker(newWorker);
    // Save private permanent address separately for the worker's own profile settings
    storage.savePermanentAddress(newWorker.id, permanentAddressPayload);

    // Save in auth user
    const authProfile = {
      ...newWorker,
      permanentAddress: permanentAddressPayload,
      role: 'worker',
    };
    storage.setAuthUser(authProfile);
    setUser(authProfile);

    // Persist new worker to MongoDB backend when running
    const safePassword = data.password && String(data.password).length >= 6 ? data.password : 'password123';
    const workCoords = resolveDistrictWorkCoords(
      data.coordinates,
      `${data.city || ''} ${data.location || ''}`
    );
    const shouldShareLocation =
      data.locationSharingEnabled !== undefined ? Boolean(data.locationSharingEnabled) : true;
    const shouldBeOnline =
      data.isOnline !== undefined ? Boolean(data.isOnline) : shouldShareLocation;

    const registerSyncPromise = (async () => {
      let res = await api.registerWorker({
        name: data.fullName,
        email: data.email,
        phone: data.phone || '+91 98765 43210',
        password: safePassword,
        city: data.city || data.location?.split(',')[0] || 'Guwahati',
        profession: data.profession,
        category: data.category?.toLowerCase() || 'electrician',
        skills: data.skills,
        experience: `${data.experience} Years`,
        experienceYears: Number(data.experience) || 3,
        hourlyRate: Number(data.hourlyRate) || 300,
        dailyRate: Number(data.dailyRate) || 2000,
        location: data.location,
        permanentAddress: permanentAddressPayload,
        languages: data.languages,
        about: data.about,
        tagline: data.tagline,
        coordinates: workCoords,
        locationSharingEnabled: shouldShareLocation,
        isOnline: shouldBeOnline,
      });

      if (!res?.success && !res?.offline) {
        const loginAttempt = await api.login(data.email, safePassword, 'worker');
        if (loginAttempt?.success) res = loginAttempt;
      }
      const applied = applyBackendSession(data.email, res);
      if (!applied && res && !res.offline) {
        storage.clearAuthUser();
        setUser(null);
      }
      return lastBackendAuthRef.current;
    })();
    pendingAuthSyncRef.current = registerSyncPromise;

    return newWorker;
  };

  const switchRole = (role) => {
    if (demoProfiles[role]) {
      storage.setAuthUser(demoProfiles[role]);
      setUser(demoProfiles[role]);
    }
  };

  const logout = () => {
    storage.clearAuthUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      loginWithGoogle,
      logout,
      registerCustomer,
      registerWorker,
      waitForBackendSync,
      switchRole,
      updateUserProfile,
      isAuthenticated: !!user,
      isCustomer: user?.role === 'customer',
      isWorker: user?.role === 'worker',
      isAdmin: user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

