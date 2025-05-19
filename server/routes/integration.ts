import express, { Request, Response } from "express";
import { isAuthenticated, isCompanyAdmin } from "../middleware/auth";
import { storage } from "../storage";
import { generateBlogPost, generateSummary, getAvailableAIProviders } from "../ai";
import { AIProviderType } from "../ai/types";

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

    // In a real implementation, we would retrieve this from the database
    // For now, we'll use a placeholder
    const wordpressIntegration: WordPressIntegration = {
      siteUrl: "https://example.com",
      apiKey: "wp_" + Math.random().toString(36).substring(2, 15),
      autoPublish: true
    };

    return res.json(wordpressIntegration);
  } catch (error) {
    console.error("Error fetching WordPress integration:", error);
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

    // Generate a new API key if one is not provided
    const apiKey = "wp_" + Math.random().toString(36).substring(2, 15);

    // In a real implementation, we would save this to the database
    const wordpressIntegration: WordPressIntegration = {
      siteUrl,
      apiKey,
      autoPublish: autoPublish ?? true
    };

    return res.json(wordpressIntegration);
  } catch (error) {
    console.error("Error updating WordPress integration:", error);
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

    // In a real implementation, we would retrieve this from the database
    // For now, we'll generate a placeholder
    const scriptCode = `
<div id="checkin-widget-${company.id}" class="checkin-widget"></div>
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${req.protocol}://${req.get('host')}/api/integration/embed/widget.js';
    script.async = true;
    script.onload = function() {
      CheckInWidget.init({
        targetSelector: '#checkin-widget-${company.id}',
        companyId: ${company.id},
        theme: 'light',
        style: 'modern',
        showTechPhotos: true,
        showCheckInPhotos: true,
        autoRefresh: true,
        refreshInterval: 300
      });
    };
    document.head.appendChild(script);
  })();
</script>`;

    const styleCode = `
.checkin-widget {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}`;

    const embedIntegration: EmbedIntegration = {
      settings: {
        showTechPhotos: true,
        showCheckInPhotos: true,
        theme: "light",
        style: "modern",
        autoRefresh: true,
        refreshInterval: 300
      },
      scriptCode,
      styleCode
    };

    return res.json(embedIntegration);
  } catch (error) {
    console.error("Error fetching embed integration:", error);
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
<div id="checkin-widget-${company.id}" class="checkin-widget"></div>
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${req.protocol}://${req.get('host')}/api/integration/embed/widget.js';
    script.async = true;
    script.onload = function() {
      CheckInWidget.init({
        targetSelector: '#checkin-widget-${company.id}',
        companyId: ${company.id},
        theme: '${settings.theme}',
        style: '${settings.style}',
        showTechPhotos: ${settings.showTechPhotos},
        showCheckInPhotos: ${settings.showCheckInPhotos},
        autoRefresh: ${settings.autoRefresh},
        refreshInterval: ${settings.refreshInterval}
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

    // In a real implementation, we would save this to the database
    const embedIntegration: EmbedIntegration = {
      settings,
      scriptCode,
      styleCode
    };

    return res.json(embedIntegration);
  } catch (error) {
    console.error("Error updating embed integration:", error);
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
        console.error('Error fetching check-ins:', error);
      });
  }
  
  function renderWidget(data) {
    const container = document.querySelector(config.targetSelector);
    if (!container) return;
    
    container.innerHTML = '';
    
    // Apply theme
    container.classList.add('checkin-theme-' + (config.theme || 'light'));
    container.classList.add('checkin-style-' + (config.style || 'modern'));
    
    // Header
    const header = document.createElement('div');
    header.className = 'checkin-header';
    header.innerHTML = '<h3>Recent Service Check-Ins</h3>';
    container.appendChild(header);
    
    // Check-ins
    const checkInsContainer = document.createElement('div');
    checkInsContainer.className = 'checkin-list';
    
    if (data.checkIns && data.checkIns.length > 0) {
      data.checkIns.forEach(checkIn => {
        const checkInElement = document.createElement('div');
        checkInElement.className = 'checkin-item';
        
        let technicianInfo = '';
        if (config.showTechPhotos && checkIn.technician && checkIn.technician.photo) {
          technicianInfo += \`<img src="\${checkIn.technician.photo}" alt="\${checkIn.technician.name}" class="technician-photo">\`;
        }
        technicianInfo += \`<span class="technician-name">\${checkIn.technician ? checkIn.technician.name : 'Technician'}</span>\`;
        
        let checkInPhotos = '';
        if (config.showCheckInPhotos && checkIn.photos && checkIn.photos.length > 0) {
          checkInPhotos = '<div class="checkin-photos">';
          checkIn.photos.forEach(photo => {
            checkInPhotos += \`<img src="\${photo}" alt="Check-in photo" class="checkin-photo">\`;
          });
          checkInPhotos += '</div>';
        }
        
        checkInElement.innerHTML = \`
          <div class="checkin-header">
            <div class="technician-info">\${technicianInfo}</div>
            <div class="checkin-time">\${new Date(checkIn.createdAt).toLocaleDateString()}</div>
          </div>
          <div class="checkin-job-type">\${checkIn.jobType}</div>
          <div class="checkin-location">\${checkIn.location || ''}</div>
          <div class="checkin-notes">\${checkIn.notes || ''}</div>
          \${checkInPhotos}
        \`;
        
        checkInsContainer.appendChild(checkInElement);
      });
    } else {
      checkInsContainer.innerHTML = '<div class="checkin-empty">No recent check-ins available.</div>';
    }
    
    container.appendChild(checkInsContainer);
    
    // Footer
    const footer = document.createElement('div');
    footer.className = 'checkin-footer';
    footer.innerHTML = '<a href="https://rankitpro.com" target="_blank">Powered by Rank it Pro</a>';
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
    console.error("Error fetching embed data:", error);
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
    console.error("Error fetching AI providers:", error);
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
    console.error("Error generating summary:", error);
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
    console.error("Error generating blog post:", error);
    return res.status(500).json({ message: "Error generating blog post" });
  }
});

export default router;