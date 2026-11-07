import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => storage.getAuthUser());

  // Demo user profiles
  const demoProfiles = {
    customer: {
      id: 'cust-1',
      name: 'Aarav Singhal',
      email: 'aarav.singhal@example.com',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      phone: '+91 98711 22334',
      city: 'New Delhi',
    },
    worker: {
      id: 'w-1',
      name: 'Rohit Kumar',
      email: 'rohit.kumar@example.com',
      role: 'worker',
      profession: 'Electrician',
      rating: 4.8,
      verified: true,
      avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80',
      phone: '+91 98765 43210',
      city: 'New Delhi',
    },
    admin: {
      id: 'admin-1',
      name: 'Vikramaditya (Admin)',
      email: 'admin@hireworker.com',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
      phone: '+91 99999 88888',
      city: 'Headquarters',
    }
  };

  const login = (email, password, role = 'customer') => {
    let profile = demoProfiles[role] || {
      id: `user-${Date.now()}`,
      name: email.split('@')[0],
      email,
      role,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      phone: '+91 98765 00000',
      city: 'Mumbai',
    };

    if (role === 'worker') {
      const existingWorker = storage.getWorkers().find(w => w.email.toLowerCase() === email.toLowerCase());
      if (existingWorker) {
        profile = {
          ...existingWorker,
          role: 'worker',
        };
      }
    }

    storage.setAuthUser(profile);
    setUser(profile);
    return profile;
  };

  const registerCustomer = (data) => {
    const newCustomer = {
      id: `cust-${Date.now()}`,
      name: data.fullName,
      email: data.email,
      phone: data.phone,
      city: data.city || 'New Delhi',
      role: 'customer',
      avatar: data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    };
    storage.setAuthUser(newCustomer);
    setUser(newCustomer);
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
      avatar: data.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80',
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

    // Save in storage workers list
    storage.saveWorker(newWorker);

    // Save in auth user
    const authProfile = {
      ...newWorker,
      role: 'worker',
    };
    storage.setAuthUser(authProfile);
    setUser(authProfile);
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
      logout,
      registerCustomer,
      registerWorker,
      switchRole,
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

