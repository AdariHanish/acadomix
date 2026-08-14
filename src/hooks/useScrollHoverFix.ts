import { useEffect } from 'react';

/**
 * Fixes the browser issue where CSS :hover sticks to wrong elements during scroll.
 * On scroll, pointer-events are briefly toggled which forces the browser
 * to re-evaluate what's under the cursor.
 */
export function useScrollHoverFix() {
  useEffect(() => {
    let scrollTimer: ReturnType<typeof setTimeout>;
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        // During scroll, disable pointer events so hover states clear
        document.body.style.pointerEvents = 'none';
      }

      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        // After scroll stops, re-enable pointer events
        document.body.style.pointerEvents = '';
        ticking = false;
      }, 80);
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(scrollTimer);
      document.body.style.pointerEvents = '';
    };
  }, []);
}
