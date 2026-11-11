import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import User from '../models/User.js';
import WorkerProfile from '../models/WorkerProfile.js';
import Job from '../models/Job.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import Notification from '../models/Notification.js';
import { connectDB } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const seedAll = async () => {
  try {
    const connected = await connectDB();
    if (!connected) {
      console.error('Seeder aborted: MongoDB is not connected. Check MONGO_URI in backend/.env.');
      process.exit(1);
    }
    console.log('Seeding WorkOshop MongoDB database...');

    // Clear existing collections
    await User.deleteMany();
    await WorkerProfile.deleteMany();
    await Job.deleteMany();
    await Booking.deleteMany();
    await Review.deleteMany();
    await Notification.deleteMany();

    // 1. Create Admin
    const admin = await User.create({
      name: 'Vikramaditya (Admin)',
      email: 'admin@workoshop.com',
      phone: '+91 99999 88888',
      password: 'password123',
      role: 'admin',
      isVerified: true,
      city: 'New Delhi',
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    });

    // 2. Create Customers
    const customer1 = await User.create({
      name: 'Aarav Singhal',
      email: 'aarav.singhal@example.com',
      phone: '+91 98711 22334',
      password: 'password123',
      role: 'customer',
      isVerified: true,
      city: 'New Delhi',
      profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    });

    const customer2 = await User.create({
      name: 'Priya Verma',
      email: 'priya.v@example.com',
      phone: '+91 98111 55667',
      password: 'password123',
      role: 'customer',
      isVerified: true,
      city: 'Mumbai',
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    });

    // 3. Create Workers
    const workerUser1 = await User.create({
      name: 'Rohit Kumar',
      email: 'rohit.kumar@example.com',
      phone: '+91 98765 43210',
      password: 'password123',
      role: 'worker',
      isVerified: true,
      city: 'Guwahati',
      profileImage: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80',
    });

    await WorkerProfile.create({
      userId: workerUser1._id,
      profession: 'Electrician',
      category: 'electrician',
      verificationStatus: 'verified',
      averageRating: 4.8,
      totalReviews: 124,
      experience: '5+ Years',
      experienceYears: 5,
      hourlyRate: 300,
      dailyRate: 2200,
      location: 'Guwahati, Assam, India',
      city: 'Guwahati',
      coordinates: { lat: 26.1445, lng: 91.7362 },
      geoLocation: { type: 'Point', coordinates: [91.7362, 26.1445] },
      isOnline: true,
      locationSharingEnabled: true,
      lastLocationUpdatedAt: new Date(),
      availability: 'Available Now',
      isAvailable: true,
      skills: ['Circuit Breakers', 'Home Rewiring', 'Inverter Setup', 'Smart Home Automation', 'MCB Installation', 'Short Circuit Detection'],
      languages: ['Hindi', 'English', 'Punjabi'],
      education: 'Diploma in Electrical Engineering - ITI Pusa, New Delhi (2019)',
      certifications: ['Govt. Certified Wireman License Grade A', 'Schneider Electric Certified Specialist'],
      about: 'I am a certified master electrician with over 5 years of hands-on experience handling everything from minor short-circuit troubleshooting to entire home rewiring, solar setup, and heavy commercial switchboard maintenance.',
      tagline: 'Certified Master Electrician with 5+ years expertise in residential & commercial systems.',
      completedJobs: 342,
      responseRate: '98%',
      portfolioImages: [
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
      ],
      services: [
        { id: 's-1', title: 'Complete House Wiring Inspection', price: 600, duration: '2 hours', description: 'Comprehensive check of all MCBs and earthing.' },
        { id: 's-2', title: 'Inverter & Battery Setup', price: 500, duration: '1.5 hours', description: 'Mounting and load separation.' },
      ],
    });

    const workerUser2 = await User.create({
      name: 'Suresh Patel',
      email: 'suresh.plumb@example.com',
      phone: '+91 98111 22334',
      password: 'password123',
      role: 'worker',
      isVerified: true,
      city: 'Mumbai',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    });

    await WorkerProfile.create({
      userId: workerUser2._id,
      profession: 'Plumber',
      category: 'plumber',
      verificationStatus: 'verified',
      averageRating: 4.9,
      totalReviews: 98,
      experience: '7+ Years',
      experienceYears: 7,
      hourlyRate: 350,
      dailyRate: 2400,
      location: 'Mumbai, Maharashtra',
      city: 'Mumbai',
      coordinates: { lat: 19.076, lng: 72.8777 },
      geoLocation: { type: 'Point', coordinates: [72.8777, 19.076] },
      isOnline: true,
      locationSharingEnabled: true,
      lastLocationUpdatedAt: new Date(),
      availability: 'Available Now',
      isAvailable: true,
      skills: ['Concealed Leakage Detection', 'Bathroom Fitting', 'Water Heater / Geyser', 'Drainage Unclogging'],
      languages: ['Hindi', 'Marathi', 'English', 'Gujarati'],
      education: 'Vocational Certification in Plumbing & Sanitary Engineering (ITI Mumbai)',
      certifications: ['Jaquar Certified Sanitary Technician'],
      about: 'Over 7 years of specialized plumbing expertise across residential high-rises and bungalows.',
      tagline: 'Expert sanitary & pipeline plumbing with modern leak detection technology.',
      completedJobs: 412,
      responseRate: '99%',
      portfolioImages: [
        'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&auto=format&fit=crop&q=80',
      ],
      services: [
        { id: 's-5', title: 'Major Leakage Detection & Repair', price: 750, duration: '2 hours', description: 'Thermal camera check without breaking tiles.' },
      ],
    });

    const workerUser3 = await User.create({
      name: 'Manish Vishwakarma',
      email: 'manish.wood@example.com',
      phone: '+91 97222 33445',
      password: 'password123',
      role: 'worker',
      isVerified: true,
      city: 'Bengaluru',
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    });

    await WorkerProfile.create({
      userId: workerUser3._id,
      profession: 'Carpenter',
      category: 'carpenter',
      verificationStatus: 'verified',
      averageRating: 4.7,
      totalReviews: 86,
      experience: '8+ Years',
      experienceYears: 8,
      hourlyRate: 400,
      dailyRate: 2800,
      location: 'Bengaluru, Karnataka',
      city: 'Bengaluru',
      coordinates: { lat: 12.9716, lng: 77.5946 },
      geoLocation: { type: 'Point', coordinates: [77.5946, 12.9716] },
      isOnline: false,
      locationSharingEnabled: false,
      availability: 'Available Tomorrow',
      isAvailable: false,
      skills: ['Modular Kitchen Assembly', 'Hydraulic Bed Repair', 'Door & Window Hinges', 'Godrej Lock Fitting'],
      languages: ['Hindi', 'Kannada', 'English'],
      about: 'Passionate wood artisan with 8 years of experience in furniture assembly and cabinetry.',
      tagline: 'Custom wooden furniture, modular kitchen repair & fine door locking mechanisms.',
      completedJobs: 289,
      responseRate: '95%',
      portfolioImages: [
        'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&auto=format&fit=crop&q=80',
      ],
    });

    // 4. Create Sample Jobs
    await Job.create({
      customerId: customer1._id,
      title: 'Complete 3BHK Electrical Rewiring & DB Board Setup',
      category: 'electrician',
      categoryName: 'Electrician',
      description: 'Looking for a certified electrician to replace 20-year-old copper wiring and setup earthing.',
      location: 'Indirapuram, Ghaziabad (Delhi NCR)',
      budget: 8500,
      paymentType: 'Fixed Price',
      requiredExperience: '5+ Years',
      preferredDate: '2026-11-15',
      status: 'Open',
      applications: [
        {
          workerId: workerUser1._id,
          workerName: workerUser1.name,
          bidAmount: 8000,
          message: 'I can complete this with Havells FRLS wires and Schneider MCBs.',
        },
      ],
    });

    // 5. Create Sample Bookings
    const booking1 = await Booking.create({
      bookingNumber: 'HW-BK-2026-001',
      customerId: customer1._id,
      workerId: workerUser1._id,
      serviceTitle: 'Inverter & Battery Setup + Load Check',
      serviceDate: '2026-11-12',
      serviceTime: '11:00 AM',
      location: 'Flat 402, Royale Towers, Indirapuram, Ghaziabad',
      instructions: 'Please bring testing meter and extra copper lugs if possible.',
      amount: 900,
      status: 'Accepted',
    });

    const booking2 = await Booking.create({
      bookingNumber: 'HW-BK-2026-002',
      customerId: customer1._id,
      workerId: workerUser2._id,
      serviceTitle: 'Kitchen Sink Tap Replacement',
      serviceDate: '2026-10-29',
      serviceTime: '10:00 AM',
      location: 'Flat 402, Royale Towers, Indirapuram, Ghaziabad',
      instructions: 'Fitted new swivel mixer tap.',
      amount: 500,
      status: 'Completed',
      reviewed: true,
    });

    // 6. Create Sample Review
    await Review.create({
      customerId: customer1._id,
      workerId: workerUser2._id,
      bookingId: booking2._id,
      rating: 5,
      comment: 'Suresh arrived quickly and fixed the kitchen tap seamlessly without any water damage.',
    });

    // 7. Create Sample Notification
    await Notification.create({
      userId: customer1._id,
      title: 'Booking Accepted',
      message: 'Rohit Kumar has accepted your booking for Inverter Setup on Nov 12.',
      type: 'booking',
      link: '/bookings',
    });

    console.log('WorkOshop Database successfully seeded!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedAll();

