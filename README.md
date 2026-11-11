# WorkOshop — Skilled Worker Marketplace

**"Find Skilled People. Get Work Done."**

WorkOshop is a full-stack skilled-worker hiring marketplace connecting customers with verified tradespeople and service professionals (Electricians, Plumbers, Carpenters, Painters, Cleaners, Drivers, Mechanics, Construction workers, and more).

---

## Architecture Overview

The project is structured into two dedicated directories:

```
WorkOshoP/
├── frontend/                     # Client Application (React 18, Vite, Tailwind CSS, Lucide React)
│   ├── src/
│   │   ├── components/           # Navbar, Footer, WorkerCard, CategoryCard, ReviewModal, etc.
│   │   ├── pages/                # Login, Home, FindWorkers, WorkerProfile, PostJob, MyJobs, Bookings, Messages, etc.
│   │   ├── dashboards/           # CustomerDashboard, WorkerDashboard, AdminDashboard
│   │   ├── context/              # AuthContext (Role switching, JWT auth, demo accounts)
│   │   ├── services/             # Axios API client (api.js) with fallback to localStorage
│   │   ├── App.jsx               # Entry router (Login gateway at `/` & `/login`, main pages at `/home`, etc.)
│   │   └── main.jsx              # React DOM entry
│   ├── package.json
│   └── vite.config.js            # Reverse proxy `/api` -> `http://localhost:5000`
│
├── backend/                      # Production-ready REST API (Node.js, Express, MongoDB/Mongoose, Socket.io)
│   ├── config/                   # db.js (MongoDB connection with graceful fallback)
│   ├── models/                   # User, WorkerProfile, Job, Booking, Message, Review, Notification
│   ├── controllers/              # Auth, User, Worker, Job, Booking, Message, Review, Notification, Admin
│   ├── routes/                   # authRoutes, workerRoutes, jobRoutes, bookingRoutes, etc.
│   ├── middleware/               # authMiddleware (JWT), roleMiddleware, errorMiddleware, uploadMiddleware
│   ├── utils/                    # generateToken, sendNotification, seeder.js
│   ├── tests/                    # requests.http (API verification tests)
│   ├── server.js                 # Express server with Helmet, CORS, Rate Limit, Socket.io (Port 5000)
│   └── package.json
│
├── package.json                  # Root workspace helper scripts
└── README.md
```

---

## Key Features

1. **Dedicated Login & Registration Gateway (`/` and `/login`)**:
   - Arriving at the website immediately presents the modern split-screen authentication portal.
   - Includes Sign In, Register, 1-Click Google OAuth simulation, Role switching (Customer vs. Worker), and instant 1-Click demo accounts.
   - Guests can click **"Enter Website as Guest"** to immediately explore the marketplace without logging in.

2. **Worker Profile & Smart Recommendations**:
   - Detailed profiles with hourly rates, verified badge, skills, gallery photos, and customer reviews.
   - **"Other Skilled Workers You May Like"**: Automatically suggests matching workers at the bottom of the profile.

3. **Service Discovery & Filtering**:
   - Live search by profession, location, category, experience, rating, price range, and verification status.

4. **Job Posting & Booking System**:
   - Customers can post service requests with budgets and deadlines.
   - Workers receive instant job alerts and can submit proposals.
   - Direct booking flow with date, time, address, and live status tracking (*Pending*, *Accepted*, *In Progress*, *Completed*).

5. **Security & Performance**:
   - JWT token authentication with bcrypt password hashing.
   - Role-Based Access Control (Customer, Worker, Admin).
   - Helmet security headers, CORS protection, rate-limiting, and sanitized inputs.

---

## How to Run

### Quick Start (From Root Workspace)

1. **Start the Backend Server (Port 5000):**
   ```powershell
   npm run dev:backend
   ```

2. **Start the Frontend Application (Port 3000):**
   ```powershell
   npm run dev:frontend
   ```

3. Open **`http://localhost:3000`** in your browser to view the login gateway.

---

### Seeding Test Data (Optional)

If you have a local MongoDB service running:
```powershell
npm run seed:backend
```
*Note: If MongoDB is not running locally, the frontend seamlessly uses its built-in interactive offline dataset.*
