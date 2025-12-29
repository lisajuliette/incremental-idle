# Incremental Idle - Retro Pixel Edition (React Native)

A minimalist incremental idle game featuring 9 color-coded generators, a random prestige system, and a retro pixel art aesthetic - built with React Native and Expo.

## Features

- **9 Color-Coded Generators**: Each with unique colors, costs, and production rates
- **Exponential Progression**: Scientifically balanced cost scaling and milestone multipliers
- **Prestige System**: Random bonuses that reset your progress for permanent upgrades
- **Retro Pixel Art UI**: Nostalgic pixel-style interface optimized for mobile
- **Offline Progress**: Idle multiplier grows while you're away (capped at 24 hours)
- **Auto-Save**: Game saves automatically every 30 seconds
- **Mobile Navigation**: Tab-based navigation between game screens

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo Go app on your iOS/Android device (for testing)
- **Recommended**: Watchman (for better file watching on macOS)
  ```bash
  brew install watchman
  ```

### Installation

1. Install dependencies:
```bash
npm install
```

2. **If you encounter "EMFILE: too many open files" error:**
   - Install Watchman: `brew install watchman`
   - Or increase file limit: `ulimit -n 4096`
   - See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more details

3. Start the Expo development server:
```bash
# Option 1: Using npm (configured in package.json)
npm start

# Option 2: Using Expo CLI directly (recommended)
npx expo start
# or if you have Expo CLI installed globally:
expo start
```

3. Run on your device:
   - **iOS**: Press `i` in the terminal or scan the QR code with Camera app
   - **Android**: Press `a` in the terminal or scan the QR code with Expo Go app
   - **Web**: Press `w` in the terminal (limited functionality)

## Project Structure

```
incremental-idle/
├── App.js                 # Main app entry point with navigation
├── src/
│   ├── config/
│   │   └── generators.js  # Game configuration
│   ├── context/
│   │   └── GameContext.js # Game state management
│   ├── screens/
│   │   ├── GeneratorsScreen.js
│   │   ├── StatsScreen.js
│   │   ├── PrestigeScreen.js
│   │   └── SettingsScreen.js
│   └── utils/
│       ├── generators.js  # Generator logic
│       ├── prestige.js    # Prestige calculations
│       ├── formatters.js  # Number formatting
│       └── save.js        # Save/load system
├── package.json
└── app.json
```

## Gameplay

1. **Buy Generators**: Tap the BUY buttons to purchase generator levels
2. **Watch Production**: Generators automatically produce currency over time
3. **Reach Milestones**: Get 2× multipliers at levels 25, 50, 100, 200, and 400
4. **Prestige**: When you have enough lifetime earnings, prestige to gain permanent bonuses
5. **Unlock More**: New generators unlock as you progress

## Technical Details

- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Bottom Tabs)
- **State Management**: React Context API
- **Big Numbers**: break_infinity.js for precise calculations
- **Storage**: AsyncStorage with LZ-String compression
- **Game Loop**: requestAnimationFrame with delta-time calculations

## Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

## Dependencies

- `expo` - React Native framework
- `react-navigation` - Navigation library
- `@react-native-async-storage/async-storage` - Persistent storage
- `@react-native-picker/picker` - Picker component
- `break_infinity.js` - Big number handling
- `lz-string` - Save file compression

## Browser Compatibility

This is a React Native app designed for iOS and Android. Web support is limited and not recommended for production use.

## License

This project is open source and available for modification and distribution.
