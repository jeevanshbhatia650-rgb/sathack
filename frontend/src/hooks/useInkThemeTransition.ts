'use client';

import { useState, useEffect, useCallback } from 'react';

export function useInkThemeTransition() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('webwink-theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else if (
      !saved &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  const triggerThemeToggle = useCallback((e?: React.MouseEvent<HTMLElement>) => {
    let x = window.innerWidth * 0.92;
    let y = window.innerHeight * 0.04;
    if (e && typeof e.clientX === 'number') {
      x = e.clientX;
      y = e.clientY;
    }
    document.documentElement.style.setProperty('--click-x', `${x}px`);
    document.documentElement.style.setProperty('--click-y', `${y}px`);

    const applyToggle = () => {
      const nextDark = !document.documentElement.classList.contains('dark');
      document.documentElement.classList.toggle('dark', nextDark);
      localStorage.setItem('webwink-theme', nextDark ? 'dark' : 'light');
      setIsDark(nextDark);
    };

    // Use native View Transitions API if supported, fallback to instant toggle
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document as any).startViewTransition(() => {
        applyToggle();
      });
    } else {
      applyToggle();
    }
  }, []);

  return { isDark, triggerThemeToggle };
}
