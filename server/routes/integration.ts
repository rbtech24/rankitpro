import express, { Request, Response } from "express";
import { isAuthenticated, isCompanyAdmin } from "../middleware/auth";
import { storage } from "../storage";
import { generateBlogPost, generateSummary, getAvailableAIProviders } from "../ai";
import { AIProviderType } from "../ai/types";
import { escapeHtml, sanitizeText, sanitizeUrl, createSafeTextContent } from "../utils/html-sanitizer";
import { logger } from "../services/logger";

import { logger } from '../services/logger';
const router = express.Router();

// WordPress integration settings
interface WordPressIntegration {
  siteUrl: string;
  apiKey: string;
  autoPublish: boolean;
}

// JavaScript embed integration settings
interface EmbedIntegration {
  settings: {
    showTechPhotos: boolean;
    showCheckInPhotos: boolean;
    theme: "light" | "dark" | "auto";
    style: "modern" | "classic" | "minimal";
    autoRefresh: boolean;
    refreshInterval: number; // in seconds
  };
  scriptCode: string;
  styleCode: string;
}

// ===== WordPress Integration =====

// Get WordPress integration settings
router.get("/wordpress", isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.companyId) {
      return res.status(400).json({ message: "User does not belong to a company" });
    }

    const company = await storage.getCompany(user.companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Get WordPress integration settings from company data
    const wordpressConfig = company.wordpressConfig ? JSON.parse(company.wordpressConfig) : null;
    
    if (!wordpressConfig) {
      return res.json({ success: true });
    }
    
    const wordpressIntegration: WordPressIntegration = {
      siteUrl: wordpressConfig.siteUrl || "",
      apiKey: wordpressConfig.apiKey || "",
      autoPublish: wordpressConfig.autoPublish || false
    };

    return res.json(wordpressIntegration);
  } catch (error) {
    logger.error("Database operation error", { error: error?.message || "Unknown error" });
    return res.status(500).json({ message: "Error fetching WordPress integration" });
  }
});

// Update WordPress integration settings
router.post("/wordpress", isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.companyId) {
      return res.status(400).json({ message: "User does not belong to a company" });
    }

    const { siteUrl, autoPublish } = req.body as Partial<WordPressIntegration>;
    
    if (!siteUrl) {
      return res.status(400).json({ message: "Site URL is required" });
    }

    // Import production utilities
    const { generateSecureApiKey, validateAndSanitizeUrl } = await import("../utils/production-fixes");
    
    // Validate and sanitize the site URL
    const validatedSiteUrl = validateAndSanitizeUrl(siteUrl);
    
    // Generate a secure API key
    const apiKey = await generateSecureApiKey("wp");

    // Save WordPress integration settings to company database
    const wordpressConfig = {
      siteUrl: validatedSiteUrl,
      apiKey,
      autoPublish: autoPublish ?? true,
      configuredAt: new Date().toISOString()
    };
    
    await storage.updateCompany(user.companyId, {
      wordpressConfig: JSON.stringify(wordpressConfig)
    });

    const wordpressIntegration: WordPressIntegration = {
      siteUrl: validatedSiteUrl,
      apiKey,
      autoPublish: autoPublish ?? true
    };

    return res.json(wordpressIntegration);
  } catch (error) {
    logger.error("Unhandled error occurred");
    return res.status(500).json({ message: "Error updating WordPress integration" });
  }
});

// ===== JavaScript Embed Integration =====

