'use client';

import { useState, useEffect, useCallback } from 'react';

export type Region = 'IN' | 'GLOBAL';

export function useGeoPricing() {
  const [region, setRegion] = useState<Region>('IN');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage manual preference first
    const saved = localStorage.getItem('webwink-region-pref');
    if (saved === 'IN' || saved === 'GLOBAL') {
      setRegion(saved);
      setLoading(false);
      return;
    }

    // Default timezone heuristic
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta') {
        setRegion('IN');
      }
    } catch (e) {
      // Fallback
    }

    // Fetch server geo API
    fetch('/api/geo')
      .then((res) => res.json())
      .then((data) => {
        if (data?.region === 'GLOBAL' || data?.region === 'IN') {
          // If no manual preference, set detected region
          if (!localStorage.getItem('webwink-region-pref')) {
            setRegion(data.region);
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const toggleRegion = useCallback(() => {
    setRegion((prev) => {
      const next = prev === 'IN' ? 'GLOBAL' : 'IN';
      localStorage.setItem('webwink-region-pref', next);
      return next;
    });
  }, []);

  const setManualRegion = useCallback((target: Region) => {
    setRegion(target);
    localStorage.setItem('webwink-region-pref', target);
  }, []);

  return {
    region,
    isIndia: region === 'IN',
    loading,
    toggleRegion,
    setManualRegion,
  };
}
