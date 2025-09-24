/**
 * Utility to manage body scroll lock when modals are open
 * Helps hide iOS Safari browser menu by preventing body scroll
 */

let scrollPosition = 0;

export const lockBodyScroll = () => {
  // Save current scroll position
  scrollPosition = window.pageYOffset;
  
  // Apply styles to body
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollPosition}px`;
  document.body.style.width = '100%';
  document.body.classList.add('modal-open');
};

export const unlockBodyScroll = () => {
  // Remove styles from body
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  document.body.classList.remove('modal-open');
  
  // Restore scroll position
  window.scrollTo(0, scrollPosition);
};

// Hook for React components
export const useModalBodyLock = () => {
  return {
    lockBodyScroll,
    unlockBodyScroll
  };
};
