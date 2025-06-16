# App Store Assets for Rank It Pro

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

```bash
# Generate icons from source
npm run generate-icons

# Create screenshots (requires app running)
npm run capture-screenshots

# Build complete asset package
npm run build-assets
```

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

See `app-description.md` for complete store listing copy including:
- App title and subtitle
- Description and features
- Keywords for ASO
- Privacy policy links
- Support contact information
