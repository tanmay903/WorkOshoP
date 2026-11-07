# HireWorker — Full-Stack Skilled Worker Marketplace

**"Find Skilled People. Get Work Done."**

The project has been separated into clean, modular **Frontend** and **Backend** directories.

---

## Project Structure

```
WorkOshoP/
├── frontend/                     # Client application (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/           # Reusable UI components (Navbar, WorkerCard, CategoryCard, etc.)
│   │   ├── pages/                # Main pages (Home, FindWorkers, WorkerProfile, PostJob, MyJobs, etc.)
│   │   ├── dashboards/           # Role dashboards (CustomerDashboard, WorkerDashboard, AdminDashboard)
│   │   ├── context/              # Authentication & persona state (AuthContext.jsx)
│   │   ├── services/             # Backend API client integration (api.js)
│   │   ├── data/                 # Rich fallback dataset & categories
│   │   ├── utils/                # LocalStorage persistent fallback (storage.js)
│   │   ├── App.jsx               # Routes setup
│   │   ├── main.jsx              # App entry point
│   │   └── index.css             # Tailwind base styles
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/                      # REST API Server (Node.js + Express)
│   ├── src/
│   │   ├── routes/
│   │   │   ├── workers.js        # Worker discovery, search, filters & reviews
│   │   │   ├── jobs.js           # Customer job postings & bids
│   │   │   ├── bookings.js       # Service scheduling & status progression
│   │   │   ├── messages.js       # In-app messaging & chat history
│   │   │   ├── notifications.js  # System & order alerts
│   │   │   ├── auth.js           # Authentication & registrations
│   │   │   └── categories.js     # Skilled service categories
│   │   ├── data/
│   │   │   ├── seedData.js       # Seed dataset
│   │   │   └── db.js             # Data store engine
│   │   └── server.js             # Express app entry point (port 5000)
│   └── package.json
│
├── package.json                  # Root workspace helper scripts
└── README.md
```

---

## How to Run

### Option A: Run From Root Workspace

1. **Start the Backend API Server:**
   ```powershell
   npm run dev:backend
   ```
   Runs Express on **`http://localhost:5000`** with live reload.

2. **In a separate terminal, start the Frontend App:**
   ```powershell
   npm run dev:frontend
   ```
   Runs Vite on **`http://localhost:3000`**.

---

### Option B: Run From Individual Directories

#### 1. Backend Server
```powershell
cd backend
npm start
```

#### 2. Frontend Application
```powershell
cd frontend
npm run dev
```

---

## API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/workers` | Discover workers with filters (`?q=`, `?loc=`, `?category=`, `?verified=`, `?minRating=`) |
| `GET` | `/api/workers/:id` | Detailed worker profile |
| `POST` | `/api/workers/:id/reviews` | Submit a customer rating and review |
| `GET` | `/api/jobs` | Get job postings (`?status=`) |
| `POST` | `/api/jobs` | Post a new job requirement |
| `GET` | `/api/bookings` | List all scheduled bookings |
| `POST` | `/api/bookings` | Book a service slot |
| `PUT` | `/api/bookings/:id/status` | Update booking status (*Accepted*, *In Progress*, *Completed*) |
| `GET` | `/api/messages` | Conversation threads |
| `POST` | `/api/messages/:convId` | Send a chat message |
| `GET` | `/api/categories` | Service categories |
