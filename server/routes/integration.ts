import { Router } from "express";
import { isAuthenticated, isCompanyAdmin } from "../middleware/auth";
import crypto from "crypto";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { generateSummary, generateBlogPost, getAvailableAIProviders, AIProviderType } from "../ai-service";

// Schema for WordPress integration
const wordpressIntegrationSchema = z.object({
  siteUrl: z.string().url(),
  apiKey: z.string().optional(),
  autoPublish: z.boolean().default(true),
  includePhotos: z.boolean().default(true),
  addSchemaMarkup: z.boolean().default(true),
  displayMap: z.boolean().default(true),
  postType: z.enum(["post", "check_in", "custom"]).default("check_in"),
  category: z.string().optional(),
});

// Schema for JavaScript embed
const embedIntegrationSchema = z.object({
  showTechPhotos: z.boolean().default(true),
  showCheckInPhotos: z.boolean().default(true),
  maxCheckIns: z.number().int().min(1).max(20).default(5),
  linkFullPosts: z.boolean().default(true),
  customCss: z.string().optional(),
  width: z.enum(["full", "fixed"]).default("full"),
  fixedWidth: z.number().int().min(200).max(1200).optional(),
});

// Content generation schema
const contentGenerationSchema = z.object({
  jobType: z.string(),
  notes: z.string(),
  location: z.string().optional(),
  technicianName: z.string(),
  provider: z.enum(["openai", "anthropic", "xai"] as const).default("openai")
});

// API routes
const router = Router();

// Get available AI providers
router.get("/ai/providers", isAuthenticated, async (req, res) => {
  try {
    const providers = getAvailableAIProviders();
    res.json({ providers });
  } catch (error) {
    console.error("Error fetching AI providers:", error);
    res.status(500).json({ message: "Failed to fetch AI providers" });
  }
});

