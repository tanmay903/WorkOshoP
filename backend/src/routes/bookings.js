import { Router } from 'express';
import { db } from '../data/db.js';

const router = Router();

// GET /api/bookings
router.get('/', (req, res) => {
  const { status } = req.query;
  let bookings = db.getBookings();

  if (status && status !== 'All') {
    bookings = bookings.filter(b => b.status === status);
  }

  res.json({ success: true, count: bookings.length, data: bookings });
});

// POST /api/bookings
router.post('/', (req, res) => {
  const newBooking = {
    ...req.body,
    id: `bk-${Date.now()}`,
    bookingNumber: `HW-BK-${Math.floor(1000 + Math.random() * 9000)}`,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };

  const saved = db.addBooking(newBooking);

  db.addNotification({
    id: `notif-${Date.now()}`,
    type: 'booking',
    title: 'New Service Booking',
    message: `${newBooking.customerName || 'Customer'} scheduled "${newBooking.serviceTitle}" on ${newBooking.serviceDate}.`,
    time: 'Just now',
    read: false,
    link: '/bookings'
  });

  res.status(201).json({ success: true, data: saved });
});

// PUT /api/bookings/:id/status
router.put('/:id/status', (req, res) => {
  const { status } = req.body;
  const updated = db.updateBooking(req.params.id, { status });

  if (!updated) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  db.addNotification({
    id: `notif-${Date.now()}`,
    type: 'booking',
    title: `Booking ${status}`,
    message: `Booking #${updated.bookingNumber} for "${updated.serviceTitle}" is now ${status}.`,
    time: 'Just now',
    read: false,
    link: '/bookings'
  });

  res.json({ success: true, data: updated });
});

export default router;

