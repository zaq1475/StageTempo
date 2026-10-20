import { useState, useEffect } from 'react';

export function useIsLandscape(): boolean {
  const [isLandscape, setIsLandscape] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth > window.innerHeight;
  });

  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    // Also listen to matchMedia if supported
    let mql: MediaQueryList | null = null;
    if (window.matchMedia) {
      mql = window.matchMedia('(orientation: landscape)');
      const mqlListener = (e: MediaQueryListEvent) => {
        setIsLandscape(e.matches);
      };
      if (mql.addEventListener) {
        mql.addEventListener('change', mqlListener);
      } else {
        // Fallback for older browsers
        mql.addListener(mqlListener);
      }
      return () => {
        window.removeEventListener('resize', checkOrientation);
        window.removeEventListener('orientationchange', checkOrientation);
        if (mql) {
          if (mql.removeEventListener) {
            mql.removeEventListener('change', mqlListener);
          } else {
            mql.removeListener(mqlListener);
          }
        }
      };
    }

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  return isLandscape;
}
