import { useEffect, useRef, useCallback } from 'react';
import { useNavigationHistory } from '../context/NavigationHistoryContext';

/**
 * useSwipeNavigation
 * Detects two-finger horizontal trackpad swipe (wheel deltaX) and
 * two-finger touch swipe, then navigates ONLY within the current
 * session's own history stack — never the browser's global history.
 */
export default function useSwipeNavigation() {
  const { goBack, goForward, canGoBack, canGoForward } = useNavigationHistory();

  const cooldownRef    = useRef(false);
  const accumulatedRef = useRef(0);
  const resetTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Trackpad two-finger horizontal swipe via wheel event ─────────────────
  const handleWheel = useCallback((e: WheelEvent) => {
    // Ignore if vertical scroll dominates
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    // Opt-out: elements or containers with data-no-swipe
    if ((e.target as HTMLElement).closest('[data-no-swipe]')) return;

    accumulatedRef.current += e.deltaX;

    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => {
      accumulatedRef.current = 0;
    }, 150);

    const THRESHOLD = 35;

    if (cooldownRef.current) return;

    if (accumulatedRef.current < -THRESHOLD && canGoBack()) {
      // Swipe LEFT with fingers → go back
      cooldownRef.current = true;
      accumulatedRef.current = 0;
      dispatchSwipeEvent('right'); // arrow appears on the right side
      goBack();
      setTimeout(() => { cooldownRef.current = false; }, 320);

    } else if (accumulatedRef.current > THRESHOLD && canGoForward()) {
      // Swipe RIGHT with fingers → go forward
      cooldownRef.current = true;
      accumulatedRef.current = 0;
      dispatchSwipeEvent('left'); // arrow appears on the left side
      goForward();
      setTimeout(() => { cooldownRef.current = false; }, 320);
    }
  }, [goBack, goForward, canGoBack, canGoForward]);

  // ── Touch swipe (mobile / tablet two-finger) ──────────────────────────────
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      touchStartRef.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
    }
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current || cooldownRef.current) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const dx   = endX - touchStartRef.current.x;
    const dy   = endY - touchStartRef.current.y;
    touchStartRef.current = null;

    const TOUCH_THRESHOLD = 60;
    if (Math.abs(dx) < TOUCH_THRESHOLD || Math.abs(dx) < Math.abs(dy) * 1.5) return;

    cooldownRef.current = true;
    if (dx < 0 && canGoBack()) {
      // Swipe left → go back
      dispatchSwipeEvent('right');
      goBack();
    } else if (dx > 0 && canGoForward()) {
      // Swipe right → go forward
      dispatchSwipeEvent('left');
      goForward();
    } else {
      cooldownRef.current = false; // no nav happened, release immediately
      return;
    }
    setTimeout(() => { cooldownRef.current = false; }, 800);
  }, [goBack, goForward, canGoBack, canGoForward]);

  useEffect(() => {
    window.addEventListener('wheel',      handleWheel,      { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend',   handleTouchEnd,   { passive: true });
    return () => {
      window.removeEventListener('wheel',      handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend',   handleTouchEnd);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, [handleWheel, handleTouchStart, handleTouchEnd]);
}

function dispatchSwipeEvent(direction: 'left' | 'right') {
  window.dispatchEvent(new CustomEvent('swipe-navigate', { detail: { direction } }));
}
