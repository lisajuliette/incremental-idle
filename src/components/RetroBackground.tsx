/**
 * Retro Background Component
 * Creates a pastel gradient background with optional cloud decorations
 * Background extends to the top of the screen including safe area
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface RetroBackgroundProps {
  children: React.ReactNode;
  showClouds?: boolean;
}

export default function RetroBackground({ children, showClouds = true }: RetroBackgroundProps) {
  const { theme } = useTheme();

  return (
    <View
      className={`flex-1 ${theme.background.primary}`}
      style={styles.container}
    >
      {/* Optional cloud decorations */}
      {showClouds && (
        <View style={styles.cloudsContainer} pointerEvents="none">
          {/* Cloud elements would go here - can be implemented with SVG or images */}
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  cloudsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
});

