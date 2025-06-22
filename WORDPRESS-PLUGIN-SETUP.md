# WordPress Plugin Setup Instructions

## Plugin Configuration

Your WordPress test site needs these settings:

### 1. Plugin Settings (WordPress Admin > Settings > RankItPro)

- **Company ID**: `16`
- **API Domain**: `https://3ba12234-e3a1-4984-9152-1724cec12a3c-00-3d1awbp5bhqqy.kirk.replit.dev`
- **Cache Time**: `300` (5 minutes)

### 2. Shortcode Usage

Add these shortcodes to your WordPress pages/posts:

```
[rankitpro type="checkins" limit="5"]
```

or for all content:

```
[rankitpro]
```

### 3. Direct HTML Integration

Alternatively, add this HTML where you want the content to appear:

```html
<div data-rankitpro-widget="checkins"></div>
<script src="https://3ba12234-e3a1-4984-9152-1724cec12a3c-00-3d1awbp5bhqqy.kirk.replit.dev/widget/16?type=checkins&limit=5"></script>
```

### 4. Available Data

Your company (ID: 16) has:
- 2 check-ins available
- Service reports with photos
- Technician: Rod Bartruff
- Locations in Texas and Florida

### 5. Troubleshooting

If you see "No check-ins available":
1. Verify Company ID is set to `16`
2. Verify API Domain matches exactly
3. Check that the shortcode includes the correct attributes
4. Ensure your WordPress site can make external API calls

The widget endpoint is working correctly and returning your check-in data.