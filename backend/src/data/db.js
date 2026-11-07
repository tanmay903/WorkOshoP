import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { categories, workers, jobs, bookings } from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'store.json');

// Memory store
let store = {
  categories: [...categories],
  workers: [...workers],
  jobs: [...jobs],
  bookings: [...bookings],
  messages: [
    {
      id: 'conv-1',
      workerId: 'w-1',
      workerName: 'Rohit Kumar',
      workerProfession: 'Electrician',
      customerId: 'cust-1',
      customerName: 'Aarav Singhal',
      unreadCount: 1,
      lastUpdated: '10 mins ago',
      messages: [
        { id: 'm-1', sender: 'customer', text: 'Hi Rohit! Can you come by on Thursday for inverter setup?', time: '10:15 AM' },
        { id: 'm-2', sender: 'worker', text: 'Namaste Aarav ji! Yes, 11:00 AM on Thursday works nicely for me.', time: '10:20 AM' }
      ]
    }
  ],
  notifications: [
    {
      id: 'notif-1',
      type: 'booking',
      title: 'Booking Accepted',
      message: 'Rohit Kumar has accepted your booking for Inverter Setup on Nov 12.',
      time: '2 hours ago',
      read: false,
      link: '/bookings'
    }
  ]
};

// Try loading existing store.json if available
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    store = { ...store, ...JSON.parse(raw) };
  }
} catch (err) {
  console.log('Using default in-memory seed store.');
}

const persist = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
  } catch (err) {
    console.error('Error persisting store:', err.message);
  }
};

export const db = {
  // Workers
  getWorkers: () => store.workers,
  getWorkerById: (id) => store.workers.find(w => w.id === id) || null,
  addWorker: (worker) => {
    store.workers = [worker, ...store.workers];
    persist();
    return worker;
  },
  updateWorker: (id, updates) => {
    store.workers = store.workers.map(w => w.id === id ? { ...w, ...updates } : w);
    persist();
    return store.workers.find(w => w.id === id);
  },

  // Jobs
  getJobs: () => store.jobs,
  getJobById: (id) => store.jobs.find(j => j.id === id) || null,
  addJob: (job) => {
    store.jobs = [job, ...store.jobs];
    persist();
    return job;
  },
  updateJob: (id, updates) => {
    store.jobs = store.jobs.map(j => j.id === id ? { ...j, ...updates } : j);
    persist();
    return store.jobs.find(j => j.id === id);
  },
  deleteJob: (id) => {
    store.jobs = store.jobs.filter(j => j.id !== id);
    persist();
    return true;
  },

  // Bookings
  getBookings: () => store.bookings,
  getBookingById: (id) => store.bookings.find(b => b.id === id) || null,
  addBooking: (booking) => {
    store.bookings = [booking, ...store.bookings];
    persist();
    return booking;
  },
  updateBooking: (id, updates) => {
    store.bookings = store.bookings.map(b => b.id === id ? { ...b, ...updates } : b);
    persist();
    return store.bookings.find(b => b.id === id);
  },

  // Messages
  getConversations: () => store.messages,
  addMessage: (convId, msg) => {
    store.messages = store.messages.map(c => {
      if (c.id === convId) {
        return {
          ...c,
          lastUpdated: 'Just now',
          messages: [...c.messages, msg]
        };
      }
      return c;
    });
    persist();
    return msg;
  },

  // Notifications
  getNotifications: () => store.notifications,
  addNotification: (notif) => {
    store.notifications = [notif, ...store.notifications];
    persist();
    return notif;
  },
  markAllNotificationsRead: () => {
    store.notifications = store.notifications.map(n => ({ ...n, read: true }));
    persist();
    return store.notifications;
  },

  // Categories
  getCategories: () => store.categories,
};

