# PWA Installation Setup - iOS and Android Support

## Overview
Rank It Pro now supports Progressive Web App (PWA) installation on both iOS and Android devices, providing a native app-like experience.

## iOS Installation
- Custom installation prompt appears after 3 seconds on iOS devices
- Step-by-step visual instructions guide users through Safari's "Add to Home Screen" process
- App appears as native icon on iOS home screen
- Launches in standalone mode without browser UI

## Android Installation
- Browser's native installation prompt for Chrome/Edge
- Custom fallback prompt with one-click install
- Automatic detection of installation capability

## Technical Implementation

### Files Added:
- `public/manifest.json` - PWA configuration
- `public/sw.js` - Service worker for offline functionality
- `client/src/components/PWAInstallPrompt.tsx` - Custom installation UI
- PWA icons in multiple sizes for all devices

### iOS-Specific Meta Tags:
- `apple-mobile-web-app-capable` - Enables standalone mode
- `apple-mobile-web-app-title` - App name on home screen
- `apple-touch-icon` - Home screen icon
- Viewport optimization for mobile devices

### Features:
- Offline capability via service worker
- App shortcuts for quick actions
- Proper theme colors and branding
- Responsive design for all screen sizes

## User Experience
1. **First Visit**: Users see normal website
2. **Installation Prompt**: After 3 seconds (iOS) or on browser capability (Android)
3. **Installation**: Easy guided process
4. **App Experience**: Native-like interface with offline support

## Production Benefits
- Increased user engagement and retention
- Native app experience without app store deployment
- Offline functionality for field technicians
- Quick access from device home screen
- Reduced bounce rates and improved performance metrics