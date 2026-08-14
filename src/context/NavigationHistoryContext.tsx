import React, { createContext, useContext, useRef, useEffect, useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export type NavDirection = 'back' | 'forward' | null;

interface NavHistoryCtx {
  goBack: () => void;
  goForward: () => void;
  canGoBack: () => boolean;
  canGoForward: () => boolean;
  navDirection: NavDirection;
}

const NavigationHistoryContext = createContext<NavHistoryCtx | null>(null);

export function NavigationHistoryProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  const stackRef          = useRef<string[]>([]);
  const indexRef          = useRef(-1);
  const isProgrammaticRef = useRef(false);
  const [navDirection, setNavDirection] = useState<NavDirection>(null);

  const pathOf = (loc: typeof location) =>
    loc.pathname + (loc.search || '') + (loc.hash || '');

  useEffect(() => {
    const path = pathOf(location);

    if (isProgrammaticRef.current) {
      isProgrammaticRef.current = false;
      return;
    }

    // User-triggered navigation — truncate forward stack and push
    const newStack = stackRef.current.slice(0, indexRef.current + 1);
    newStack.push(path);
    stackRef.current = newStack;
    indexRef.current  = newStack.length - 1;
    setNavDirection(null); // link-clicks have no slide direction
  }, [location]);

  const canGoBack    = useCallback(() => indexRef.current > 0, []);
  const canGoForward = useCallback(() => indexRef.current < stackRef.current.length - 1, []);

  const goBack = useCallback(() => {
    if (!canGoBack()) return;
    isProgrammaticRef.current = true;
    indexRef.current -= 1;
    setNavDirection('back');
    navigate(stackRef.current[indexRef.current]);
  }, [navigate, canGoBack]);

  const goForward = useCallback(() => {
    if (!canGoForward()) return;
    isProgrammaticRef.current = true;
    indexRef.current += 1;
    setNavDirection('forward');
    navigate(stackRef.current[indexRef.current]);
  }, [navigate, canGoForward]);

  return (
    <NavigationHistoryContext.Provider value={{ goBack, goForward, canGoBack, canGoForward, navDirection }}>
      {children}
    </NavigationHistoryContext.Provider>
  );
}

export function useNavigationHistory() {
  const ctx = useContext(NavigationHistoryContext);
  if (!ctx) throw new Error('useNavigationHistory must be inside NavigationHistoryProvider');
  return ctx;
}
