export function getVisitorId(): string {
  try {
    const key = 'acadomix_vid_v1';
    let vid = localStorage.getItem(key);
    if (!vid) {
      vid = 'v_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now().toString(36);
      localStorage.setItem(key, vid);
    }
    return vid;
  } catch {
    return 'anonymous_' + Date.now();
  }
}

let lastTrackedPath = '';
let lastTrackedTime = 0;

export function trackPageView(pagePath?: string) {
  try {
    const page = pagePath || window.location.pathname || '/';
    const now = Date.now();

    // Prevent duplicate pings within 2 seconds for identical path
    if (page === lastTrackedPath && now - lastTrackedTime < 2000) {
      return;
    }
    lastTrackedPath = page;
    lastTrackedTime = now;

    const visitor_id = getVisitorId();
    const referrer = document.referrer ? document.referrer.slice(0, 300) : '';

    // Non-blocking fire-and-forget
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify({ visitor_id, page, referrer })], {
        type: 'application/json'
      });
      navigator.sendBeacon('/api/analytics', blob);
    } else {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitor_id, page, referrer }),
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Analytics should never break user experience
  }
}
