import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import AppleLoader from './AppleLoader';
import { useNavigationHistory } from '../context/NavigationHistoryContext';

// Lazy pages
const HomePage      = React.lazy(() => import('../pages/HomePage'));
const ReviewPage    = React.lazy(() => import('../pages/ReviewPage'));
const PaymentPage   = React.lazy(() => import('../pages/PaymentPage'));
const ProjectsPage  = React.lazy(() => import('../pages/ProjectsPage'));

const AdminLogin     = React.lazy(() => import('../pages/admin/AdminLogin'));
const AdminLayout    = React.lazy(() => import('../pages/admin/AdminLayout'));
const Dashboard      = React.lazy(() => import('../pages/admin/Dashboard'));
const AdminReviews   = React.lazy(() => import('../pages/admin/AdminReviews'));
const AdminPayments  = React.lazy(() => import('../pages/admin/AdminPayments'));
const AdminProjects  = React.lazy(() => import('../pages/admin/AdminProjects'));
const AdminLeads     = React.lazy(() => import('../pages/admin/AdminLeads'));
const AdminCustomers = React.lazy(() => import('../pages/admin/AdminCustomers'));
const AdminAssets    = React.lazy(() => import('../pages/admin/AdminAssets'));
const AdminSettings  = React.lazy(() => import('../pages/admin/AdminSettings'));
const AdminIDCards   = React.lazy(() => import('../pages/admin/AdminIDCards'));
const AdminOffers    = React.lazy(() => import('../pages/admin/AdminOffers'));
const AdminDatabase  = React.lazy(() => import('../pages/admin/AdminDatabase'));

/** Slide distance (vw) — small value = subtle, fast feel */
const SLIDE = 22;

const variants = {
  enter: (dir: 'forward' | 'back' | null) => ({
    x: dir === 'back' ? -SLIDE + '%' : dir === 'forward' ? SLIDE + '%' : 0,
    opacity: 0,
    scale: 0.98,
  }),
  visible: {
    x: '0%',
    opacity: 1,
    scale: 1,
    transition: {
      x:       { type: 'spring', stiffness: 520, damping: 38, mass: 0.8 },
      opacity: { duration: 0.12 },
      scale:   { duration: 0.18 },
    },
  },
  exit: (dir: 'forward' | 'back' | null) => ({
    x: dir === 'back' ? SLIDE + '%' : dir === 'forward' ? -SLIDE + '%' : 0,
    opacity: 0,
    scale: 0.98,
    transition: {
      x:       { type: 'spring', stiffness: 520, damping: 38, mass: 0.8 },
      opacity: { duration: 0.10 },
      scale:   { duration: 0.14 },
    },
  }),
};

export default function AnimatedRoutes() {
  const location                    = useLocation();
  const { navDirection }            = useNavigationHistory();

  return (
    <AnimatePresence mode="wait" custom={navDirection}>
      <motion.div
        key={location.pathname}
        custom={navDirection}
        variants={variants}
        initial="enter"
        animate="visible"
        exit="exit"
        style={{ position: 'relative', width: '100%', minHeight: '100vh', overflow: 'hidden' }}
      >
        <Suspense fallback={
          <div className="h-screen w-screen flex items-center justify-center bg-black">
            <AppleLoader />
          </div>
        }>
          <Routes location={location}>
            {/* Public */}
            <Route path="/"         element={<HomePage />} />
            <Route path="/reviews"  element={<ReviewPage />} />
            <Route path="/payment"  element={<PaymentPage />} />
            <Route path="/projects" element={<ProjectsPage />} />

            {/* Admin */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="reviews"   element={<AdminReviews />} />
              <Route path="payments"  element={<AdminPayments />} />
              <Route path="projects"  element={<AdminProjects />} />
              <Route path="leads"     element={<AdminLeads />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="assets"    element={<AdminAssets />} />
              <Route path="id-cards"  element={<AdminIDCards />} />
              <Route path="offers"    element={<AdminOffers />} />
              <Route path="database"  element={<AdminDatabase />} />
              <Route path="settings"  element={<AdminSettings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}
