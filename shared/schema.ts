import { pgTable, text, serial, integer, boolean, jsonb, timestamp, foreignKey, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table with roles
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["super_admin", "company_admin", "technician"] }).notNull().default("technician"),
  companyId: integer("company_id").references(() => companies.id),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Companies table
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phoneNumber: text("phone_number"),
  website: text("website"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  industry: text("industry"),
  plan: text("plan", { enum: ["starter", "pro", "agency"] }).notNull().default("starter"),
  usageLimit: integer("usage_limit").notNull().default(50),
  isActive: boolean("is_active").notNull().default(true),
  notes: text("notes"),
  wordpressConfig: text("wordpress_config"),
  javaScriptEmbedConfig: text("javascript_embed_config"),
  reviewSettings: text("review_settings"),
  crmIntegrations: text("crm_integrations"), // Stores JSON string with CRM configurations
  crmSyncHistory: text("crm_sync_history"), // Stores JSON string with CRM sync history
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login"),
});

// Technicians table
export const technicians = pgTable("technicians", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  specialty: text("specialty"),
  userId: integer("user_id").references(() => users.id),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Check-ins table
export const checkIns = pgTable("check_ins", {
  id: serial("id").primaryKey(),
  jobType: text("job_type").notNull(),
  notes: text("notes"),
  customerName: text("customer_name"),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone"),
  workPerformed: text("work_performed"),
  materialsUsed: text("materials_used"),
  latitude: numeric("latitude"),
  longitude: numeric("longitude"),
  location: text("location"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  addressVerified: boolean("address_verified").default(false),
  locationSource: text("location_source", { enum: ["gps", "manual", "both"] }),
  photos: jsonb("photos").default([]),
  beforePhotos: jsonb("before_photos").default([]),
  afterPhotos: jsonb("after_photos").default([]),
  problemDescription: text("problem_description"),
  solutionDescription: text("solution_description"),
  customerFeedback: text("customer_feedback"),
  followUpRequired: boolean("follow_up_required").default(false),
  followUpNotes: text("follow_up_notes"),
  isBlog: boolean("is_blog").default(false),
  technicianId: integer("technician_id").references(() => technicians.id).notNull(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Blog posts table
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  photos: jsonb("photos").default([]),
  checkInId: integer("check_in_id").references(() => checkIns.id),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Review requests table
export const reviewRequests = pgTable("review_requests", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  method: text("method", { enum: ["email", "sms"] }).notNull(),
  jobType: text("job_type"),
  customMessage: text("custom_message"),
  token: text("token"),
  status: text("status", { enum: ["pending", "sent", "failed"] }).notNull().default("pending"),
  sentAt: timestamp("sent_at"),
  technicianId: integer("technician_id").references(() => technicians.id).notNull(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Review responses table to track customer feedback
export const reviewResponses = pgTable("review_responses", {
  id: serial("id").primaryKey(),
  reviewRequestId: integer("review_request_id").references(() => reviewRequests.id).notNull(),
  rating: integer("rating").notNull(), // 1-5 star rating
  feedback: text("feedback"), // Optional text feedback
  customerName: text("customer_name").notNull(),
  technicianId: integer("technician_id").references(() => technicians.id).notNull(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  publicDisplay: boolean("public_display").default(false), // Whether this can be displayed publicly
  respondedAt: timestamp("responded_at").defaultNow(),
});

// Schema validation
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertCompanySchema = createInsertSchema(companies).omit({ id: true, createdAt: true });
export const insertTechnicianSchema = createInsertSchema(technicians).omit({ id: true, createdAt: true });
export const insertCheckInSchema = createInsertSchema(checkIns).omit({ id: true, createdAt: true });
export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({ id: true, createdAt: true });
export const insertReviewRequestSchema = createInsertSchema(reviewRequests).omit({ id: true, sentAt: true });
export const insertReviewResponseSchema = createInsertSchema(reviewResponses).omit({ id: true, respondedAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

export type Technician = typeof technicians.$inferSelect;
export type InsertTechnician = z.infer<typeof insertTechnicianSchema>;

export type CheckIn = typeof checkIns.$inferSelect;
export type InsertCheckIn = z.infer<typeof insertCheckInSchema>;

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;

export type ReviewRequest = typeof reviewRequests.$inferSelect;
export type InsertReviewRequest = z.infer<typeof insertReviewRequestSchema>;

export type ReviewResponse = typeof reviewResponses.$inferSelect;
export type InsertReviewResponse = z.infer<typeof insertReviewResponseSchema>;

// Review Automation Schemas
export const reviewFollowUpSettings = pgTable("review_follow_up_settings", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id, { onDelete: "cascade" }).notNull(),

  // Initial request settings
  initialDelay: integer("initial_delay").default(2).notNull(), // Days after service completion
  initialMessage: text("initial_message").notNull(),
  initialSubject: text("initial_subject").notNull(),
  
  // First follow-up settings
  enableFirstFollowUp: boolean("enable_first_follow_up").default(true).notNull(),
  firstFollowUpDelay: integer("first_follow_up_delay").default(3).notNull(),
  firstFollowUpMessage: text("first_follow_up_message").notNull(),
  firstFollowUpSubject: text("first_follow_up_subject").notNull(),
  
  // Second follow-up settings
  enableSecondFollowUp: boolean("enable_second_follow_up").default(true).notNull(),
  secondFollowUpDelay: integer("second_follow_up_delay").default(5).notNull(),
  secondFollowUpMessage: text("second_follow_up_message").notNull(),
  secondFollowUpSubject: text("second_follow_up_subject").notNull(),
  
  // Final follow-up settings
  enableFinalFollowUp: boolean("enable_final_follow_up").default(false).notNull(),
  finalFollowUpDelay: integer("final_follow_up_delay").default(7).notNull(),
  finalFollowUpMessage: text("final_follow_up_message"),
  finalFollowUpSubject: text("final_follow_up_subject"),
  
  // Channels and time settings
  enableEmailRequests: boolean("enable_email_requests").default(true).notNull(),
  enableSmsRequests: boolean("enable_sms_requests").default(false).notNull(),
  preferredSendTime: text("preferred_send_time").default("10:00").notNull(),
  sendWeekends: boolean("send_weekends").default(false).notNull(),
  
  // Additional options
  includeServiceDetails: boolean("include_service_details").default(true).notNull(),
  includeTechnicianPhoto: boolean("include_technician_photo").default(true).notNull(),
  includeCompanyLogo: boolean("include_company_logo").default(true).notNull(),
  enableIncentives: boolean("enable_incentives").default(false).notNull(),
  incentiveDetails: text("incentive_details"),
  
  // Targeting and optimization
  targetPositiveExperiencesOnly: boolean("target_positive_experiences_only").default(false).notNull(),
  targetServiceTypes: text("target_service_types").array(),
  targetMinimumInvoiceAmount: numeric("target_minimum_invoice_amount").default("0").notNull(),
  
  // Smart timing options
  enableSmartTiming: boolean("enable_smart_timing").default(false).notNull(),
  smartTimingPreferences: jsonb("smart_timing_preferences").notNull(),
  
  // Status
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const reviewRequestStatuses = pgTable("review_request_statuses", {
  id: serial("id").primaryKey(),
  reviewRequestId: integer("review_request_id").references(() => reviewRequests.id, { onDelete: "cascade" }).notNull(),
  checkInId: integer("check_in_id").references(() => checkIns.id, { onDelete: "set null" }),
  customerId: text("customer_id").notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  
  // Request tracking
  initialRequestSent: boolean("initial_request_sent").default(false).notNull(),
  initialRequestSentAt: timestamp("initial_request_sent_at"),
  firstFollowUpSent: boolean("first_follow_up_sent").default(false).notNull(),
  firstFollowUpSentAt: timestamp("first_follow_up_sent_at"),
  secondFollowUpSent: boolean("second_follow_up_sent").default(false).notNull(),
  secondFollowUpSentAt: timestamp("second_follow_up_sent_at"),
  finalFollowUpSent: boolean("final_follow_up_sent").default(false).notNull(),
  finalFollowUpSentAt: timestamp("final_follow_up_sent_at"),
  
  // Response tracking
  linkClicked: boolean("link_clicked").default(false).notNull(),
  linkClickedAt: timestamp("link_clicked_at"),
  reviewSubmitted: boolean("review_submitted").default(false).notNull(),
  reviewSubmittedAt: timestamp("review_submitted_at"),
  
  // Status
  status: text("status", { enum: ['pending', 'in_progress', 'completed', 'unsubscribed'] }).default('pending').notNull(),
  unsubscribedAt: timestamp("unsubscribed_at"),
  completedAt: timestamp("completed_at"),
  technicianId: integer("technician_id").references(() => technicians.id, { onDelete: "set null" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Insert schemas for the new tables
export const insertReviewFollowUpSettingsSchema = createInsertSchema(reviewFollowUpSettings).omit({ 
  id: true, 
  createdAt: true,
  updatedAt: true
});

export const insertReviewRequestStatusSchema = createInsertSchema(reviewRequestStatuses).omit({ 
  id: true, 
  createdAt: true
});

// API Credentials table
export const apiCredentials = pgTable("api_credentials", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  apiKeyHash: text("api_key_hash").notNull().unique(),
  secretKeyHash: text("secret_key_hash").notNull(),
  permissions: text("permissions").notNull(), // JSON array of permission strings
  isActive: boolean("is_active").default(true).notNull(),
  expiresAt: timestamp("expires_at"),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertAPICredentialsSchema = createInsertSchema(apiCredentials).omit({ 
  id: true, 
  createdAt: true,
  updatedAt: true
});

// AI Usage Tracking table
export const aiUsageTracking = pgTable("ai_usage_tracking", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  provider: text("provider", { enum: ["openai", "anthropic", "xai"] }).notNull(),
  operation: text("operation", { enum: ["summary", "blog_post"] }).notNull(),
  tokensUsed: integer("tokens_used").notNull(),
  estimatedCost: numeric("estimated_cost", { precision: 10, scale: 6 }).notNull(), // Store in dollars
  requestData: jsonb("request_data"), // Store request details for analysis
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userId: integer("user_id").references(() => users.id),
  checkInId: integer("check_in_id").references(() => checkIns.id)
});

// Monthly AI Usage Summary table
export const monthlyAiUsage = pgTable("monthly_ai_usage", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  year: integer("year").notNull(),
  month: integer("month").notNull(),
  totalRequests: integer("total_requests").notNull().default(0),
  totalTokens: integer("total_tokens").notNull().default(0),
  totalCost: numeric("total_cost", { precision: 10, scale: 2 }).notNull().default("0.00"),
  openaiRequests: integer("openai_requests").notNull().default(0),
  openaiCost: numeric("openai_cost", { precision: 10, scale: 2 }).notNull().default("0.00"),
  anthropicRequests: integer("anthropic_requests").notNull().default(0),
  anthropicCost: numeric("anthropic_cost", { precision: 10, scale: 2 }).notNull().default("0.00"),
  xaiRequests: integer("xai_requests").notNull().default(0),
  xaiCost: numeric("xai_cost", { precision: 10, scale: 2 }).notNull().default("0.00"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Insert schemas for AI usage tracking
export const insertAiUsageTrackingSchema = createInsertSchema(aiUsageTracking).omit({ 
  id: true, 
  createdAt: true
});

export const insertMonthlyAiUsageSchema = createInsertSchema(monthlyAiUsage).omit({ 
  id: true, 
  createdAt: true,
  updatedAt: true
});

// Types for AI usage tracking
export type AiUsageTracking = typeof aiUsageTracking.$inferSelect;
export type InsertAiUsageTracking = z.infer<typeof insertAiUsageTrackingSchema>;

export type MonthlyAiUsage = typeof monthlyAiUsage.$inferSelect;
export type InsertMonthlyAiUsage = z.infer<typeof insertMonthlyAiUsageSchema>;

// Types for the new tables
export type ReviewFollowUpSettings = typeof reviewFollowUpSettings.$inferSelect;
export type InsertReviewFollowUpSettings = z.infer<typeof insertReviewFollowUpSettingsSchema>;

export type ReviewRequestStatus = typeof reviewRequestStatuses.$inferSelect;
export type InsertReviewRequestStatus = z.infer<typeof insertReviewRequestStatusSchema>;

// WordPress custom fields integration
export const wordpressCustomFields = pgTable("wordpress_custom_fields", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id, { onDelete: "cascade" }).notNull(),
  
  // Connection settings
  siteUrl: text("site_url").notNull(),
  apiKey: text("api_key").notNull(),
  secretKey: text("secret_key").notNull(),
  useRestApi: boolean("use_rest_api").default(true).notNull(),
  
  // Publishing settings
  postType: text("post_type").default("post").notNull(),
  defaultCategory: text("default_category"),
  defaultAuthor: text("default_author"),
  postStatus: text("post_status", { enum: ["publish", "draft", "pending"] }).default("draft").notNull(),
  autoPublish: boolean("auto_publish").default(false).notNull(),
  
  // Field mapping
  titlePrefix: text("title_prefix"),
  titleTemplate: text("title_template"),
  contentTemplate: text("content_template"),
  
  // Field options
  includePhotos: boolean("include_photos").default(true).notNull(),
  includeLocation: boolean("include_location").default(true).notNull(),
  includeMap: boolean("include_map").default(false).notNull(),
  includeSchema: boolean("include_schema").default(false).notNull(),
  
  // Advanced settings
  customFieldMappings: jsonb("custom_field_mappings").notNull(),
  taxonomyMappings: jsonb("taxonomy_mappings").notNull(),
  advancedMapping: text("advanced_mapping"),
  metaPrefix: text("meta_prefix").default("rankitpro_").notNull(),
  
  // Status
  isConnected: boolean("is_connected").default(false).notNull(),
  lastSync: timestamp("last_sync"),
  lastSyncStatus: text("last_sync_status"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertWordpressCustomFieldsSchema = createInsertSchema(wordpressCustomFields).omit({ 
  id: true, 
  createdAt: true,
  updatedAt: true,
  lastSync: true
});

export type WordpressCustomFields = typeof wordpressCustomFields.$inferSelect;
export type InsertWordpressCustomFields = z.infer<typeof insertWordpressCustomFieldsSchema>;

// Extended types that include related data
export type CheckInWithTechnician = CheckIn & {
  technician: Technician;
};

export type TechnicianWithStats = Technician & {
  checkinsCount: number;
  reviewsCount: number;
  rating: number;
};

export type APICredentials = typeof apiCredentials.$inferSelect;
export type InsertAPICredentials = z.infer<typeof insertAPICredentialsSchema>;
