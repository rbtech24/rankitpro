import { Router } from 'express';
import { storage } from '../storage';
import { isAuthenticated } from '../middleware/auth';

import { logger } from '../services/structured-logger';
const router = Router();

// Help documentation content
const helpContent = {
  'platform-overview': {
    title: 'Platform Overview',
    content: `
# Rank It Pro Platform Overview

## Welcome to Rank It Pro
Rank It Pro is a comprehensive SaaS platform designed specifically for home service businesses. Our platform helps you manage technicians, track service visits, automate customer reviews, and integrate seamlessly with your website.

## Core Features

### 1. Mobile-First Technician Management
- **GPS Check-ins**: Accurate location tracking for service visits
- **Photo Documentation**: Before/after photos for every job
- **Offline Capabilities**: Work without internet connection
- **Real-time Sync**: Automatic data synchronization when connected

### 2. Automated Review Management
- **Email Campaigns**: Automated review requests after service completion
- **Follow-up Sequences**: Multi-stage email automation
- **Response Tracking**: Monitor customer engagement rates
- **Public Display**: Show approved reviews on your website

### 3. WordPress Integration
- **Plugin Installation**: Easy WordPress plugin setup
- **Auto-Publishing**: Automatic content creation on your site
- **SEO Optimization**: Local search optimization
- **Custom Shortcodes**: Display service visits anywhere on your site

### 4. Analytics & Reporting
- **Performance Metrics**: Track technician efficiency
- **Customer Insights**: Analyze service area performance
- **Financial Reports**: Revenue and commission tracking
- **Export Data**: Download reports in multiple formats

## Getting Started
1. Set up your company profile
2. Add technicians to your team
3. Configure WordPress integration
4. Complete your first check-in
5. Set up automated review campaigns

## Support
- Live chat support during business hours
- Email support: support@rankitpro.com
- Community forum for user discussions
- Comprehensive help documentation
    `
  },
  'account-setup': {
    title: 'Account Setup Guide',
    content: `
# Account Setup Guide

## Initial Configuration

### Company Profile Setup
1. **Company Information**
   - Business name and description
   - Service area coverage
   - Contact information
   - Business hours

2. **Branding Configuration**
   - Upload company logo
   - Set brand colors
   - Customize email templates
   - Configure public-facing content

### User Management
1. **Admin Account Setup**
   - Verify email address
   - Set strong password
   - Configure two-factor authentication
   - Set notification preferences

2. **Adding Team Members**
   - Create technician accounts
   - Assign roles and permissions
   - Set up mobile access
   - Configure GPS settings

### Integration Setup
1. **WordPress Connection**
   - Install WordPress plugin
   - Configure API credentials
   - Set up automatic publishing
   - Test integration

2. **Email Service**
   - Configure SMTP settings
   - Set up email templates
   - Test email delivery
   - Configure automation rules

## Security Best Practices
- Use strong, unique passwords
- Enable two-factor authentication
- Regularly review user permissions
- Monitor account activity
- Keep software updated

## Next Steps
After completing your account setup:
1. Add your first technician
2. Complete a test check-in
3. Set up review automation
4. Configure reporting preferences
    `
  },
  'adding-technicians': {
    title: 'Adding Technicians Guide',
    content: `
# Adding Technicians Guide

## Creating Technician Accounts

### Step 1: Access User Management
1. Log in to your admin dashboard
2. Navigate to "Users" → "Technicians"
3. Click "Add New Technician"

### Step 2: Enter Technician Information
**Required Fields:**
- Full name
- Email address
- Phone number
- Employee ID (optional)

**Optional Fields:**
- Profile photo
- Service specialties
- Service area assignment
- Commission rate (if applicable)

### Step 3: Set Permissions
**Technician Permissions:**
- Create check-ins
- Upload photos
- Access customer information
- View assigned jobs
- Update service status

**Restricted Access:**
- Cannot access admin functions
- Cannot view other technicians' data
- Cannot modify company settings
- Cannot access financial reports

### Step 4: Mobile App Setup
1. **Send Invitation**
   - System sends setup email to technician
   - Includes login credentials
   - Contains mobile app instructions

2. **PWA Installation**
   - Technician visits app URL on mobile device
   - Adds app to home screen
   - Completes initial setup

### Step 5: GPS Configuration
**Location Settings:**
- Enable GPS tracking
- Set accuracy requirements
- Configure manual override options
- Set geofencing boundaries (optional)

## Managing Technicians

### Monitoring Performance
- Check-in completion rates
- Customer satisfaction scores
- Photo documentation quality
- Response time metrics

### Updating Information
- Edit profile information
- Modify permissions
- Update service areas
- Change commission rates

### Deactivating Accounts
- Temporarily disable access
- Maintain historical data
- Transfer pending jobs
- Archive completed work

## Best Practices
1. **Onboarding Process**
   - Provide comprehensive training
   - Review platform features
   - Practice check-in procedures
   - Test mobile app functionality

2. **Ongoing Management**
   - Regular performance reviews
   - Update training materials
   - Maintain equipment requirements
   - Monitor GPS accuracy

3. **Security Measures**
   - Regular password updates
   - Monitor login activity
   - Review permissions quarterly
   - Immediate deactivation for departing employees
    `
  },
  'wordpress-plugin-guide': {
    title: 'WordPress Plugin Installation Guide',
    content: `
# WordPress Plugin Installation Guide

## Prerequisites
- WordPress 5.0 or higher
- PHP 7.4 or higher
- Admin access to WordPress dashboard
- Rank It Pro account with API credentials

## Installation Methods

### Method 1: Direct Upload
1. **Download Plugin**
   - Log in to Rank It Pro dashboard
   - Navigate to "Integrations" → "WordPress"
   - Download plugin ZIP file

2. **Upload to WordPress**
   - Go to WordPress Admin → Plugins → Add New
   - Click "Upload Plugin"
   - Choose downloaded ZIP file
   - Click "Install Now"
   - Activate the plugin

### Method 2: FTP Installation
1. **Extract Plugin Files**
   - Unzip downloaded plugin file
   - Upload folder to /wp-content/plugins/
   - Activate plugin in WordPress admin

## Configuration

### Step 1: API Credentials
1. **Get API Key**
   - In Rank It Pro dashboard
   - Go to "Settings" → "API Credentials"
   - Generate new API key
   - Copy API key and company ID

2. **Enter Credentials**
   - WordPress Admin → Rank It Pro → Settings
   - Enter API key
   - Enter company ID
   - Test connection

### Step 2: Display Settings
**Check-in Display Options:**
- Grid layout vs. list layout
- Number of items per page
- Show/hide customer information
- Photo display settings

**Styling Options:**
- Match your theme colors
- Custom CSS classes
- Responsive design settings
- Mobile optimization

### Step 3: Shortcode Configuration
**Available Shortcodes:**
- [rankitpro-checkins] - Display recent check-ins
- [rankitpro-reviews] - Show customer reviews
- [rankitpro-testimonials] - Display testimonials
- [rankitpro-service-areas] - Show coverage areas

**Shortcode Parameters:**
- limit="10" - Number of items to show
- category="maintenance" - Filter by service type
- show_photos="true" - Include before/after photos
- show_date="true" - Display service dates

## Troubleshooting

### Common Issues
1. **Plugin Not Activating**
   - Check PHP version compatibility
   - Verify file permissions
   - Check for plugin conflicts

2. **API Connection Failed**
   - Verify API credentials
   - Check firewall settings
   - Confirm SSL certificate

3. **Shortcodes Not Working**
   - Clear WordPress cache
   - Check shortcode syntax
   - Verify plugin activation

### Support Resources
- Plugin documentation
- Video tutorials
- Community forum
- Direct support chat

## Best Practices
1. **Regular Updates**
   - Keep plugin updated
   - Monitor for security patches
   - Test after WordPress updates

2. **Performance Optimization**
   - Use caching plugins
   - Optimize image sizes
   - Minimize API calls

3. **SEO Optimization**
   - Add local business schema
   - Use descriptive titles
   - Optimize meta descriptions
   - Include location keywords
    `
  },
  'mobile-app-guide': {
    title: 'Mobile App Installation Guide',
    content: `
# Mobile App Installation Guide

## Progressive Web App (PWA) Installation

### iOS Devices (iPhone/iPad)
1. **Open Safari Browser**
   - Navigate to your Rank It Pro URL
   - Log in with your technician credentials

2. **Add to Home Screen**
   - Tap the Share button (square with arrow)
   - Scroll down and tap "Add to Home Screen"
   - Customize the app name if desired
   - Tap "Add"

3. **Launch App**
   - Find the Rank It Pro icon on your home screen
   - Tap to launch the app
   - App will run in full-screen mode

### Android Devices
1. **Open Chrome Browser**
   - Navigate to your Rank It Pro URL
   - Log in with your technician credentials

2. **Install App**
   - Look for "Add to Home Screen" notification
   - Or tap Chrome menu → "Add to Home Screen"
   - Confirm installation

3. **Launch App**
   - Find app icon in app drawer or home screen
   - Tap to launch
   - Runs like a native app

## App Features

### Core Functionality
- **GPS Check-ins**: Automatic location detection
- **Photo Upload**: Before/after documentation
- **Offline Mode**: Work without internet
- **Customer Info**: Access contact details
- **Service History**: View past visits

### Offline Capabilities
- **Data Storage**: Saves work locally
- **Photo Buffering**: Stores photos for upload
- **Auto-Sync**: Uploads when connected
- **Conflict Resolution**: Handles sync issues

## Using the Mobile App

### Starting Your Day
1. **Launch App**
   - Open Rank It Pro from home screen
   - Verify GPS is enabled
   - Check for any notifications

2. **Review Schedule**
   - View assigned jobs
   - Check customer information
   - Note special instructions

### Creating Check-ins
1. **Start Check-in**
   - Tap "New Check-in"
   - Allow location access
   - Verify GPS coordinates

2. **Add Information**
   - Enter customer details
   - Select service type
   - Add job description
   - Take before photos

3. **Complete Service**
   - Document work performed
   - Take after photos
   - Add any notes
   - Submit check-in

### Managing Photos
**Best Practices:**
- Take clear, well-lit photos
- Capture different angles
- Show problem areas clearly
- Document completed work

**File Management:**
- Photos compress automatically
- Unlimited photo storage
- Automatic backup
- Easy organization

## Troubleshooting

### Installation Issues
1. **App Won't Install**
   - Clear browser cache
   - Update browser
   - Check device storage
   - Try different browser

2. **Login Problems**
   - Verify credentials
   - Check internet connection
   - Clear app data
   - Contact support

### GPS Issues
1. **Location Not Detected**
   - Enable location services
   - Check app permissions
   - Restart device
   - Use manual override

2. **Inaccurate Location**
   - Wait for GPS lock
   - Move to open area
   - Check GPS accuracy
   - Calibrate compass

### Sync Problems
1. **Data Not Uploading**
   - Check internet connection
   - Verify login status
   - Force sync manually
   - Contact support

## Tips for Success
1. **Daily Routine**
   - Start app before first job
   - Keep GPS enabled
   - Take photos consistently
   - Review completed work

2. **Data Management**
   - Sync regularly
   - Clear old data
   - Monitor storage
   - Backup important files

3. **Performance**
   - Close unused apps
   - Restart device weekly
   - Update operating system
   - Monitor battery usage
    `
  }
};