// Get JavaScript embed code and settings
router.get("/embed", isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.companyId) {
      return res.status(400).json({ message: "User does not belong to a company" });
    }

    const company = await storage.getCompany(user.companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Get embed integration settings from company data
    const embedConfig = company.javaScriptEmbedConfig ? JSON.parse(company.javaScriptEmbedConfig) : null;
    
    const defaultSettings = {
      showTechPhotos: true,
      showCheckInPhotos: true,
      theme: "light",
      style: "modern",
      autoRefresh: true,
      refreshInterval: 300
    };

    const settings = embedConfig?.settings || defaultSettings;
    const { getBaseUrl } = await import("../utils/url-helper");
    const baseUrl = getBaseUrl();
    
    const scriptCode = `
<div id="checkin-widget-content" class="checkin-widget"></div>
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'content/api/integration/embed/widget.js';
    script.async = true;
    script.onload = function() {
      CheckInWidget.init({
        targetSelector: '#checkin-widget-content',
        companyId: content,
        theme: 'content',
        style: 'content',
        showTechPhotos: content,
        showCheckInPhotos: content,
        autoRefresh: content,
        refreshInterval: content
      });
    };
    document.head.appendChild(script);
  })();
</script>`;

    let styleCode = `
.checkin-widget {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
  border-radius: 8px;
}`;

    if (settings.style === "modern") {
      styleCode += `
.checkin-widget {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}`;
    } else if (settings.style === "classic") {
      styleCode += `
.checkin-widget {
  border: 1px solid #ddd;
}`;
    }

    if (settings.theme === "dark") {
      styleCode += `
.checkin-widget {
  background-color: #222;
  color: #fff;
}`;
    }

    const embedIntegration: EmbedIntegration = {
      settings,
      scriptCode,
      styleCode
    };

    return res.json(embedIntegration);
  } catch (error) {
    logger.error("Unhandled error occurred");
    return res.status(500).json({ message: "Error fetching embed integration" });
  }
});

// Update JavaScript embed settings
router.post("/embed", isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.companyId) {
      return res.status(400).json({ message: "User does not belong to a company" });
    }

    const settings = req.body.settings as EmbedIntegration["settings"];
    
    if (!settings) {
      return res.status(400).json({ message: "Settings are required" });
    }

    const company = await storage.getCompany(user.companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Update the script code with the new settings
    const scriptCode = `
<div id="checkin-widget-content" class="checkin-widget"></div>
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'content://content/api/integration/embed/widget.js';
    script.async = true;
    script.onload = function() {
      CheckInWidget.init({
        targetSelector: '#checkin-widget-content',
        companyId: content,
        theme: 'content',
        style: 'content',
        showTechPhotos: content,
        showCheckInPhotos: content,
        autoRefresh: content,
        refreshInterval: content
      });
    };
    document.head.appendChild(script);
  })();
</script>`;

    // Update the style code based on the selected style
    let styleCode = `
.checkin-widget {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
  border-radius: 8px;
}`;

    if (settings.style === "modern") {
      styleCode += `
.checkin-widget {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}`;
    } else if (settings.style === "classic") {
      styleCode += `
.checkin-widget {
  border: 1px solid #ddd;
}`;
    }

    if (settings.theme === "dark") {
      styleCode += `
.checkin-widget {
  background-color: #222;
  color: #fff;
}`;
    }

    // Save embed integration settings to company database
    const embedConfigData = {
      settings,
      lastUpdated: new Date().toISOString()
    };
    
    await storage.updateCompany(user.companyId, {
      javaScriptEmbedConfig: JSON.stringify(embedConfigData)
    });

    const embedIntegration: EmbedIntegration = {
      settings,
      scriptCode,
      styleCode
    };

    return res.json(embedIntegration);
  } catch (error) {
    logger.error("Database operation error", { error: error?.message || "Unknown error" });
    return res.status(500).json({ message: "Error updating embed integration" });
  }
});

