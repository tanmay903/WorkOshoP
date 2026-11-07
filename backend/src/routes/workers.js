import { Router } from 'express';
import { db } from '../data/db.js';

const router = Router();

// GET /api/workers with search & filter params
router.get('/', (req, res) => {
  const { q, loc, category, verified, available, minRating, maxPrice } = req.query;
  let workers = db.getWorkers();

  if (q) {
    const query = q.toLowerCase();
    workers = workers.filter(w =>
      w.name.toLowerCase().includes(query) ||
      w.profession.toLowerCase().includes(query) ||
      w.skills?.some(s => s.toLowerCase().includes(query))
    );
  }

  if (loc) {
    const locationQuery = loc.toLowerCase();
    workers = workers.filter(w =>
      w.location?.toLowerCase().includes(locationQuery) ||
      w.city?.toLowerCase().includes(locationQuery)
    );
  }

  if (category && category !== 'all') {
    workers = workers.filter(w => w.category === category);
  }

  if (verified === 'true') {
    workers = workers.filter(w => w.verified);
  }

  if (available === 'true') {
    workers = workers.filter(w => w.isAvailable);
  }

  if (minRating) {
    workers = workers.filter(w => w.rating >= Number(minRating));
  }

  if (maxPrice) {
    workers = workers.filter(w => w.hourlyRate <= Number(maxPrice));
  }

  res.json({ success: true, count: workers.length, data: workers });
});

// GET /api/workers/:id
router.get('/:id', (req, res) => {
  const worker = db.getWorkerById(req.params.id);
  if (!worker) {
    return res.status(404).json({ success: false, message: 'Worker not found' });
  }
  res.json({ success: true, data: worker });
});

// POST /api/workers (Create / Register worker)
router.post('/', (req, res) => {
  const newWorker = {
    ...req.body,
    id: req.body.id || `w-${Date.now()}`,
    rating: req.body.rating || 5.0,
    reviewsCount: req.body.reviewsCount || 0,
    verified: false,
    isAvailable: true,
  };
  const saved = db.addWorker(newWorker);
  res.status(201).json({ success: true, data: saved });
});

// PUT /api/workers/:id
router.put('/:id', (req, res) => {
  const updated = db.updateWorker(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Worker not found' });
  }
  res.json({ success: true, data: updated });
});

// POST /api/workers/:id/reviews
router.post('/:id/reviews', (req, res) => {
  const worker = db.getWorkerById(req.params.id);
  if (!worker) {
    return res.status(404).json({ success: false, message: 'Worker not found' });
  }

  const review = {
    id: `r-${Date.now()}`,
    customerName: req.body.customerName || 'Customer',
    rating: Number(req.body.rating) || 5,
    date: new Date().toISOString().split('T')[0],
    comment: req.body.comment || '',
  };

  const reviews = [review, ...(worker.reviews || [])];
  const avg = (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);

  const updated = db.updateWorker(req.params.id, {
    reviews,
    reviewsCount: reviews.length,
    rating: parseFloat(avg),
  });

  res.status(201).json({ success: true, data: updated, review });
});

export default router;

