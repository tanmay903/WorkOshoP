import { initialWorkers } from '../data/workers';
import { initialJobs, initialBookings, initialMessages, initialNotifications } from '../data/jobs';

const WORKERS_KEY = 'hw_workers';
const JOBS_KEY = 'hw_jobs';
const BOOKINGS_KEY = 'hw_bookings';
const MESSAGES_KEY = 'hw_messages';
const NOTIFICATIONS_KEY = 'hw_notifications';
const AUTH_KEY = 'hw_auth_user';
const CERTIFICATES_KEY = 'hw_certificates';
const USERS_KEY = 'hw_users';
const PERMANENT_ADDR_KEY = 'hw_worker_perm_addr';
const SAVED_WORKERS_KEY = 'hw_saved_workers';

const initialCertificates = [];

const initialUsers = [
  {
    id: 'cust-1',
    name: 'Aarav Singhal',
    email: 'aarav.singhal@example.com',
    role: 'customer',
    phone: '+91 98711 22334',
    city: 'Guwahati, Assam',
    status: 'Active',
    registeredDate: '2024-01-05',
    totalBookings: 8,
    totalSpent: '₹14,200',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'cust-2',
    name: 'Pooja Verma',
    email: 'pooja.v@example.com',
    role: 'customer',
    phone: '+91 98111 55667',
    city: 'Noida',
    status: 'Active',
    registeredDate: '2024-01-18',
    totalBookings: 3,
    totalSpent: '₹4,800',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'cust-3',
    name: 'Rahul Sharma',
    email: 'rahul.s@example.com',
    role: 'customer',
    phone: '+91 99222 33445',
    city: 'Gurugram',
    status: 'Active',
    registeredDate: '2024-02-01',
    totalBookings: 5,
    totalSpent: '₹9,500',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'admin-1',
    name: 'Vikramaditya (Admin)',
    email: 'admin@workoshop.com',
    role: 'admin',
    phone: '+91 99999 88888',
    city: 'Headquarters',
    status: 'Active',
    registeredDate: '2023-01-01',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80'
  }
];

// One-time cleanup of legacy pre-seeded example hire history from localStorage
const LEGACY_EXAMPLE_PURGE_KEY = 'hw_purged_examples_v1';
const purgeLegacyExamples = () => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    if (localStorage.getItem(LEGACY_EXAMPLE_PURGE_KEY) === 'true') return;

    const legacyBookingIds = new Set(['bk-101', 'bk-102', 'bk-103']);
    const legacyMessageIds = new Set(['conv-1', 'conv-2']);
    const legacyNotifIds = new Set(['notif-1', 'notif-2', 'notif-3', 'notif-4']);
    const legacyJobIds = new Set(['job-3', 'job-4']);

    const rawBookings = localStorage.getItem(BOOKINGS_KEY);
    if (rawBookings) {
      const parsed = JSON.parse(rawBookings);
      if (Array.isArray(parsed)) {
        localStorage.setItem(BOOKINGS_KEY, JSON.stringify(parsed.filter(b => !legacyBookingIds.has(b.id))));
      }
    }

    const rawMessages = localStorage.getItem(MESSAGES_KEY);
    if (rawMessages) {
      const parsed = JSON.parse(rawMessages);
      if (Array.isArray(parsed)) {
        localStorage.setItem(MESSAGES_KEY, JSON.stringify(parsed.filter(m => !legacyMessageIds.has(m.id))));
      }
    }

    const rawNotifs = localStorage.getItem(NOTIFICATIONS_KEY);
    if (rawNotifs) {
      const parsed = JSON.parse(rawNotifs);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter(n => !legacyNotifIds.has(n.id));
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(cleaned.length > 0 ? cleaned : initialNotifications));
      }
    }

    const rawJobs = localStorage.getItem(JOBS_KEY);
    if (rawJobs) {
      const parsed = JSON.parse(rawJobs);
      if (Array.isArray(parsed)) {
        const cleanedJobs = parsed
          .filter(j => !legacyJobIds.has(j.id))
          .map(j => (j.id === 'job-1' && j.customerId === 'cust-1' ? { ...j, customerId: 'market-cust-1' } : j));
        localStorage.setItem(JOBS_KEY, JSON.stringify(cleanedJobs));
      }
    }

    localStorage.setItem(LEGACY_EXAMPLE_PURGE_KEY, 'true');
  } catch {
    // Ignore storage parse issues
  }
};

