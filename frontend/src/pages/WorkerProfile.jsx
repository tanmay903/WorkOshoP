import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  Phone,
  MessageSquare,
  Briefcase,
  Share2,
  Calendar,
  CheckCircle2,
  Award,
  BookOpen,
  DollarSign,
  Globe,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  Navigation,
  Sparkles,
  Users
} from 'lucide-react';
import { RatingStars } from '../components/RatingStars';
import { WorkerCard } from '../components/WorkerCard';
import { BookingModal } from '../components/BookingModal';
import { ReviewModal } from '../components/ReviewModal';
import { storage } from '../utils/storage';
import { useAuth } from '../context/AuthContext';

export const WorkerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [worker, setWorker] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'experience' | 'reviews' | 'portfolio'
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [callRevealed, setCallRevealed] = useState(false);
  const [suggestedWorkers, setSuggestedWorkers] = useState([]);

  useEffect(() => {
    // If no ID or ID not found, fallback to first worker (Rohit Kumar)
    const target = storage.getWorkerById(id) || storage.getWorkers()[0];
    setWorker(target);
    window.scrollTo(0, 0);

    if (target) {
      const all = storage.getWorkers();
      // Find workers in same category or profession (excluding current)
      let sameCategory = all.filter(
        (w) => w.id !== target.id && (w.category === target.category || w.profession === target.profession)
      );

      // If less than 3, supplement with other top rated verified workers
      if (sameCategory.length < 3) {
        const others = all.filter(
          (w) => w.id !== target.id && !sameCategory.some((sc) => sc.id === w.id)
        );
        sameCategory = [...sameCategory, ...others];
      }

      setSuggestedWorkers(sameCategory.slice(0, 3));
    }
  }, [id]);

  if (!worker) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600 font-medium">Loading worker profile...</p>
      </div>
    );
  }

  const handleHireService = (srv) => {
    setSelectedService(srv);
    setShowBookingModal(true);
  };

  const handleStartChat = () => {
    const conv = storage.startOrGetConversationWithWorker(worker, user);
    navigate(`/messages?conv=${conv.id}`);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link to="/find-workers" className="hover:text-primary-600 transition-colors">Find Workers</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-800">{worker.name}</span>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* Profile Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="relative bg-white rounded-3xl border border-slate-200/90 shadow-soft overflow-hidden">
          {/* Cover background */}
          <div className="h-44 sm:h-56 w-full relative overflow-hidden bg-gradient-to-r from-navy-900 to-primary-900">
            <img
              src={worker.coverImage}
              alt="Cover"
              className="w-full h-full object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          {/* Profile Header Content */}
          <div className="px-6 sm:px-8 pb-6 pt-0 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
                {/* Avatar with verified check */}
                <div className="relative">
                  <img
                    src={worker.avatar}
                    alt={worker.name}
                    className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover ring-4 ring-white shadow-xl bg-white"
                  />
                  {worker.isAvailable && (
                    <span className="absolute bottom-2 right-2 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full shadow-sm" title="Available for hire today" />
                  )}
                </div>

                {/* Name, Profession, Meta */}
                <div className="space-y-1.5 sm:mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      {worker.name}
                    </h1>
                    {worker.verified && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="w-3.5 h-3.5 fill-emerald-600 text-white" />
                        Verified Pro
                      </span>
                    )}
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 font-semibold border border-primary-200">
                      {worker.availability}
                    </span>
                  </div>

                  <p className="text-sm sm:text-base font-semibold text-primary-600">
                    {worker.profession}
                  </p>

                  <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-600 flex-wrap pt-0.5">
                    <RatingStars rating={worker.rating} count={worker.reviewsCount} size="sm" />
                    <span className="flex items-center gap-1 text-slate-500">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {worker.location} ({worker.distance})
                    </span>
                  </div>
                </div>
              </div>

              {/* Top Quick Actions (Mobile/Tablet friendly) */}
              <div className="flex items-center gap-2 w-full sm:w-auto sm:mb-2">
                <button
                  onClick={() => { setSelectedService(null); setShowBookingModal(true); }}
                  className="flex-1 sm:flex-initial px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-xl shadow-md shadow-primary-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Hire Now</span>
                </button>
                <button
                  onClick={handleStartChat}
                  className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <MessageSquare className="w-4 h-4 text-primary-600" />
                  <span className="hidden sm:inline">Message</span>
                </button>
                <button
                  onClick={handleShare}
                  className="p-2.5 bg-white hover:bg-slate-50 text-slate-600 rounded-xl border border-slate-200 transition-colors"
                  title="Share profile"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tagline / Professional Description */}
            <div className="mt-5 pt-5 border-t border-slate-100">
              <p className="text-sm text-slate-700 leading-relaxed max-w-4xl">
                {worker.tagline}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Column Profile Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ===================================================
              B. LEFT SIDEBAR (Col span 3)
             =================================================== */}
          <aside className="lg:col-span-3 space-y-6">
            {/* Quick Metrics Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
                Key Details
              </h3>

              {/* Hourly / Daily Rate */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Hourly Rate</span>
                <span className="font-bold text-slate-900 text-sm">₹{worker.hourlyRate} / hour</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Full Day Rate</span>
                <span className="font-bold text-slate-900 text-sm">₹{worker.dailyRate} / day</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Total Experience</span>
                <span className="font-bold text-primary-700 text-sm bg-primary-50 px-2 py-0.5 rounded-md">
                  {worker.experience}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Availability</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {worker.availability}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Jobs Completed</span>
                <span className="font-bold text-slate-900">{worker.completedJobs || 120}+</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Response Rate</span>
                <span className="font-semibold text-slate-900">{worker.responseRate || '98%'}</span>
              </div>
            </div>

            {/* Skills Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
                Core Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {worker.skills?.map((skill, i) => (
                  <span
                    key={i}
                    className="text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/60"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Languages Spoken */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary-600" />
                Languages Spoken
              </h3>
              <div className="flex flex-wrap gap-2 text-xs">
                {worker.languages?.map((lang, i) => (
                  <span key={i} className="px-2.5 py-1 bg-primary-50 text-primary-700 font-medium rounded-md">
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            {/* Share profile widget */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs text-center space-y-3">
              <p className="text-xs text-slate-600">Share this verified profile with your neighbors and friends.</p>
              <button
                onClick={handleShare}
                className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Share Profile'}</span>
              </button>
            </div>
          </aside>

          {/* ===================================================
              C. MAIN CONTENT TABS (Col span 6)
             =================================================== */}
          <main className="lg:col-span-6 space-y-6">
            {/* Tabs Header */}
            <div className="bg-white rounded-2xl p-1.5 border border-slate-200/90 shadow-xs flex items-center justify-between overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'experience', label: 'Work Experience' },
                { id: 'reviews', label: `Reviews (${worker.reviews?.length || worker.reviewsCount})` },
                { id: 'portfolio', label: 'Portfolio' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* About Me */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-3">
                  <h3 className="text-base font-bold text-slate-900">About Me</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {worker.about}
                  </p>
                </div>

                {/* Services Provided with Pricing */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Services I Provide</h3>
                      <p className="text-xs text-slate-500">Fixed rate service packages with instant booking</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {worker.services?.map((srv) => (
                      <div
                        key={srv.id}
                        className="p-4 rounded-xl border border-slate-200 hover:border-primary-300 hover:bg-primary-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                      >
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-slate-900 group-hover:text-primary-600 transition-colors">
                            {srv.title}
                          </h4>
                          <p className="text-xs text-slate-500">
                            Duration: {srv.duration} &bull; {srv.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-base font-extrabold text-slate-900">₹{srv.price}</span>
                          <button
                            onClick={() => handleHireService(srv)}
                            className="px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all active:scale-95"
                          >
                            Book
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education & Certifications */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    Education & Certifications
                  </h3>
                  <div className="space-y-3 text-xs sm:text-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 mt-0.5">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Trade Training & Qualification</p>
                        <p className="text-xs text-slate-500 mt-0.5">{worker.education}</p>
                      </div>
                    </div>

                    {worker.certifications?.map((cert, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{cert}</p>
                          <p className="text-xs text-emerald-700 font-medium">Verified by Skill India & HireWorker Council</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Work Gallery Preview */}
                {worker.gallery && worker.gallery.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900">Work Gallery & Past Jobs</h3>
                      <button
                        onClick={() => setActiveTab('portfolio')}
                        className="text-xs font-semibold text-primary-600 hover:underline"
                      >
                        View All ({worker.gallery.length})
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {worker.gallery.map((imgUrl, i) => (
                        <img
                          key={i}
                          src={imgUrl}
                          alt={`Job sample ${i + 1}`}
                          className="w-full h-24 rounded-xl object-cover hover:scale-105 transition-transform cursor-pointer border border-slate-100"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: WORK EXPERIENCE */}
            {activeTab === 'experience' && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Professional Experience Timeline</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Proven track record of high quality craftmanship</p>
                </div>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  <div className="relative">
                    <span className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-primary-600 ring-4 ring-primary-100" />
                    <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">2021 &mdash; Present</span>
                    <h4 className="font-bold text-slate-900 text-sm mt-0.5">Independent Master {worker.profession} & Contractor</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Leading residential renovations, commercial maintenance, and on-demand breakdown emergencies. Completed over 300+ direct customer projects with 98% positive reviews.
                    </p>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-slate-400 ring-4 ring-slate-100" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">2019 &mdash; 2021</span>
                    <h4 className="font-bold text-slate-900 text-sm mt-0.5">Senior Site Technician &bull; Urban Buildcon Pvt Ltd</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Supervised installation teams for 120 residential luxury flats. Managed blueprints, electrical distribution switchboards, and final safety sign-offs.
                    </p>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-slate-300 ring-4 ring-slate-100" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">2018 &mdash; 2019</span>
                    <h4 className="font-bold text-slate-900 text-sm mt-0.5">Apprentice Specialist &bull; Central ITI Training Cell</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Completed 1,200 hours of practical trade training with grade A certification.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {/* Rating Overview Card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100">
                    <div className="text-center sm:text-left">
                      <div className="text-4xl font-extrabold text-slate-900">{worker.rating}</div>
                      <div className="py-1">
                        <RatingStars rating={worker.rating} showCount={false} size="md" />
                      </div>
                      <p className="text-xs text-slate-500">Based on {worker.reviewsCount || 124} customer reviews</p>
                    </div>

                    <button
                      onClick={() => setShowReviewModal(true)}
                      className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
                    >
                      Write a Review
                    </button>
                  </div>

                  {/* Reviews List */}
                  <div className="mt-6 space-y-4">
                    {worker.reviews && worker.reviews.length > 0 ? (
                      worker.reviews.map((rev) => (
                        <div key={rev.id} className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={rev.customerAvatar}
                                alt={rev.customerName}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <div>
                                <h4 className="font-bold text-xs text-slate-900">{rev.customerName}</h4>
                                <span className="text-[10px] text-slate-400">{rev.date}</span>
                              </div>
                            </div>
                            <RatingStars rating={rev.rating} showCount={false} size="xs" />
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            "{rev.comment}"
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 text-center py-6">
                        No written reviews yet. Be the first to review {worker.name}!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: PORTFOLIO */}
            {activeTab === 'portfolio' && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Work Portfolio & Project Photos</h3>
                  <p className="text-xs text-slate-500">Actual on-site photographs submitted by {worker.name}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {worker.gallery?.map((imgUrl, i) => (
                    <div key={i} className="group relative rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
                      <img
                        src={imgUrl}
                        alt={`Portfolio item ${i + 1}`}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-4">
                        <span className="text-xs font-semibold text-white">Project #{i + 1} - Verified On-site Completion</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* ===================================================
              D. RIGHT SIDEBAR (Col span 3)
             =================================================== */}
          <aside className="lg:col-span-3 space-y-6">
            {/* Primary Action Box */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-soft space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary-600">Hire This Worker</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-extrabold text-slate-900">₹{worker.hourlyRate}</span>
                  <span className="text-xs text-slate-500">/ hour standard</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => { setSelectedService(null); setShowBookingModal(true); }}
                  className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-xl shadow-md shadow-primary-500/25 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Hire Now</span>
                </button>

                <button
                  onClick={handleStartChat}
                  className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2 active:scale-95"
                >
                  <MessageSquare className="w-4 h-4 text-primary-600" />
                  <span>Send Direct Message</span>
                </button>

                {/* Call Button */}
                <button
                  onClick={() => setCallRevealed(!callRevealed)}
                  className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>{callRevealed ? worker.phone : 'Click to View Phone'}</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-500 text-center">
                Free cancellation up to 2 hours before scheduled slot.
              </p>
            </div>

            {/* Verification Badges */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Verification Status
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Govt. Photo ID Verified</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Skill & Tool Audit Passed</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Phone & Address Authenticated</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Police Clearance Certificate</span>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">Service Coverage</span>
                <span className="text-primary-600 font-semibold flex items-center gap-1">
                  <Navigation className="w-3 h-3" />
                  {worker.city}
                </span>
              </div>

              {/* Styled Map Graphic */}
              <div className="w-full h-36 bg-slate-100 rounded-xl relative overflow-hidden border border-slate-200 flex items-center justify-center">
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="relative text-center p-3">
                  <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center mx-auto shadow-lg animate-pulse mb-1">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 block">{worker.location}</span>
                  <span className="text-[10px] text-slate-500">Servicing within 15 km radius</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Suggested Workers Section at the bottom of worker info */}
      {suggestedWorkers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-soft">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-100 gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-3 py-1 rounded-full mb-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Recommended Alternatives
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Other Skilled Workers You May Like
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Top-rated verified professionals in {worker.profession} & related trades
                </p>
              </div>

              <Link
                to={`/find-workers?category=${worker.category || 'all'}`}
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors"
              >
                <span>Browse All {worker.profession}s</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Suggested Workers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestedWorkers.map((sWorker) => (
                <WorkerCard key={sWorker.id} worker={sWorker} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Booking Modal */}
      <BookingModal
        worker={worker}
        initialService={selectedService}
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
      />

      {/* Review Modal */}
      <ReviewModal
        worker={worker}
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onReviewAdded={(newRev) => {
          const updated = storage.getWorkerById(worker.id);
          setWorker(updated);
        }}
      />
    </div>
  );
};

