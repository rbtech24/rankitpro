# WordPress Plugin Domain Configuration Fix

## Issue Identified
The WordPress plugin was configured to use the Replit development URL instead of the production domain, causing HTTP 503 errors when fetching widget data.

## Root Cause
- Plugin fallback API domain was set to: `https://3ba12234-e3a1-4984-9152-1724cec12a3c-00-3d1awbp5bhqqy.kirk.replit.dev`
- Development URLs are not accessible from external sites
- WordPress site was trying to fetch testimonials, check-ins, reviews, and blog data from the dev URL

## Solution Applied
Updated the WordPress plugin configuration to use the production domain:

### Changes Made:
1. **Default API Domain**: Changed from Replit dev URL to `https://rankitpro.com`
2. **Settings Description**: Updated help text to reference production domain
3. **Fallback Configuration**: Ensured all API calls default to production

### Files Modified:
- `wordpress-plugin/rank-it-pro-plugin.php`
  - Line ~285: Updated get_option fallback
  - Line ~875: Updated default value in settings
  - Line ~1165: Updated description text

## Expected Result
- WordPress shortcodes will now fetch data from the live production API
- HTTP 503 errors should be resolved
- Testimonials, check-ins, reviews, and blog posts will display correctly

## Next Steps for WordPress Site
1. **Update Plugin**: Upload the corrected plugin file to WordPress
2. **Clear Cache**: Clear any WordPress caching if enabled
3. **Test Shortcodes**: Verify all RankItPro shortcodes are working
4. **Configure API Settings**: Ensure Company ID and API domain are correctly set in WordPress admin

## Verification
Test the widget endpoints:
- Testimonials: `https://rankitpro.com/widget/16?type=testimonials&format=html`
- Check-ins: `https://rankitpro.com/widget/16?type=checkins&format=html`
- Reviews: `https://rankitpro.com/widget/16?type=reviews&format=html`
- Blogs: `https://rankitpro.com/widget/16?type=blogs&format=html`

All should return data instead of 503 errors.