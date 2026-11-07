import { initialWorkers } from '../data/workers';
import { initialJobs, initialBookings, initialMessages, initialNotifications } from '../data/jobs';

const WORKERS_KEY = 'hw_workers';
const JOBS_KEY = 'hw_jobs';
const BOOKINGS_KEY = 'hw_bookings';
const MESSAGES_KEY = 'hw_messages';
const NOTIFICATIONS_KEY = 'hw_notifications';
const AUTH_KEY = 'hw_auth_user';

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
    const workers = storage.getWorkers();
    const idx = workers.findIndex(w => w.id === worker.id);
    let updated;
    if (idx >= 0) {
      updated = [...workers];
      updated[idx] = { ...updated[idx], ...worker };
    } else {
      updated = [worker, ...workers];
    }
    localStorage.setItem(WORKERS_KEY, JSON.stringify(updated));
    return worker;
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

  saveBooking: (booking) => {
    const bookings = storage.getBookings();
    const newBooking = {
      ...booking,
      id: booking.id || `bk-${Date.now()}`,
      bookingNumber: booking.bookingNumber || `HW-BK-${Math.floor(1000 + Math.random() * 9000)}`,
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

  startOrGetConversationWithWorker: (worker, customer) => {
    const convs = storage.getConversations();
    const existing = convs.find(c => c.workerId === worker.id);
    if (existing) return existing;

    const newConv = {
      id: `conv-${Date.now()}`,
      workerId: worker.id,
      workerName: worker.name,
      workerProfession: worker.profession,
      workerAvatar: worker.avatar,
      customerId: customer?.id || 'cust-1',
      customerName: customer?.name || 'Aarav Singhal',
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
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
          phone: '+91 98711 22334',
          city: 'New Delhi',
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
  },

  clearAuthUser: () => {
    localStorage.removeItem(AUTH_KEY);
  }
};