// Generate content with AI
router.post("/ai/generate-summary", isAuthenticated, async (req, res) => {
  try {
    const data = contentGenerationSchema.parse(req.body);
    
    const summary = await generateSummary(
      {
        jobType: data.jobType,
        notes: data.notes,
        location: data.location,
        technicianName: data.technicianName
      },
      data.provider as AIProviderType
    );
    
    res.json({ 
      summary,
      provider: data.provider
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    
    console.error("Error generating summary:", error);
    res.status(500).json({ message: "Failed to generate summary" });
  }
});

router.post("/ai/generate-blog-post", isAuthenticated, async (req, res) => {
  try {
    const data = contentGenerationSchema.parse(req.body);
    
    const blogPost = await generateBlogPost(
      {
        jobType: data.jobType,
        notes: data.notes,
        location: data.location,
        technicianName: data.technicianName
      },
      data.provider as AIProviderType
    );
    
    res.json({ 
      ...blogPost,
      provider: data.provider
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    
    console.error("Error generating blog post:", error);
    res.status(500).json({ message: "Failed to generate blog post" });
  }
});

// WordPress integration routes
router.get("/wordpress", isAuthenticated, isCompanyAdmin, async (req, res) => {
  try {
    const companyId = req.user.companyId;
    
    if (!companyId) {
      return res.status(400).json({ message: "No company associated with this user" });
    }
    
    // In a real implementation, fetch from database
    // For now, return mock integration data
    const integration = {
      siteUrl: "https://example.com",
      apiKey: "wp_" + crypto.randomBytes(16).toString('hex'),
      autoPublish: true,
      includePhotos: true,
      addSchemaMarkup: true,
      displayMap: true,
      postType: "check_in",
      category: "service",
      status: "connected",
      lastSync: new Date().toISOString()
    };
    
    res.json(integration);
  } catch (error) {
    console.error("Error fetching WordPress integration:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/wordpress", isAuthenticated, isCompanyAdmin, async (req, res) => {
  try {
    const companyId = req.user.companyId;
    
    if (!companyId) {
      return res.status(400).json({ message: "No company associated with this user" });
    }
    
    // Validate input
    const data = wordpressIntegrationSchema.parse(req.body);
    
    // Generate API key if not provided
    const apiKey = data.apiKey || "wp_" + crypto.randomBytes(16).toString('hex');
    
    // In a real implementation, save to database
    // For now, just echo back the data with the API key
    res.status(201).json({
      ...data,
      apiKey,
      status: "connected",
      lastSync: new Date().toISOString()
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    
    console.error("Error saving WordPress integration:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// WordPress API for website to fetch data
router.get("/wordpress/checkins/:apiKey", async (req, res) => {
  try {
    const { apiKey } = req.params;
    
    // In a real implementation, validate API key and fetch check-ins
    // For now, return mock data
    if (!apiKey || !apiKey.startsWith("wp_")) {
      return res.status(401).json({ message: "Invalid API key" });
    }
    
    const checkIns = [
      {
        id: 1,
        title: "Water Heater Installation",
        content: "Replaced 50-gallon water heater for customer. Old unit was leaking from the bottom. New unit installed with expansion tank and brought up to current code requirements.",
        technician: "Robert Wilson",
        jobType: "Installation",
        date: new Date().toISOString(),
        photos: [
          { url: "https://example.com/images/water-heater-1.jpg", alt: "New water heater installation" },
          { url: "https://example.com/images/water-heater-2.jpg", alt: "Completed installation" }
        ],
        location: "Portland, OR",
        schema: {
          "@context": "https://schema.org",
          "@type": "HomeAndConstructionBusiness",
          "name": "Example Plumbing",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Portland",
            "addressRegion": "OR"
          },
          "review": {
            "@type": "Review",
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": "5",
              "bestRating": "5"
            },
            "author": {
              "@type": "Person",
              "name": "Customer"
            }
          }
        }
      }
    ];
    
    res.json(checkIns);
  } catch (error) {
    console.error("Error fetching check-ins for WordPress:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// JavaScript embed integration routes
router.get("/embed", isAuthenticated, isCompanyAdmin, async (req, res) => {
  try {
    const companyId = req.user.companyId;
    
    if (!companyId) {
      return res.status(400).json({ message: "No company associated with this user" });
    }
    
    // In a real implementation, fetch from database
    // For now, return mock integration data
    const company = await import("../storage").then(m => m.storage.getCompany(companyId));
    
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    
    const companySlug = company.name.toLowerCase().replace(/\s+/g, '-');
    const token = "embed_" + crypto.randomBytes(16).toString('hex');
    
    const integration = {
      token,
      embedCode: `<script src="https://checkin-pro.app/embed/${companySlug}?token=${token}"></script>`,
      settings: {
        showTechPhotos: true,
        showCheckInPhotos: true,
        maxCheckIns: 5,
        linkFullPosts: true,
        width: "full"
      }
    };
    
    res.json(integration);
  } catch (error) {
    console.error("Error fetching embed integration:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/embed/settings", isAuthenticated, isCompanyAdmin, async (req, res) => {
  try {
    const companyId = req.user.companyId;
    
    if (!companyId) {
      return res.status(400).json({ message: "No company associated with this user" });
    }
    
    // Validate input
    const data = embedIntegrationSchema.parse(req.body);
    
    // In a real implementation, save to database
    // For now, just echo back the data
    res.status(200).json({
      settings: data,
      updated: true
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    
    console.error("Error saving embed settings:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/embed/regenerate-token", isAuthenticated, isCompanyAdmin, async (req, res) => {
  try {
    const companyId = req.user.companyId;
    
    if (!companyId) {
      return res.status(400).json({ message: "No company associated with this user" });
    }
    
    // In a real implementation, update token in database
    const token = "embed_" + crypto.randomBytes(16).toString('hex');
    
    const company = await import("../storage").then(m => m.storage.getCompany(companyId));
    
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    
    const companySlug = company.name.toLowerCase().replace(/\s+/g, '-');
    
    res.json({
      token,
      embedCode: `<script src="https://checkin-pro.app/embed/${companySlug}?token=${token}"></script>`
    });
  } catch (error) {
    console.error("Error regenerating embed token:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// JavaScript embed endpoint (public)
router.get("/embed/:companySlug", async (req, res) => {
  try {
    const { companySlug } = req.params;
    const { token } = req.query;
    
    // In a real implementation, validate token and fetch check-ins by company slug
    // For now, return mock HTML
    if (!token || !token.toString().startsWith("embed_")) {
      return res.status(401).json({ message: "Invalid token" });
    }
    
    // In a real implementation, lookup company by slug
    // For now, use the slug as company name
    const companyName = companySlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    .checkin-pro-widget {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      max-width: 100%;
      margin: 0 auto;
    }
    .checkin-pro-widget h3 {
      font-size: 1.2rem;
      margin-bottom: 1rem;
    }
    .checkin-pro-widget .checkin-item {
      border-top: 1px solid #eaeaea;
      border-bottom: 1px solid #eaeaea;
      padding: 1rem 0;
      margin-bottom: 1rem;
    }
    .checkin-pro-widget .checkin-header {
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    .checkin-pro-widget .tech-avatar {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      background-color: #e6f7ff;
      color: #1890ff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      margin-right: 0.75rem;
    }
    .checkin-pro-widget .tech-info {
      display: flex;
      flex-direction: column;
    }
    .checkin-pro-widget .tech-name {
      font-weight: 500;
      font-size: 0.9rem;
    }
    .checkin-pro-widget .job-type {
      font-size: 0.8rem;
      color: #666;
    }
    .checkin-pro-widget .checkin-content {
      font-size: 0.9rem;
      line-height: 1.5;
    }
    .checkin-pro-widget .checkin-footer {
      margin-top: 0.5rem;
      text-align: right;
      font-size: 0.8rem;
    }
    .checkin-pro-widget .checkin-footer a {
      color: #1890ff;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="checkin-pro-widget">
    <h3>Recent Check-Ins from ${companyName}</h3>
    <div class="checkin-item">
      <div class="checkin-header">
        <div class="tech-avatar">R</div>
        <div class="tech-info">
          <div class="tech-name">Robert Wilson</div>
          <div class="job-type">Water Heater Installation</div>
        </div>
      </div>
      <div class="checkin-content">
        Replaced 50-gallon water heater for customer. Old unit was leaking from the bottom. New unit installed with expansion tank and brought up to current code requirements.
      </div>
      <div class="checkin-footer">
        <a href="#" target="_blank">Read full post</a>
      </div>
    </div>
    <div class="checkin-item">
      <div class="checkin-header">
        <div class="tech-avatar">S</div>
        <div class="tech-info">
          <div class="tech-name">Sarah Johnson</div>
          <div class="job-type">AC Maintenance</div>
        </div>
      </div>
      <div class="checkin-content">
        Performed annual maintenance on 3-ton Carrier AC unit. Cleaned coils, replaced filter, checked refrigerant levels, and tested operation. System is running efficiently.
      </div>
      <div class="checkin-footer">
        <a href="#" target="_blank">Read full post</a>
      </div>
    </div>
  </div>
</body>
</html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);
  } catch (error) {
    console.error("Error serving embed content:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;