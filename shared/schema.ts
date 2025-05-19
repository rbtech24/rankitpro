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
  plan: text("plan", { enum: ["starter", "pro", "agency"] }).notNull().default("starter"),
  usageLimit: integer("usage_limit").notNull().default(50),
  wordpressConfig: text("wordpress_config"),
  javaScriptEmbedConfig: text("javascript_embed_config"),
  reviewSettings: text("review_settings"),
  createdAt: timestamp("created_at").defaultNow(),
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
  sentAt: timestamp("sent_at").defaultNow(),
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

// Extended types that include related data
export type CheckInWithTechnician = CheckIn & {
  technician: Technician;
};

export type TechnicianWithStats = Technician & {
  checkinsCount: number;
  reviewsCount: number;
  rating: number;
};