// Serve the widget.js file
router.get("/embed/widget.js", async (_req: Request, res: Response) => {
  // This would be a client-side JavaScript file that renders the check-ins widget
  const widgetJs = `
const CheckInWidget = (function() {
  let config = {};
  
  function init(options) {
    config = options || {};
    fetchCheckIns();
    
    if (config.autoRefresh) {
      setInterval(fetchCheckIns, (config.refreshInterval || 300) * 1000);
    }
  }
  
  function fetchCheckIns() {
    fetch('/api/integration/embed/data?companyId=' + config.companyId)
      .then(response => response.json())
      .then(data => {
        renderWidget(data);
      })
      .catch(error => {
        logger.error("Unhandled error occurred");
      });
  }
  
  function renderWidget(data) {
    const container = document.querySelector(config.targetSelector);
    if (!container) return;
    
    // Clear container safely
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    
    // Apply theme safely
    const safeTheme = (config.theme || 'light').replace(/[^a-zA-Z0-9-]/g, '');
    const safeStyle = (config.style || 'modern').replace(/[^a-zA-Z0-9-]/g, '');
    container.classList.add('checkin-theme-' + safeTheme);
    container.classList.add('checkin-style-' + safeStyle);
    
    // Header - safe text content
    const header = document.createElement('div');
    header.className = 'checkin-header';
    const headerTitle = document.createElement('h3');
    headerTitle.textContent = 'Recent Service Check-Ins';
    header.appendChild(headerTitle);
    container.appendChild(header);
    
    // Check-ins
    const checkInsContainer = document.createElement('div');
    checkInsContainer.className = 'checkin-list';
    
    if (data.checkIns && data.checkIns.length > 0) {
      data.checkIns.forEach(checkIn => {
        const checkInElement = document.createElement('div');
        checkInElement.className = 'checkin-item';
        
        // Create technician info safely
        const technicianInfoDiv = document.createElement('div');
        technicianInfoDiv.className = 'technician-info';
        
        if (config.showTechPhotos && checkIn.technician && checkIn.technician.photo) {
          const techPhoto = document.createElement('img');
          techPhoto.src = sanitizeUrl(checkIn.technician.photo);
          techPhoto.alt = sanitizeText(checkIn.technician.name);
          techPhoto.className = 'technician-photo';
          technicianInfoDiv.appendChild(techPhoto);
        }
        
        const techNameSpan = document.createElement('span');
        techNameSpan.className = 'technician-name';
        techNameSpan.textContent = sanitizeText(checkIn.technician ? checkIn.technician.name : 'Technician');
        technicianInfoDiv.appendChild(techNameSpan);
        
        // Create check-in photos safely
        const checkInPhotosDiv = document.createElement('div');
        checkInPhotosDiv.className = 'checkin-photos';
        
        if (config.showCheckInPhotos && checkIn.photos && checkIn.photos.length > 0) {
          checkIn.photos.forEach(photo => {
      const photoImg = document.createElement('img');
            photoImg.src = sanitizeUrl(photo);
            photoImg.alt = 'Check-in photo';
            photoImg.className = 'checkin-photo';
            checkInPhotosDiv.appendChild(photoImg);
          });
        }
        
        // Build check-in element safely
        const checkInHeaderDiv = document.createElement('div');
        checkInHeaderDiv.className = 'checkin-header';
        checkInHeaderDiv.appendChild(technicianInfoDiv);
        
        const checkInTime = document.createElement('div');
        checkInTime.className = 'checkin-time';
        checkInTime.textContent = new Date(checkIn.createdAt).toLocaleDateString();
        checkInHeaderDiv.appendChild(checkInTime);
        
        const jobTypeDiv = document.createElement('div');
        jobTypeDiv.className = 'checkin-job-type';
        jobTypeDiv.textContent = sanitizeText(checkIn.jobType);
        
        const locationDiv = document.createElement('div');
        locationDiv.className = 'checkin-location';
        locationDiv.textContent = sanitizeText(checkIn.location || '');
        
        const notesDiv = document.createElement('div');
        notesDiv.className = 'checkin-notes';
        notesDiv.textContent = sanitizeText(checkIn.notes || '');
        
        checkInElement.appendChild(checkInHeaderDiv);
        checkInElement.appendChild(jobTypeDiv);
        checkInElement.appendChild(locationDiv);
        checkInElement.appendChild(notesDiv);
        if (checkInPhotosDiv.children.length > 0) {
          checkInElement.appendChild(checkInPhotosDiv);
        }
        
        checkInsContainer.appendChild(checkInElement);
      });
    } else {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'checkin-empty';
      emptyDiv.textContent = 'No recent check-ins available.';
      checkInsContainer.appendChild(emptyDiv);
    }
    
    container.appendChild(checkInsContainer);
    
    // Footer - safe link creation
    const footer = document.createElement('div');
    footer.className = 'checkin-footer';
    const footerLink = document.createElement('a');
    footerLink.href = '#';
    footerLink.target = '_blank';
    footerLink.textContent = 'Powered by Rank it Pro';
    footer.appendChild(footerLink);
    container.appendChild(footer);
    
    // Apply styles
    applyStyles();
  }
  
  function applyStyles() {
    if (!document.getElementById('checkin-widget-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'checkin-widget-styles';
      
      let css = \`
        .checkin-widget {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          max-width: 100%;
          margin: 0 auto;
          padding: 20px;
          border-radius: 8px;
        }
        
        .checkin-theme-light {
          background-color: #fff;
          color: #333;
        }
        
        .checkin-theme-dark {
          background-color: #222;
          color: #fff;
        }
        
        .checkin-style-modern {
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .checkin-style-classic {
          border: 1px solid #ddd;
        }
        
        .checkin-style-minimal {
          border: none;
          box-shadow: none;
          padding: 0;
        }
        
        .checkin-header h3 {
          margin-top: 0;
          margin-bottom: 1rem;
        }
        
        .checkin-item {
          margin-bottom: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }
        
        .checkin-theme-dark .checkin-item {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .checkin-item:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        
        .checkin-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }
        
        .technician-info {
          display: flex;
          align-items: center;
          font-weight: bold;
        }
        
        .technician-photo {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          margin-right: 0.5rem;
          object-fit: cover;
        }
        
        .checkin-time {
          font-size: 0.85em;
          opacity: 0.7;
        }
        
        .checkin-job-type {
          font-weight: bold;
          margin-bottom: 0.25rem;
        }
        
        .checkin-location {
          font-size: 0.9em;
          margin-bottom: 0.25rem;
          opacity: 0.8;
        }
        
        .checkin-notes {
          margin-bottom: 0.5rem;
          white-space: pre-line;
        }
        
        .checkin-photos {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        
        .checkin-photo {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 4px;
        }
        
        .checkin-footer {
          margin-top: 1rem;
          text-align: right;
          font-size: 0.8em;
          opacity: 0.7;
        }
        
        .checkin-footer a {
          text-decoration: none;
          color: inherit;
        }
        
        .checkin-empty {
          padding: 2rem 0;
          text-align: center;
          opacity: 0.7;
        }
      \`;
      
      styleElement.textContent = css;
      document.head.appendChild(styleElement);
    }
  }
  
  return {
    init
  };
})();`;

  // Set the appropriate content type and send the JavaScript
  res.setHeader('Content-Type', 'application/javascript');
  res.send(widgetJs);
});

