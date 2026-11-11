import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Plus,
  Eye,
  Award,
  Sparkles,
  ExternalLink,
  X,
  FileCheck2,
  HelpCircle
} from 'lucide-react';
import { storage } from '../../utils/storage';
import { useAuth } from '../../context/AuthContext';

export const UploadCertificates = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewCert, setPreviewCert] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const [formData, setFormData] = useState({
    type: 'Trade License & Diploma',
    title: '',
    issuer: '',
    credentialId: '',
    issuedDate: new Date().toISOString().split('T')[0],
    expiryDate: '2028-12-31',
    fileUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
  });

  const workerId = user?.id || 'w-1';

  useEffect(() => {
    setCertificates(storage.getCertificatesByWorker(workerId));
  }, [workerId]);

  const verifiedCount = certificates.filter(c => c.status === 'Verified').length;
  const pendingCount = certificates.filter(c => c.status === 'Pending Review').length;

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.issuer) return;

    storage.saveCertificate({
      workerId,
      workerName: user?.name || 'Rohit Kumar',
      workerProfession: user?.profession || 'Electrician',
      type: formData.type,
      title: formData.title,
      issuer: formData.issuer,
      credentialId: formData.credentialId || `CERT-${Math.floor(10000 + Math.random() * 90000)}`,
      issuedDate: formData.issuedDate,
      expiryDate: formData.expiryDate || 'Lifetime Valid',
      fileUrl: formData.fileUrl,
      status: 'Pending Review',
    });

    setCertificates(storage.getCertificatesByWorker(workerId));
    setShowUploadModal(false);
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 4500);

    setFormData({
      type: 'Trade License & Diploma',
      title: '',
      issuer: '',
      credentialId: '',
      issuedDate: new Date().toISOString().split('T')[0],
      expiryDate: '2028-12-31',
      fileUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#00033D] via-[#0600AB] to-[#0033FF] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-[#0600AB]/40">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#977DFF]/20 text-[#FFCCF2] text-xs font-bold border border-[#977DFF]/40 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Trade Verification & Quality Accreditation
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Upload & Manage Certificates
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl leading-relaxed">
            Verified professionals receive 4x more customer bookings and the official <strong>Verified Pro</strong> badge. Upload your technical diplomas, Aadhaar verification, and police clearance certificates below.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Certificate</span>
        </button>
      </div>

      {uploadSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm animate-fadeIn shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Certificate uploaded successfully! Our Admin Verification Committee is auditing your document. You will be notified once approved.</span>
        </div>
      )}

      {/* Verification Health Indicator */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#0600AB]/20 p-5 rounded-2xl border border-slate-200/90 dark:border-[#0600AB]/40 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Verified Documents</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{verifiedCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0600AB]/20 p-5 rounded-2xl border border-slate-200/90 dark:border-[#0600AB]/40 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Review</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{pendingCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0600AB]/20 p-5 rounded-2xl border border-slate-200/90 dark:border-[#0600AB]/40 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Profile Trust Level</span>
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-0.5">Tier 1 Pro</p>
          </div>
        </div>
      </div>

      {/* Uploaded Certificates List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileCheck2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          Submitted Certifications & Credentials
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {certificates.map((cert) => {
            const isVerified = cert.status === 'Verified';

            return (
              <div
                key={cert.id}
                className="bg-white dark:bg-[#0600AB]/20 rounded-2xl p-5 border border-slate-200/90 dark:border-[#0600AB]/40 shadow-xs hover:border-primary-400 dark:hover:border-primary-400 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
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
                        Pending Admin Review
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                      {cert.title}
                    </h3>
                    <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold mt-1">
                      Issued by: {cert.issuer}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#00033D]/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Credential ID</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{cert.credentialId}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Validity</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{cert.expiryDate}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-[#0600AB]/30 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Uploaded: {cert.submittedAt}
                  </span>
                  <button
                    onClick={() => setPreviewCert(cert)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Document</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Verification Guidelines Info Box */}
      <div className="bg-slate-50 dark:bg-[#0600AB]/15 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-[#0600AB]/30 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          The 4 Pillars of WorkOshop Verification
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-4 bg-white dark:bg-[#00033D]/70 rounded-2xl border border-slate-200/80 dark:border-[#0600AB]/30">
            <span className="font-bold text-slate-900 dark:text-white block text-sm mb-1">1. Government Photo ID</span>
            <span>Aadhaar card, voter ID, or passport to prevent fraud and impersonation.</span>
          </div>
          <div className="p-4 bg-white dark:bg-[#00033D]/70 rounded-2xl border border-slate-200/80 dark:border-[#0600AB]/30">
            <span className="font-bold text-slate-900 dark:text-white block text-sm mb-1">2. Trade Diploma</span>
            <span>NCVT / ITI certification or Skill India trade license validating skills.</span>
          </div>
          <div className="p-4 bg-white dark:bg-[#00033D]/70 rounded-2xl border border-slate-200/80 dark:border-[#0600AB]/30">
            <span className="font-bold text-slate-900 dark:text-white block text-sm mb-1">3. Police Verification</span>
            <span>PCC clearance certificate confirming clean background and safety.</span>
          </div>
          <div className="p-4 bg-white dark:bg-[#00033D]/70 rounded-2xl border border-slate-200/80 dark:border-[#0600AB]/30">
            <span className="font-bold text-slate-900 dark:text-white block text-sm mb-1">4. Tool & Safety Audit</span>
            <span>Inspection report confirming standardized diagnostic tools & PPE kits.</span>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-[#00033D] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#0600AB]/40 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-[#00033D] via-[#0600AB] to-[#0033FF] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFCCF2]">Trade Accreditation</span>
                <h3 className="font-bold text-base leading-tight mt-0.5">Upload Official Certificate</h3>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="p-1 rounded-lg hover:bg-white/10 text-white/80">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-medium"
                >
                  <option value="Government Photo ID">Government Photo ID (Aadhaar / Voter ID)</option>
                  <option value="Trade License & Diploma">Trade License & Technical Diploma (ITI / NCVT)</option>
                  <option value="Police Clearance Certificate">Police Clearance Certificate (PCC)</option>
                  <option value="Tool & Safety Audit">Tool & Safety Clearance Certificate</option>
                  <option value="Specialized Brand Training">Specialized Brand / Appliance Training</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Certificate / Document Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electrician Wireman Class-1 License"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Issuing Authority *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Skill India / ITI Delhi"
                    value={formData.issuer}
                    onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Certificate / License Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DL-ELEC-2023-889"
                    value={formData.credentialId}
                    onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>

              {/* Upload Dropzone Preview */}
              <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2 bg-slate-50/50 dark:bg-slate-800/40">
                <Upload className="w-8 h-8 text-primary-600 dark:text-primary-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Document scanned image ready for upload
                </p>
                <span className="text-[10px] text-slate-400 block">
                  Accepted formats: PDF, JPG, PNG (Max 10MB)
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Submit for Audit</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certificate Document Preview Modal */}
      {previewCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-2xl bg-white dark:bg-[#00033D] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#0600AB]/40 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-400">{previewCert.type}</span>
                <h3 className="font-bold text-base leading-tight mt-0.5">{previewCert.title}</h3>
              </div>
              <button onClick={() => setPreviewCert(null)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <img
                src={previewCert.fileUrl}
                alt={previewCert.title}
                className="w-full h-80 object-cover rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm"
              />

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Issuer</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{previewCert.issuer}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Credential ID</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{previewCert.credentialId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Status</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{previewCert.status}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-right">
              <button
                onClick={() => setPreviewCert(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold text-xs rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

