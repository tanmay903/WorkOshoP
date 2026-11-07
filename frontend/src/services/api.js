const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  async getWorkers(params = {}) {
    try {
      const search = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/workers${search ? `?${search}` : ''}`);
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch (err) {
      console.warn('Backend offline, using local data fallback');
      return null;
    }
  },

  async getWorkerById(id) {
    try {
      const res = await fetch(`${API_BASE}/workers/${id}`);
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch {
      return null;
    }
  },

  async getJobs() {
    try {
      const res = await fetch(`${API_BASE}/jobs`);
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  async getBookings() {
    try {
      const res = await fetch(`${API_BASE}/bookings`);
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  async getConversations() {
    try {
      const res = await fetch(`${API_BASE}/messages`);
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch {
      return null;
    }
  },

  async sendMessage(convId, text, sender) {
    try {
      const res = await fetch(`${API_BASE}/messages/${convId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, sender }),
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  async getNotifications() {
    try {
      const res = await fetch(`${API_BASE}/notifications`);
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch {
      return null;
    }
  },

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
  }
};

