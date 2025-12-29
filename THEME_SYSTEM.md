# Theme System Documentation

## Overview

The app uses a flexible theme system that allows easy switching between different color skins. Themes are defined in `src/theme/skins.ts` and applied throughout the app via React Context.

## Current Themes

### Purple Theme (Default)
- **Colors**: Purple, Indigo, Sky
- **Depths**: 200 and 300
- **Primary**: `bg-purple-200`
- **Secondary**: `bg-indigo-200`
- **Tertiary**: `bg-sky-200`
- **Accents**: `bg-purple-300`, `bg-indigo-300`, `bg-sky-300`

### Green Theme
- **Colors**: Teal, Emerald, Lime
- **Depths**: 200 and 300
- **Primary**: `bg-teal-200`
- **Secondary**: `bg-emerald-200`
- **Tertiary**: `bg-lime-200`
- **Accents**: `bg-teal-300`, `bg-emerald-300`, `bg-lime-300`

## Architecture

### File Structure

```
src/theme/
├── skins.ts          # Skin definitions (color palettes)
└── colors.ts         # Theme builder (converts skins to full themes)

src/context/
└── ThemeContext.tsx  # React Context for theme access
```

### How It Works

1. **Skins** (`src/theme/skins.ts`)
   - Define color palettes using Tailwind classes
   - Each skin has primary, secondary, tertiary, and accent colors
   - Easy to add new skins

2. **Theme Builder** (`src/theme/colors.ts`)
   - Takes a skin and builds a complete theme
   - Includes backgrounds, buttons, text, borders, etc.
   - Generator colors are fixed (game mechanics)

3. **Theme Context** (`src/context/ThemeContext.tsx`)
   - Provides theme to all components
   - Reads theme preference from game settings
   - Automatically updates when theme changes

## Usage in Components

### Basic Usage

```tsx
import { useTheme } from '../context/ThemeContext';

function MyComponent() {
    const { theme } = useTheme();
    
    return (
        <View className={theme.background.primary}>
            <Text className={theme.text.primary}>Hello</Text>
        </View>
    );
}
```

### Available Theme Properties

```tsx
theme.background.primary      // Main background
theme.background.secondary    // Secondary background
theme.background.tertiary     // Tertiary background
theme.background.card         // Card background
theme.background.window       // Window background

theme.button.primary          // Primary button
theme.button.secondary        // Secondary button
theme.button.success          // Success button
theme.button.disabled         // Disabled button

theme.text.primary            // Main text
theme.text.secondary          // Secondary text
theme.text.accent             // Accent text
theme.text.white              // White text

theme.border.default          // Default border
theme.border.light            // Light border
theme.border.dark             // Dark border

theme.currency.symbol         // Currency symbol color
theme.currency.value          // Currency value color
```

## Adding a New Theme

### Step 1: Define the Skin

Add to `src/theme/skins.ts`:

```tsx
export const ORANGE_SKIN: SkinDefinition = {
    id: 'orange',
    name: 'Orange',
    description: 'Orange, amber, and yellow theme',
    colors: {
        primary: 'bg-orange-200',
        secondary: 'bg-amber-200',
        tertiary: 'bg-yellow-200',
        accent1: 'bg-orange-300',
        accent2: 'bg-amber-300',
        accent3: 'bg-yellow-300',
        window: 'bg-white/85',
        card: 'bg-white/50',
        border: 'border-orange-300',
        borderActive: 'border-amber-300',
        titleBar: 'bg-orange-300',
        titleBarActive: 'bg-amber-300',
    },
};
```

### Step 2: Add to SKINS Object

```tsx
export const SKINS: Record<SkinId, SkinDefinition> = {
    purple: PURPLE_SKIN,
    green: GREEN_SKIN,
    orange: ORANGE_SKIN,  // Add here
};
```

### Step 3: Update TypeScript Types

In `src/types/game.ts`:

```tsx
export interface GameSettings {
    // ...
    theme: 'purple' | 'green' | 'orange';  // Add new theme
}
```

### Step 4: Update SkinId Type

In `src/theme/skins.ts`:

```tsx
export type SkinId = 'purple' | 'green' | 'orange';  // Add new theme
```

## Theme Selection

Users can change themes in the Settings screen:
1. Open Settings (Config tab)
2. Scroll to "Theme" section
3. Tap desired theme
4. Theme applies immediately
5. Preference is saved automatically

## Persistence

- Theme preference is stored in game settings
- Saved to local storage with game state
- Loaded automatically on app start
- Ready for Supabase migration

## Best Practices

1. **Always use `useTheme()` hook** - Don't import theme directly
2. **Use theme properties** - Don't hardcode colors
3. **Generator colors are fixed** - They represent game mechanics
4. **Test all themes** - Ensure readability in all themes
5. **Keep skins simple** - Use 200/300 depths for consistency

## Color Guidelines

- **200 depth**: Backgrounds (lighter)
- **300 depth**: UI elements, borders, accents (darker)
- **Generator colors**: Fixed (yellow-400, pink-400, etc.)
- **Success/Error**: Fixed (green-500, red-400)
- **Text**: Gray scale (gray-800, gray-600, etc.)

## Future Enhancements

- Custom theme builder
- Theme preview in settings
- Per-component theme overrides
- Dark mode support
- Animated theme transitions

