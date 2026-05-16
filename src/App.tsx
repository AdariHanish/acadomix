import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { initializeStorage } from './utils/storage';

// Pages
import HomePage from './pages/HomePage';
import ReviewPage from './pages/ReviewPage';
import PaymentPage from './pages/PaymentPage';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminReviews from './pages/admin/AdminReviews';
import AdminPayments from './pages/admin/AdminPayments';
import AdminProjects from './pages/admin/AdminProjects';
import AdminLeads from './pages/admin/AdminLeads';
import AdminAssets from './pages/admin/AdminAssets';
import AdminSettings from './pages/admin/AdminSettings';
import ProjectsPage from './pages/ProjectsPage';


export default function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/reviews" element={<ReviewPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/projects" element={<ProjectsPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="leads" element={<AdminLeads />} />
          <Route path="assets" element={<AdminAssets />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
