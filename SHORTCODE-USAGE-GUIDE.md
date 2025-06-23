# RankItPro WordPress Shortcodes Guide

## Available Shortcodes

### 1. Service Check-ins
Display recent service visits and technician reports.
```
[rankitpro_checkins company_id="16" limit="5"]
```

### 2. Customer Reviews
Show customer reviews and ratings.
```
[rankitpro_reviews company_id="16" limit="5"]
```

### 3. Blog Posts
Display recent blog posts from your service visits.
```
[rankitpro_blogs company_id="16" limit="3"]
```

### 4. Customer Testimonials
Show audio, video, and text testimonials.
```
[rankitpro_testimonials company_id="16" limit="5"]
```

### 5. All Content Combined
Display all content types in one widget.
```
[rankitpro_all company_id="16" limit="10"]
```

## Shortcode Parameters

- `company_id` - Your company ID (required)
- `limit` - Number of items to display (optional, default: 5)
- `type` - Content type filter (optional): checkins, reviews, blogs, testimonials, all

## Examples

### Show only 3 recent check-ins:
```
[rankitpro_checkins company_id="16" limit="3"]
```

### Show all content with limit of 8:
```
[rankitpro_all company_id="16" limit="8"]
```

### Show only testimonials:
```
[rankitpro_testimonials company_id="16"]
```

## Your Company Details

- **Company ID**: 16
- **Company Name**: Carrollton Sprinkler Repair
- **API Key**: b3e9eac681d470e6a925093552bc85f50b5b23541f0bdf82e4c838c9bc03cb51

## Current Content Available

### Reviews (2):
- Sarah Mitchell (5-star rating)
- David Chen (5-star rating)

### Testimonials (4):
- Jennifer Rodriguez (Audio testimonial)
- Michael Thompson (Video testimonial)
- Maria Rodriguez (Audio testimonial)
- James Wilson (Video testimonial)

### Check-ins (Service Visits):
- Production Test visit by Rod Bartruff

### Blog Posts:
- Multiple professional service posts with photos