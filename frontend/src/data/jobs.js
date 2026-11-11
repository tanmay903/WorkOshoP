export const initialJobs = [
  {
    id: 'job-1',
    title: 'Complete 3BHK Electrical Rewiring & DB Board Setup',
    category: 'electrician',
    categoryName: 'Electrician',
    description: 'Looking for a certified electrician to replace 20-year-old copper wiring with fire-retardant cables, install 12-way double door MCB distribution board, and setup earthing in Zoo Road, Guwahati.',
    budget: 8500,
    paymentType: 'Fixed Price',
    experienceRequired: '5+ Years',
    preferredDate: '2026-11-15',
    location: 'Guwahati, Kamrup Metropolitan, Assam',
    status: 'Open', // 'Open' | 'Applications Received' | 'In Progress' | 'Completed' | 'Cancelled'
    postedDate: '2026-11-05',
    customerId: 'market-cust-1',
    customerName: 'Sanjay Verma',
    customerPhone: '+91 98711 22334',
    customerEmail: 'sanjay.verma@example.com',
    applicationsCount: 0,
    proposals: []
  },
  {
    id: 'job-2',
    title: 'Bathroom Wall Concealed Leakage & Diverter Replacement',
    category: 'plumber',
    categoryName: 'Plumber',
    description: 'Severe water dampness visible on the bedroom wall shared with the master bath. Need ultrasonic/pressure leak detection and replacing old brass mixer with single lever diverter.',
    budget: 3200,
    paymentType: 'Fixed Price',
    experienceRequired: '3+ Years',
    preferredDate: '2026-11-10',
    location: 'Dibrugarh, Assam',
    status: 'Open',
    postedDate: '2026-11-03',
    customerId: 'market-cust-2',
    customerName: 'Meera Kapur',
    customerPhone: '+91 99200 33445',
    customerEmail: 'meera.k@example.com',
    applicationsCount: 0,
    proposals: []
  }
];

// Bookings start empty; only real hires created by users appear here
export const initialBookings = [];

// Conversations start empty; created dynamically when a user starts chatting with a worker
export const initialMessages = [];

export const initialNotifications = [
  {
    id: 'notif-welcome',
    type: 'system',
    title: 'Welcome to WorkOshop!',
    message: 'Your account is active. Browse verified professionals and hire on demand.',
    time: 'Just now',
    read: false,
    link: '/find-workers'
  }
];

