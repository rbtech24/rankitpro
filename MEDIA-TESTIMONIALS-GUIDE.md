# Audio & Video Testimonials Implementation Guide

## How Media Testimonials Work

### Customer Recording Process
1. **Recording Interface**: Customers can record audio/video testimonials directly through the platform using:
   - Browser's MediaRecorder API for real-time recording
   - File upload for pre-recorded testimonials
   - Mobile app integration with device camera/microphone

2. **File Storage**: Media files are stored in:
   - **Cloud Storage**: AWS S3, Google Cloud Storage, or similar
   - **CDN Distribution**: For fast global delivery
   - **Database**: Only stores file URLs, metadata, and transcriptions

### Technical Implementation

#### Frontend (Customer Dashboard)
```typescript
// Audio/Video recording component
const MediaRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  
  const startRecording = async (type: 'audio' | 'video') => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: type === 'video'
    });
    
    const recorder = new MediaRecorder(stream);
    // Recording logic...
  };
};
```

#### Media Storage Structure
```
/testimonials/
  /company-16/
    /audio/
      - jennifer-rodriguez-2025-06-23.mp3 (2.1MB)
      - maria-rodriguez-2025-06-23.wav (3.4MB)
    /video/
      - michael-thompson-2025-06-23.mp4 (12.8MB)
      - james-wilson-2025-06-23.webm (8.9MB)
```

#### Database Schema
```sql
CREATE TABLE testimonials (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  content TEXT NOT NULL, -- Transcription for audio/video
  type testimonial_type NOT NULL, -- 'text', 'audio', 'video'
  media_url VARCHAR(500), -- S3/CDN URL
  file_size INTEGER, -- In bytes
  duration INTEGER, -- In seconds for audio/video
  status approval_status DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### WordPress Site Display

#### Shortcode Usage
```php
// Display testimonials with media players
[rankitpro type="testimonials" company_id="16" limit="5"]
```

#### Generated HTML with Media Players
- **Audio**: HTML5 `<audio>` controls with multiple format support
- **Video**: HTML5 `<video>` controls with responsive sizing
- **Fallback**: Text transcription always available
- **Accessibility**: Closed captions and keyboard navigation

### Company Dashboard Features

#### Media Management
1. **Preview Players**: Native HTML5 audio/video controls
2. **Approval Workflow**: Listen/watch before publishing
3. **Transcription**: Automatic speech-to-text for searchability
4. **Analytics**: Play counts, engagement metrics
5. **Download**: Export media files for other marketing uses

#### Technical Features
- **Lazy Loading**: Media only loads when in viewport
- **Compression**: Automatic optimization for web delivery
- **Multiple Formats**: MP3/WAV for audio, MP4/WebM for video
- **Responsive**: Adapts to mobile/tablet/desktop screens

### Security & Privacy

#### Media Protection
- **Signed URLs**: Temporary access tokens for sensitive content
- **Domain Restriction**: Only embed on authorized websites
- **Expiration**: Time-limited access to prevent hotlinking
- **Watermarking**: Optional company branding overlay

#### Customer Consent
- **Recording Consent**: Clear permission before recording
- **Usage Rights**: Explicit agreement for marketing use
- **Deletion Rights**: Customers can request removal
- **Privacy Compliance**: GDPR/CCPA compliant handling

### Current Implementation Status

✅ **Completed**:
- Database schema with media_url support
- HTML5 players in dashboard and WordPress widget
- File format support (MP3, WAV, MP4, WebM)
- Responsive design and accessibility

🔄 **In Progress**:
- Recording interface for customers
- Cloud storage integration
- Automatic transcription service

📋 **Planned**:
- Mobile app recording
- Advanced analytics
- Automatic compression
- CDN distribution

### Example Media URLs
Current testimonials use placeholder URLs:
- `https://example.com/audio/jennifer-testimonial.mp3`
- `https://example.com/video/michael-testimonial.mp4`

Production implementation would use actual cloud storage URLs:
- `https://cdn.rankitpro.com/testimonials/company-16/audio/jennifer-rodriguez-hash.mp3`
- `https://videos.rankitpro.com/testimonials/company-16/video/michael-thompson-hash.mp4`