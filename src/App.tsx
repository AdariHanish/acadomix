import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppleLoader from './components/AppleLoader';
import ImageLightbox from './components/ImageLightbox';
import SwipeIndicator from './components/SwipeIndicator';
import AnimatedRoutes from './components/AnimatedRoutes';
import useIdleRefresh from './hooks/useIdleRefresh';
import useSwipeNavigation from './hooks/useSwipeNavigation';
import { NavigationHistoryProvider } from './context/NavigationHistoryContext';
import { prefetchPublicData } from './utils/storage';

/** Rendered inside HashRouter so useNavigate() is available */
function SwipeNavigator() {
  useSwipeNavigation();
  return null;
}

export default function App() {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState('');

  useIdleRefresh(15);

  useEffect(() => {
    // Start background prefetch immediately so navigation is instant
    prefetchPublicData().catch(() => {});

    const handler = (e: Event) => {

      const detail = (e as CustomEvent).detail;
      setLightboxSrc(detail.src);
      setLightboxAlt(detail.alt || '');
    };

    const handleGlobalImageClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG') {
        const img = target as HTMLImageElement;
        const isExcluded =
          img.classList.contains('no-lightbox') ||
          img.closest('.no-lightbox') ||
          img.src.includes('logo-placeholder') ||
          (img.width  > 0 && img.width  < 45) ||
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
    <BrowserRouter>
      <NavigationHistoryProvider>
        <SwipeNavigator />
        <SwipeIndicator />

        {/* All routes with slide-in/out animation */}
        <AnimatedRoutes />

        {/* Global Image Lightbox */}
        <ImageLightbox src={lightboxSrc} alt={lightboxAlt} onClose={() => setLightboxSrc(null)} />
      </NavigationHistoryProvider>
    </BrowserRouter>
  );
}
