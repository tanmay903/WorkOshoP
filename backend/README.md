# WorkOshop Enterprise Backend

Scalable, secure, and production-ready Node.js, Express, and MongoDB backend for **WorkOshop** ("Find Skilled People. Get Work Done.").

---

## 1. Technology Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js 4.x
- **Database:** MongoDB with Mongoose 8.x ODM
- **Authentication:** JWT (JSON Web Tokens), bcryptjs password hashing, role-based authorization
- **Security:** Helmet, CORS, Express-Rate-Limit, Express-Validator
- **Media Uploads:** Multer with Cloudinary integration
- **Real-Time Engine:** Socket.IO 4.x for real-time messaging, typing indicators, and alerts

---

## 2. Directory Structure

```
backend/
├── config/
│   ├── db.js                   # Mongoose MongoDB connection
│   └── cloudinary.js           # Cloudinary configuration
│
├── controllers/
│   ├── authController.js       # Customer/Worker signup, login, logout, password reset
│   ├── userController.js       # User profile management
│   ├── workerController.js     # Worker search, filtering, rates, portfolio & availability
│   ├── jobController.js        # Job posting, proposals, and contractor acceptance
│   ├── bookingController.js    # Multi-step booking lifecycle management
│   ├── messageController.js    # Chat history, threads & direct messaging
│   ├── reviewController.js     # Verified reviews & automatic rating calculations
│   ├── notificationController.js # Alerts and status notifications
│   └── adminController.js      # Platform metrics, KYC badge verification & moderation
│
├── models/
│   ├── User.js                 # Customer, Worker, Admin accounts
│   ├── WorkerProfile.js        # Tradesperson rates, skills, location, portfolio & stats
│   ├── Job.js                  # Job posts and worker applications
│   ├── Booking.js              # Scheduled appointments & lifecycle status
│   ├── Message.js              # Private messages & conversation records
│   ├── Review.js               # 5-star rating & reviews for completed bookings
│   └── Notification.js         # In-app notification documents
│
├── routes/
│   ├── authRoutes.js           # /api/auth
│   ├── userRoutes.js           # /api/users
│   ├── workerRoutes.js         # /api/workers
│   ├── jobRoutes.js            # /api/jobs
│   ├── bookingRoutes.js        # /api/bookings
│   ├── messageRoutes.js        # /api/messages
│   ├── reviewRoutes.js         # /api/reviews
│   ├── notificationRoutes.js   # /api/notifications
│   └── adminRoutes.js          # /api/admin
│
├── middleware/
│   ├── authMiddleware.js       # JWT extraction & user authentication
│   ├── roleMiddleware.js       # Role-based access control (RBAC)
│   ├── errorMiddleware.js      # Global error & 404 handler
│   └── uploadMiddleware.js     # Multer file upload validation
│
├── utils/
│   ├── generateToken.js        # JWT signing & HTTP-only cookies
│   ├── sendNotification.js     # Unified database + Socket.io notification dispatch
│   └── seeder.js               # Database seeding utility
│
├── uploads/                    # Local storage directory for media uploads
├── server.js                   # HTTP Server & Socket.IO initialization
├── package.json
└── .env.example
```

---

## 3. Database Schema Design (Mongoose)

### `User`
- `name`: String
- `email`: String (unique)
- `phone`: String
- `password`: String (bcrypt hashed)
- `profileImage`: String URL
- `role`: `'customer'` | `'worker'` | `'admin'`
- `isVerified`: Boolean
- `isActive`: Boolean
- `city`: String

### `WorkerProfile`
- `userId`: Ref to `User`
- `profession`: e.g. `'Electrician'`, `'Plumber'`, `'Carpenter'`
- `skills`: Array of Strings
- `experience`: String (e.g. `'5+ Years'`)
- `experienceYears`: Number
- `hourlyRate`: Number
- `dailyRate`: Number
- `location`: String & `city`
- `coordinates`: `{ lat, lng }`
- `languages`: Array of Strings
- `about`: String bio
- `tagline`: String summary
- `portfolioImages`: Array of Strings
- `availability`: `'Available Now'` | `'Available Tomorrow'` | `'Currently Busy'`
- `averageRating`: Number (1.0 to 5.0)
- `totalReviews`: Number
- `verificationStatus`: `'pending'` | `'verified'` | `'rejected'`
- `education`: String
- `workExperience`: Array of `{ title, company, duration, description }`
- `certifications`: Array of Strings
- `services`: Array of `{ id, title, price, duration, description }`

### `Job`
- `customerId`: Ref to `User`
- `title`, `category`, `description`, `location`
- `budget`: Number
- `paymentType`: `'Fixed Price'` | `'Hourly Rate'`
- `requiredExperience`: String
- `preferredDate`: String
- `status`: `'Open'` | `'Applications Received'` | `'In Progress'` | `'Completed'` | `'Cancelled'`
- `applications`: Array of worker bids

