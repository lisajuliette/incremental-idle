/**
 * Font loading utility
 * Loads Jersey 10 font for the retro pixel aesthetic
 */

import { useFonts } from 'expo-font';

export function useJerseyFont() {
  const [fontsLoaded] = useFonts({
    'Jersey10': require('../../assets/fonts/Jersey10-Regular.ttf'),
  });

  return fontsLoaded;
}

// Font family name
export const pixelFontFamily = 'Jersey10';
export const pixelFontFamilyAlt = 'Jersey10';

// Font styles for retro pixel aesthetic
export const pixelFontStyle = {
  fontFamily: 'Jersey10',
  fontSize: 12,
  letterSpacing: 0.5,
} as const;

