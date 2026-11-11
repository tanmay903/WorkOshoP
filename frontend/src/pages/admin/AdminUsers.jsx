import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Lock,
  Unlock,
  Trash2
} from 'lucide-react';
import { storage } from '../../utils/storage';
import { Avatar } from '../../components/Avatar';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusNotice, setStatusNotice] = useState(null);

  useEffect(() => {
    setUsers(storage.getUsers());
  }, []);

  const handleToggleStatus = (userId, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    const updated = storage.updateUserStatus(userId, nextStatus);
    setUsers(updated);

    setStatusNotice(`User account status updated to ${nextStatus}.`);
    setTimeout(() => setStatusNotice(null), 3500);
  };

  const filteredUsers = users.filter(u => {
    const matchesRole = roleFilter === 'All' || (u.role || '').toLowerCase() === roleFilter.toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = (u.name || '').toLowerCase().includes(q) ||
                          (u.email || '').toLowerCase().includes(q) ||
                          (u.phone && u.phone.includes(searchQuery)) ||
                          (u.profession || '').toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  const totalCustomers = users.filter(u => u.role === 'customer').length;
  const totalWorkers = users.filter(u => u.role === 'worker').length;
  const totalSuspended = users.filter(u => u.status === 'Suspended').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30 mb-2">
            <Users className="w-3.5 h-3.5" />
            User Management & Permissions
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Customer & Worker User Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Manage authenticated accounts, review activity logs, adjust permissions, and enforce platform trust & safety guidelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-2 bg-slate-800 rounded-xl border border-slate-700 text-xs text-center">
            <span className="text-slate-400 block text-[10px] uppercase">Customers</span>
            <strong className="text-white text-sm">{totalCustomers}</strong>
          </div>
          <div className="px-3.5 py-2 bg-slate-800 rounded-xl border border-slate-700 text-xs text-center">
            <span className="text-slate-400 block text-[10px] uppercase">Workers</span>
            <strong className="text-white text-sm">{totalWorkers}</strong>
          </div>
        </div>
      </div>

      {statusNotice && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* Search & Role Filters */}
      <div className="bg-white dark:bg-[#0600AB]/20 rounded-2xl p-4 border border-slate-200/90 dark:border-[#0600AB]/40 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by user name, email, phone number, or profession..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-[#00033D] border border-slate-200 dark:border-[#0600AB]/40 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {['All', 'Customer', 'Worker', 'Admin'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                roleFilter === role
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {role}s
            </button>
          ))}
        </div>
      </div>

      {/* Users List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredUsers.map((u) => {
          const isActive = u.status === 'Active';

          return (
            <div
              key={u.id}
              className="bg-white dark:bg-[#0600AB]/20 rounded-2xl p-5 border border-slate-200/90 dark:border-[#0600AB]/40 shadow-xs hover:border-primary-400 dark:hover:border-primary-400 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={u.name}
                      className="w-12 h-12 rounded-2xl text-sm ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                    />
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                        {u.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {u.email}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    u.role === 'admin'
                      ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                      : u.role === 'worker'
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                      : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                  }`}>
                    {u.role}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-[#00033D]/60 rounded-xl space-y-1.5 text-xs text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phone:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{u.phone || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">City:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{u.city || 'Delhi NCR'}</span>
                  </div>
                  {u.profession && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Trade:</span>
                      <span className="font-bold text-primary-600 dark:text-primary-400">{u.profession}</span>
                    </div>
                  )}
                  {u.totalSpent && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Hires:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{u.totalSpent}</span>
                    </div>
                  )}
                  {u.completedJobs && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Completed Jobs:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{u.completedJobs}+</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-[#0600AB]/30 flex items-center justify-between">
                <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                  isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  {u.status || 'Active'}
                </span>

                {u.role !== 'admin' && (
                  <button
                    onClick={() => handleToggleStatus(u.id, u.status || 'Active')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 ${
                      isActive
                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                    }`}
                  >
                    {isActive ? (
                      <>
                        <Lock className="w-3 h-3" />
                        <span>Suspend</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3 h-3" />
                        <span>Activate</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

