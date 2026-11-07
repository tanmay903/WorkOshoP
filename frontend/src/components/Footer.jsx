import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ShieldCheck, Headphones, Heart, Phone, Mail, MapPin, ArrowRight } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-navy-950 text-slate-400 text-sm border-t border-slate-800">
      {/* Top Features Bar */}
      <div className="border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="w-12 h-12 rounded-2xl bg-primary-900/60 border border-primary-500/20 text-primary-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-base">100% Verified Workers</h4>
                <p className="text-xs text-slate-400 mt-0.5">Government ID, trade skill & background checked</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="w-12 h-12 rounded-2xl bg-emerald-900/40 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-base">Flexible Hiring</h4>
                <p className="text-xs text-slate-400 mt-0.5">Book hourly or fix a full-day custom contract</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="w-12 h-12 rounded-2xl bg-amber-900/40 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-base">24/7 Dedicated Support</h4>
                <p className="text-xs text-slate-400 mt-0.5">Prompt conflict resolution and job guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/home" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white">
                <Zap className="w-5 h-5 fill-white" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">
                Hire<span className="text-primary-500">Worker</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              HireWorker is India's premier skilled-worker marketplace connecting homeowners and businesses with verified electricians, plumbers, carpenters, mechanics, cleaners, and more.
            </p>

            <div className="pt-2 text-xs text-slate-400 space-y-2">
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary-500" />
                <span>+91 (011) 4567-8900 / 1800-HIRE-PRO</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary-500" />
                <span>support@hireworker.com</span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-500" />
                <span>Tech Park Tower B, New Delhi &bull; Mumbai &bull; Bengaluru</span>
              </p>
            </div>
          </div>

          {/* Popular Categories */}
          <div>
            <h5 className="text-white font-semibold text-sm mb-4 tracking-wide uppercase">Top Services</h5>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li><Link to="/find-workers?category=electrician" className="hover:text-white transition-colors">Electricians</Link></li>
              <li><Link to="/find-workers?category=plumber" className="hover:text-white transition-colors">Plumbers</Link></li>
              <li><Link to="/find-workers?category=carpenter" className="hover:text-white transition-colors">Carpenters</Link></li>
              <li><Link to="/find-workers?category=painter" className="hover:text-white transition-colors">Painters</Link></li>
              <li><Link to="/find-workers?category=cleaner" className="hover:text-white transition-colors">House Cleaners</Link></li>
              <li><Link to="/find-workers?category=driver" className="hover:text-white transition-colors">Drivers & Chauffeurs</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-white font-semibold text-sm mb-4 tracking-wide uppercase">Quick Links</h5>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li><Link to="/find-workers" className="hover:text-white transition-colors">Discover Workers</Link></li>
              <li><Link to="/post-job" className="hover:text-white transition-colors">Post a Job Free</Link></li>
              <li><Link to="/my-jobs" className="hover:text-white transition-colors">My Posted Jobs</Link></li>
              <li><Link to="/bookings" className="hover:text-white transition-colors">Track Bookings</Link></li>
              <li><Link to="/register-worker" className="text-primary-400 font-semibold hover:text-primary-300 transition-colors">Join as a Worker</Link></li>
              <li><Link to="/admin" className="hover:text-white transition-colors">Admin Portal</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h5 className="text-white font-semibold text-sm mb-4 tracking-wide uppercase">Stay Updated</h5>
            <p className="text-xs text-slate-400 mb-3">
              Get weekly discounts, trade tips, and service updates directly to your inbox.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed to HireWorker newsletter!'); }} className="space-y-2">
              <input
                type="email"
                required
                placeholder="Enter your email"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 text-xs rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
              />
              <button
                type="submit"
                className="w-full py-2 px-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Subscribe</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-slate-500">
            &copy; {new Date().getFullYear()} HireWorker Technologies Inc. All rights reserved. "Find Skilled People. Get Work Done."
          </p>
          <div className="flex items-center space-x-6 text-slate-500">
            <a href="#privacy" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#terms" className="hover:text-slate-300">Terms of Service</a>
            <a href="#security" className="hover:text-slate-300">Safety & Trust</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

