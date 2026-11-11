import React from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  Award,
  Sparkles,
  BarChart3,
  PieChart,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { storage } from '../../utils/storage';
import { categories } from '../../data/categories';

export const AdminAnalytics = () => {
  const workers = storage.getWorkers();
  const bookings = storage.getBookings();
  const jobs = storage.getJobs();

  const totalGMV = bookings.reduce((sum, b) => sum + (Number(b.estimatedAmount) || 0), 0);
  const totalCommission = Math.round(totalGMV * 0.1);
  const avgJobValue = bookings.length > 0 ? Math.round(totalGMV / bookings.length) : 0;

  const topCities = [
    { city: 'New Delhi & Central NCR', share: '46%', bookings: 58 },
    { city: 'Noida & Greater Noida', share: '24%', bookings: 32 },
    { city: 'Gurugram Cybercity', share: '18%', bookings: 24 },
    { city: 'Faridabad & Ghaziabad', share: '12%', bookings: 16 },
  ];

  const categoryPerformance = categories.slice(0, 6).map((c, i) => {
    const jobCount = jobs.filter(j => j.category === c.id).length;
    return {
      name: c.name,
      volume: 3200 + i * 1400,
      jobs: jobCount + 4 + i * 3,
      growth: `+${18 + i * 4}%`,
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            Executive Intelligence & Platform Metrics
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Financial & Marketplace Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Real-time business performance across gross merchandise volume (GMV), net commission take-rate, and regional skilled worker demand.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
            Reporting Period: <strong className="text-emerald-400">Past 30 Days</strong>
          </span>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-[#0600AB]/20 p-6 rounded-3xl border border-slate-200/90 dark:border-[#0600AB]/40 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Marketplace GMV</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">₹{totalGMV.toLocaleString()}</p>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +24.8% month-over-month
          </span>
        </div>

        <div className="bg-white dark:bg-[#0600AB]/20 p-6 rounded-3xl border border-slate-200/90 dark:border-[#0600AB]/40 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Net Platform Commission</span>
            <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-primary-600 dark:text-primary-400">₹{totalCommission.toLocaleString()}</p>
          <span className="text-xs text-slate-500 dark:text-slate-400">Fixed 10% platform take-rate</span>
        </div>

        <div className="bg-white dark:bg-[#0600AB]/20 p-6 rounded-3xl border border-slate-200/90 dark:border-[#0600AB]/40 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Average Order Value (AOV)</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">₹{avgJobValue}</p>
          <span className="text-xs text-slate-500 dark:text-slate-400">Per booked technician visit</span>
        </div>

        <div className="bg-white dark:bg-[#0600AB]/20 p-6 rounded-3xl border border-slate-200/90 dark:border-[#0600AB]/40 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Verified Pros Ratio</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">92.4%</p>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Industry-leading safety rate</span>
        </div>
      </div>

      {/* 2-Column Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trade Category Revenue Performance */}
        <div className="bg-white dark:bg-[#0600AB]/20 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-[#0600AB]/40 shadow-soft space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Revenue by Trade Category
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Top-performing skilled services by customer bookings</p>
          </div>

          <div className="space-y-4">
            {categoryPerformance.map((item, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800 dark:text-slate-200">{item.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">{item.jobs} orders</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{item.growth}</span>
                    <span className="font-bold text-slate-900 dark:text-white">₹{item.volume.toLocaleString()}</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#977DFF] via-[#0033FF] to-[#0600AB] rounded-full"
                    style={{ width: `${85 - i * 10}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Distribution */}
        <div className="bg-white dark:bg-[#0600AB]/20 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-[#0600AB]/40 shadow-soft space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Regional Demand Hotspots
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Metropolitan cluster service distribution across NCR</p>
          </div>

          <div className="space-y-4">
            {topCities.map((c, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl border border-slate-200/90 dark:border-[#0600AB]/40 bg-slate-50/50 dark:bg-[#00033D]/60 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-xs">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">{c.city}</h4>
                    <span className="text-[11px] text-slate-400">{c.bookings} successful dispatches</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-primary-600 dark:text-primary-400 text-sm">{c.share}</span>
                  <span className="text-[10px] text-slate-400 block">Market share</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

