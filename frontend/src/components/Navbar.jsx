import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Briefcase,
  Users,
  PlusCircle,
  FileText,
  MessageSquare,
  Bell,
  Menu,
  X,
  ChevronDown,
  LogOut,
  UserCheck,
  ShieldAlert,
  MapPin,
  ShieldCheck,
  Calendar,
  Sparkles,
  Settings
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useCustomerLocation } from '../context/LocationContext';
import { storage } from '../utils/storage';
import { Avatar } from './Avatar';
import { MapPickerModal } from './MapPickerModal';

export const Navbar = () => {
  const { user, logout, isCustomer, isWorker, isAdmin } = useAuth();
  const { customerLocation, defaultMapLocation, setSiteLocation, clearSiteLocation } = useCustomerLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  // Click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update badges
  useEffect(() => {
    const updateBadges = () => {
      const notifs = storage.getNotifications();
      setUnreadNotifications(notifs.filter(n => !n.read).length);

      const convs = storage.getConversationsForUser(user);
      const totalUnread = convs.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
      setUnreadMessages(totalUnread);
    };

    updateBadges();
    const interval = setInterval(updateBadges, 3000);
    return () => clearInterval(interval);
  }, [location, user]);

  // Dynamic navigation links based on user role
  const getNavLinks = () => {
    if (isWorker) {
      return [
        { name: 'Dashboard', path: '/worker-dashboard' },
        { name: 'Available Works', path: '/available-works' },
        { name: 'Bookings', path: '/worker/bookings' },
        { name: 'Upload Certificates', path: '/worker/certificates' },
        { name: 'My Profile & Rates', path: '/worker/my-profile' },
      ];
    }
    if (isAdmin) {
      return [
        { name: 'Admin Console', path: '/admin' },
        { name: 'Worker Approvals', path: '/admin/verifications' },
        { name: 'User Directory', path: '/admin/users' },
        { name: 'All Bookings', path: '/admin/bookings' },
        { name: 'Analytics', path: '/admin/analytics' },
      ];
    }
    // Customer (default)
    return [
      { name: 'Home', path: '/home' },
      { name: 'Find Workers', path: '/find-workers' },
      { name: 'Nearby Workers', path: '/nearby-workers' },
      { name: 'Post Job', path: '/post-job' },
      { name: 'My Jobs', path: '/my-jobs' },
      { name: 'My Bookings', path: '/bookings' },
    ];
  };

  const navLinks = getNavLinks();
  const homeDestination = isWorker ? '/worker-dashboard' : isAdmin ? '/admin' : '/home';

  return (
    <header className="sticky top-0 z-40 w-full glass-nav border-b border-slate-200/90 dark:border-slate-800 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Role-Aware Logo */}
          <Link to={homeDestination} className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl overflow-hidden bg-[#0F172A] flex items-center justify-center shadow-md shadow-[#2563EB]/20 group-hover:scale-105 group-hover:rotate-2 transition-transform duration-300 ring-1 ring-slate-200 shrink-0">
              <img
                src="/logo.jpg"
                alt="WorkOshop Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                  Work<span className="text-[#2563EB]">Oshop</span>
                </span>
                <span className="hidden sm:inline-block bg-teal-50 text-[#0D9488] border border-teal-200 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  {isWorker ? 'Worker Pro' : isAdmin ? 'Super Admin' : 'Customer'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden sm:block tracking-wide">
                {isWorker
                  ? 'Tradesperson Portal & Client Bids'
                  : isAdmin
                  ? 'Governance, Auditing & Controls'
                  : 'Find Skilled People. Get Work Done.'}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links (Changes with Role) */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-2.5 lg:px-3 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50/70 dark:bg-primary-950/60 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Site-Wide Customer Location Selector */}
            {!isWorker && !isAdmin && (
              <div className="hidden sm:inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:border-primary-400 transition-colors overflow-hidden max-w-[200px]">
                <button
                  type="button"
                  onClick={() => setLocationModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors truncate"
                  title={
                    customerLocation.isSet
                      ? `Site location: ${customerLocation.label} (Click to change)`
                      : 'Set your location for the whole site'
                  }
                >
                  <MapPin
                    className={`w-3.5 h-3.5 shrink-0 ${
                      customerLocation.isSet ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">
                    {customerLocation.isSet
                      ? customerLocation.district || customerLocation.label
                      : 'Select Location'}
                  </span>
                </button>
                {customerLocation.isSet && (
                  <button
                    type="button"
                    onClick={clearSiteLocation}
                    className="pr-2 pl-0.5 py-1.5 text-slate-400 hover:text-red-500 transition-colors"
                    title="Reset location to All Assam"
                    aria-label="Clear selected location"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Messages Icon */}
            <Link
              to="/messages"
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Messages"
            >
              <MessageSquare className="w-5 h-5" />
              {unreadMessages > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadMessages}
                </span>
              )}
            </Link>

            {/* Notifications Icon */}
            <Link
              to="/notifications"
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifications}
                </span>
              )}
            </Link>

            {/* User Profile or Login/Register */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <Avatar
                    name={user.name}
                    src={isWorker ? user.avatar : ''}
                    className="w-8 h-8 rounded-full text-xs ring-1 ring-primary-500"
                  />
                  <span className="hidden sm:inline-block font-semibold text-xs text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
                    {(user?.name || 'User').split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-50 animate-fadeIn divide-y divide-slate-100 dark:divide-slate-800">
                    <div className="px-4 py-2.5">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 uppercase tracking-wide">
                        {user.role}
                      </span>
                    </div>

                    <div className="py-1">
                      {isCustomer && (
                        <>
                          <Link
                            to="/customer-dashboard"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-primary-50 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400"
                          >
                            <Briefcase className="w-4 h-4 text-slate-400" />
                            Customer Dashboard
                          </Link>
                          <Link
                            to="/find-workers"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-primary-50 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400"
                          >
                            <Users className="w-4 h-4 text-slate-400" />
                            Discover Workers
                          </Link>
                          <Link
                            to="/bookings"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-primary-50 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400"
                          >
                            <Calendar className="w-4 h-4 text-slate-400" />
                            My Bookings
                          </Link>
                          <Link
                            to="/my-jobs"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-primary-50 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400"
                          >
                            <FileText className="w-4 h-4 text-slate-400" />
                            Posted Jobs
                          </Link>
                        </>
                      )}

                      {isWorker && (
                        <>
                          <Link
                            to="/worker-dashboard"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-primary-50 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400"
                          >
                            <UserCheck className="w-4 h-4 text-slate-400" />
                            Worker Dashboard
                          </Link>
                          <Link
                            to="/available-works"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-primary-50 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400"
                          >
                            <Briefcase className="w-4 h-4 text-slate-400" />
                            Available Works
                          </Link>
                          <Link
                            to="/worker/bookings"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-primary-50 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400"
                          >
                            <Calendar className="w-4 h-4 text-slate-400" />
                            Customer Bookings
                          </Link>
                          <Link
                            to="/worker/certificates"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-primary-50 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400"
                          >
                            <ShieldAlert className="w-4 h-4 text-slate-400" />
                            Upload Certificates
                          </Link>
                          <Link
                            to="/worker/my-profile"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-primary-50 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400"
                          >
                            <Settings className="w-4 h-4 text-slate-400" />
                            My Profile & Rates
                          </Link>
                        </>
                      )}

                      {isAdmin && (
                        <>
                          <Link
                            to="/admin"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-primary-50 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400"
                          >
                            <ShieldAlert className="w-4 h-4 text-slate-400" />
                            Admin Console
                          </Link>
                          <Link
                            to="/admin/verifications"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-primary-50 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400"
                          >
                            <ShieldCheck className="w-4 h-4 text-slate-400" />
                            Worker Approvals
                          </Link>
                          <Link
                            to="/admin/users"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-primary-50 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400"
                          >
                            <Users className="w-4 h-4 text-slate-400" />
                            User Directory
                          </Link>
                          <Link
                            to="/admin/bookings"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-primary-50 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400"
                          >
                            <Calendar className="w-4 h-4 text-slate-400" />
                            All Bookings
                          </Link>
                          <Link
                            to="/admin/analytics"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-primary-50 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400"
                          >
                            <Sparkles className="w-4 h-4 text-slate-400" />
                            Analytics Reports
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => { logout(); navigate('/login'); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-primary-600 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-md transition-all active:scale-95"
                >
                  Join Free
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {locationModalOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <MapPickerModal
            isOpen={locationModalOpen}
            onClose={() => setLocationModalOpen(false)}
            initialValue={
              customerLocation.isSet ? customerLocation.label : defaultMapLocation.label
            }
            initialCoords={
              customerLocation.isSet
                ? { lat: customerLocation.lat, lng: customerLocation.lng }
                : { lat: defaultMapLocation.lat, lng: defaultMapLocation.lng }
            }
            title="Set Your Site-Wide Location"
            onSelectLocation={(loc, nearest, exactCoords) => {
              setSiteLocation({
                label: loc || (nearest ? `${nearest.town}, ${nearest.district}, Assam` : ''),
                district: nearest?.district || '',
                lat: exactCoords?.lat ?? nearest?.lat,
                lng: exactCoords?.lng ?? nearest?.lng,
              });
            }}
          />,
          document.body
        )}

      {/* Mobile Drawer Menu (Role-Specific) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-3 pb-6 space-y-3 animate-fadeIn">
          <div className="space-y-1">
            {!isWorker && !isAdmin && (
              <div className="mb-2 flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setLocationModalOpen(true);
                  }}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 truncate flex-1 text-left"
                >
                  <MapPin
                    className={`w-4 h-4 shrink-0 ${
                      customerLocation.isSet ? 'text-primary-600' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">
                    {customerLocation.isSet
                      ? `Location: ${customerLocation.label}`
                      : 'Select Your Location (All Assam)'}
                  </span>
                </button>
                {customerLocation.isSet && (
                  <button
                    type="button"
                    onClick={clearSiteLocation}
                    className="text-xs font-semibold text-red-500 hover:text-red-600 px-1.5 py-0.5 rounded"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded-xl text-sm font-semibold ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};