const SEEDED_WORKERS_PURGE_KEY = 'hw_purged_seeded_workers_v2';
const SEEDED_WORKER_EMAILS = new Set([
  'rohit.kumar@example.com',
  'suresh.plumb@example.com',
  'manish.wood@example.com',
  'suresh.p@example.com',
  'amit.s@example.com',
]);

const isPreloadedDemoWorker = (w) => {
  if (!w) return false;
  const id = String(w.id || '');
  const email = String(w.email || '').toLowerCase();
  return (
    /^w-([1-9]|[1-9]\d|10[0-8])$/.test(id) ||
    SEEDED_WORKER_EMAILS.has(email) ||
    email.endsWith('@workoshop.in')
  );
};

const purgeSeededDemoWorkers = () => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    if (localStorage.getItem(SEEDED_WORKERS_PURGE_KEY) === 'true') return;

    const rawWorkers = localStorage.getItem(WORKERS_KEY);
    if (rawWorkers) {
      const parsed = JSON.parse(rawWorkers);
      if (Array.isArray(parsed)) {
        const realOnly = parsed.filter((w) => !isPreloadedDemoWorker(w));
        localStorage.setItem(WORKERS_KEY, JSON.stringify(realOnly));
      }
    }

    const rawUsers = localStorage.getItem(USERS_KEY);
    if (rawUsers) {
      const parsedUsers = JSON.parse(rawUsers);
      if (Array.isArray(parsedUsers)) {
        const realUsers = parsedUsers.filter((u) => !isPreloadedDemoWorker(u));
        localStorage.setItem(USERS_KEY, JSON.stringify(realUsers));
      }
    }

    const rawCerts = localStorage.getItem(CERTIFICATES_KEY);
    if (rawCerts) {
      const parsedCerts = JSON.parse(rawCerts);
      if (Array.isArray(parsedCerts)) {
        const realCerts = parsedCerts.filter(
          (c) => !/^w-([1-9]|[1-9]\d|10[0-8])$/.test(String(c.workerId || ''))
        );
        localStorage.setItem(CERTIFICATES_KEY, JSON.stringify(realCerts));
      }
    }

    localStorage.setItem(SEEDED_WORKERS_PURGE_KEY, 'true');
  } catch {
    // Ignore storage parse issues
  }
};

purgeLegacyExamples();
purgeSeededDemoWorkers();