### `Booking`
- `bookingNumber`: e.g. `'HW-BK-2026-001'`
- `customerId`: Ref to `User`
- `workerId`: Ref to `User`
- `jobId`: Ref to `Job` (optional)
- `serviceTitle`, `serviceDate`, `serviceTime`, `location`, `instructions`
- `amount`: Number
- `status`: `'Pending'` | `'Accepted'` | `'Rejected'` | `'In Progress'` | `'Completed'` | `'Cancelled'`
- `reviewed`: Boolean

### `Review`
- `customerId`: Ref to `User`
- `workerId`: Ref to `User`
- `bookingId`: Ref to `Booking` (unique, ensures 1 review per booking)
- `rating`: Number (1 to 5)
- `comment`: String

### `Message`
- `senderId`: Ref to `User`
- `receiverId`: Ref to `User`
- `conversationId`: String
- `message`: String
- `messageType`: `'text'` | `'image'` | `'file'`
- `isRead`: Boolean

### `Notification`
- `userId`: Ref to `User`
- `title`: String
- `message`: String
- `type`: `'booking'` | `'job'` | `'message'` | `'review'` | `'verification'`
- `link`: String
- `isRead`: Boolean

---

## 4. API Endpoints

### Authentication (`/api/auth`)
- `POST /register-customer` &mdash; Create customer account
- `POST /register-worker` &mdash; Create worker profile with trade details
- `POST /login` &mdash; Sign in & retrieve JWT
- `POST /logout` &mdash; Clear session cookie
- `GET /me` &mdash; Get current user profile (protected)
- `POST /forgot-password` &mdash; Generate password reset token
- `PUT /reset-password/:token` &mdash; Reset password
- `PUT /change-password` &mdash; Change password (protected)

### Workers (`/api/workers`)
- `GET /` &mdash; Filter and search workers (`?q=`, `?loc=`, `?category=`, `?minRating=`, `?maxPrice=`, `?verifiedOnly=`, `?availableOnly=`, `?sortBy=`, `?page=`, `?limit=`)
- `GET /:id` &mdash; Detailed worker profile with reviews
- `POST /profile` &mdash; Update my worker profile (worker)
- `PUT /availability` &mdash; Toggle instant availability status (worker)
- `POST /portfolio-images` &mdash; Upload up to 8 portfolio images (multer)
- `DELETE /:id` &mdash; Delete profile (admin or owner)

### Jobs (`/api/jobs`)
- `GET /` &mdash; List jobs
- `POST /` &mdash; Post a new job (customer)
- `GET /my-jobs` &mdash; Get jobs posted by logged-in customer
- `GET /:id` &mdash; Get job details and applications
- `PUT /:id` &mdash; Update job
- `DELETE /:id` &mdash; Delete job
- `POST /:id/apply` &mdash; Apply for job with bid amount & message (worker)
- `PUT /:id/applications/:appId/accept` &mdash; Accept worker bid (customer)

### Bookings (`/api/bookings`)
- `POST /` &mdash; Create a booking (customer)
- `GET /` &mdash; List my bookings (role-aware)
- `GET /:id` &mdash; Booking details
- `PUT /:id/status` &mdash; Update status (`Accepted`, `Rejected`, `In Progress`, `Completed`, `Cancelled`)

### Messaging (`/api/messages`)
- `GET /` &mdash; Get active conversation threads with unread counts
- `GET /:conversationId` &mdash; Get conversation message history
- `POST /` &mdash; Send a direct message

### Reviews (`/api/reviews`)
- `POST /` &mdash; Submit review (enforces completed booking check & calculates average rating)
- `GET /worker/:workerId` &mdash; Get reviews for worker

### Notifications (`/api/notifications`)
- `GET /` &mdash; Get notifications
- `PUT /mark-read` &mdash; Mark all as read
- `PUT /:id/read` &mdash; Mark single notification as read

### Admin Portal (`/api/admin`)
- `GET /stats` &mdash; Platform-wide business and operational metrics
- `GET /users` &mdash; List all platform users with filtering
- `PUT /workers/:id/verify` &mdash; Grant or revoke KYC verified badge
- `PUT /users/:id/toggle-status` &mdash; Activate or suspend account

---

## 5. Socket.IO Real-Time Events

- `join_user (userId)`: Registers socket in user's notification room
- `join_conversation (conversationId)`: Joins active chat room
- `send_chat_message (payload)`: Emits message to conversation participants
- `receive_chat_message`: Delivers message to active chat window
- `new_message_notification`: Pushes in-app message popup
- `new_notification`: Dispatches booking or system notification
- `typing` / `stop_typing`: Real-time user typing indicator
- `online_users`: Broadcasts currently active user IDs

---

## 6. How to Run

### Development Mode
```powershell
# From root directory:
npm run dev:backend

# Or from backend folder:
cd backend
npm run dev
```

### Seed Database
```powershell
npm run seed:backend
```
Populates MongoDB with admin, customer, worker accounts (Rohit Kumar, Suresh Patel, Manish Vishwakarma), jobs, bookings, and reviews.

