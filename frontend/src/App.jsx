import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { ErrorBoundary } from './components/ErrorBoundary';

// Pages
import { Home } from './pages/Home';
import { FindWorkers } from './pages/FindWorkers';
import { NearbyWorkers } from './pages/NearbyWorkers';
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

// Worker Pages
import { AvailableWorks } from './pages/worker/AvailableWorks';
import { WorkerBookings } from './pages/worker/WorkerBookings';
import { UploadCertificates } from './pages/worker/UploadCertificates';
import { WorkerMyProfile } from './pages/worker/WorkerMyProfile';

// Admin Pages
import { AdminVerifications } from './pages/admin/AdminVerifications';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminBookings } from './pages/admin/AdminBookings';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';

const RoleRoute = ({ requiredRole, children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user || user.role !== requiredRole) {
    const message =
      requiredRole === 'worker'
        ? 'Please log in with a Worker account first to switch to the Worker Profile.'
        : 'Admin authentication is required to access the Admin Console.';

    return (
      <Navigate
        to={`/login?role=${requiredRole}`}
        replace
        state={{
          from: location.pathname,
          requiredRole,
          message,
        }}
      />
    );
  }

  return children;
};

// Main Application Layout (Wrapped with Navigation Bar and Footer)
const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-slate-800 font-sans selection:bg-primary-600 selection:text-white">
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
    <AuthProvider>
      <LocationProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <ScrollToTop />
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
            <Route path="/nearby-workers" element={<NearbyWorkers />} />
            <Route path="/worker/:id" element={<WorkerProfile />} />
            <Route path="/post-job" element={<PostJob />} />
            <Route path="/my-jobs" element={<MyJobs />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/register-worker" element={<RegisterWorker />} />

            {/* Dashboards */}
            <Route path="/customer-dashboard" element={<CustomerDashboard />} />
            <Route path="/worker-dashboard" element={<RoleRoute requiredRole="worker"><WorkerDashboard /></RoleRoute>} />
            <Route path="/admin" element={<RoleRoute requiredRole="admin"><AdminDashboard /></RoleRoute>} />

            {/* Worker Site Specific Pages */}
            <Route path="/available-works" element={<RoleRoute requiredRole="worker"><AvailableWorks /></RoleRoute>} />
            <Route path="/worker/bookings" element={<RoleRoute requiredRole="worker"><WorkerBookings /></RoleRoute>} />
            <Route path="/worker/certificates" element={<RoleRoute requiredRole="worker"><UploadCertificates /></RoleRoute>} />
            <Route path="/worker/my-profile" element={<RoleRoute requiredRole="worker"><WorkerMyProfile /></RoleRoute>} />

            {/* Admin Site Specific Pages */}
            <Route path="/admin/verifications" element={<RoleRoute requiredRole="admin"><AdminVerifications /></RoleRoute>} />
            <Route path="/admin/users" element={<RoleRoute requiredRole="admin"><AdminUsers /></RoleRoute>} />
            <Route path="/admin/bookings" element={<RoleRoute requiredRole="admin"><AdminBookings /></RoleRoute>} />
            <Route path="/admin/analytics" element={<RoleRoute requiredRole="admin"><AdminAnalytics /></RoleRoute>} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </ErrorBoundary>
        </BrowserRouter>
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;
