# Retro UI Implementation Guide

## Overview

The app has been updated with a retro Windows 95/98 style interface featuring:
- Window-based UI with title bars and control buttons
- Pastel color scheme inspired by vaporwave aesthetics
- Pixel-style typography using system monospace fonts
- Retro background with soft pastel gradients

## Components

### Window Component (`src/components/Window.tsx`)
A reusable window component that creates the classic Windows 95/98 look:
- Title bar with window title
- Minimize, maximize, and close buttons (styled as retro squares)
- Window border with shadow for depth
- Content area for child components

**Usage:**
```tsx
<Window title="generators.exe">
  <YourContent />
</Window>
```

### RetroBackground Component (`src/components/RetroBackground.tsx`)
Provides the pastel gradient background for the retro aesthetic.

**Usage:**
```tsx
<RetroBackground>
  <YourContent />
</RetroBackground>
```

## Color Themes

### Pastel Theme (Default)
- Primary: Very light lavender (`bg-purple-100`)
- Secondary: Soft pink (`bg-pink-100`)
- Tertiary: Light blue (`bg-blue-100`)
- Accents: Light purple, pink, and blue at 200 depth
- Window backgrounds: Semi-transparent white

### Purple Theme
- Classic purple, indigo, and sky colors

### Green Theme
- Teal, emerald, and lime colors

## Typography

Currently using system `monospace` font which provides a pixelated look when styled with:
- Small font sizes (10-12px)
- Letter spacing (0.5)
- Bold weights for emphasis

### Adding Custom Pixel Fonts

To add custom pixel fonts like "Press Start 2P" or "VT323":

1. **Download font files:**
   - Visit [Google Fonts](https://fonts.google.com/)
   - Download "Press Start 2P" or "VT323" as `.ttf` files

2. **Add to project:**
   - Create `assets/fonts/` directory
   - Place font files there (e.g., `PressStart2P-Regular.ttf`)

3. **Update font loader:**
   - Modify `src/utils/fonts.ts` to use `expo-font`:
   ```tsx
   import { useFonts } from 'expo-font';
   
   export function usePixelFonts() {
     const [fontsLoaded] = useFonts({
       'PressStart2P': require('../../assets/fonts/PressStart2P-Regular.ttf'),
     });
     return fontsLoaded;
   }
   ```

4. **Load in App.tsx:**
   ```tsx
   const fontsLoaded = usePixelFonts();
   if (!fontsLoaded) return <LoadingScreen />;
   ```

5. **Update font references:**
   - Change `fontFamily: 'monospace'` to `fontFamily: 'PressStart2P'`

## Window Icons

The window control buttons (minimize, maximize, close) are created using:
- Simple geometric shapes (lines, squares)
- Retro color scheme (gray buttons, red close button)
- Pixel-perfect styling

For more detailed icons, consider:
- Using SVG icons from [Heroicons](https://heroicons.com/) (pixelated version)
- Creating custom pixel art icons
- Using icon fonts with pixel styling

## Styling Guidelines

### Window Styling
- Use `border-4` for thick window borders
- Apply shadow for depth (`shadow-lg`)
- Title bars use accent colors from theme
- Content areas use semi-transparent white backgrounds

### Text Styling
- Use `fontFamily: 'monospace'` for pixel aesthetic
- Small font sizes (10-12px for body, 14px for headers)
- Add letter spacing for readability
- Use uppercase for labels/buttons

### Color Usage
- Pastel backgrounds for main areas
- Semi-transparent overlays for depth
- High contrast text for readability
- Accent colors for interactive elements

## Future Enhancements

- [ ] Add custom pixel font loading
- [ ] Create pixel art icon set
- [ ] Add window dragging functionality
- [ ] Implement window stacking/z-index management
- [ ] Add more pastel theme variations
- [ ] Create animated background clouds
- [ ] Add retro sound effects


