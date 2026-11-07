export const initialJobs = [
  {
    id: 'job-1',
    title: 'Complete 3BHK Electrical Rewiring & DB Board Setup',
    category: 'electrician',
    categoryName: 'Electrician',
    description: 'Looking for a certified electrician to replace 20-year-old copper wiring with fire-retardant cables, install 12-way double door MCB distribution board, and setup earthing in Indirapuram.',
    budget: 8500,
    paymentType: 'Fixed Price',
    experienceRequired: '5+ Years',
    preferredDate: '2026-11-15',
    location: 'Indirapuram, Ghaziabad (Delhi NCR)',
    status: 'Open', // 'Open' | 'Applications Received' | 'In Progress' | 'Completed' | 'Cancelled'
    postedDate: '2026-11-05',
    customerId: 'cust-1',
    customerName: 'Aarav Singhal',
    customerPhone: '+91 98711 22334',
    customerEmail: 'aarav.s@example.com',
    applicationsCount: 4,
    proposals: [
      { workerId: 'w-1', workerName: 'Rohit Kumar', bidAmount: 8000, date: '2026-11-06', message: 'Hello Aarav, I can complete this with Havells FRLS wires and Schneider MCBs within 2 days.' },
      { workerId: 'w-10', workerName: 'Kavita Sundaram', bidAmount: 8500, date: '2026-11-06', message: 'Certified electrical engineer. Will provide testing report with digital insulation tester.' }
    ]
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
    location: 'Bandra West, Mumbai',
    status: 'Applications Received',
    postedDate: '2026-11-03',
    customerId: 'cust-2',
    customerName: 'Meera Kapur',
    customerPhone: '+91 99200 33445',
    customerEmail: 'meera.k@example.com',
    applicationsCount: 3,
    proposals: [
      { workerId: 'w-2', workerName: 'Suresh Patel', bidAmount: 3000, date: '2026-11-04', message: 'I have modern thermal camera to pinpoint exact leak without breaking extra tiles.' }
    ]
  },
  {
    id: 'job-3',
    title: 'Custom Floating TV Unit & Study Table Woodwork',
    category: 'carpenter',
    categoryName: 'Carpenter',
    description: 'Need skilled carpenter to build an 8x5 ft wall-mounted wooden TV console with concealed wire channels and a minimalist oak finish study desk.',
    budget: 14000,
    paymentType: 'Fixed Price',
    experienceRequired: '5+ Years',
    preferredDate: '2026-11-20',
    location: 'Koramangala, Bengaluru',
    status: 'In Progress',
    postedDate: '2026-10-28',
    customerId: 'cust-1',
    customerName: 'Aarav Singhal',
    customerPhone: '+91 98711 22334',
    customerEmail: 'aarav.s@example.com',
    applicationsCount: 5,
    assignedWorker: { workerId: 'w-3', workerName: 'Manish Vishwakarma', bidAmount: 13500 }
  },
  {
    id: 'job-4',
    title: 'Pre-Diwali Full House Deep Cleaning & Sanitization',
    category: 'cleaner',
    categoryName: 'Cleaner',
    description: 'Deep scrubbing of 2 bathrooms, kitchen oil degreasing, balcony pressure wash, and dry vacuuming of 3 bedroom mattresses.',
    budget: 3800,
    paymentType: 'Fixed Price',
    experienceRequired: 'Any Experience',
    preferredDate: '2026-10-25',
    location: 'Sector 62, Noida',
    status: 'Completed',
    postedDate: '2026-10-20',
    customerId: 'cust-3',
    customerName: 'Ritu Sen',
    customerPhone: '+91 98100 44556',
    customerEmail: 'ritu.sen@example.com',
    applicationsCount: 6,
    assignedWorker: { workerId: 'w-5', workerName: 'Sunita Devi', bidAmount: 3600 }
  }
];

