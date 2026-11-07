import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { Home } from './pages/Home';
import { FindWorkers } from './pages/FindWorkers';
import { WorkerProfile } from './pages/WorkerProfile';
import { PostJob } from './pages/PostJob';
import { MyJobs } from './pages/MyJobs';
import { Bookings } from './pages/Bookings';
import { Messages } from './pages/Messages';
import { Notifications } from './pages/Notifications';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { RegisterWorker } from './pages/RegisterWorker';

// Dashboards
import { CustomerDashboard } from './dashboards/CustomerDashboard';
import { WorkerDashboard } from './dashboards/WorkerDashboard';
import { AdminDashboard } from './dashboards/AdminDashboard';

// Main Application Layout (Wrapped with Navigation Bar and Footer)
const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-surface dark:bg-[#00033D] text-slate-800 dark:text-slate-100 font-sans selection:bg-primary-600 selection:text-white transition-colors duration-200">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
          {/* ========================================================
              1. Entry Gateway (When user visits the site, opens Login)
             ======================================================== */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ========================================================
              2. Main Marketplace Website (With Navbar & Footer)
             ======================================================== */}
          <Route element={<MainLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/find-workers" element={<FindWorkers />} />
            <Route path="/worker/:id" element={<WorkerProfile />} />
            <Route path="/post-job" element={<PostJob />} />
            <Route path="/my-jobs" element={<MyJobs />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/register-worker" element={<RegisterWorker />} />

            {/* Dashboards */}
            <Route path="/customer-dashboard" element={<CustomerDashboard />} />
            <Route path="/worker-dashboard" element={<WorkerDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
  );
}

export default App;
