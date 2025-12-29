# Setup Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   # Using npm (configured in package.json)
   npm start
   
   # Or using Expo CLI directly
   npx expo start
   ```

3. **Run on device:**
   - Install Expo Go app on your phone
   - Scan the QR code shown in terminal
   - Or press `i` for iOS simulator, `a` for Android emulator

## Required Assets

You'll need to create these asset files (or use placeholders):

- `assets/icon.png` - App icon (1024x1024)
- `assets/splash.png` - Splash screen (1242x2436)
- `assets/adaptive-icon.png` - Android adaptive icon (1024x1024)
- `assets/favicon.png` - Web favicon (48x48)

For now, you can use any placeholder images or create simple colored squares.

## Troubleshooting

### Metro bundler issues
```bash
npm start -- --reset-cache
```

### iOS simulator not working
Make sure Xcode is installed and Command Line Tools are set up:
```bash
xcode-select --install
```

### Android emulator not working
Make sure Android Studio is installed and an emulator is running.

### Package installation issues
Try clearing cache:
```bash
rm -rf node_modules
npm cache clean --force
npm install
```

## Development Notes

- The game auto-saves every 30 seconds
- Save files are stored in AsyncStorage (device storage)
- Game state persists between app restarts
- Offline progress is calculated when the app reopens

