# WordPress Plugin - Final Integration Instructions

## Current Status
Your WordPress plugin shows "Connected" but shortcodes display "No check-ins available". This is because the widget script is loading but not finding the container elements properly.

## Quick Fix for Your WordPress Site

### 1. Plugin ZIP Update
I've updated the plugin with debug logging. Download the new version from:
```
https://3ba12234-e3a1-4984-9152-1724cec12a3c-00-3d1awbp5bhqqy.kirk.replit.dev/api/wordpress/plugin
```

### 2. WordPress Settings (Verify These)
- Company ID: `16` 
- API Domain: `https://3ba12234-e3a1-4984-9152-1724cec12a3c-00-3d1awbp5bhqqy.kirk.replit.dev`

### 3. Test the Debug Page First
Visit this URL to confirm the widget works:
```
https://3ba12234-e3a1-4984-9152-1724cec12a3c-00-3d1awbp5bhqqy.kirk.replit.dev/wordpress-debug.html
```

### 4. WordPress Shortcode Usage
Use these exact shortcodes in your WordPress pages:

**For check-ins:**
```
[rankitpro_checkins]
```

**For all content:**
```
[rankitpro type="checkins" limit="5"]
```

### 5. Browser Console Debug
After adding the shortcode, open browser console (F12) and look for:
- "RankItPro: Initializing widget for company 16"
- "RankItPro: Widget script loaded successfully"

If you see errors, they'll help identify the issue.

### 6. Fallback Direct HTML Method
If shortcodes still fail, add this HTML directly to your page:

```html
<div data-rankitpro-widget="checkins" id="rankitpro-manual"></div>
<script>
console.log('Manual widget loading...');
var script = document.createElement('script');
script.src = 'https://3ba12234-e3a1-4984-9152-1724cec12a3c-00-3d1awbp5bhqqy.kirk.replit.dev/widget/16?type=checkins&limit=5';
script.onload = function() { console.log('Widget loaded successfully'); };
script.onerror = function() { console.error('Widget failed to load'); };
document.head.appendChild(script);
</script>
```

## Expected Results
You should see Rod Bartruff's 2 service reports:
1. Production Test check-in from Dallas, TX
2. Sprinkler Repair from Florida with photo

The widget automatically adapts to your WordPress theme styling.