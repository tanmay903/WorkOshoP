import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  MapPin,
  Calendar,
  DollarSign,
  PlusCircle,
  Eye,
  Edit2,
  Trash2,
  Users,
  CheckCircle2,
  Clock,
  X,
  AlertCircle
} from 'lucide-react';
import { storage } from '../utils/storage';
import { useAuth } from '../context/AuthContext';

export const MyJobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [viewingJob, setViewingJob] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: '', budget: '', description: '', location: '' });

  useEffect(() => {
    setJobs(storage.getJobsForCustomer(user));
  }, [user]);

  const statuses = ['All', 'Open', 'Applications Received', 'In Progress', 'Completed', 'Cancelled'];

  const filteredJobs = jobs.filter(j => {
    if (selectedStatus === 'All') return true;
    return j.status === selectedStatus;
  });

  const handleDeleteJob = (jobId) => {
    if (window.confirm('Are you sure you want to delete this job listing?')) {
      storage.deleteJob(jobId);
      setJobs(storage.getJobsForCustomer(user));
    }
  };

  const handleEditClick = (job) => {
    setEditingJob(job);
    setEditFormData({
      title: job.title,
      budget: job.budget,
      description: job.description,
      location: job.location,
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingJob) return;

    storage.updateJob(editingJob.id, {
      title: editFormData.title,
      budget: Number(editFormData.budget),
      description: editFormData.description,
      location: editFormData.location,
    });
    setJobs(storage.getJobsForCustomer(user));
    setEditingJob(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Applications Received':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'In Progress':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Bar */}
      <div className="bg-white dark:bg-[#0600AB]/20 rounded-2xl p-6 border border-slate-200/90 dark:border-[#0600AB]/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Posted Jobs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track worker bids, assign tasks, and monitor repair status in real-time.
          </p>
        </div>

        <Link
          to="/post-job"
          className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-primary-500/25 transition-all flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Job</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-semibold">
        {statuses.map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStatus(st)}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              selectedStatus === st
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-white dark:bg-[#0600AB]/20 hover:bg-slate-100 dark:hover:bg-[#0600AB]/40 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#0600AB]/40'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Jobs List */}
      {filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white dark:bg-[#0600AB]/20 rounded-2xl p-6 border border-slate-200/90 dark:border-[#0600AB]/40 shadow-xs hover:border-primary-300 dark:hover:border-primary-400 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(job.status)}`}>
                    {job.status}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    {job.categoryName || job.category}
                  </span>
                  <span className="text-xs text-slate-400">
                    Posted on {job.postedDate}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {job.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 max-w-2xl">
                  {job.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap pt-1">
                  <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
                    <DollarSign className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                    ₹{job.budget} ({job.paymentType || 'Fixed'})
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Target: {job.preferredDate}
                  </span>
                  <span className="flex items-center gap-1 text-primary-600 dark:text-primary-400 font-semibold">
                    <Users className="w-3.5 h-3.5" />
                    {job.proposals?.length || job.applicationsCount || 0} Worker Bids
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 border-t border-slate-100 dark:border-[#0600AB]/30 md:border-t-0 pt-3 md:pt-0">
                <button
                  onClick={() => setViewingJob(job)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>
                <button
                  onClick={() => handleEditClick(job)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteJob(job.id)}
                  className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800 transition-colors"
                  title="Delete job"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0600AB]/20 rounded-3xl p-12 text-center border border-slate-200/90 dark:border-[#0600AB]/40 shadow-xs space-y-4">
          <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">No jobs found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            You don't have any jobs matching the selected status. Post your repair job for free now.
          </p>
          <Link
            to="/post-job"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs rounded-xl shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post a Job Free</span>
          </Link>
        </div>
      )}

      {/* View Details Modal */}
      {viewingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-xl bg-white dark:bg-[#00033D] rounded-2xl shadow-xl border border-slate-100 dark:border-[#0600AB]/40 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-400">Job Details</span>
                <h3 className="font-bold text-base leading-tight mt-0.5">{viewingJob.title}</h3>
              </div>
              <button onClick={() => setViewingJob(null)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs sm:text-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(viewingJob.status)}`}>
                  {viewingJob.status}
                </span>
                <span className="font-bold text-primary-600 dark:text-primary-400 text-base">₹{viewingJob.budget} ({viewingJob.paymentType})</span>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 dark:text-white mb-1">Description:</h4>
                <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">{viewingJob.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block">Category</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingJob.categoryName || viewingJob.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Location</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingJob.location}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Preferred Date</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingJob.preferredDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Experience Required</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingJob.experienceRequired}</span>
                </div>
              </div>

              {/* Proposals Received */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  Received Proposals ({viewingJob.proposals?.length || 0})
                </h4>

                {viewingJob.proposals && viewingJob.proposals.length > 0 ? (
                  <div className="space-y-2">
                    {viewingJob.proposals.map((prop, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-[#0600AB]/30 border border-slate-200 dark:border-[#0600AB]/40 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{prop.workerName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">"{prop.message}"</p>
                          <span className="text-[10px] text-slate-400">{prop.date}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-primary-600 dark:text-primary-400 text-sm">₹{prop.bidAmount}</span>
                          <Link
                            to={`/worker/${prop.workerId}`}
                            className="block mt-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400"
                          >
                            View Worker Profile
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No bids submitted yet for this job.</p>
                )}
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-right">
              <button
                onClick={() => setViewingJob(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Job Modal */}
      {editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-[#00033D] rounded-2xl shadow-xl border border-slate-100 dark:border-[#0600AB]/40 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Edit Job Posting</h3>
              <button onClick={() => setEditingJob(null)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Budget (₹)</label>
                <input
                  type="number"
                  required
                  value={editFormData.budget}
                  onChange={(e) => setEditFormData({ ...editFormData, budget: e.target.value })}
                  className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Location</label>
                <input
                  type="text"
                  required
                  value={editFormData.location}
                  onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                  className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows="3"
                  required
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

