# WordPress Plugin Setup Instructions

## Current Issue
Your WordPress plugin is missing the API Domain configuration field, causing it to default to production URL instead of your development server.

## Solution Steps

### 1. Download Updated Plugin
Visit: `https://3ba12234-e3a1-4984-9152-1724cec12a3c-00-3d1awbp5bhqqy.kirk.replit.dev/api/wordpress/plugin`

### 2. Install Plugin
1. Deactivate current RankItPro plugin
2. Delete old plugin files
3. Upload and activate the new version

### 3. Configure Settings
Go to WordPress Admin > Settings > RankItPro and set:

**Company ID:** `16`
**API Domain:** `https://3ba12234-e3a1-4984-9152-1724cec12a3c-00-3d1awbp5bhqqy.kirk.replit.dev`
**Cache Time:** `300`

### 4. Test Integration
Add this shortcode to any page or post:
```
[rankitpro_checkins]
```

### 5. Expected Results
You should see:
- Rod Bartruff's Production Test check-in (Dallas, TX)
- Sprinkler Repair service report (Florida) with photo
- Content styled to match your WordPress theme

The widget endpoint is confirmed working and returning your actual service data.