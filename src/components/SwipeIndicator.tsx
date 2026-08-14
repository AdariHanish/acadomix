import { useEffect, useState } from 'react';

type Direction = 'left' | 'right' | null;

export default function SwipeIndicator() {
  const [direction, setDirection] = useState<Direction>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const dir = (e as CustomEvent).detail.direction as Direction;
      setDirection(dir);
      setTimeout(() => setDirection(null), 600);
    };
    window.addEventListener('swipe-navigate', handler);
    return () => window.removeEventListener('swipe-navigate', handler);
  }, []);

  if (!direction) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        transform: 'translateY(-50%)',
        ...(direction === 'right' ? { left: '16px' } : { right: '16px' }),
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '52px',
        height: '52px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.25)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        animation: 'swipeIndicatorIn 0.6s ease forwards',
        pointerEvents: 'none',
      }}
    >
      <style>{`
        @keyframes swipeIndicatorIn {
          0%   { opacity: 0; transform: translateY(-50%) scale(0.6); }
          20%  { opacity: 1; transform: translateY(-50%) scale(1.1); }
          50%  { opacity: 1; transform: translateY(-50%) scale(1); }
          100% { opacity: 0; transform: translateY(-50%) scale(0.8); }
        }
      `}</style>
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {direction === 'right' ? (
          <polyline points="15 18 9 12 15 6" />   // ← arrow = go back
        ) : (
          <polyline points="9 18 15 12 9 6" />    // → arrow = go forward
        )}
      </svg>
    </div>
  );
}
