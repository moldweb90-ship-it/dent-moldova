import { useEffect } from 'react';

// Global counter to support multiple modals
let openModalsCount = 0;
let lastScrollY = 0;

export function useBodyScrollLock(isOpen: boolean): void {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const body = document.body as HTMLBodyElement;

    if (isOpen) {
      openModalsCount += 1;
      if (openModalsCount === 1) {
        // Freeze background in place using fixed positioning
        lastScrollY = window.scrollY || window.pageYOffset;
        body.classList.add('modal-open');
        body.style.position = 'fixed';
        body.style.top = `-${lastScrollY}px`;
        body.style.left = '0';
        body.style.right = '0';
        body.style.width = '100%';
      }
    }

    return () => {
      if (isOpen) {
        openModalsCount = Math.max(0, openModalsCount - 1);
        if (openModalsCount === 0) {
          // Restore scroll position and styles
          body.classList.remove('modal-open');
          body.style.position = '';
          body.style.top = '';
          body.style.left = '';
          body.style.right = '';
          body.style.width = '';
          window.scrollTo(0, lastScrollY);
        }
      }
    };
  }, [isOpen]);
}


