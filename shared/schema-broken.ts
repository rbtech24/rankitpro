import { pgTable, text, serial, integer, boolean, jsonb, timestamp, foreignKey, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table with roles
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["super_admin", "company_admin", "technician", "sales_staff"] }).notNull().default("technician"),
  companyId: integer("company_id").references(() => companies.id),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  // User preferences
  notificationPreferences: jsonb("notification_preferences").default({
    emailNotifications: true,
    newCheckIns: true,
    newBlogPosts: true,
    reviewRequests: true,
    billingUpdates: true,
    pushNotifications: true,
    notificationSound: true
  }),
  appearancePreferences: jsonb("appearance_preferences").default({
    theme: "light",
    language: "en",
    timezone: "UTC",
    defaultView: "dashboard"
  }),
});

// Subscription plans table
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  yearlyPrice: numeric("yearly_price", { precision: 10, scale: 2 }),
  billingPeriod: text("billing_period", { enum: ["monthly", "yearly"] }).notNull(),
  maxTechnicians: integer("max_technicians").notNull(),
  maxCheckIns: integer("max_check_ins").notNull(),
  features: jsonb("features").default([]).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  stripeProductId: text("stripe_product_id"),
  stripePriceId: text("stripe_price_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Companies table
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  plan: text("plan", { enum: ["starter", "pro", "agency"] }).notNull().default("starter"),
  subscriptionPlanId: integer("subscription_plan_id").references(() => subscriptionPlans.id),
  usageLimit: integer("usage_limit").notNull().default(50),
  wordpressConfig: text("wordpress_config"),
  javaScriptEmbedConfig: text("javascript_embed_config"),
  reviewSettings: text("review_settings"),
  crmIntegrations: text("crm_integrations"),
  crmSyncHistory: text("crm_sync_history"),
  socialMediaConfig: jsonb("social_media_config"),
  featuresEnabled: jsonb("features_enabled").default({
    audioTestimonials: false,
    videoTestimonials: false,
    advancedAnalytics: false,
    prioritySupport: false,
    customBranding: false,
    apiAccess: false
  }),
  trialStartDate: timestamp("trial_start_date").defaultNow(),
  trialEndDate: timestamp("trial_end_date"),
  isTrialActive: boolean("is_trial_active").default(true),
  isEmailVerified: boolean("is_email_verified").default(false),
  emailVerificationToken: text("email_verification_token"),
  salesPersonId: integer("sales_person_id"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  businessType: text("business_type").notNull().default("field_service"), // 'field_service' or 'marketing_focused'
  industry: text("industry"),
  email: text("email"),
  phoneNumber: text("phone_number"),
  website: text("website"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  maxTechnicians: integer("max_technicians").default(10),
  isActive: boolean("is_active").default(true).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Company locations table
export const companyLocations = pgTable("company_locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zip: text("zip").notNull(),
  phone: text("phone"),
  email: text("email"),
  latitude: numeric("latitude"),
  longitude: numeric("longitude"),
  managerName: text("manager_name"),
  managerEmail: text("manager_email"),
  managerPhone: text("manager_phone"),
  operatingHours: jsonb("operating_hours").default({
    monday: { open: "09:00", close: "17:00", closed: false },
    tuesday: { open: "09:00", close: "17:00", closed: false },
    wednesday: { open: "09:00", close: "17:00", closed: false },
    thursday: { open: "09:00", close: "17:00", closed: false },
    friday: { open: "09:00", close: "17:00", closed: false },
    saturday: { open: "09:00", close: "17:00", closed: true },
    sunday: { open: "09:00", close: "17:00", closed: true }
  }),
  timezone: text("timezone").default("UTC"),
  isActive: boolean("is_active").default(true).notNull(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Technicians table
export const technicians = pgTable("technicians", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  specialty: text("specialty"),
  location: text("location").notNull(), // Keep for backward compatibility
  locationId: integer("location_id").references(() => companyLocations.id),
  userId: integer("user_id").references(() => users.id),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  active: boolean("active").default(true).notNull(),
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
  generatedContent: text("generated_content"), // AI-generated content
  wordpressSyncStatus: text("wordpress_sync_status", { enum: ["pending", "synced", "failed"] }),
  wordpressPostId: integer("wordpress_post_id"),
  wordpressPostUrl: text("wordpress_post_url"),
  technicianId: integer("technician_id").references(() => technicians.id).notNull(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  locationId: integer("location_id").references(() => companyLocations.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Job types table
export const jobTypes = pgTable("job_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Blog posts table
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt").default(""),
  featuredImage: text("featured_image").default(""),
  gallery: text("gallery").array().default([]),
  status: text("status", { enum: ["draft", "published", "scheduled"] }).default("draft"),
  publishDate: timestamp("publish_date").defaultNow(),
  tags: text("tags").array().default([]),
  seoTitle: text("seo_title").default(""),
  seoDescription: text("seo_description").default(""),
  publishToWordPress: boolean("publish_to_wordpress").default(false),
  wordPressCategory: text("wordpress_category").default("blog"),
  photos: jsonb("photos").default([]),
  checkInId: integer("check_in_id").references(() => checkIns.id),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
  sentAt: timestamp("sent_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  technicianId: integer("technician_id").references(() => technicians.id).notNull(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
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
  createdAt: timestamp("created_at").defaultNow(),
  respondedAt: timestamp("responded_at").defaultNow(),
});

// Schema validation
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertCompanySchema = createInsertSchema(companies).omit({ id: true, createdAt: true });
export const insertCompanyLocationSchema = createInsertSchema(companyLocations).omit({ id: true, createdAt: true });
export const insertTechnicianSchema = createInsertSchema(technicians).omit({ id: true, createdAt: true });
export const insertCheckInSchema = createInsertSchema(checkIns).omit({ id: true, createdAt: true }).extend({
  jobType: z.string().min(1),
  technicianId: z.number(),
  companyId: z.number(),
  notes: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  location: z.string().nullable().optional(),
  customerName: z.string().nullable().optional(),
  customerEmail: z.string().nullable().optional(),
  customerPhone: z.string().nullable().optional(),
  isBlog: z.boolean().optional()
});
export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({ id: true, createdAt: true });
export const insertReviewRequestSchema = createInsertSchema(reviewRequests).omit({ id: true, sentAt: true }).extend({
  customerName: z.string().min(1),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  method: z.enum(["email", "sms"]),
  jobType: z.string().nullable().optional(),
  customMessage: z.string().nullable().optional(),
  token: z.string().nullable().optional(),
  status: z.enum(["pending", "sent", "failed"]).default("pending"),
  technicianId: z.number(),
  companyId: z.number()
});
export const insertReviewResponseSchema = createInsertSchema(reviewResponses).omit({ id: true, respondedAt: true });
export const insertJobTypeSchema = createInsertSchema(jobTypes).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type JobType = typeof jobTypes.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

export type CompanyLocation = typeof companyLocations.$inferSelect;
export type InsertCompanyLocation = z.infer<typeof insertCompanyLocationSchema>;

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
export const aiUsageLogs = pgTable("ai_usage_logs", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  provider: text("provider", { enum: ["openai", "anthropic", "xai"] }).notNull(),
  operation: text("operation", { enum: ["summary", "blog_post"] }).notNull(),
  tokensUsed: integer("tokens_used").notNull(),
  estimatedCost: text("estimated_cost").notNull(), // Store as string for precision
  requestData: jsonb("request_data"), // Store request details for analysis
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userId: integer("user_id").references(() => users.id),
  checkInId: integer("check_in_id").references(() => checkIns.id)
});

// WordPress Integrations table  
export const wordpressIntegrations = pgTable("wordpress_integrations", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  apiKey: text("api_key").notNull(),
  secretKey: text("secret_key").notNull(),
  siteUrl: text("site_url").notNull(),
  useRestApi: boolean("use_rest_api").default(true).notNull(),
  postType: text("post_type").default("post").notNull(),
  defaultCategory: text("default_category"),
  customFieldMappings: jsonb("custom_field_mappings").default({}).notNull(),
  taxonomyMappings: jsonb("taxonomy_mappings").default({}).notNull(),
  autoPublish: boolean("auto_publish").default(false).notNull(),
  includePhotos: boolean("include_photos").default(true).notNull(),
  photoSettings: jsonb("photo_settings").default({}).notNull(),
  contentTemplate: text("content_template"),
  lastSync: timestamp("last_sync"),
  lastSyncStatus: text("last_sync_status"),
  syncErrors: jsonb("sync_errors").default([]).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
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
export const insertAiUsageLogsSchema = createInsertSchema(aiUsageLogs).omit({ 
  id: true, 
  createdAt: true
});

// Remove duplicate subscription plans table - already exists at line 36

export const insertMonthlyAiUsageSchema = createInsertSchema(monthlyAiUsage).omit({ 
  id: true, 
  createdAt: true,
  updatedAt: true
});

// Types for AI usage tracking
export type AiUsageLogs = typeof aiUsageLogs.$inferSelect;
export type InsertAiUsageLogs = z.infer<typeof insertAiUsageLogsSchema>;

export type MonthlyAiUsage = typeof monthlyAiUsage.$inferSelect;
export type InsertMonthlyAiUsage = z.infer<typeof insertMonthlyAiUsageSchema>;

// API Keys table (alias for apiCredentials)
export const apiKeys = apiCredentials;

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

// Sales People table - Enhanced for full user integration
export const salesPeople = pgTable("sales_people", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(), // Link to users table
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  commissionRate: numeric("commission_rate", { precision: 5, scale: 4 }).notNull().default("0.10"), // Default 10% commission
  isActive: boolean("is_active").default(true),
  stripeAccountId: text("stripe_account_id"), // For direct payouts
  bankingDetails: jsonb("banking_details"), // Encrypted banking info
  totalEarnings: numeric("total_earnings", { precision: 12, scale: 2 }).default("0.00"),
  pendingCommissions: numeric("pending_commissions", { precision: 12, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sales Commissions table - Enhanced for comprehensive tracking
export const salesCommissions = pgTable("sales_commissions", {
  id: serial("id").primaryKey(),
  salesPersonId: integer("sales_person_id").references(() => salesPeople.id).notNull(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  subscriptionId: text("subscription_id"), // Stripe subscription ID
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  commissionRate: numeric("commission_rate", { precision: 5, scale: 4 }).notNull(), // Rate at time of sale
  baseAmount: numeric("base_amount", { precision: 10, scale: 2 }).notNull(), // Original payment amount
  billingPeriod: text("billing_period").notNull(), // monthly/yearly
  type: text("type", { enum: ["signup", "renewal", "setup", "bonus"] }).notNull().default("renewal"),
  status: text("status", { enum: ["pending", "approved", "paid", "disputed"] }).notNull().default("pending"),
  isPaid: boolean("is_paid").default(false).notNull(),
  paidAt: timestamp("paid_at"),
  stripePayoutId: text("stripe_payout_id"), // Stripe payout reference
  notes: text("notes"),
  paymentDate: timestamp("payment_date").notNull(), // When customer payment was received
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Commission Payouts table - Track batch payments to sales staff
export const commissionPayouts = pgTable("commission_payouts", {
  id: serial("id").primaryKey(),
  salesPersonId: integer("sales_person_id").references(() => salesPeople.id).notNull(),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  commissionIds: jsonb("commission_ids").notNull(), // Array of commission IDs included
  stripePayoutId: text("stripe_payout_id").notNull(),
  payoutDate: timestamp("payout_date").notNull(),
  status: text("status", { enum: ["pending", "processing", "completed", "failed"] }).notNull().default("pending"),
  failureReason: text("failure_reason"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Company Assignments table - Enhanced to track sales attribution
export const companyAssignments = pgTable("company_assignments", {
  id: serial("id").primaryKey(),
  salesPersonId: integer("sales_person_id").references(() => salesPeople.id).notNull(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  signupDate: timestamp("signup_date").defaultNow(),
  subscriptionPlan: text("subscription_plan").notNull(),
  initialPlanPrice: numeric("initial_plan_price", { precision: 10, scale: 2 }).notNull(),
  currentPlanPrice: numeric("current_plan_price", { precision: 10, scale: 2 }).notNull(),
  billingPeriod: text("billing_period", { enum: ["monthly", "yearly"] }).notNull(),
  stripeSubscriptionId: text("stripe_subscription_id"),
  status: text("status", { enum: ["active", "cancelled", "suspended"] }).notNull().default("active"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema validation for sales tables
export const insertSalesPersonSchema = createInsertSchema(salesPeople).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  totalEarnings: true,
  pendingCommissions: true 
});
export const insertSalesCommissionSchema = createInsertSchema(salesCommissions).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  isPaid: true,
  paidAt: true,
  stripePayoutId: true
});
export const insertCompanyAssignmentSchema = createInsertSchema(companyAssignments).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  signupDate: true
});
export const insertCommissionPayoutSchema = createInsertSchema(commissionPayouts).omit({ 
  id: true, 
  createdAt: true 
});

// Types for sales system
export type SalesPerson = typeof salesPeople.$inferSelect;
export type InsertSalesPerson = z.infer<typeof insertSalesPersonSchema>;
export type SalesCommission = typeof salesCommissions.$inferSelect;
export type InsertSalesCommission = z.infer<typeof insertSalesCommissionSchema>;
export type CompanyAssignment = typeof companyAssignments.$inferSelect;
export type InsertCompanyAssignment = z.infer<typeof insertCompanyAssignmentSchema>;
export type CommissionPayout = typeof commissionPayouts.$inferSelect;
export type InsertCommissionPayout = z.infer<typeof insertCommissionPayoutSchema>;

// Extended types for sales dashboard
export type SalesPersonWithStats = SalesPerson & {
  totalCustomers: number;
  monthlyEarnings: number;
  pendingPayouts: number;
  conversionRate: number;
  lastSale: Date | null;
};

export type CommissionWithDetails = SalesCommission & {
  salesPerson: SalesPerson;
  company: {
    id: number;
    name: string;
    email: string;
  };
};

// Create aliases for storage layer compatibility
export const salesPersons = salesPeople;
export const commissions = salesCommissions;

// Audio/Video Testimonials
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  technicianId: integer("technician_id").references(() => technicians.id).notNull(),
  checkInId: integer("check_in_id").references(() => checkIns.id),
  
  // Customer information
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone"),
  
  // Testimonial content
  type: text("type", { enum: ["audio", "video"] }).notNull(),
  title: text("title").notNull(),
  content: text("content"), // Transcription for audio/video
  duration: integer("duration"), // Duration in seconds
  
  // File information
  originalFileName: text("original_file_name").notNull(),
  fileSize: integer("file_size").notNull(), // Size in bytes
  mimeType: text("mime_type").notNull(),
  storageUrl: text("storage_url").notNull(),
  thumbnailUrl: text("thumbnail_url"), // For video testimonials
  
  // Metadata
  jobType: text("job_type"),
  location: text("location"),
  rating: integer("rating"), // 1-5 stars given by customer
  
  // Publishing status
  status: text("status", { enum: ["pending", "approved", "published", "rejected"] }).default("pending").notNull(),
  approvalToken: text("approval_token"), // For customer approval via email
  approvedAt: timestamp("approved_at"),
  publishedAt: timestamp("published_at"),
  
  // Display settings
  isPublic: boolean("is_public").default(false).notNull(),
  showOnWebsite: boolean("show_on_website").default(false).notNull(),
  tags: text("tags").array(), // For categorization and filtering
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Testimonial approval tracking
export const testimonialApprovals = pgTable("testimonial_approvals", {
  id: serial("id").primaryKey(),
  testimonialId: integer("testimonial_id").references(() => testimonials.id, { onDelete: "cascade" }).notNull(),
  customerEmail: text("customer_email").notNull(),
  approvalToken: text("approval_token").notNull().unique(),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).default("pending").notNull(),
  approvedAt: timestamp("approved_at"),
  rejectedAt: timestamp("rejected_at"),
  rejectionReason: text("rejection_reason"),
  emailSentAt: timestamp("email_sent_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(), // Token expiry
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Insert schemas for testimonials
export const insertTestimonialSchema = createInsertSchema(testimonials).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertTestimonialApprovalSchema = createInsertSchema(testimonialApprovals).omit({ 
  id: true, 
  createdAt: true 
});

// Types for testimonials
export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type TestimonialApproval = typeof testimonialApprovals.$inferSelect;
export type InsertTestimonialApproval = z.infer<typeof insertTestimonialApprovalSchema>;

// Support Tickets table for customer support system
export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  ticketNumber: text("ticket_number").notNull().unique(), // Format: SUP-YYYYMMDD-XXXX
  
  // Submitter information
  companyId: integer("company_id").references(() => companies.id),
  submitterId: integer("submitter_id").references(() => users.id).notNull(),
  submitterName: text("submitter_name").notNull(),
  submitterEmail: text("submitter_email").notNull(),
  
  // Ticket details
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  category: text("category", { 
    enum: ["technical", "billing", "feature_request", "bug_report", "account", "integration", "other"] 
  }).notNull(),
  priority: text("priority", { 
    enum: ["low", "medium", "high", "urgent"] 
  }).default("medium").notNull(),
  
  // Status tracking
  status: text("status", { 
    enum: ["open", "in_progress", "waiting_response", "resolved", "closed"] 
  }).default("open").notNull(),
  
  // Assignment
  assignedToId: integer("assigned_to_id").references(() => users.id), // Admin user
  assignedAt: timestamp("assigned_at"),
  
  // Resolution
  resolution: text("resolution"),
  resolvedAt: timestamp("resolved_at"),
  resolvedById: integer("resolved_by_id").references(() => users.id),
  
  // Metadata
  attachments: text("attachments").array(), // File URLs
  tags: text("tags").array(),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastResponseAt: timestamp("last_response_at").defaultNow().notNull()
});

// Support Ticket Responses table for ticket conversation
export const supportTicketResponses = pgTable("support_ticket_responses", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").references(() => supportTickets.id, { onDelete: "cascade" }).notNull(),
  
  // Response details
  responderId: integer("responder_id").references(() => users.id).notNull(),
  responderName: text("responder_name").notNull(),
  responderType: text("responder_type", { enum: ["admin", "customer"] }).notNull(),
  
  // Content
  message: text("message").notNull(),
  attachments: text("attachments").array(),
  
  // Internal notes (only visible to admins)
  isInternal: boolean("is_internal").default(false).notNull(),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Insert schemas for support system
export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({ 
  id: true, 
  ticketNumber: true,
  createdAt: true, 
  updatedAt: true,
  lastResponseAt: true 
});

export const insertSupportTicketResponseSchema = createInsertSchema(supportTicketResponses).omit({ 
  id: true, 
  createdAt: true 
});

// Payment transactions table
export const paymentTransactions = pgTable("payment_transactions", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  subscriptionPlanId: integer("subscription_plan_id").references(() => subscriptionPlans.id),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("USD").notNull(),
  status: text("status", { enum: ["success", "failed", "pending", "refunded"] }).notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeChargeId: text("stripe_charge_id"),
  paymentMethod: text("payment_method"), // card, bank_transfer, etc.
  billingPeriod: text("billing_period", { enum: ["monthly", "yearly"] }),
  metadata: jsonb("metadata").default({}),
  failureReason: text("failure_reason"),
  refundAmount: numeric("refund_amount", { precision: 10, scale: 2 }),
  refundedAt: timestamp("refunded_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Subscription status table
export const subscriptionStatus = pgTable("subscription_status", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  subscriptionPlanId: integer("subscription_plan_id").references(() => subscriptionPlans.id).notNull(),
  status: text("status", { enum: ["active", "canceled", "past_due", "unpaid", "trialing"] }).notNull(),
  stripeSubscriptionId: text("stripe_subscription_id"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  canceledAt: timestamp("canceled_at"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  trialStart: timestamp("trial_start"),
  trialEnd: timestamp("trial_end"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas for subscription plans
export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertPaymentTransactionSchema = createInsertSchema(paymentTransactions).omit({
  id: true,
  createdAt: true
});

export const insertSubscriptionStatusSchema = createInsertSchema(subscriptionStatus).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Types for subscription system
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = z.infer<typeof insertPaymentTransactionSchema>;
export type SubscriptionStatus = typeof subscriptionStatus.$inferSelect;
export type InsertSubscriptionStatus = z.infer<typeof insertSubscriptionStatusSchema>;

// Social Media Posts Schema
export const socialMediaPosts = pgTable("social_media_posts", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  platform: text("platform", { enum: ["facebook", "instagram", "twitter", "linkedin", "tiktok"] }).notNull(),
  postType: text("post_type", { enum: ["check_in", "review", "testimonial", "blog_post"] }).notNull(),
  relatedId: integer("related_id").notNull(),
  postContent: text("post_content").notNull(),
  mediaUrls: jsonb("media_urls"),
  platformPostId: text("platform_post_id"),
  status: text("status", { enum: ["pending", "posted", "failed", "scheduled"] }).default("pending").notNull(),
  scheduledAt: timestamp("scheduled_at"),
  postedAt: timestamp("posted_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Types for support system
export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicketResponse = typeof supportTicketResponses.$inferSelect;
export type InsertSupportTicketResponse = z.infer<typeof insertSupportTicketResponseSchema>;

// Social Media Posts types
export const insertSocialMediaPostSchema = createInsertSchema(socialMediaPosts).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSocialMediaPost = z.infer<typeof insertSocialMediaPostSchema>;
export type SocialMediaPost = typeof socialMediaPosts.$inferSelect;

// Help Topics Table for Community Features
export const helpTopics = pgTable("help_topics", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  tags: jsonb("tags").default([]).notNull(),
  authorId: integer("author_id").references(() => users.id).notNull(),
  authorName: text("author_name").notNull(),
  replies: integer("replies").default(0).notNull(),
  likes: integer("likes").default(0).notNull(),
  views: integer("views").default(0).notNull(),
  isResolved: boolean("is_resolved").default(false).notNull(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  lastActivity: timestamp("last_activity").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Help Topic Replies
export const helpTopicReplies = pgTable("help_topic_replies", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").references(() => helpTopics.id).notNull(),
  content: text("content").notNull(),
  authorId: integer("author_id").references(() => users.id).notNull(),
  authorName: text("author_name").notNull(),
  likes: integer("likes").default(0).notNull(),
  isAcceptedAnswer: boolean("is_accepted_answer").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Help Topic Likes (for tracking who liked what)
export const helpTopicLikes = pgTable("help_topic_likes", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").references(() => helpTopics.id),
  replyId: integer("reply_id").references(() => helpTopicReplies.id),
  userId: integer("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Help Topics types
export const insertHelpTopicSchema = createInsertSchema(helpTopics).omit({ id: true, createdAt: true, updatedAt: true, lastActivity: true });
export type InsertHelpTopic = z.infer<typeof insertHelpTopicSchema>;
export type HelpTopic = typeof helpTopics.$inferSelect;

// Help Topic Replies types
export const insertHelpTopicReplySchema = createInsertSchema(helpTopicReplies).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertHelpTopicReply = z.infer<typeof insertHelpTopicReplySchema>;
export type HelpTopicReply = typeof helpTopicReplies.$inferSelect;

// Help Topic Likes types
export const insertHelpTopicLikeSchema = createInsertSchema(helpTopicLikes).omit({ id: true, createdAt: true });
export type InsertHelpTopicLike = z.infer<typeof insertHelpTopicLikeSchema>;
export type HelpTopicLike = typeof helpTopicLikes.$inferSelect;

// Bug Reports Table
export const bugReports = pgTable("bug_reports", {
  id: serial("id").primaryKey(),
  ticketNumber: text("ticket_number").notNull().unique(),
  companyId: integer("company_id").references(() => companies.id),
  submitterId: integer("submitter_id").references(() => users.id).notNull(),
  submitterName: text("submitter_name").notNull(),
  submitterEmail: text("submitter_email").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  stepsToReproduce: text("steps_to_reproduce"),
  expectedBehavior: text("expected_behavior"),
  actualBehavior: text("actual_behavior"),
  browserInfo: text("browser_info"),
  deviceInfo: text("device_info"),
  priority: text("priority", { enum: ["low", "medium", "high", "critical"] }).default("medium").notNull(),
  status: text("status", { enum: ["open", "investigating", "in_progress", "resolved", "closed"] }).default("open").notNull(),
  assignedToId: integer("assigned_to_id").references(() => users.id),
  assignedAt: timestamp("assigned_at"),
  resolution: text("resolution"),
  resolvedAt: timestamp("resolved_at"),
  resolvedById: integer("resolved_by_id").references(() => users.id),
  attachments: text("attachments").array(),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastResponseAt: timestamp("last_response_at").defaultNow().notNull()
});

// Feature Requests Table
export const featureRequests = pgTable("feature_requests", {
  id: serial("id").primaryKey(),
  ticketNumber: text("ticket_number").notNull().unique(),
  companyId: integer("company_id").references(() => companies.id),
  submitterId: integer("submitter_id").references(() => users.id).notNull(),
  submitterName: text("submitter_name").notNull(),
  submitterEmail: text("submitter_email").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  businessJustification: text("business_justification"),
  proposedSolution: text("proposed_solution"),
  priority: text("priority", { enum: ["low", "medium", "high", "critical"] }).default("medium").notNull(),
  status: text("status", { enum: ["submitted", "under_review", "planned", "in_development", "completed", "rejected"] }).default("submitted").notNull(),
  votes: integer("votes").default(0).notNull(),
  estimatedEffort: text("estimated_effort"),
  targetRelease: text("target_release"),
  assignedToId: integer("assigned_to_id").references(() => users.id),
  assignedAt: timestamp("assigned_at"),
  implementationNotes: text("implementation_notes"),
  completedAt: timestamp("completed_at"),
  completedById: integer("completed_by_id").references(() => users.id),
  attachments: text("attachments").array(),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastResponseAt: timestamp("last_response_at").defaultNow().notNull()
});

// Bug Report and Feature Request Insert Schemas
export const insertBugReportSchema = createInsertSchema(bugReports).omit({ 
  id: true, 
  ticketNumber: true,
  createdAt: true, 
  updatedAt: true,
  lastResponseAt: true 
});

export const insertFeatureRequestSchema = createInsertSchema(featureRequests).omit({ 
  id: true, 
  ticketNumber: true,
  createdAt: true, 
  updatedAt: true,
  lastResponseAt: true 
});

// Bug Report and Feature Request Types
export type BugReport = typeof bugReports.$inferSelect;
export type InsertBugReport = z.infer<typeof insertBugReportSchema>;
export type FeatureRequest = typeof featureRequests.$inferSelect;
export type InsertFeatureRequest = z.infer<typeof insertFeatureRequestSchema>;

// Chat Support System Tables
export const supportAgents = pgTable("support_agents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  displayName: text("display_name").notNull(),
  isOnline: boolean("is_online").default(false).notNull(),
  isAvailable: boolean("is_available").default(true).notNull(),
  expertiseAreas: text("expertise_areas").array().default([]).notNull(), // ["technical", "billing", "setup"]
  maxConcurrentChats: integer("max_concurrent_chats").default(5).notNull(),
  currentChatCount: integer("current_chat_count").default(0).notNull(),
  lastSeen: timestamp("last_seen").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(), // UUID for client connection
  companyId: integer("company_id").references(() => companies.id),
  userId: integer("user_id").references(() => users.id).notNull(),
  supportAgentId: integer("support_agent_id").references(() => supportAgents.id),
  
  // Session metadata
  status: text("status", { 
    enum: ["waiting", "active", "resolved", "closed", "abandoned"] 
  }).default("waiting").notNull(),
  priority: text("priority", { 
    enum: ["low", "medium", "high", "urgent"] 
  }).default("medium").notNull(),
  category: text("category", { 
    enum: ["technical", "billing", "setup", "feature", "bug", "general"] 
  }).default("general").notNull(),
  
  // Context information
  currentPage: text("current_page"), // Where user was when chat started
  userAgent: text("user_agent"),
  initialMessage: text("initial_message"),
  
  // Timing
  startedAt: timestamp("started_at").defaultNow().notNull(),
  agentJoinedAt: timestamp("agent_joined_at"),
  lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
  closedAt: timestamp("closed_at"),
  
  // Ratings and feedback
  customerRating: integer("customer_rating"), // 1-5 stars
  customerFeedback: text("customer_feedback"),
  resolvedByAgent: boolean("resolved_by_agent").default(false),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => chatSessions.id, { onDelete: "cascade" }).notNull(),
  
  // Message details
  senderId: integer("sender_id").references(() => users.id).notNull(),
  senderType: text("sender_type", { enum: ["customer", "agent", "system"] }).notNull(),
  senderName: text("sender_name").notNull(),
  
  // Message content
  message: text("message").notNull(),
  messageType: text("message_type", { 
    enum: ["text", "file", "image", "system_notification", "quick_reply"] 
  }).default("text").notNull(),
  
  // Attachments and metadata
  attachments: jsonb("attachments").default([]).notNull(), // File URLs, images, etc.
  metadata: jsonb("metadata").default({}).notNull(), // Read receipts, edit history, etc.
  
  // Status tracking
  isRead: boolean("is_read").default(false).notNull(),
  readAt: timestamp("read_at"),
  isEdited: boolean("is_edited").default(false).notNull(),
  editedAt: timestamp("edited_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatQuickReplies = pgTable("chat_quick_replies", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // "billing", "technical", "general"
  title: text("title").notNull(),
  message: text("message").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  useCount: integer("use_count").default(0).notNull(),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas for chat system
export const insertSupportAgentSchema = createInsertSchema(supportAgents).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  lastSeen: true,
  currentChatCount: true
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  startedAt: true,
  lastMessageAt: true
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ 
  id: true, 
  createdAt: true 
});

export const insertChatQuickReplySchema = createInsertSchema(chatQuickReplies).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  useCount: true
});

// Types for chat system
export type SupportAgent = typeof supportAgents.$inferSelect;
export type InsertSupportAgent = z.infer<typeof insertSupportAgentSchema>;
export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatQuickReply = typeof chatQuickReplies.$inferSelect;
export type InsertChatQuickReply = z.infer<typeof insertChatQuickReplySchema>;

// Extended types for chat functionality
export type ChatSessionWithDetails = ChatSession & {
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
  company?: {
    id: number;
    name: string;
  };
  supportAgent?: {
    id: number;
    displayName: string;
    isOnline: boolean;
  };
  messageCount: number;
  lastMessage?: string;
};

export type ChatMessageWithSender = ChatMessage & {
  sender: {
    id: number;
    username: string;
  };
};
