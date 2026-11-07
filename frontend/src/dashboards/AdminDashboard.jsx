import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Briefcase,
  Calendar,
  CheckCircle2,
  XCircle,
  FileText,
  DollarSign,
  TrendingUp,
  Search,
  Check,
  AlertTriangle,
  Eye,
  Trash2,
  Lock
} from 'lucide-react';
import { storage } from '../utils/storage';

export const AdminDashboard = () => {
  const [workers, setWorkers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('workers'); // 'workers' | 'jobs' | 'bookings' | 'users'
  const [workerFilter, setWorkerFilter] = useState('');

  useEffect(() => {
    setWorkers(storage.getWorkers());
    setJobs(storage.getJobs());
    setBookings(storage.getBookings());
  }, []);

  const handleToggleVerify = (workerId, currentVerified) => {
    const updated = storage.updateWorkerVerification(workerId, !currentVerified);
    setWorkers(updated);
  };

  const handleDeleteJob = (jobId) => {
    if (window.confirm('Admin confirmation: Delete this job listing?')) {
      const updated = storage.deleteJob(jobId);
      setJobs(updated);
    }
  };

  // Calculations
  const totalWorkers = workers.length;
  const verifiedWorkers = workers.filter(w => w.verified).length;
  const pendingVerifications = totalWorkers - verifiedWorkers;
  const totalJobs = jobs.length;
  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (Number(b.estimatedAmount) || 0), 0);
  const platformFeeEarned = Math.round(totalRevenue * 0.1); // 10% demo fee

  const filteredWorkersList = workers.filter(w =>
    w.name.toLowerCase().includes(workerFilter.toLowerCase()) ||
    w.profession.toLowerCase().includes(workerFilter.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30 mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            Super Administrator Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            HireWorker Admin Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Global governance, trade verification, marketplace integrity & transaction auditing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-300 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            System Status: <strong className="text-emerald-400">All Nodes Healthy</strong>
          </span>
        </div>
      </div>

      {/* High Level Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Total Workers</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalWorkers}</p>
          <span className="text-[10px] text-primary-600 font-medium">Registered trade</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Verified Workers</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{verifiedWorkers}</p>
          <span className="text-[10px] text-emerald-600 font-medium">{Math.round((verifiedWorkers / (totalWorkers || 1)) * 100)}% vetted</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Pending Audits</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">{pendingVerifications}</p>
          <span className="text-[10px] text-amber-600 font-medium">Action required</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Total Jobs</span>
          <p className="text-2xl font-bold text-purple-600 mt-1">{totalJobs}</p>
          <span className="text-[10px] text-purple-600 font-medium">Market postings</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Total Bookings</span>
          <p className="text-2xl font-bold text-blue-600 mt-1">{totalBookings}</p>
          <span className="text-[10px] text-blue-600 font-medium">Orders handled</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Est. Commission</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">₹{platformFeeEarned}</p>
          <span className="text-[10px] text-slate-500 font-medium">10% Platform fee</span>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto text-xs font-bold">
        {[
          { id: 'workers', label: `Manage Workers (${totalWorkers})`, icon: Users },
          { id: 'jobs', label: `Manage Jobs (${totalJobs})`, icon: FileText },
          { id: 'bookings', label: `Manage Bookings (${totalBookings})`, icon: Calendar },
        ].map((tab) => {
          const IconComp = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <IconComp className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Manage Workers */}
      {activeTab === 'workers' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-bold text-base text-slate-900">
              Worker Verification & KYC Audit Table
            </h3>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search name or profession..."
                value={workerFilter}
                onChange={(e) => setWorkerFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Worker Profile</th>
                  <th className="py-3 px-4">Profession & Experience</th>
                  <th className="py-3 px-4">Rates</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Verification Status</th>
                  <th className="py-3 px-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredWorkersList.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={w.avatar}
                          alt={w.name}
                          className="w-10 h-10 rounded-xl object-cover shrink-0"
                        />
                        <div>
                          <Link to={`/worker/${w.id}`} className="font-bold text-slate-900 hover:text-primary-600 block">
                            {w.name}
                          </Link>
                          <span className="text-[11px] text-slate-400">{w.city || w.location}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      <div>{w.profession}</div>
                      <span className="text-[11px] text-slate-400">{w.experience}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900">₹{w.hourlyRate}/hr</span>
                      <span className="text-[10px] text-slate-400 block">₹{w.dailyRate}/day</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-amber-600">{w.rating} &star;</span>
                      <span className="text-[10px] text-slate-400 block">({w.reviewsCount} reviews)</span>
                    </td>

                    <td className="py-3.5 px-4">
                      {w.verified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 fill-emerald-600 text-white" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Pending Audit
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleVerify(w.id, w.verified)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all ${
                            w.verified
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                          }`}
                        >
                          {w.verified ? 'Revoke Badge' : 'Verify Worker'}
                        </button>
                        <Link
                          to={`/worker/${w.id}`}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Manage Jobs */}
      {activeTab === 'jobs' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-bold text-base text-slate-900">All Customer Posted Jobs</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {jobs.map((j) => (
              <div key={j.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{j.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                      {j.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Category: <strong>{j.categoryName || j.category}</strong> &bull; Location: {j.location} &bull; Budget: ₹{j.budget}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Posted by: {j.customerName} ({j.customerEmail}) on {j.postedDate}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDeleteJob(j.id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200"
                    title="Remove Job"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Manage Bookings */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-bold text-base text-slate-900">All Marketplace Bookings & Orders</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {bookings.map((b) => (
              <div key={b.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500">{b.bookingNumber}</span>
                    <span className="font-bold text-sm text-slate-900">{b.serviceTitle}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Worker: <strong>{b.workerName}</strong> &bull; Customer: <strong>{b.customerName}</strong>
                  </p>
                  <span className="text-[11px] text-slate-400">
                    Scheduled: {b.serviceDate} at {b.serviceTime} &bull; Amount: ₹{b.estimatedAmount}
                  </span>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

