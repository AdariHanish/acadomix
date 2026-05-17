import React, { Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppleLoader from './components/AppleLoader';

// Lazy loaded Pages
const HomePage = React.lazy(() => import('./pages/HomePage'));
const ReviewPage = React.lazy(() => import('./pages/ReviewPage'));
const PaymentPage = React.lazy(() => import('./pages/PaymentPage'));
const ProjectsPage = React.lazy(() => import('./pages/ProjectsPage'));

// Lazy loaded Admin Pages
const AdminLogin = React.lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout = React.lazy(() => import('./pages/admin/AdminLayout'));
const Dashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const AdminReviews = React.lazy(() => import('./pages/admin/AdminReviews'));
const AdminPayments = React.lazy(() => import('./pages/admin/AdminPayments'));
const AdminProjects = React.lazy(() => import('./pages/admin/AdminProjects'));
const AdminLeads = React.lazy(() => import('./pages/admin/AdminLeads'));
const AdminAssets = React.lazy(() => import('./pages/admin/AdminAssets'));
const AdminSettings = React.lazy(() => import('./pages/admin/AdminSettings'));

export default function App() {
  return (
    <HashRouter>
      <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center bg-black"><AppleLoader /></div>}>
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
      </Suspense>
    </HashRouter>
  );
}
