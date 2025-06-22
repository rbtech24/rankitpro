# WordPress Plugin Troubleshooting

## Quick Fix for Your Test Site

Your WordPress plugin shows "Connected" but the shortcodes display "No check-ins available". Here's the solution:

### 1. WordPress Plugin Settings
Go to WordPress Admin > Settings > RankItPro and configure:
- **Company ID**: `16`
- **API Domain**: `https://3ba12234-e3a1-4984-9152-1724cec12a3c-00-3d1awbp5bhqqy.kirk.replit.dev`

### 2. Test the Widget Directly
Visit this URL to test if the widget works:
`https://3ba12234-e3a1-4984-9152-1724cec12a3c-00-3d1awbp5bhqqy.kirk.replit.dev/widget-test.html`

### 3. WordPress Shortcode Usage
Use these shortcodes in your WordPress pages:

**For check-ins only:**
```
[rankitpro type="checkins" limit="5"]
```

**For all content:**
```
[rankitpro type="all" limit="10"]
```

### 4. Debug Steps
If still not working:
1. Check browser console for JavaScript errors
2. Verify your WordPress site can make external API calls
3. Try disabling caching plugins temporarily
4. Ensure the shortcode attributes are exactly as shown

### 5. Alternative Direct Integration
If shortcodes fail, add this HTML directly to your page:

```html
<div data-rankitpro-widget="checkins"></div>
<script src="https://3ba12234-e3a1-4984-9152-1724cec12a3c-00-3d1awbp5bhqqy.kirk.replit.dev/widget/16?type=checkins&limit=5"></script>
```

The widget contains Rod Bartruff's 2 check-ins with service reports and should display with your theme styling.