export const storage = {
  // Workers
  getWorkers: () => {
    try {
      const data = localStorage.getItem(WORKERS_KEY);
      if (!data) {
        localStorage.setItem(WORKERS_KEY, JSON.stringify(initialWorkers));
        return initialWorkers;
      }
      return JSON.parse(data);
    } catch {
      return initialWorkers;
    }
  },

  getWorkerById: (id) => {
    const workers = storage.getWorkers();
    return workers.find(w => w.id === id) || null;
  },

  saveWorker: (worker) => {
    const { permanentAddress: _privatePermAddress, ...publicWorker } = worker;
    const workers = storage.getWorkers();
    const idx = workers.findIndex(w => w.id === publicWorker.id);
    let updated;
    if (idx >= 0) {
      updated = [...workers];
      updated[idx] = { ...updated[idx], ...publicWorker };
    } else {
      updated = [publicWorker, ...workers];
    }
    localStorage.setItem(WORKERS_KEY, JSON.stringify(updated));
    return publicWorker;
  },

  // Private worker permanent address (stored separately from public worker cards & live GPS)
  getPermanentAddress: (workerId) => {
    try {
      const raw = localStorage.getItem(PERMANENT_ADDR_KEY);
      if (!raw) return null;
      const map = JSON.parse(raw);
      return map?.[workerId] || null;
    } catch {
      return null;
    }
  },

  savePermanentAddress: (workerId, permAddr) => {
    if (!workerId) return null;
    try {
      const raw = localStorage.getItem(PERMANENT_ADDR_KEY);
      const map = raw ? JSON.parse(raw) : {};
      map[workerId] = permAddr;
      localStorage.setItem(PERMANENT_ADDR_KEY, JSON.stringify(map));
      return permAddr;
    } catch {
      return null;
    }
  },

  updateWorkerVerification: (id, verified) => {
    const workers = storage.getWorkers();
    const updated = workers.map(w => w.id === id ? { ...w, verified } : w);
    localStorage.setItem(WORKERS_KEY, JSON.stringify(updated));
    return updated;
  },

  addWorkerReview: (workerId, review) => {
    const workers = storage.getWorkers();
    const updated = workers.map(w => {
      if (w.id === workerId) {
        const existingReviews = w.reviews || [];
        const newReviews = [review, ...existingReviews];
        const newReviewsCount = newReviews.length;
        const sumRating = newReviews.reduce((acc, r) => acc + Number(r.rating), 0);
        const newAvg = (sumRating / newReviewsCount).toFixed(1);
        return {
          ...w,
          reviews: newReviews,
          reviewsCount: newReviewsCount,
          rating: parseFloat(newAvg),
        };
      }
      return w;
    });
    localStorage.setItem(WORKERS_KEY, JSON.stringify(updated));
    return updated.find(w => w.id === workerId);
  },

  // Jobs
  getJobs: () => {
    try {
      const data = localStorage.getItem(JOBS_KEY);
      if (!data) {
        localStorage.setItem(JOBS_KEY, JSON.stringify(initialJobs));
        return initialJobs;
      }
      return JSON.parse(data);
    } catch {
      return initialJobs;
    }
  },

  saveJob: (job) => {
    const jobs = storage.getJobs();
    const newJob = {
      ...job,
      id: job.id || `job-${Date.now()}`,
      postedDate: job.postedDate || new Date().toISOString().split('T')[0],
      status: job.status || 'Open',
      applicationsCount: job.applicationsCount || 0,
      proposals: job.proposals || [],
    };
    const updated = [newJob, ...jobs];
    localStorage.setItem(JOBS_KEY, JSON.stringify(updated));
    return newJob;
  },

  updateJob: (jobId, updates) => {
    const jobs = storage.getJobs();
    const updated = jobs.map(j => j.id === jobId ? { ...j, ...updates } : j);
    localStorage.setItem(JOBS_KEY, JSON.stringify(updated));
    return updated;
  },

  deleteJob: (jobId) => {
    const jobs = storage.getJobs();
    const updated = jobs.filter(j => j.id !== jobId);
    localStorage.setItem(JOBS_KEY, JSON.stringify(updated));
    return updated;
  },

  getJobsForCustomer: (user) => {
    const jobs = storage.getJobs();
    if (!user) return [];
    if (user.role === 'admin') return jobs;
    return jobs.filter(j =>
      j.customerId === user.id ||
      (j.customerEmail && user.email && j.customerEmail.toLowerCase() === user.email.toLowerCase())
    );
  },

  // Bookings
  getBookings: () => {
    try {
      const data = localStorage.getItem(BOOKINGS_KEY);
      if (!data) {
        localStorage.setItem(BOOKINGS_KEY, JSON.stringify(initialBookings));
        return initialBookings;
      }
      return JSON.parse(data);
    } catch {
      return initialBookings;
    }
  },

  getBookingsForUser: (user) => {
    const all = storage.getBookings();
    if (!user) return [];
    if (user.role === 'admin') return all;
    if (user.role === 'worker') {
      return all.filter(b =>
        b.workerId === user.id ||
        (b.workerEmail && user.email && b.workerEmail.toLowerCase() === user.email.toLowerCase()) ||
        (b.workerName && user.name && b.workerName.toLowerCase() === user.name.toLowerCase())
      );
    }
    return all.filter(b =>
      b.customerId === user.id ||
      (b.customerEmail && user.email && b.customerEmail.toLowerCase() === user.email.toLowerCase())
    );
  },

  saveBooking: (booking) => {
    if (!booking.customerId) {
      throw new Error("You must be logged in to create a booking.");
    }
    const loc = booking.address || booking.location;
    if (!loc || !loc.trim()) {
      throw new Error("Work location is required to hire a worker.");
    }
    const bookings = storage.getBookings();
    const newBooking = {
      ...booking,
      id: booking.id || `bk-${Date.now()}`,
      bookingNumber: booking.bookingNumber || `WO-BK-${Math.floor(1000 + Math.random() * 9000)}`,
      status: booking.status || 'Pending',
      createdAt: new Date().toISOString(),
    };
    const updated = [newBooking, ...bookings];
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updated));

    // Also trigger a notification for the worker
    storage.addNotification({
      type: 'booking',
      title: 'New Booking Request',
      message: `${newBooking.customerName || 'A customer'} requested booking for "${newBooking.serviceTitle}" on ${newBooking.serviceDate}.`,
      link: '/bookings',
    });

    return newBooking;
  },

  updateBookingStatus: (bookingId, status) => {
    const bookings = storage.getBookings();
    let updatedBooking = null;
    const updated = bookings.map(b => {
      if (b.id === bookingId) {
        updatedBooking = { ...b, status };
        return updatedBooking;
      }
      return b;
    });
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updated));

    if (updatedBooking) {
      storage.addNotification({
        type: 'booking',
        title: `Booking ${status}`,
        message: `Booking #${updatedBooking.bookingNumber} for "${updatedBooking.serviceTitle}" has been updated to ${status}.`,
        link: '/bookings',
      });
    }

    return updated;
  },

  // Messages
  getConversations: () => {
    try {
      const data = localStorage.getItem(MESSAGES_KEY);
      if (!data) {
        localStorage.setItem(MESSAGES_KEY, JSON.stringify(initialMessages));
        return initialMessages;
      }
      return JSON.parse(data);
    } catch {
      return initialMessages;
    }
  },

  sendMessage: (convId, text, sender = 'customer') => {
    const convs = storage.getConversations();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: `m-${Date.now()}`,
      sender,
      text,
      time: timeStr,
    };

    const updated = convs.map(c => {
      if (c.id === convId) {
        return {
          ...c,
          lastUpdated: 'Just now',
          unreadCount: sender === 'customer' ? 0 : (c.unreadCount || 0) + 1,
          messages: [...c.messages, newMsg],
        };
      }
      return c;
    });
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(updated));
    return { updated, newMsg };
  },

  getConversationsForUser: (user) => {
    const convs = storage.getConversations();
    if (!user) return [];
    if (user.role === 'admin') return convs;
    if (user.role === 'worker') {
      return convs.filter(c =>
        c.workerId === user.id ||
        (c.workerName && user.name && c.workerName.toLowerCase() === user.name.toLowerCase())
      );
    }
    return convs.filter(c => c.customerId === user.id);
  },

  startOrGetConversationWithWorker: (worker, customer) => {
    const convs = storage.getConversations();
    const customerId = customer?.id || 'cust-guest';
    const existing = convs.find(c => c.workerId === worker.id && c.customerId === customerId);
    if (existing) return existing;

    const newConv = {
      id: `conv-${Date.now()}`,
      workerId: worker.id,
      workerName: worker.name,
      workerProfession: worker.profession,
      workerAvatar: worker.avatar,
      customerId,
      customerName: customer?.name || 'Customer',
      unreadCount: 0,
      lastUpdated: 'Just now',
      messages: [
        {
          id: `m-init-${Date.now()}`,
          sender: 'worker',
          text: `Hello! I am ${worker.name}, ${worker.profession}. How can I assist you with your project today?`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]
    };
    localStorage.setItem(MESSAGES_KEY, JSON.stringify([newConv, ...convs]));
    return newConv;
  },

  startOrGetConversationWithCustomer: (customer, worker) => {
    const convs = storage.getConversations();
    const customerId = customer?.id || 'cust-guest';
    const workerId = worker?.id || 'w-1';
    const existing = convs.find(c =>
      c.customerId === customerId &&
      (c.workerId === workerId || (c.workerName && worker?.name && c.workerName.toLowerCase() === worker.name.toLowerCase()))
    );
    if (existing) return existing;

    const newConv = {
      id: `conv-${Date.now()}`,
      workerId,
      workerName: worker?.name || 'Service Professional',
      workerProfession: worker?.profession || 'Tradesperson',
      workerAvatar: worker?.avatar || '',
      customerId,
      customerName: customer?.name || 'Customer',
      unreadCount: 0,
      lastUpdated: 'Just now',
      messages: [
        {
          id: `m-init-${Date.now()}`,
          sender: 'worker',
          text: `Hello ${customer?.name || 'there'}! I am ${worker?.name || 'your assigned professional'} following up regarding your booking.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]
    };
    localStorage.setItem(MESSAGES_KEY, JSON.stringify([newConv, ...convs]));
    return newConv;
  },

  // Notifications
  getNotifications: () => {
    try {
      const data = localStorage.getItem(NOTIFICATIONS_KEY);
      if (!data) {
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(initialNotifications));
        return initialNotifications;
      }
      return JSON.parse(data);
    } catch {
      return initialNotifications;
    }
  },

  addNotification: (notif) => {
    const notifs = storage.getNotifications();
    const newNotif = {
      ...notif,
      id: `notif-${Date.now()}`,
      time: 'Just now',
      read: false,
    };
    const updated = [newNotif, ...notifs];
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    return newNotif;
  },

  markAllNotificationsRead: () => {
    const notifs = storage.getNotifications();
    const updated = notifs.map(n => ({ ...n, read: true }));
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    return updated;
  },

  markNotificationRead: (id) => {
    const notifs = storage.getNotifications();
    const updated = notifs.map(n => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    return updated;
  },

  deleteNotification: (id) => {
    const notifs = storage.getNotifications();
    const updated = notifs.filter(n => n.id !== id);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    return updated;
  },

  clearReadNotifications: () => {
    const notifs = storage.getNotifications();
    const updated = notifs.filter(n => !n.read);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    return updated;
  },

  // Job Proposals (For Workers bidding on Available Works)
  addProposalToJob: (jobId, proposal) => {
    const jobs = storage.getJobs();
    let updatedJob = null;
    const updated = jobs.map(j => {
      if (j.id === jobId) {
        const existing = j.proposals || [];
        const newProposal = {
          id: `prop-${Date.now()}`,
          date: 'Just now',
          ...proposal,
        };
        const newProps = [newProposal, ...existing];
        updatedJob = {
          ...j,
          proposals: newProps,
          applicationsCount: newProps.length,
          status: j.status === 'Open' ? 'Applications Received' : j.status,
        };
        return updatedJob;
      }
      return j;
    });
    localStorage.setItem(JOBS_KEY, JSON.stringify(updated));

    storage.addNotification({
      type: 'proposal',
      title: 'New Worker Bid Received',
      message: `${proposal.workerName} submitted a quote of ₹${proposal.bidAmount} for your job.`,
      link: '/my-jobs',
    });

    return updatedJob;
  },

  // Certificates & Verifications
  getCertificates: () => {
    try {
      const data = localStorage.getItem(CERTIFICATES_KEY);
      if (!data) {
        localStorage.setItem(CERTIFICATES_KEY, JSON.stringify(initialCertificates));
        return initialCertificates;
      }
      return JSON.parse(data);
    } catch {
      return initialCertificates;
    }
  },

  getCertificatesByWorker: (workerId) => {
    const certs = storage.getCertificates();
    return certs.filter(c => c.workerId === workerId);
  },

  saveCertificate: (cert) => {
    const certs = storage.getCertificates();
    const newCert = {
      ...cert,
      id: cert.id || `cert-${Date.now()}`,
      status: cert.status || 'Pending Review',
      submittedAt: new Date().toISOString().split('T')[0],
    };
    const updated = [newCert, ...certs];
    localStorage.setItem(CERTIFICATES_KEY, JSON.stringify(updated));

    storage.addNotification({
      type: 'verification',
      title: 'Certificate Submitted',
      message: `Your "${newCert.title}" has been submitted to the Admin Council for verification.`,
      link: '/worker/certificates',
    });

    return newCert;
  },

  updateCertificateStatus: (certId, status) => {
    const certs = storage.getCertificates();
    let updatedCert = null;
    const updated = certs.map(c => {
      if (c.id === certId) {
        updatedCert = { ...c, status };
        return updatedCert;
      }
      return c;
    });
    localStorage.setItem(CERTIFICATES_KEY, JSON.stringify(updated));

    if (updatedCert && status === 'Verified') {
      // Also update worker verification badge
      storage.updateWorkerVerification(updatedCert.workerId, true);
    }

    return updated;
  },

  // Users Directory (Admin)
  getUsers: () => {
    try {
      const data = localStorage.getItem(USERS_KEY);
      if (!data) {
        localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
        return initialUsers;
      }
      return JSON.parse(data);
    } catch {
      return initialUsers;
    }
  },

  updateUserStatus: (userId, status) => {
    const users = storage.getUsers();
    const updated = users.map(u => u.id === userId ? { ...u, status } : u);
    localStorage.setItem(USERS_KEY, JSON.stringify(updated));
    return updated;
  },

  // Auth User
  getAuthUser: () => {
    try {
      const data = localStorage.getItem(AUTH_KEY);
      if (!data) {
        // Default customer user for demo
        const defaultUser = {
          id: 'cust-1',
          name: 'Aarav Singhal',
          email: 'aarav.singhal@example.com',
          role: 'customer', // 'customer' | 'worker' | 'admin'
          avatar: '',
          phone: '+91 98711 22334',
          city: 'Guwahati, Assam',
        };
        localStorage.setItem(AUTH_KEY, JSON.stringify(defaultUser));
        return defaultUser;
      }
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  setAuthUser: (user) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    // If the authenticated user is a worker, ensure their worker profile matches the login identity
    if (user && user.role === 'worker') {
      try {
        const { permanentAddress: _privatePermAddress, ...publicUser } = user;
        const workers = storage.getWorkers();
        const idx = workers.findIndex(w => w.id === publicUser.id || (w.email && publicUser.email && w.email.toLowerCase() === publicUser.email.toLowerCase()));
        if (idx !== -1) {
          workers[idx] = { ...workers[idx], ...publicUser };
          localStorage.setItem(WORKERS_KEY, JSON.stringify(workers));
        }
      } catch {
        // Fallback
      }
    }
  },

  clearAuthUser: () => {
    localStorage.removeItem(AUTH_KEY);
  },

  // Saved / Favourite Workers
  getSavedWorkerIds: (userId) => {
    try {
      const uid = userId || storage.getAuthUser()?.id || 'guest';
      const raw = JSON.parse(localStorage.getItem(SAVED_WORKERS_KEY) || '{}');
      return Array.isArray(raw[uid]) ? raw[uid] : [];
    } catch {
      return [];
    }
  },

  isWorkerSaved: (workerId, userId) => {
    if (!workerId) return false;
    return storage.getSavedWorkerIds(userId).includes(String(workerId));
  },

  toggleSavedWorker: (worker, user) => {
    const workerId = String(typeof worker === 'object' ? worker.id : worker);
    const uid = user?.id || storage.getAuthUser()?.id || 'guest';
    let raw = {};
    try {
      raw = JSON.parse(localStorage.getItem(SAVED_WORKERS_KEY) || '{}');
    } catch {
      raw = {};
    }
    const list = Array.isArray(raw[uid]) ? raw[uid] : [];
    const exists = list.includes(workerId);
    const updatedList = exists ? list.filter(id => id !== workerId) : [workerId, ...list];
    raw[uid] = updatedList;
    localStorage.setItem(SAVED_WORKERS_KEY, JSON.stringify(raw));

    if (!exists && typeof worker === 'object' && worker?.name) {
      storage.addNotification({
        title: 'Worker Saved to Favourites',
        message: `${worker.name} (${worker.profession || 'Skilled Pro'}) has been added to your saved list.`,
        type: 'system',
        link: `/worker/${workerId}`,
      });
    }

    if (typeof window !== 'undefined' && typeof window.CustomEvent === 'function') {
      window.dispatchEvent(new window.CustomEvent('hw-saved-workers-changed', { detail: { ids: updatedList } }));
    }
    return { saved: !exists, ids: updatedList };
  }
};

