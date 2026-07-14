import { useEffect } from 'react';

export default function useIdleRefresh(idleMinutes = 15) {
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      // Convert minutes to milliseconds
      timeoutId = setTimeout(() => {
        console.log(`User idle for ${idleMinutes} minutes. Auto-refreshing...`);
        window.location.reload();
      }, idleMinutes * 60 * 1000);
    };

    // Listen to standard user interactions
    const events = ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    // Initialize timer on mount
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [idleMinutes]);
}