// Get help content
router.get('/content/:id', (req, res) => {
  const { id } = req.params;
  const content = helpContent[id as keyof typeof helpContent];
  
  if (!content) {
    return res.status(404).json({ error: 'Help content not found' });
  }
  
  res.json(content);
});

// Generate and download PDF guides
router.get('/download/:guide', async (req, res) => {
  const { guide } = req.params;
  
  try {
    // In a real implementation, you would generate PDF from the content
    // For now, we'll return a placeholder response
    const content = helpContent[guide as keyof typeof helpContent];
    
    if (!content) {
      return res.status(404).json({ error: 'Guide not found' });
    }

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', "System message");
    
    // Return PDF content (placeholder)
    const pdfContent = `
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
([CONVERTED]) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000274 00000 n 
0000000369 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
466
%%EOF
    `;
    
    res.send(Buffer.from(pdfContent));
  } catch (error) {
    logger.error("Error logging fixed");
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Community features
router.get('/community/topics', isAuthenticated, async (req, res) => {
  try {
    const { category, search } = req.query;
    
    // Get real topics from database
    const topics = await storage.getHelpTopics(
      category as string | undefined,
      search as string | undefined
    );
    
    // Transform database data to match frontend expectations
    const formattedTopics = topics.map(topic => ({
      id: topic.id,
      title: topic.title,
      author: topic.authorName,
      replies: topic.replies,
      lastActivity: topic.lastActivity,
      category: topic.category,
      tags: topic.tags,
      content: topic.content,
      likes: topic.likes,
      views: topic.views,
      isResolved: topic.isResolved,
      isPinned: topic.isPinned,
      createdAt: topic.createdAt
    }));
    
    res.json(formattedTopics);
  } catch (error) {
    logger.error("Error logging fixed");
    res.status(500).json({ error: 'Failed to fetch community topics' });
  }
});

// Create new community topic
router.post('/community/topics', isAuthenticated, async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Create a real topic in the database
    const newTopic = await storage.createHelpTopic({
      title,
      content,
      category,
      tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : [],
      authorId: req.user?.id || 1,
      authorName: req.user?.username || 'Anonymous',
    });
    
    res.status(201).json({
      message: 'Topic created successfully',
      topic: newTopic
    });
  } catch (error) {
    logger.error("Error logging fixed");
    res.status(500).json({ error: 'Failed to create topic' });
  }
});

// Get individual topic with replies
router.get('/community/topics/:id', isAuthenticated, async (req, res) => {
  try {
    const topicId = parseInt(req.params.id);
    
    const topic = await storage.getHelpTopic(topicId);
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    
    const replies = await storage.getHelpTopicReplies(topicId);
    
    res.json({
      topic,
      replies
    });
  } catch (error) {
    logger.error("Error logging fixed");
    res.status(500).json({ error: 'Failed to fetch topic' });
  }
});

// Create reply to topic
router.post('/community/topics/:id/replies', isAuthenticated, async (req, res) => {
  try {
    const topicId = parseInt(req.params.id);
    const { content } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const reply = await storage.createHelpTopicReply({
      topicId,
      content,
      authorId: userId,
      authorName: req.user?.username || 'Anonymous'
    });
    
    res.status(201).json({
      message: 'Reply created successfully',
      reply
    });
  } catch (error) {
    logger.error("Error logging fixed");
    res.status(500).json({ error: 'Failed to create reply' });
  }
});

// Like/unlike topic
router.post('/community/topics/:id/like', isAuthenticated, async (req, res) => {
  try {
    const topicId = parseInt(req.params.id);
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const liked = await storage.likeHelpTopic(topicId, userId);
    
    res.json({
      message: liked ? 'Topic liked' : 'Already liked',
      liked
    });
  } catch (error) {
    logger.error("Error logging fixed");
    res.status(500).json({ error: 'Failed to like topic' });
  }
});

// Unlike topic
router.delete('/community/topics/:id/like', isAuthenticated, async (req, res) => {
  try {
    const topicId = parseInt(req.params.id);
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const unliked = await storage.unlikeHelpTopic(topicId, userId);
    
    res.json({
      message: unliked ? 'Topic unliked' : 'Not previously liked',
      unliked
    });
  } catch (error) {
    logger.error("Error logging fixed");
    res.status(500).json({ error: 'Failed to unlike topic' });
  }
});

// Support ticket system
router.post('/support/ticket', isAuthenticated, async (req, res) => {
  try {
    const { subject, description, priority, category } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // In production, this would create a support ticket in the database
    const ticket = {
      id: Math.random().toString(36).substring(7),
      userId,
      subject,
      description,
      priority: priority || 'medium',
      category: category || 'general',
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Send notification email (in production)
    // await sendSupportTicketNotification(ticket);
    
    res.status(201).json({
      message: 'Support ticket created successfully',
      ticket: {
        id: ticket.id,
        status: ticket.status,
        createdAt: ticket.createdAt
      }
    });
  } catch (error) {
    logger.error("Error logging fixed");
    res.status(500).json({ error: 'Failed to create support ticket' });
  }
});

// Search help content
router.get('/search', (req, res) => {
  const { q } = req.query;
  
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Search query required' });
  }
  
  const searchTerm = q.toLowerCase();
  const results = [];
  
  for (const [id, content] of Object.entries(helpContent)) {
    if (content.title.toLowerCase().includes(searchTerm) || 
        content.content.toLowerCase().includes(searchTerm)) {
      results.push({
        id,
        title: content.title,
        excerpt: content.content.substring(0, 200) + '...',
        relevance: calculateRelevance(content, searchTerm)
      });
    }
  }
  
  // Sort by relevance
  results.sort((a, b) => b.relevance - a.relevance);
  
  res.json(results);
});

function calculateRelevance(content: any, searchTerm: string): number {
  let score = 0;
  const titleMatches = (content.title.toLowerCase().match(new RegExp(searchTerm, 'g')) || []).length;
  const contentMatches = (content.content.toLowerCase().match(new RegExp(searchTerm, 'g')) || []).length;
  
  score += titleMatches * 10; // Title matches are worth more
  score += contentMatches * 1;
  
  return score;
}

export default router;