// Endpoint to get the check-ins data for the widget
router.get("/embed/data", async (req: Request, res: Response) => {
  try {
    const companyId = Number(req.query.companyId);
    
    if (isNaN(companyId)) {
      return res.status(400).json({ message: "Invalid company ID" });
    }

    // Get recent check-ins for the company
    const checkIns = await storage.getCheckInsByCompany(companyId, 5);

    // Format the response with only the necessary information
    const formattedCheckIns = checkIns.map(checkIn => ({
      id: checkIn.id,
      jobType: checkIn.jobType,
      notes: checkIn.notes,
      location: checkIn.location,
      createdAt: checkIn.createdAt,
      technician: {
        name: checkIn.technician.name,
        specialty: checkIn.technician.specialty
        // In a real implementation, we would include photo URLs
      },
      photos: [] // In a real implementation, we would include photo URLs
    }));

    return res.json({ checkIns: formattedCheckIns });
  } catch (error) {
    logger.error("Database operation error", { error: error?.message || "Unknown error" });
    return res.status(500).json({ message: "Error fetching embed data" });
  }
});

// ===== AI Integration =====

// Get available AI providers
router.get("/ai/providers", isAuthenticated, isCompanyAdmin, async (_req: Request, res: Response) => {
  try {
    const providers = getAvailableAIProviders();
    return res.json({ providers });
  } catch (error) {
    logger.error("Database operation error", { error: error?.message || "Unknown error" });
    return res.status(500).json({ message: "Error fetching AI providers" });
  }
});

// Generate a summary using AI
router.post("/ai/generate-summary", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { jobType, notes, location, technicianName, provider } = req.body;
    
    if (!jobType || !notes || !technicianName) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    const summary = await generateSummary({
      jobType,
      notes,
      location,
      technicianName
    }, provider as AIProviderType);

    return res.json({ summary });
  } catch (error) {
    logger.error("Database operation error", { error: error?.message || "Unknown error" });
    return res.status(500).json({ message: "Error generating summary" });
  }
});

// Generate a blog post using AI
router.post("/ai/generate-blog-post", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { jobType, notes, location, technicianName, provider } = req.body;
    
    if (!jobType || !notes || !technicianName) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    const blogPost = await generateBlogPost({
      jobType,
      notes,
      location,
      technicianName
    }, provider as AIProviderType);

    return res.json(blogPost);
  } catch (error) {
    logger.error("Database operation error", { error: error?.message || "Unknown error" });
    return res.status(500).json({ message: "Error generating blog post" });
  }
});

export default router;