export const initialBookings = [
  {
    id: 'bk-101',
    bookingNumber: 'HW-BK-2026-001',
    workerId: 'w-1',
    workerName: 'Rohit Kumar',
    workerProfession: 'Electrician',
    workerAvatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80',
    customerId: 'cust-1',
    customerName: 'Aarav Singhal',
    customerPhone: '+91 98711 22334',
    serviceTitle: 'Inverter & Battery Setup + Load Check',
    serviceDate: '2026-11-12',
    serviceTime: '11:00 AM',
    address: 'Flat 402, Royale Towers, Indirapuram, Ghaziabad',
    instructions: 'Please bring testing meter and extra copper lugs if possible.',
    estimatedAmount: 900,
    status: 'Accepted', // 'Pending' | 'Accepted' | 'In Progress' | 'Completed' | 'Cancelled' | 'Rejected'
    createdAt: '2026-11-06T10:30:00Z',
  },
  {
    id: 'bk-102',
    bookingNumber: 'HW-BK-2026-002',
    workerId: 'w-5',
    workerName: 'Sunita Devi',
    workerProfession: 'Cleaner',
    workerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    customerId: 'cust-1',
    customerName: 'Aarav Singhal',
    customerPhone: '+91 98711 22334',
    serviceTitle: 'Kitchen Deep Degreasing & Tiles Shine',
    serviceDate: '2026-11-14',
    serviceTime: '02:00 PM',
    address: 'Flat 402, Royale Towers, Indirapuram, Ghaziabad',
    instructions: 'Kitchen has modern glass hob, needs non-scratch cleaner.',
    estimatedAmount: 950,
    status: 'Pending',
    createdAt: '2026-11-07T09:15:00Z',
  },
  {
    id: 'bk-103',
    bookingNumber: 'HW-BK-2026-003',
    workerId: 'w-2',
    workerName: 'Suresh Patel',
    workerProfession: 'Plumber',
    workerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    customerId: 'cust-1',
    customerName: 'Aarav Singhal',
    customerPhone: '+91 98711 22334',
    serviceTitle: 'Kitchen Sink Tap Replacement',
    serviceDate: '2026-10-29',
    serviceTime: '10:00 AM',
    address: 'Flat 402, Royale Towers, Indirapuram, Ghaziabad',
    instructions: 'Fitted new swivel mixer tap.',
    estimatedAmount: 500,
    status: 'Completed',
    createdAt: '2026-10-28T14:20:00Z',
    reviewGiven: true,
  }
];

export const initialMessages = [
  {
    id: 'conv-1',
    workerId: 'w-1',
    workerName: 'Rohit Kumar',
    workerProfession: 'Electrician',
    workerAvatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80',
    customerId: 'cust-1',
    customerName: 'Aarav Singhal',
    unreadCount: 1,
    lastUpdated: '10 mins ago',
    messages: [
      { id: 'm-1', sender: 'customer', text: 'Hi Rohit! Can you come by on Thursday for inverter setup?', time: '10:15 AM' },
      { id: 'm-2', sender: 'worker', text: 'Namaste Aarav ji! Yes, 11:00 AM on Thursday works nicely for me.', time: '10:20 AM' },
      { id: 'm-3', sender: 'worker', text: 'Please ensure battery distilled water is ready if it is a lead acid battery.', time: '10:22 AM' }
    ]
  },
  {
    id: 'conv-2',
    workerId: 'w-2',
    workerName: 'Suresh Patel',
    workerProfession: 'Plumber',
    workerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    customerId: 'cust-1',
    customerName: 'Aarav Singhal',
    unreadCount: 0,
    lastUpdated: 'Yesterday',
    messages: [
      { id: 'm-4', sender: 'customer', text: 'Thank you for replacing the sink tap yesterday!', time: 'Yesterday' },
      { id: 'm-5', sender: 'worker', text: 'You are welcome! In case of any drippage, please let me know, there is 30 days service warranty.', time: 'Yesterday' }
    ]
  }
];

export const initialNotifications = [
  {
    id: 'notif-1',
    type: 'booking',
    title: 'Booking Accepted',
    message: 'Rohit Kumar has accepted your booking for Inverter Setup on Nov 12.',
    time: '2 hours ago',
    read: false,
    link: '/bookings'
  },
  {
    id: 'notif-2',
    type: 'proposal',
    title: 'New Job Application',
    message: 'Kavita Sundaram submitted a proposal for "Complete 3BHK Electrical Rewiring".',
    time: '5 hours ago',
    read: false,
    link: '/my-jobs'
  },
  {
    id: 'notif-3',
    type: 'message',
    title: 'New Message from Rohit Kumar',
    message: 'Please ensure battery distilled water is ready if it is a lead acid...',
    time: '10 mins ago',
    read: false,
    link: '/messages'
  },
  {
    id: 'notif-4',
    type: 'system',
    title: 'Profile Verified',
    message: 'Welcome to HireWorker! Your phone number and email are now verified.',
    time: '1 day ago',
    read: true,
    link: '/customer-dashboard'
  }
];

