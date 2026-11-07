import { Router } from 'express';
import { db } from '../data/db.js';

const router = Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password, role = 'customer' } = req.body;

  let userProfile = {
    id: `user-${Date.now()}`,
    name: email ? email.split('@')[0] : 'User',
    email,
    role,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    token: `demo-jwt-token-${Date.now()}`
  };

  if (role === 'worker') {
    const existingWorker = db.getWorkers().find(w => w.email?.toLowerCase() === email?.toLowerCase());
    if (existingWorker) {
      userProfile = {
        ...existingWorker,
        role: 'worker',
        token: `demo-jwt-worker-${Date.now()}`
      };
    }
  }

  res.json({ success: true, user: userProfile });
});

// POST /api/auth/register-customer
router.post('/register-customer', (req, res) => {
  const { fullName, email, phone, city } = req.body;
  const newCustomer = {
    id: `cust-${Date.now()}`,
    name: fullName,
    email,
    phone,
    city: city || 'New Delhi',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    token: `demo-jwt-customer-${Date.now()}`
  };
  res.status(201).json({ success: true, user: newCustomer });
});

export default router;

