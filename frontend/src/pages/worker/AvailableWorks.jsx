import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  MapPin,
  Calendar,
  DollarSign,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  Users,
  AlertCircle,
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { storage } from '../../utils/storage';
import { categories } from '../../data/categories';
import { useAuth } from '../../context/AuthContext';

export const AvailableWorks = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [biddingJob, setBiddingJob] = useState(null);
  const [bidForm, setBidForm] = useState({
    bidAmount: '',
    estimatedTime: '2 hours',
    message: 'Hello! I have extensive experience with this specific trade work and can arrive with full equipment.'
  });
  const [bidSubmittedJobId, setBidSubmittedJobId] = useState(null);

  useEffect(() => {
    setJobs(storage.getJobs());
  }, []);

  const filteredJobs = jobs.filter(job => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = (job.title || '').toLowerCase().includes(q) ||
                          (job.description || '').toLowerCase().includes(q) ||
                          (job.location || '').toLowerCase().includes(q);
    const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenBidModal = (job) => {
    setBiddingJob(job);
    setBidForm({
      bidAmount: job.budget || '1500',
      estimatedTime: '2-3 hours',
      message: `Hi, I am ${user?.name || 'Rohit Kumar'}, a certified ${user?.profession || 'Electrician'}. I can handle this task efficiently on ${job.preferredDate}.`
    });
  };

  const handleSendProposal = (e) => {
    e.preventDefault();
    if (!biddingJob) return;

    const workerName = user?.name || 'Rohit Kumar';
    const workerProfession = user?.profession || 'Electrician';

    storage.addProposalToJob(biddingJob.id, {
      workerId: user?.id || 'w-1',
      workerName,
      workerProfession,
      bidAmount: Number(bidForm.bidAmount),
      estimatedTime: bidForm.estimatedTime,
      message: bidForm.message,
    });

    setJobs(storage.getJobs());
    setBidSubmittedJobId(biddingJob.id);
    setBiddingJob(null);

    setTimeout(() => {
      setBidSubmittedJobId(null);
    }, 4000);
  };

  const hasWorkerApplied = (job) => {
    const workerId = user?.id || 'w-1';
    return job.proposals?.some(p => p.workerId === workerId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#00033D] via-[#0600AB] to-[#0033FF] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-[#0600AB]/40">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#977DFF]/20 text-[#FFCCF2] text-xs font-bold border border-[#977DFF]/40 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Worker Job Board & Direct Client Bids
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Available Works & Contracts
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl leading-relaxed">
            Browse live jobs posted by customers in your service radius. Submit competitive quotes, clarify requirements, and secure high-paying repair tasks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/worker/certificates"
            className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all border border-white/20 flex items-center gap-1.5"
          >
            <span>Certificates & Badges</span>
          </Link>
          <Link
            to="/worker/bookings"
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-emerald-500/25 flex items-center gap-1.5"
          >
            <span>My Bookings</span>
          </Link>
        </div>
      </div>

      {bidSubmittedJobId && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm animate-fadeIn shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Your bid and proposal have been submitted to the customer! You can track client responses in your <strong>Worker Messages</strong>.</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#0600AB]/20 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-[#0600AB]/40 shadow-xs flex flex-col md:flex-row items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by job title, problem description, or area (e.g. Noida, Delhi)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-[#00033D] border border-slate-200 dark:border-[#0600AB]/40 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-56 shrink-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-[#00033D] border border-slate-200 dark:border-[#0600AB]/40 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-medium"
          >
            <option value="all">All Trade Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Job Cards Grid */}
      <div className="grid grid-cols-1 gap-5">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => {
            const isApplied = hasWorkerApplied(job);

            return (
              <div
                key={job.id}
                className="bg-white dark:bg-[#0600AB]/20 rounded-2xl p-6 border border-slate-200/90 dark:border-[#0600AB]/40 shadow-xs hover:border-primary-400 dark:hover:border-primary-400 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-2.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                      {job.categoryName || job.category}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {job.experienceRequired || '3+ Years'}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-400">
                      Posted {job.postedDate}
                    </span>
                    {isApplied && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Proposal Submitted
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {job.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                    {job.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap pt-1">
                    <span className="flex items-center gap-1 font-bold text-slate-900 dark:text-white text-sm">
                      <DollarSign className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      ₹{job.budget} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">({job.paymentType || 'Fixed Price'})</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Target Date: {job.preferredDate}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-primary-600 dark:text-primary-400">
                      <Users className="w-3.5 h-3.5" />
                      {job.proposals?.length || job.applicationsCount || 0} Worker Bids
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 border-t border-slate-100 dark:border-[#0600AB]/30 lg:border-t-0 pt-4 lg:pt-0">
                  {isApplied ? (
                    <button
                      disabled
                      className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-xs rounded-xl cursor-default flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Applied (Quote Active)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenBidModal(job)}
                      className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-primary-500/25 transition-all flex items-center gap-1.5"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send Quote / Bid</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white dark:bg-[#0600AB]/20 rounded-3xl p-12 text-center border border-slate-200/90 dark:border-[#0600AB]/40 space-y-3">
            <Briefcase className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-white">No available jobs found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              There are no customer postings currently matching your filter criteria. Check back shortly as clients post new jobs daily.
            </p>
          </div>
        )}
      </div>

      {/* Bid Modal */}
      {biddingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-[#00033D] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#0600AB]/40 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-[#00033D] via-[#0600AB] to-[#0033FF] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFCCF2]">Submit Worker Proposal</span>
                <h3 className="font-bold text-base leading-tight mt-0.5">{biddingJob.title}</h3>
              </div>
              <button onClick={() => setBiddingJob(null)} className="p-1 rounded-lg hover:bg-white/10 text-white/80">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendProposal} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Quote (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      required
                      min="100"
                      value={bidForm.bidAmount}
                      onChange={(e) => setBidForm({ ...bidForm, bidAmount: e.target.value })}
                      className="w-full pl-7 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Client Budget: ₹{biddingJob.budget}</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Estimated Time Needed *
                  </label>
                  <input
                    type="text"
                    required
                    value={bidForm.estimatedTime}
                    onChange={(e) => setBidForm({ ...bidForm, estimatedTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="e.g. 2 hours"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Message / Cover Pitch to Customer *
                </label>
                <textarea
                  rows="4"
                  required
                  value={bidForm.message}
                  onChange={(e) => setBidForm({ ...bidForm, message: e.target.value })}
                  placeholder="Explain why you are the best fit, your experience with this exact task, and when you can arrive..."
                  className="w-full p-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setBiddingJob(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Proposal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

