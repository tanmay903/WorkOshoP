export const categories = [
  { id: 'electrician', name: 'Electrician', tagline: 'Wiring, fixtures, repairs & installations', icon: 'Zap', count: 24 },
  { id: 'plumber', name: 'Plumber', tagline: 'Pipes, leakage, taps & bathroom fitting', icon: 'Wrench', count: 19 },
  { id: 'carpenter', name: 'Carpenter', tagline: 'Furniture repair, woodwork & assembly', icon: 'Hammer', count: 15 },
  { id: 'painter', name: 'Painter', tagline: 'Interior, exterior & waterproofing', icon: 'Paintbrush', count: 18 },
  { id: 'cleaner', name: 'Cleaner', tagline: 'Deep home cleaning, sofa & sanitization', icon: 'Sparkles', count: 32 },
  { id: 'driver', name: 'Driver', tagline: 'Personal, commercial & outstation chauffeurs', icon: 'Car', count: 14 },
  { id: 'mechanic', name: 'Mechanic', tagline: 'Two-wheeler, car & machinery repairs', icon: 'Cog', count: 16 },
  { id: 'helper', name: 'Helper', tagline: 'Moving, loading, garden & household aid', icon: 'Users', count: 27 },
  { id: 'construction', name: 'Construction Worker', tagline: 'Masonry, tiling, concrete & renovation', icon: 'HardHat', count: 21 },
  { id: 'more-services', name: 'More Services', tagline: 'AC Repair, Pest Control, Welding & more', icon: 'Grid', count: 45 },
];

