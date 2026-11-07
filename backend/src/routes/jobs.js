import { Router } from 'express';
import { db } from '../data/db.js';

const router = Router();

// GET /api/jobs
router.get('/', (req, res) => {
  const { status, category } = req.query;
  let jobs = db.getJobs();

  if (status && status !== 'All') {
    jobs = jobs.filter(j => j.status === status);
  }

  if (category && category !== 'all') {
    jobs = jobs.filter(j => j.category === category);
  }

  res.json({ success: true, count: jobs.length, data: jobs });
});

// POST /api/jobs
router.post('/', (req, res) => {
  const newJob = {
    ...req.body,
    id: `job-${Date.now()}`,
    postedDate: new Date().toISOString().split('T')[0],
    status: 'Open',
    applicationsCount: 0,
    proposals: [],
  };

  const saved = db.addJob(newJob);

  // Trigger notification
  db.addNotification({
    id: `notif-${Date.now()}`,
    type: 'job',
    title: 'Job Successfully Posted',
    message: `Your job "${newJob.title}" is now open for tradesperson bids.`,
    time: 'Just now',
    read: false,
    link: '/my-jobs'
  });

  res.status(201).json({ success: true, data: saved });
});

// PUT /api/jobs/:id
router.put('/:id', (req, res) => {
  const updated = db.updateJob(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Job not found' });
  }
  res.json({ success: true, data: updated });
});

// DELETE /api/jobs/:id
router.delete('/:id', (req, res) => {
  db.deleteJob(req.params.id);
  res.json({ success: true, message: 'Job deleted successfully' });
});

export default router;

