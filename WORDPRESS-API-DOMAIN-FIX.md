# WordPress Plugin API Domain Fix

## Issue Identified
Your WordPress plugin settings page doesn't show the API Domain field, causing it to default to `rankitpro.com` instead of your development URL.

## Solution
I've updated the plugin to:
1. Show the API Domain field in the settings page
2. Default to your Replit development URL for testing
3. Include clear instructions for development vs production

## Configuration Steps

### 1. Download Updated Plugin
Get the latest version: `/api/wordpress/plugin`

### 2. WordPress Settings Configuration
Go to Settings > RankItPro and set:

- **Company ID**: `16`
- **API Domain**: `https://3ba12234-e3a1-4984-9152-1724cec12a3c-00-3d1awbp5bhqqy.kirk.replit.dev`
- **Cache Time**: `300` (default is fine)

### 3. Save and Test
1. Click "Save Settings"
2. The plugin should show "Connected" status
3. Use shortcode `[rankitpro_checkins]` on your test page

## Expected Behavior
- Development: Uses your Replit URL for testing
- Production: Will use `https://rankitpro.com` when you deploy

The plugin now properly handles both environments without hardcoded values.