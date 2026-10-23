import { useState, useEffect } from 'react';

export type HeightProfile = 'compact' | 'standard' | 'tall';

export interface ViewportProfile {
  heightProfile: HeightProfile;
  isKeyboardOpen: boolean;
  viewportHeight: number;
}

export function useViewportProfile(): ViewportProfile {
  const [profile, setProfile] = useState<ViewportProfile>(() => {
    const h = typeof window !== 'undefined' ? window.innerHeight : 800;
    return {
      viewportHeight: h,
      heightProfile: h < 720 ? 'compact' : h > 820 ? 'tall' : 'standard',
      isKeyboardOpen: false,
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const baseHeight = window.innerHeight;

    const updateProfile = () => {
      const currentHeight = window.visualViewport
        ? window.visualViewport.height
        : window.innerHeight;

      // Si la altura del visualViewport cae más del 25% respecto a la base, el teclado virtual está desplegado
      const keyboardOpen = currentHeight < baseHeight * 0.75;

      setProfile({
        viewportHeight: currentHeight,
        heightProfile: currentHeight < 720 ? 'compact' : currentHeight > 820 ? 'tall' : 'standard',
        isKeyboardOpen: keyboardOpen,
      });
    };

    updateProfile();

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateProfile);
    } else {
      window.addEventListener('resize', updateProfile);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateProfile);
      } else {
        window.removeEventListener('resize', updateProfile);
      }
    };
  }, []);

  return profile;
}
