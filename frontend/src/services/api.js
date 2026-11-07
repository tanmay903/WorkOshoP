const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = (isJson = true) => {
  const headers = {};
  if (isJson) headers['Content-Type'] = 'application/json';

  try {
    const rawUser = localStorage.getItem('hw_auth_user');
    if (rawUser) {
      const user = JSON.parse(rawUser);
      if (user.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }
    }
  } catch (err) {
    // Ignore storage parse error
  }

  return headers;
};

export const api = {
  // Workers
  async getWorkers(params = {}) {
    try {
      const search = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/workers${search ? `?${search}` : ''}`, {
        headers: getHeaders(false),
      });
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch (err) {
      console.warn('Backend offline, using fallback');
      return null;
    }
  },

  async getWorkerById(id) {
    try {
      const res = await fetch(`${API_BASE}/workers/${id}`, {
        headers: getHeaders(false),
      });
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch {
      return null;
    }
  },

  // Jobs
  async getJobs(params = {}) {
    try {
      const search = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/jobs${search ? `?${search}` : ''}`, {
        headers: getHeaders(false),
      });
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch {
      return null;
    }
  },

  async postJob(jobData) {
    try {
      const res = await fetch(`${API_BASE}/jobs`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify(jobData),
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  // Bookings
  async getBookings(status) {
    try {
      const url = status && status !== 'All' ? `${API_BASE}/bookings?status=${status}` : `${API_BASE}/bookings`;
      const res = await fetch(url, {
        headers: getHeaders(false),
      });
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch {
      return null;
    }
  },

  async postBooking(bookingData) {
    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify(bookingData),
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  async updateBookingStatus(id, status) {
    try {
      const res = await fetch(`${API_BASE}/bookings/${id}/status`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify({ status }),
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  // Reviews
  async postReview(reviewData) {
    try {
      const res = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify(reviewData),
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  // Messages
  async getConversations() {
    try {
      const res = await fetch(`${API_BASE}/messages`, {
        headers: getHeaders(false),
      });
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch {
      return null;
    }
  },

  async sendMessage(receiverId, message, conversationId) {
    try {
      const res = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ receiverId, message, conversationId }),
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  // Notifications
  async getNotifications() {
    try {
      const res = await fetch(`${API_BASE}/notifications`, {
        headers: getHeaders(false),
      });
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch {
      return null;
    }
  },

  async markAllNotificationsRead() {
    try {
      const res = await fetch(`${API_BASE}/notifications/mark-read`, {
        method: 'PUT',
        headers: getHeaders(true),
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  // Auth
  async login(email, password, role) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  async registerCustomer(customerData) {
    try {
      const res = await fetch(`${API_BASE}/auth/register-customer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData),
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  async registerWorker(workerData) {
    try {
      const res = await fetch(`${API_BASE}/auth/register-worker`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workerData),
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  // Admin
  async getAdminStats() {
    try {
      const res = await fetch(`${API_BASE}/admin/stats`, {
        headers: getHeaders(false),
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  async toggleWorkerVerification(workerProfileId, status) {
    try {
      const res = await fetch(`${API_BASE}/admin/workers/${workerProfileId}/verify`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify({ status }),
      });
      return await res.json();
    } catch {
      return null;
    }
  },
};