export const workers = [
  {
    id: 'w-1',
    name: 'Rohit Kumar',
    profession: 'Electrician',
    category: 'electrician',
    verified: true,
    rating: 4.8,
    reviewsCount: 124,
    experience: '5+ Years',
    experienceYears: 5,
    hourlyRate: 300,
    dailyRate: 2200,
    location: 'New Delhi, India',
    city: 'New Delhi',
    distance: '2.4 km away',
    availability: 'Available Now',
    isAvailable: true,
    phone: '+91 98765 43210',
    email: 'rohit.kumar@example.com',
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200&auto=format&fit=crop&q=80',
    tagline: 'Certified Master Electrician with 5+ years expertise in residential & commercial systems.',
    about: 'I am a certified master electrician with over 5 years of hands-on experience handling everything from minor short-circuit troubleshooting to entire home rewiring, solar setup, and heavy commercial switchboard maintenance.',
    skills: ['Circuit Breakers', 'Home Rewiring', 'Inverter Setup', 'Smart Home Automation', 'MCB Installation', 'Short Circuit Detection'],
    languages: ['Hindi', 'English', 'Punjabi'],
    education: 'Diploma in Electrical Engineering - ITI Pusa, New Delhi (2019)',
    certifications: ['Govt. Certified Wireman License Grade A', 'Schneider Electric Certified Specialist'],
    completedJobs: 342,
    responseRate: '98%',
    services: [
      { id: 's-1', title: 'Complete House Wiring Inspection', price: 600, duration: '2 hours', description: 'Comprehensive check of all MCBs, earthing, load testing.' },
      { id: 's-2', title: 'Inverter & Battery Setup', price: 500, duration: '1.5 hours', description: 'Mounting, copper connection, and load separation.' },
      { id: 's-3', title: 'Ceiling Fan & Light Fixture Installation', price: 200, duration: '45 mins', description: 'Precision mounting with concealed wiring.' }
    ],
    reviews: [
      { id: 'r-1', customerName: 'Amit Sharma', rating: 5, date: '2026-10-28', comment: 'Rohit arrived within 30 minutes! Diagnosed our living room trip issue immediately.' },
      { id: 'r-2', customerName: 'Priya Verma', rating: 5, date: '2026-10-14', comment: 'Did entire 3BHK LED profile light setup. Very clean work!' }
    ]
  },
  {
    id: 'w-2',
    name: 'Suresh Patel',
    profession: 'Plumber',
    category: 'plumber',
    verified: true,
    rating: 4.9,
    reviewsCount: 98,
    experience: '7+ Years',
    experienceYears: 7,
    hourlyRate: 350,
    dailyRate: 2400,
    location: 'Mumbai, Maharashtra',
    city: 'Mumbai',
    distance: '3.1 km away',
    availability: 'Available Now',
    isAvailable: true,
    phone: '+91 98111 22334',
    email: 'suresh.plumb@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=1200&auto=format&fit=crop&q=80',
    tagline: 'Expert sanitary & pipeline plumbing with modern leak detection technology.',
    about: 'Over 7 years of specialized plumbing expertise across residential high-rises and bungalows.',
    skills: ['Concealed Leakage Detection', 'Bathroom Fitting', 'Water Heater / Geyser', 'Drainage Unclogging'],
    languages: ['Hindi', 'Marathi', 'English', 'Gujarati'],
    services: [
      { id: 's-5', title: 'Major Leakage Detection & Repair', price: 750, duration: '2 hours', description: 'Pressure test & sensor check without breaking tiles.' },
      { id: 's-6', title: 'Complete Sanitary Fitting Set', price: 1200, duration: '4 hours', description: 'Wall-hung commode, diverters, shower panels.' }
    ],
    reviews: [
      { id: 'r-4', customerName: 'Deepak Mehta', rating: 5, date: '2026-11-01', comment: 'Solved our bathroom seepage without tearing down the wall.' }
    ]
  },
  {
    id: 'w-3',
    name: 'Manish Vishwakarma',
    profession: 'Carpenter',
    category: 'carpenter',
    verified: true,
    rating: 4.7,
    reviewsCount: 86,
    experience: '8+ Years',
    experienceYears: 8,
    hourlyRate: 400,
    dailyRate: 2800,
    location: 'Bengaluru, Karnataka',
    city: 'Bengaluru',
    distance: '4.0 km away',
    availability: 'Available Tomorrow',
    isAvailable: false,
    phone: '+91 97222 33445',
    email: 'manish.wood@example.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=1200&auto=format&fit=crop&q=80',
    tagline: 'Custom wooden furniture, modular kitchen repair & fine door locking mechanisms.',
    about: 'Passionate wood artisan with 8 years of experience in furniture assembly and cabinetry.',
    skills: ['Modular Kitchen Assembly', 'Hydraulic Bed Repair', 'Door & Window Hinges', 'Godrej Lock Fitting'],
    languages: ['Hindi', 'Kannada', 'English'],
    services: [
      { id: 's-8', title: 'Modular Furniture Assembly', price: 800, duration: '3 hours', description: 'Flatpack assembly.' }
    ],
    reviews: []
  }
];

export const jobs = [
  {
    id: 'job-1',
    title: 'Complete 3BHK Electrical Rewiring & DB Board Setup',
    category: 'electrician',
    categoryName: 'Electrician',
    description: 'Looking for a certified electrician to replace copper wiring and setup earthing.',
    budget: 8500,
    paymentType: 'Fixed Price',
    experienceRequired: '5+ Years',
    preferredDate: '2026-11-15',
    location: 'Indirapuram, Ghaziabad (Delhi NCR)',
    status: 'Open',
    postedDate: '2026-11-05',
    customerId: 'cust-1',
    customerName: 'Aarav Singhal',
    customerPhone: '+91 98711 22334',
    customerEmail: 'aarav.s@example.com',
    applicationsCount: 4,
    proposals: [
      { workerId: 'w-1', workerName: 'Rohit Kumar', bidAmount: 8000, date: '2026-11-06', message: 'I can complete this with Havells FRLS wires.' }
    ]
  }
];

export const bookings = [
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
    status: 'Accepted',
    createdAt: '2026-11-06T10:30:00Z',
  }
];

