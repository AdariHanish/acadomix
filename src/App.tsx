import React, { Suspense, useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppleLoader from './components/AppleLoader';
import ImageLightbox from './components/ImageLightbox';
import useIdleRefresh from './hooks/useIdleRefresh';

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
const AdminCustomers = React.lazy(() => import('./pages/admin/AdminCustomers'));
const AdminAssets = React.lazy(() => import('./pages/admin/AdminAssets'));
const AdminSettings = React.lazy(() => import('./pages/admin/AdminSettings'));
const AdminIDCards = React.lazy(() => import('./pages/admin/AdminIDCards'));
const AdminOffers = React.lazy(() => import('./pages/admin/AdminOffers'));



export default function App() {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState('');
  
  // Refresh site if user is inactive for 15 minutes
  useIdleRefresh(15);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setLightboxSrc(detail.src);
      setLightboxAlt(detail.alt || '');
    };
    
    const handleGlobalImageClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG') {
        const img = target as HTMLImageElement;
        
        // Exclude tiny icons, logo placeholders, or explicitly excluded items
        const isExcluded = 
          img.classList.contains('no-lightbox') || 
          img.closest('.no-lightbox') ||
          img.src.includes('logo-placeholder') ||
          (img.width > 0 && img.width < 45) || 
          (img.height > 0 && img.height < 45);

        if (!isExcluded && img.src) {
          setLightboxSrc(img.src);
          setLightboxAlt(img.alt || 'Zoomed Image');
        }
      }
    };

    window.addEventListener('open-lightbox', handler);
    window.addEventListener('click', handleGlobalImageClick);
    return () => {
      window.removeEventListener('open-lightbox', handler);
      window.removeEventListener('click', handleGlobalImageClick);
    };
  }, []);

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
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="assets" element={<AdminAssets />} />
            <Route path="id-cards" element={<AdminIDCards />} />
            <Route path="offers" element={<AdminOffers />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      {/* Global Image Lightbox */}
      <ImageLightbox src={lightboxSrc} alt={lightboxAlt} onClose={() => setLightboxSrc(null)} />
      

    </HashRouter>
  );
}
