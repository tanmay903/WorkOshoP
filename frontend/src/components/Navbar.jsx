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
  Calendar,
  Layers,
  Sparkles,
  Zap,
  Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../utils/storage';
import { ThemeToggle } from './ThemeToggle';

export const Navbar = () => {
  const { user, logout, switchRole, isCustomer, isWorker, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    setRoleSwitcherOpen(false);
  }, [location.pathname]);

  // Click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
        setRoleSwitcherOpen(false);
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

      const convs = storage.getConversations();
      const totalUnread = convs.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
      setUnreadMessages(totalUnread);
    };

    updateBadges();
    const interval = setInterval(updateBadges, 3000);
    return () => clearInterval(interval);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/home' },
    { name: 'Find Workers', path: '/find-workers' },
    { name: 'Post Job', path: '/post-job' },
    { name: 'My Jobs', path: '/my-jobs' },
    { name: 'Bookings', path: '/bookings' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-nav border-b border-slate-200/80 dark:border-[#0600AB]/30 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0600AB] via-[#0033FF] to-[#977DFF] flex items-center justify-center text-white shadow-md shadow-[#0033FF]/30 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">
                  Hire<span className="text-primary-600">Worker</span>
                </span>
                <span className="hidden sm:inline-block bg-[#FFCCF2] dark:bg-[#0600AB]/60 text-[#0600AB] dark:text-[#977DFF] text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  Pro
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block tracking-wide">
                Find Skilled People. Get Work Done.
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
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
            {/* Theme Toggle Button */}
            <ThemeToggle />

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

            {/* Role Switcher Pill (Quick demo switcher) */}
            <div className="relative hidden xl:block">
              <button
                onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700"
              >
                <Layers className="w-3.5 h-3.5 text-primary-600" />
                <span>Persona: <strong className="capitalize text-slate-900 dark:text-white">{user?.role || 'Guest'}</strong></span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {roleSwitcherOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 py-1.5 z-50 animate-fadeIn">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Switch Demo Persona
                  </div>
                  <button
                    onClick={() => { switchRole('customer'); setRoleSwitcherOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 ${isCustomer ? 'font-bold text-primary-600' : 'text-slate-700 dark:text-slate-200'}`}
                  >
                    <span>Customer (Aarav)</span>
                    {isCustomer && <span className="w-2 h-2 rounded-full bg-primary-600" />}
                  </button>
                  <button
                    onClick={() => { switchRole('worker'); setRoleSwitcherOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 ${isWorker ? 'font-bold text-primary-600' : 'text-slate-700 dark:text-slate-200'}`}
                  >
                    <span>Worker (Rohit - Electrician)</span>
                    {isWorker && <span className="w-2 h-2 rounded-full bg-primary-600" />}
                  </button>
                  <button
                    onClick={() => { switchRole('admin'); setRoleSwitcherOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 ${isAdmin ? 'font-bold text-primary-600' : 'text-slate-700 dark:text-slate-200'}`}
                  >
                    <span>Admin (Vikramaditya)</span>
                    {isAdmin && <span className="w-2 h-2 rounded-full bg-primary-600" />}
                  </button>
                </div>
              )}
            </div>

            {/* User Profile or Login/Register */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-primary-500"
                  />
                  <span className="hidden sm:inline-block font-semibold text-xs text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
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
                        <Link
                          to="/customer-dashboard"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-primary-50 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400"
                        >
                          <Briefcase className="w-4 h-4 text-slate-400" />
                          Customer Dashboard
                        </Link>
                      )}
                      {isWorker && (
                        <Link
                          to="/worker-dashboard"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-primary-50 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400"
                        >
                          <UserCheck className="w-4 h-4 text-slate-400" />
                          Worker Dashboard
                        </Link>
                      )}
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-primary-50 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400"
                        >
                          <ShieldAlert className="w-4 h-4 text-slate-400" />
                          Admin Console
                        </Link>
                      )}
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
                    </div>

                    <div className="py-1">
                      <div className="px-4 py-1.5 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                        Quick Demo Role Switch
                      </div>
                      <button
                        onClick={() => { switchRole('customer'); setProfileDropdownOpen(false); }}
                        className="w-full text-left px-4 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between"
                      >
                        Switch to Customer
                        {isCustomer && <span className="text-primary-600 text-xs font-bold">&check;</span>}
                      </button>
                      <button
                        onClick={() => { switchRole('worker'); setProfileDropdownOpen(false); }}
                        className="w-full text-left px-4 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between"
                      >
                        Switch to Worker
                        {isWorker && <span className="text-primary-600 text-xs font-bold">&check;</span>}
                      </button>
                      <button
                        onClick={() => { switchRole('admin'); setProfileDropdownOpen(false); }}
                        className="w-full text-left px-4 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between"
                      >
                        Switch to Admin
                        {isAdmin && <span className="text-primary-600 text-xs font-bold">&check;</span>}
                      </button>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => { logout(); navigate('/'); }}
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

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-3 pb-6 space-y-3 animate-fadeIn">
          {/* Theme switcher inside mobile drawer */}
          <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
            <ThemeToggle showLabel className="w-full justify-start py-2.5 px-3" />
          </div>

          <div className="space-y-1">
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

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3">
              Dashboards & Tools
            </div>
            <Link
              to="/customer-dashboard"
              className="block px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
            >
              Customer Dashboard
            </Link>
            <Link
              to="/worker-dashboard"
              className="block px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
            >
              Worker Dashboard
            </Link>
            <Link
              to="/admin"
              className="block px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
            >
              Admin Dashboard
            </Link>
            <Link
              to="/register-worker"
              className="block px-3 py-2 text-sm font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 rounded-xl"
            >
              Register as Worker
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

