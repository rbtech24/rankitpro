#!/bin/bash

# Mobile App Build Script for Rank It Pro
# Builds and prepares app for Android Play Store and iOS App Store publishing

echo "🚀 Building Rank It Pro Mobile Apps"

# Step 1: Build web assets
echo "📦 Building web assets..."
npm run build

# Step 2: Sync with mobile platforms
echo "📱 Syncing with Android and iOS..."
npx cap sync

# Step 3: Generate app icons for all platforms
echo "🎨 Generating app icons..."
npx capacitor-assets generate

# Step 4: Copy additional assets
echo "📋 Copying store assets..."
cp public/assets/icon-512x512.png android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
cp public/assets/icon-192x192.png android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
cp public/assets/icon-144x144.png android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
cp public/assets/icon-96x96.png android/app/src/main/res/mipmap-hdpi/ic_launcher.png
cp public/assets/icon-72x72.png android/app/src/main/res/mipmap-mdpi/ic_launcher.png

echo "✅ Mobile app build completed!"
echo ""
echo "Next steps:"
echo "📋 For Android: npx cap open android"
echo "📋 For iOS: npx cap open ios"
echo ""
echo "Publishing checklist:"
echo "- Update version numbers in build.gradle and Info.plist"
echo "- Generate signed APK/AAB for Android"
echo "- Archive and upload iOS app to App Store Connect"
echo "- Prepare store listings with screenshots and descriptions"