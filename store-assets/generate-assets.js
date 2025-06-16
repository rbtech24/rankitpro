#!/usr/bin/env node

/**
 * App Store Asset Generator for Rank It Pro
 * Generates all required icons, screenshots, and assets for Android and iOS app stores
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assets = {
  // Android Play Store Requirements
  android: {
    icons: [
      { size: 36, density: 'mdpi', path: 'android/app/src/main/res/mipmap-mdpi' },
      { size: 48, density: 'hdpi', path: 'android/app/src/main/res/mipmap-hdpi' },
      { size: 72, density: 'xhdpi', path: 'android/app/src/main/res/mipmap-xhdpi' },
      { size: 96, density: 'xxhdpi', path: 'android/app/src/main/res/mipmap-xxhdpi' },
      { size: 144, density: 'xxxhdpi', path: 'android/app/src/main/res/mipmap-xxxhdpi' },
      { size: 512, name: 'ic_launcher.png', path: 'store-assets/android' }
    ],
    screenshots: {
      phone: { width: 1080, height: 1920, count: 4 },
      tablet: { width: 1200, height: 1920, count: 2 }
    },
    featureGraphic: { width: 1024, height: 500 }
  },
  
  // iOS App Store Requirements
  ios: {
    icons: [
      { size: 1024, name: 'AppIcon.png', path: 'store-assets/ios' },
      { size: 180, name: 'Icon-App-60x60@3x.png', path: 'ios/App/App/Assets.xcassets/AppIcon.appiconset' },
      { size: 120, name: 'Icon-App-60x60@2x.png', path: 'ios/App/App/Assets.xcassets/AppIcon.appiconset' },
      { size: 87, name: 'Icon-App-29x29@3x.png', path: 'ios/App/App/Assets.xcassets/AppIcon.appiconset' },
      { size: 80, name: 'Icon-App-40x40@2x.png', path: 'ios/App/App/Assets.xcassets/AppIcon.appiconset' },
      { size: 58, name: 'Icon-App-29x29@2x.png', path: 'ios/App/App/Assets.xcassets/AppIcon.appiconset' }
    ],
    screenshots: {
      iphone: { width: 1290, height: 2796, count: 4 },
      ipad: { width: 2048, height: 2732, count: 2 }
    }
  }
};

// Create directory structure
function createDirectories() {
  const dirs = [
    'store-assets/android',
    'store-assets/ios',
    'store-assets/screenshots/android-phone',
    'store-assets/screenshots/android-tablet',
    'store-assets/screenshots/ios-iphone',
    'store-assets/screenshots/ios-ipad'
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
}

// Generate asset configuration files
function generateAssetConfigs() {
  // Android adaptive icon configuration
  const androidManifest = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.INTERNET" />
    
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">
    </application>
</manifest>`;

  // iOS Contents.json for AppIcon
  const iosContents = {
    "images": [
      {
        "size": "20x20",
        "idiom": "iphone",
        "filename": "Icon-App-20x20@2x.png",
        "scale": "2x"
      },
      {
        "size": "20x20",
        "idiom": "iphone",
        "filename": "Icon-App-20x20@3x.png",
        "scale": "3x"
      },
      {
        "size": "29x29",
        "idiom": "iphone",
        "filename": "Icon-App-29x29@2x.png",
        "scale": "2x"
      },
      {
        "size": "29x29",
        "idiom": "iphone",
        "filename": "Icon-App-29x29@3x.png",
        "scale": "3x"
      },
      {
        "size": "40x40",
        "idiom": "iphone",
        "filename": "Icon-App-40x40@2x.png",
        "scale": "2x"
      },
      {
        "size": "40x40",
        "idiom": "iphone",
        "filename": "Icon-App-40x40@3x.png",
        "scale": "3x"
      },
      {
        "size": "60x60",
        "idiom": "iphone",
        "filename": "Icon-App-60x60@2x.png",
        "scale": "2x"
      },
      {
        "size": "60x60",
        "idiom": "iphone",
        "filename": "Icon-App-60x60@3x.png",
        "scale": "3x"
      },
      {
        "size": "1024x1024",
        "idiom": "ios-marketing",
        "filename": "Icon-App-1024x1024@1x.png",
        "scale": "1x"
      }
    ],
    "info": {
      "version": 1,
      "author": "xcode"
    }
  };

  // Write configuration files
  fs.writeFileSync('store-assets/android-manifest-permissions.xml', androidManifest);
  fs.writeFileSync('store-assets/ios-contents.json', JSON.stringify(iosContents, null, 2));
  
  console.log('Generated asset configuration files');
}

// Generate README for asset creation
function generateAssetReadme() {
  const readme = `# App Store Assets for Rank It Pro

## Asset Requirements

### Android Play Store
- App icon: 512×512 PNG (no transparency)
- Feature graphic: 1024×500 PNG
- Screenshots: 2-8 phone screenshots (1080×1920 or 1440×2560)
- Adaptive icon: 432×432 PNG with safe zone

### iOS App Store
- App icon: 1024×1024 PNG (no transparency, no rounded corners)
- Screenshots: 3-10 screenshots per device type
- iPhone screenshots: 1290×2796 (iPhone 14 Pro Max)
- iPad screenshots: 2048×2732 (12.9" iPad Pro)

## Asset Creation Instructions

1. **App Icon Design**
   - Use the Rank It Pro logo with clear, readable text
   - Ensure icon works at small sizes (down to 16×16)
   - Use brand colors: Primary blue, secondary orange
   - Test icon visibility on light and dark backgrounds

2. **Screenshots**
   - Show key features: GPS check-in, photo capture, review collection
   - Include UI text in English
   - Demonstrate real app functionality
   - Use consistent branding and colors

3. **Feature Graphic (Android)**
   - Showcase main value proposition
   - Include app name and tagline
   - Use high-quality visuals
   - Avoid too much text

## Automated Asset Generation

Run the following commands to generate all required assets:

\`\`\`bash
# Generate icons from source
npm run generate-icons

# Create screenshots (requires app running)
npm run capture-screenshots

# Build complete asset package
npm run build-assets
\`\`\`

## Manual Asset Creation

If automated generation isn't available:

1. Create base 1024×1024 icon in design software
2. Export multiple sizes for each platform
3. Take screenshots on real devices
4. Optimize all images for web delivery
5. Validate assets meet store requirements

## Asset Validation

Before submission:
- [ ] All icons display correctly at various sizes
- [ ] Screenshots show actual app functionality
- [ ] No placeholder or lorem ipsum text
- [ ] Consistent branding across all assets
- [ ] Proper file formats and dimensions
- [ ] Optimized file sizes for quick loading

## Store Listing Copy

See \`app-description.md\` for complete store listing copy including:
- App title and subtitle
- Description and features
- Keywords for ASO
- Privacy policy links
- Support contact information
`;

  fs.writeFileSync('store-assets/README.md', readme);
  console.log('Generated asset creation guide');
}

// Main execution
function main() {
  console.log('🎨 Generating App Store Assets for Rank It Pro...');
  
  createDirectories();
  generateAssetConfigs();
  generateAssetReadme();
  
  console.log('\n✅ Asset generation completed!');
  console.log('\nNext steps:');
  console.log('1. Create app icons using design software');
  console.log('2. Capture screenshots of app functionality');
  console.log('3. Run build script: ./scripts/build-mobile.sh');
  console.log('4. Upload assets to respective app stores');
}

if (require.main === module) {
  main();
}

module.exports = { assets, createDirectories, generateAssetConfigs };