# WordPress Plugin - Final Instructions

## Status: Ready
Your "Rank It Pro Integration" plugin v1.2.1 with enhanced debugging is ready for download.

## Steps to Resolve the Issue

### 1. Clean Plugin Installation
1. Delete both existing plugins from WordPress:
   - "Rank It Pro Integration" (v1.2.0)
   - "RankItPro Service Integration" (v1.2.1)

2. Download fresh plugin from your dashboard
3. Install the new "rank-it-pro-plugin.zip"

### 2. Configuration
WordPress Settings > Rank It Pro:
- Company ID: 16
- API Domain: https://3ba12234-e3a1-4984-9152-1724cec12a3c-00-3d1awbp5bhqqy.kirk.replit.dev
- Cache Time: 300

### 3. Debugging
After adding `[rankitpro_checkins]` shortcode:
1. Press F12 > Console tab
2. Look for debug messages:
   - "RankItPro: Initializing widget for company 16"
   - "RankItPro: Container ID: [unique-id]"
   - "RankItPro: Widget script loaded successfully"

### 4. Expected Result
Should display Rod Bartruff's service reports:
- Production Test check-in (Dallas, TX)
- Sprinkler Repair service (Florida) with photo

The enhanced debugging will show exactly what's preventing the content from displaying on your WordPress site.