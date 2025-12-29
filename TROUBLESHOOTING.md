# Troubleshooting Guide

## EMFILE: Too Many Open Files Error

This is a common macOS issue where the system runs out of file descriptors for watching files.

### Quick Fix (Temporary)

Increase the file descriptor limit for the current terminal session:

```bash
ulimit -n 4096
```

Then restart Expo:
```bash
npx expo start
```

### Permanent Fix (Recommended)

1. **Check current limit:**
   ```bash
   ulimit -n
   ```

2. **Create or edit `~/.zshrc` (or `~/.bash_profile` if using bash):**
   ```bash
   echo "ulimit -n 4096" >> ~/.zshrc
   ```

3. **Reload your shell:**
   ```bash
   source ~/.zshrc
   ```

4. **Verify the limit:**
   ```bash
   ulimit -n
   ```
   Should show 4096

### Alternative: Use Watchman (Recommended for React Native)

Watchman is a file watching service that's more efficient:

```bash
# Install via Homebrew
brew install watchman

# Then restart Expo
npx expo start
```

### If Still Having Issues

1. **Close other applications** that might be watching files
2. **Restart your terminal** after setting ulimit
3. **Clear Metro bundler cache:**
   ```bash
   npx expo start --clear
   ```

## Dependency Version Issues

If you see version mismatch warnings:

```bash
npx expo install --fix
```

This will automatically update all dependencies to versions compatible with your Expo SDK version.

## Other Common Issues

### Metro Bundler Cache Issues

```bash
npx expo start --clear
```

### Node Modules Issues

```bash
rm -rf node_modules
npm cache clean --force
npm install
```

### iOS Simulator Issues

Make sure Xcode Command Line Tools are installed:
```bash
xcode-select --install
```

### Android Emulator Issues

1. Make sure Android Studio is installed
2. Start an emulator before running `npx expo start --android`
3. Or use a physical device with USB debugging enabled


