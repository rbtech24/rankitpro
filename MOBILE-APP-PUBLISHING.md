# Mobile App Publishing Guide

## Overview
Rank It Pro is now configured for publishing to both Android Play Store and iOS App Store using Capacitor for native mobile app generation.

## Project Structure
```
/android/          - Android Studio project
/ios/              - Xcode project  
/dist/             - Built web assets
capacitor.config.ts - Mobile app configuration
```

## Android Play Store Publishing

### Prerequisites
- Android Studio installed
- Google Play Console developer account ($25 one-time fee)
- Signing certificate for app distribution

### Build Process
```bash
# Build web assets
npm run build

# Sync with Android project
npx cap sync android

# Open in Android Studio
npx cap open android
```

### Android Studio Steps
1. Open the `/android` folder in Android Studio
2. Update app version in `android/app/build.gradle`
3. Generate signed APK/AAB for Play Store
4. Upload to Google Play Console
5. Complete store listing with screenshots and descriptions

### App Signing
- Generate keystore for production builds
- Configure signing in `android/app/build.gradle`
- Store keystore securely for future updates

## iOS App Store Publishing

### Prerequisites
- macOS with Xcode installed
- Apple Developer Account ($99/year)
- iOS deployment certificates

### Build Process
```bash
# Build web assets
npm run build

# Sync with iOS project
npx cap sync ios

# Open in Xcode
npx cap open ios
```

### Xcode Steps
1. Open the `/ios/App/App.xcworkspace` in Xcode
2. Configure app signing with your Apple Developer account
3. Update version and build numbers
4. Archive and upload to App Store Connect
5. Submit for App Store review

## App Configuration

### Permissions
The app is configured with necessary permissions:
- Camera access for photo capture
- Location services for GPS check-ins
- Storage access for offline functionality

### Features
- PWA functionality wrapped in native container
- Offline capability with service worker
- Native camera and GPS integration
- Push notification support (ready for implementation)

## Store Assets Required

### Icons
- Multiple icon sizes already generated (72px to 512px)
- Located in `/public/assets/`

### Screenshots
Required for both stores:
- Mobile screenshots (various device sizes)
- Feature highlights
- App workflow demonstrations

### Store Descriptions
- App title: "Rank It Pro"
- Package ID: com.rankitpro.app
- Category: Business/Productivity
- Target audience: Home service technicians and managers

## App Store Optimization

### Keywords
- Home service management
- Technician field app
- Customer review collection
- Service visit tracking
- Business productivity

### App Features to Highlight
1. GPS-enabled check-in system
2. Photo documentation
3. Customer review collection
4. AI-powered content generation
5. Offline functionality

## Testing Requirements

### Android
- Test on multiple Android devices and screen sizes
- Verify offline functionality
- Test camera and GPS features
- Performance testing

### iOS
- Test on iPhone and iPad devices
- iOS version compatibility testing
- App Store review guidelines compliance
- Privacy policy requirements

## Deployment Commands

### Development Testing
```bash
# Android
npx cap run android

# iOS (requires macOS)
npx cap run ios
```

### Production Build
```bash
# Build optimized web assets
npm run build

# Sync all platforms
npx cap sync

# Open platform-specific IDEs
npx cap open android
npx cap open ios
```

## Maintenance

### Updates
1. Update web application code
2. Run `npm run build`
3. Run `npx cap sync`
4. Rebuild and redistribute through app stores

### Version Management
- Update version in `package.json`
- Update Android version in `build.gradle`
- Update iOS version in Xcode project settings

## Support Resources
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Publishing Guide](https://developer.android.com/studio/publish)
- [iOS App Store Guidelines](https://developer.apple.com/app-store/guidelines/)