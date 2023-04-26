import { useEffect } from 'react';

export default function useViewportUnitsTrick(disabled = false) {
  useEffect(() => {
    const handleResize = () => {
      if (disabled) return;

      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [disabled]);

  useEffect(() => {
    if (!disabled) {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    return () => {
      document.documentElement.removeAttribute('style');
    };
  }, [disabled]);
}
