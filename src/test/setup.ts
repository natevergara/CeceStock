import '@testing-library/jest-dom';

// Polyfill / mock para navigator.vibrate en jsdom
if (typeof navigator !== 'undefined' && !('vibrate' in navigator)) {
  Object.defineProperty(navigator, 'vibrate', {
    value: () => true,
    writable: true,
  });
}
