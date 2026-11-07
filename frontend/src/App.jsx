import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-surface text-slate-800 font-sans selection:bg-primary-500 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/find-workers" element={<FindWorkers />} />
              <Route path="/worker/:id" element={<WorkerProfile />} />
              <Route path="/post-job" element={<PostJob />} />
              <Route path="/my-jobs" element={<MyJobs />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/register-worker" element={<RegisterWorker />} />

              {/* Dashboards */}
              <Route path="/customer-dashboard" element={<CustomerDashboard />} />
              <Route path="/worker-dashboard" element={<WorkerDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

