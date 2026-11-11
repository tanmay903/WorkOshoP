import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  Filter,
  Clock,
  Award,
  AlertTriangle,
  User,
  X,
  FileText,
  ExternalLink
} from 'lucide-react';
import { storage } from '../../utils/storage';

export const AdminVerifications = () => {
  const [certificates, setCertificates] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectCert, setInspectCert] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  useEffect(() => {
    setCertificates(storage.getCertificates());
  }, []);

  const handleUpdateStatus = (certId, status) => {
    const updated = storage.updateCertificateStatus(certId, status);
    setCertificates(updated);
    setInspectCert(null);

    setActionNotice(`Certificate status updated to "${status}".`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const filteredCerts = certificates.filter(c => {
    const matchesFilter = filterStatus === 'All' || c.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchesSearch = (c.workerName || '').toLowerCase().includes(q) ||
                          (c.title || '').toLowerCase().includes(q) ||
                          (c.issuer || '').toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const pendingCount = certificates.filter(c => c.status === 'Pending Review').length;
  const verifiedCount = certificates.filter(c => c.status === 'Verified').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin Verification & Trust Council
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Worker Certificate Approvals
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Audit trade licenses, Aadhaar IDs, and background checks submitted by tradespeople. Approved workers receive the Verified Pro badge.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-800 rounded-xl border border-slate-700 text-xs">
            <span className="text-slate-400 block text-[10px] uppercase">Pending Audits</span>
            <strong className="text-amber-400 text-base">{pendingCount} Waiting</strong>
          </div>
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Filter & Search */}
      <div className="bg-white dark:bg-[#0600AB]/20 rounded-2xl p-4 border border-slate-200/90 dark:border-[#0600AB]/40 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by worker name, diploma title, or issuing body..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-[#00033D] border border-slate-200 dark:border-[#0600AB]/40 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {['All', 'Pending Review', 'Verified', 'Rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus === st
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Verifications Table / Cards */}
      <div className="bg-white dark:bg-[#0600AB]/20 rounded-3xl border border-slate-200/90 dark:border-[#0600AB]/40 shadow-soft overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/60">
        {filteredCerts.length > 0 ? (
          filteredCerts.map((cert) => {
            const isVerified = cert.status === 'Verified';

            return (
              <div key={cert.id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-slate-50/50 dark:hover:bg-[#00033D]/40 transition-colors">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {cert.type}
                    </span>

                    {isVerified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified Pro
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        <Clock className="w-3.5 h-3.5" />
                        Pending Audit
                      </span>
                    )}

                    <span className="text-xs text-slate-400">
                      Submitted on {cert.submittedAt}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {cert.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Applicant: <strong className="text-slate-900 dark:text-white">{cert.workerName}</strong> &bull; {cert.workerProfession}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                    <span>Issuer: <strong className="text-slate-700 dark:text-slate-300">{cert.issuer}</strong></span>
                    <span>Credential ID: <strong className="font-mono text-slate-700 dark:text-slate-300">{cert.credentialId}</strong></span>
                    <span>Expiry: <strong className="text-slate-700 dark:text-slate-300">{cert.expiryDate}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 border-t border-slate-100 dark:border-[#0600AB]/30 lg:border-t-0 pt-3 lg:pt-0">
                  <button
                    onClick={() => setInspectCert(cert)}
                    className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Document</span>
                  </button>

                  {cert.status !== 'Verified' && (
                    <button
                      onClick={() => handleUpdateStatus(cert.id, 'Verified')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
                    >
                      Approve & Grant Badge
                    </button>
                  )}

                  {cert.status !== 'Rejected' && (
                    <button
                      onClick={() => handleUpdateStatus(cert.id, 'Rejected')}
                      className="px-3.5 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-semibold text-xs rounded-xl border border-rose-200 dark:border-rose-800"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center text-xs text-slate-400">
            No certificates found in this queue.
          </div>
        )}
      </div>

      {/* Inspect Modal */}
      {inspectCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-2xl bg-white dark:bg-[#00033D] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#0600AB]/40 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-400">Admin Document Audit</span>
                <h3 className="font-bold text-base leading-tight mt-0.5">{inspectCert.title}</h3>
              </div>
              <button onClick={() => setInspectCert(null)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <img
                src={inspectCert.fileUrl}
                alt={inspectCert.title}
                className="w-full h-80 object-cover rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm"
              />

              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Applicant</span>
                  <span className="font-bold text-slate-900 dark:text-white">{inspectCert.workerName} ({inspectCert.workerProfession})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Issuer</span>
                  <span className="font-bold text-slate-900 dark:text-white">{inspectCert.issuer}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Credential ID</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{inspectCert.credentialId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Current Status</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{inspectCert.status}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setInspectCert(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold text-xs rounded-xl"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateStatus(inspectCert.id, 'Rejected')}
                  className="px-4 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-semibold text-xs rounded-xl border border-rose-200 dark:border-rose-800"
                >
                  Reject Document
                </button>
                <button
                  onClick={() => handleUpdateStatus(inspectCert.id, 'Verified')}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Approve Verified Pro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

