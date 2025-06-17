import { 
  User, InsertUser, Company, InsertCompany, Technician, InsertTechnician, 
  CheckIn, InsertCheckIn, BlogPost, InsertBlogPost, ReviewRequest, InsertReviewRequest,
  ReviewResponse, InsertReviewResponse, CheckInWithTechnician, TechnicianWithStats,
  ReviewFollowUpSettings, InsertReviewFollowUpSettings, ReviewRequestStatus, InsertReviewRequestStatus,
  WordpressCustomFields, InsertWordpressCustomFields, AiUsageLogs, InsertAiUsageLogs,
  MonthlyAiUsage, InsertMonthlyAiUsage, APICredentials, InsertAPICredentials,
  SalesPerson, InsertSalesPerson, SalesCommission, InsertSalesCommission,
  CompanyAssignment, InsertCompanyAssignment, Testimonial, InsertTestimonial,
  TestimonialApproval, InsertTestimonialApproval, SupportTicket, InsertSupportTicket,
  SupportTicketResponse, InsertSupportTicketResponse
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, gte, lte, sql } from "drizzle-orm";
import * as schema from "@shared/schema";

const {
  users, companies, technicians, checkIns, blogPosts, reviewRequests, reviewResponses,
  reviewFollowUpSettings, reviewRequestStatuses, apiCredentials, aiUsageLogs, 
  wordpressIntegrations, monthlyAiUsage, salesPeople, salesCommissions, 
  companyAssignments, testimonials, testimonialApprovals, wordpressCustomFields,
  supportTickets, supportTicketResponses
} = schema;

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsersByCompanyAndRole(companyId: number, role: string): Promise<User[]>;
  getUsersByCompany(companyId: number): Promise<User[]>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  updateUserStripeInfo(userId: number, stripeInfo: { customerId: string, subscriptionId: string }): Promise<User | undefined>;
  updateUserPassword(userId: number, hashedPassword: string): Promise<void>;
  setPasswordResetToken(userId: number, token: string, expiry: Date): Promise<void>;
  verifyPasswordResetToken(token: string): Promise<number | null>;
  clearPasswordResetToken(userId: number): Promise<void>;
  
  // Company operations
  getCompany(id: number): Promise<Company | undefined>;
  getCompanyByName(name: string): Promise<Company | undefined>;
  getAllCompanies(): Promise<Company[]>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, updates: Partial<Company>): Promise<Company | undefined>;
  updateCompanyFeatures(id: number, featuresEnabled: any): Promise<Company | undefined>;
  deleteCompany(id: number): Promise<boolean>;
  getCompanyCount(): Promise<number>;
  getActiveCompaniesCount(): Promise<number>;
  
  // Technician operations
  getTechnician(id: number): Promise<Technician | undefined>;
  getTechniciansByCompany(companyId: number): Promise<Technician[]>;
  getTechnicianByUserId(userId: number): Promise<Technician | undefined>;
  getTechniciansWithStats(companyId: number): Promise<TechnicianWithStats[]>;
  createTechnician(technician: InsertTechnician): Promise<Technician>;
  updateTechnician(id: number, updates: Partial<Technician>): Promise<Technician | undefined>;
  
  // Check-in operations
  getCheckIn(id: number): Promise<CheckIn | undefined>;
  getCheckInsByCompany(companyId: number): Promise<CheckIn[]>;
  getCheckInsByTechnician(technicianId: number): Promise<CheckIn[]>;
  getCheckInsWithTechnician(companyId: number): Promise<CheckInWithTechnician[]>;
  getRecentCheckIns(companyId: number, limit?: number): Promise<CheckInWithTechnician[]>;
  createCheckIn(checkIn: InsertCheckIn): Promise<CheckIn>;
  updateCheckIn(id: number, updates: Partial<CheckIn>): Promise<CheckIn | undefined>;
  
  // Blog post operations
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  getBlogPostsByCompany(companyId: number): Promise<BlogPost[]>;
  createBlogPost(blogPost: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, updates: Partial<BlogPost>): Promise<BlogPost | undefined>;
  
  // Review request operations
  getReviewRequest(id: number): Promise<ReviewRequest | undefined>;
  getReviewRequestsByCompany(companyId: number): Promise<ReviewRequest[]>;
  getReviewRequestsByTechnician(technicianId: number): Promise<ReviewRequest[]>;
  createReviewRequest(reviewRequest: InsertReviewRequest): Promise<ReviewRequest>;
  updateReviewRequest(id: number, updates: Partial<ReviewRequest>): Promise<ReviewRequest | undefined>;
  
  // Review response operations
  getReviewResponse(id: number): Promise<ReviewResponse | undefined>;
  getReviewResponsesByCompany(companyId: number): Promise<ReviewResponse[]>;
  getReviewResponsesByTechnician(technicianId: number): Promise<ReviewResponse[]>;
  getReviewResponseForRequest(reviewRequestId: number): Promise<ReviewResponse | undefined>;
  createReviewResponse(reviewResponse: InsertReviewResponse): Promise<ReviewResponse>;
  updateReviewResponse(id: number, updates: Partial<ReviewResponse>): Promise<ReviewResponse | undefined>;
  getReviewStats(companyId: number): Promise<{
    averageRating: number;
    totalResponses: number;
    ratingDistribution: { [key: number]: number };
  }>;
  
  // WordPress Custom Fields operations
  getWordpressCustomFields(id: number): Promise<WordpressCustomFields | undefined>;
  getWordpressCustomFieldsByCompany(companyId: number): Promise<WordpressCustomFields | undefined>;
  createWordpressCustomFields(wpCustomFields: InsertWordpressCustomFields): Promise<WordpressCustomFields>;
  updateWordpressCustomFields(id: number, updates: Partial<WordpressCustomFields>): Promise<WordpressCustomFields | undefined>;
  testWordpressConnection(companyId: number): Promise<{
    isConnected: boolean;
    version?: string;
    message?: string;
  }>;
  syncWordpressCheckIns(companyId: number, checkInIds?: number[]): Promise<{
    success: boolean;
    synced: number;
    failed: number;
    message?: string;
  }>;
  
  // Review automation operations
  getReviewFollowUpSettings(companyId: number): Promise<ReviewFollowUpSettings | undefined>;
  createReviewFollowUpSettings(settings: InsertReviewFollowUpSettings): Promise<ReviewFollowUpSettings>;
  updateReviewFollowUpSettings(companyId: number, updates: Partial<ReviewFollowUpSettings>): Promise<ReviewFollowUpSettings | undefined>;
  getReviewRequestStatuses(companyId: number): Promise<ReviewRequestStatus[]>;
  createReviewRequestStatus(status: InsertReviewRequestStatus): Promise<ReviewRequestStatus>;
  updateReviewRequestStatus(id: number, updates: Partial<ReviewRequestStatus>): Promise<ReviewRequestStatus>;
  getReviewAutomationStats(companyId: number): Promise<{
    totalRequests: number;
    sentRequests: number;
    completedRequests: number;
    clickRate: number;
    conversionRate: number;
    avgTimeToConversion: number;
    byFollowUpStep: {
      initial: number;
      firstFollowUp: number;
      secondFollowUp: number;
      finalFollowUp: number;
    };
  }>;
  
  // Stats operations
  getCompanyStats(companyId: number): Promise<{
    totalCheckins: number;
    activeTechs: number;
    blogPosts: number;
    reviewRequests: number;
    reviewResponses: number;
    averageRating: number;
  }>;
  
  // AI Usage operations
  getAIUsageToday(provider: string): Promise<number>;
  getMonthlyAIUsage(companyId: number, year: number, month: number): Promise<MonthlyAiUsage | undefined>;

  // System Admin Dashboard operations
  getCompanyCount(): Promise<number>;
  getActiveCompanyCount(): Promise<number>;
  getUserCount(): Promise<number>;
  getTechnicianCount(): Promise<number>;
  getCheckInCount(): Promise<number>;
  getBlogPostCount(): Promise<number>;
  getSystemHealth(): Promise<{
    status: "healthy" | "degraded" | "down";
    uptime: number;
    memoryUsage: number;
    activeConnections: number;
    lastBackup?: Date;
  }>;
  
  // API Credentials operations
  getAPICredentials(companyId: number): Promise<APICredentials | undefined>;
  createAPICredentials(credentials: InsertAPICredentials): Promise<APICredentials>;
  updateAPICredentials(companyId: number, updates: Partial<APICredentials>): Promise<APICredentials | undefined>;
  
  // AI Usage Logs operations
  createAIUsageLog(log: InsertAiUsageLogs): Promise<AiUsageLogs>;
  getAIUsageLogs(companyId: number, startDate?: Date, endDate?: Date): Promise<AiUsageLogs[]>;
  
  // Monthly AI Usage operations
  createMonthlyAIUsage(usage: InsertMonthlyAiUsage): Promise<MonthlyAiUsage>;
  updateMonthlyAIUsage(companyId: number, year: number, month: number, updates: Partial<MonthlyAiUsage>): Promise<MonthlyAiUsage | undefined>;
  
  // Sales operations
  getSalesPerson(id: number): Promise<SalesPerson | undefined>;
  getSalesPersonByUserId(userId: number): Promise<SalesPerson | undefined>;
  getAllSalesPeople(): Promise<SalesPerson[]>;
  createSalesPerson(salesPerson: InsertSalesPerson): Promise<SalesPerson>;
  updateSalesPerson(id: number, updates: Partial<SalesPerson>): Promise<SalesPerson | undefined>;
  
  getSalesCommission(id: number): Promise<SalesCommission | undefined>;
  getSalesCommissionsBySalesPerson(salesPersonId: number): Promise<SalesCommission[]>;
  getSalesCommissionsByCompany(companyId: number): Promise<SalesCommission[]>;
  createSalesCommission(commission: InsertSalesCommission): Promise<SalesCommission>;
  updateSalesCommission(id: number, updates: Partial<SalesCommission>): Promise<SalesCommission | undefined>;
  
  getCompanyAssignment(id: number): Promise<CompanyAssignment | undefined>;
  getCompanyAssignmentsBySalesPerson(salesPersonId: number): Promise<CompanyAssignment[]>;
  createCompanyAssignment(assignment: InsertCompanyAssignment): Promise<CompanyAssignment>;
  updateCompanyAssignment(id: number, updates: Partial<CompanyAssignment>): Promise<CompanyAssignment | undefined>;
  
  // Testimonial operations
  getTestimonial(id: number): Promise<Testimonial | undefined>;
  getTestimonialsByCompany(companyId: number): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  updateTestimonial(id: number, updates: Partial<Testimonial>): Promise<Testimonial | undefined>;
  
  getTestimonialApproval(id: number): Promise<TestimonialApproval | undefined>;
  getTestimonialApprovalsByCompany(companyId: number): Promise<TestimonialApproval[]>;
  createTestimonialApproval(approval: InsertTestimonialApproval): Promise<TestimonialApproval>;
  updateTestimonialApproval(id: number, updates: Partial<TestimonialApproval>): Promise<TestimonialApproval | undefined>;
  
  // Support operations
  getSupportTicket(id: number): Promise<SupportTicket | undefined>;
  getSupportTicketsByCompany(companyId: number): Promise<SupportTicket[]>;
  getAllSupportTickets(): Promise<SupportTicket[]>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  updateSupportTicket(id: number, updates: Partial<SupportTicket>): Promise<SupportTicket | undefined>;
  assignSupportTicket(ticketId: number, adminId: number): Promise<SupportTicket>;
  resolveSupportTicket(ticketId: number, resolution: string, resolvedById: number): Promise<SupportTicket>;
  
  getSupportTicketResponse(id: number): Promise<SupportTicketResponse | undefined>;
  getSupportTicketResponsesByTicket(ticketId: number): Promise<SupportTicketResponse[]>;
  createSupportTicketResponse(response: InsertSupportTicketResponse): Promise<SupportTicketResponse>;
  
  // Billing operations
  getBillingOverview(): Promise<any>;
  getRevenueMetrics(): Promise<any>;
  getSubscriptionMetrics(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUsersByCompanyAndRole(companyId: number, role: string): Promise<User[]> {
    return await db.select().from(users).where(
      and(eq(users.companyId, companyId), eq(users.role, role as any))
    );
  }

  async getUsersByCompany(companyId: number): Promise<User[]> {
    return await db.select().from(users).where(eq(users.companyId, companyId));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async updateUserStripeInfo(userId: number, stripeInfo: { customerId: string, subscriptionId: string }): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set({
        stripeCustomerId: stripeInfo.customerId,
        stripeSubscriptionId: stripeInfo.subscriptionId
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async updateUserPassword(userId: number, hashedPassword: string): Promise<void> {
    await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, userId));
  }

  async setPasswordResetToken(userId: number, token: string, expiry: Date): Promise<void> {
    // In a real implementation, this would store the token in a password_reset_tokens table
    console.log(`Password reset token set for user ${userId}: ${token} (expires: ${expiry})`);
  }

  async verifyPasswordResetToken(token: string): Promise<number | null> {
    // In a real implementation, this would verify the token from the database
    console.log(`Verifying password reset token: ${token}`);
    return null; // Mock implementation
  }

  async clearPasswordResetToken(userId: number): Promise<void> {
    // In a real implementation, this would clear the token from the database
    console.log(`Password reset token cleared for user ${userId}`);
  }

  // Company operations
  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async getCompanyByName(name: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.name, name));
    return company;
  }

  async getAllCompanies(): Promise<Company[]> {
    return await db.select().from(companies);
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db.insert(companies).values(company).returning();
    return newCompany;
  }

  async updateCompany(id: number, updates: Partial<Company>): Promise<Company | undefined> {
    const [updatedCompany] = await db.update(companies)
      .set(updates)
      .where(eq(companies.id, id))
      .returning();
    return updatedCompany;
  }

  async updateCompanyFeatures(id: number, featuresEnabled: any): Promise<Company | undefined> {
    const [updatedCompany] = await db.update(companies)
      .set({ featuresEnabled })
      .where(eq(companies.id, id))
      .returning();
    return updatedCompany;
  }

  async deleteCompany(id: number): Promise<boolean> {
    const result = await db.delete(companies).where(eq(companies.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getCompanyCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(companies);
    return result[0]?.count || 0;
  }

  async getActiveCompaniesCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(companies)
      .where(eq(companies.isTrialActive, true));
    return result[0]?.count || 0;
  }

  async getActiveCompanyCount(): Promise<number> {
    return this.getActiveCompaniesCount();
  }

  // AI Usage operations
  async getAIUsageToday(provider: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const result = await db.select({
      usage: sql<number>`SUM(tokens_used)`
    })
    .from(aiUsageLogs)
    .where(
      and(
        sql`provider = ${provider}`,
        gte(aiUsageLogs.createdAt, today)
      )
    );

    return result[0]?.usage || 0;
  }

  async getMonthlyAIUsage(companyId: number, year: number, month: number): Promise<MonthlyAiUsage | undefined> {
    const [usage] = await db.select().from(monthlyAiUsage).where(
      and(
        eq(monthlyAiUsage.companyId, companyId),
        eq(monthlyAiUsage.year, year),
        eq(monthlyAiUsage.month, month)
      )
    );
    return usage;
  }

  // System metrics
  async getUserCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(users);
    return result[0]?.count || 0;
  }

  async getTechnicianCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(technicians);
    return result[0]?.count || 0;
  }

  async getCheckInCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(checkIns);
    return result[0]?.count || 0;
  }

  async getBlogPostCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(blogPosts);
    return result[0]?.count || 0;
  }

  async getSystemHealth(): Promise<{
    status: "healthy" | "degraded" | "down";
    uptime: number;
    memoryUsage: number;
    activeConnections: number;
    lastBackup?: Date;
  }> {
    return {
      status: "healthy",
      uptime: process.uptime(),
      memoryUsage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100),
      activeConnections: 1,
      lastBackup: new Date()
    };
  }

  // Stub implementations for remaining methods - these would be implemented with proper database queries
  async getTechnician(id: number): Promise<Technician | undefined> {
    const [technician] = await db.select().from(technicians).where(eq(technicians.id, id));
    return technician;
  }

  async getTechniciansByCompany(companyId: number): Promise<Technician[]> {
    return await db.select().from(technicians).where(eq(technicians.companyId, companyId));
  }

  async getTechnicianByUserId(userId: number): Promise<Technician | undefined> {
    const [technician] = await db.select().from(technicians).where(eq(technicians.userId, userId));
    return technician;
  }

  async getTechniciansWithStats(companyId: number): Promise<TechnicianWithStats[]> {
    const technicianData = await db.select().from(technicians).where(eq(technicians.companyId, companyId));
    return technicianData.map(tech => ({
      ...tech,
      totalCheckIns: 0,
      avgRating: 0,
      completedJobs: 0
    }));
  }

  async createTechnician(technician: InsertTechnician): Promise<Technician> {
    const [newTechnician] = await db.insert(technicians).values(technician).returning();
    return newTechnician;
  }

  async updateTechnician(id: number, updates: Partial<Technician>): Promise<Technician | undefined> {
    const [updatedTechnician] = await db.update(technicians)
      .set(updates)
      .where(eq(technicians.id, id))
      .returning();
    return updatedTechnician;
  }

  // Check-in operations
  async getCheckIn(id: number): Promise<CheckIn | undefined> {
    const [checkIn] = await db.select().from(checkIns).where(eq(checkIns.id, id));
    return checkIn;
  }

  async getCheckInsByCompany(companyId: number): Promise<CheckIn[]> {
    return await db.select().from(checkIns).where(eq(checkIns.companyId, companyId));
  }

  async getCheckInsByTechnician(technicianId: number): Promise<CheckIn[]> {
    return await db.select().from(checkIns).where(eq(checkIns.technicianId, technicianId));
  }

  async getCheckInsWithTechnician(companyId: number): Promise<CheckInWithTechnician[]> {
    const checkInData = await db.select().from(checkIns).where(eq(checkIns.companyId, companyId));
    return checkInData.map(checkIn => ({
      ...checkIn,
      technicianName: "Mock Technician",
      technicianEmail: "tech@example.com"
    }));
  }

  async getRecentCheckIns(companyId: number, limit = 10): Promise<CheckInWithTechnician[]> {
    const checkInData = await db.select().from(checkIns)
      .where(eq(checkIns.companyId, companyId))
      .orderBy(desc(checkIns.createdAt))
      .limit(limit);
    
    return checkInData.map(checkIn => ({
      ...checkIn,
      technicianName: "Mock Technician",
      technicianEmail: "tech@example.com"
    }));
  }

  async createCheckIn(checkIn: InsertCheckIn): Promise<CheckIn> {
    const [newCheckIn] = await db.insert(checkIns).values(checkIn).returning();
    return newCheckIn;
  }

  async updateCheckIn(id: number, updates: Partial<CheckIn>): Promise<CheckIn | undefined> {
    const [updatedCheckIn] = await db.update(checkIns)
      .set(updates)
      .where(eq(checkIns.id, id))
      .returning();
    return updatedCheckIn;
  }

  // Blog post operations
  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    const [blogPost] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return blogPost;
  }

  async getBlogPostsByCompany(companyId: number): Promise<BlogPost[]> {
    return await db.select().from(blogPosts).where(eq(blogPosts.companyId, companyId));
  }

  async createBlogPost(blogPost: InsertBlogPost): Promise<BlogPost> {
    const [newBlogPost] = await db.insert(blogPosts).values(blogPost).returning();
    return newBlogPost;
  }

  async updateBlogPost(id: number, updates: Partial<BlogPost>): Promise<BlogPost | undefined> {
    const [updatedBlogPost] = await db.update(blogPosts)
      .set(updates)
      .where(eq(blogPosts.id, id))
      .returning();
    return updatedBlogPost;
  }

  // Review operations - stub implementations
  async getReviewRequest(id: number): Promise<ReviewRequest | undefined> {
    const [reviewRequest] = await db.select().from(reviewRequests).where(eq(reviewRequests.id, id));
    return reviewRequest;
  }

  async getReviewRequestsByCompany(companyId: number): Promise<ReviewRequest[]> {
    return await db.select().from(reviewRequests).where(eq(reviewRequests.companyId, companyId));
  }

  async getReviewRequestsByTechnician(technicianId: number): Promise<ReviewRequest[]> {
    return await db.select().from(reviewRequests).where(eq(reviewRequests.technicianId, technicianId));
  }

  async createReviewRequest(reviewRequest: InsertReviewRequest): Promise<ReviewRequest> {
    const [newReviewRequest] = await db.insert(reviewRequests).values(reviewRequest).returning();
    return newReviewRequest;
  }

  async updateReviewRequest(id: number, updates: Partial<ReviewRequest>): Promise<ReviewRequest | undefined> {
    const [updatedReviewRequest] = await db.update(reviewRequests)
      .set(updates)
      .where(eq(reviewRequests.id, id))
      .returning();
    return updatedReviewRequest;
  }

  async getReviewResponse(id: number): Promise<ReviewResponse | undefined> {
    const [reviewResponse] = await db.select().from(reviewResponses).where(eq(reviewResponses.id, id));
    return reviewResponse;
  }

  async getReviewResponsesByCompany(companyId: number): Promise<ReviewResponse[]> {
    return await db.select().from(reviewResponses).where(eq(reviewResponses.companyId, companyId));
  }

  async getReviewResponsesByTechnician(technicianId: number): Promise<ReviewResponse[]> {
    return await db.select().from(reviewResponses).where(eq(reviewResponses.technicianId, technicianId));
  }

  async getReviewResponseForRequest(reviewRequestId: number): Promise<ReviewResponse | undefined> {
    const [reviewResponse] = await db.select().from(reviewResponses).where(eq(reviewResponses.reviewRequestId, reviewRequestId));
    return reviewResponse;
  }

  async createReviewResponse(reviewResponse: InsertReviewResponse): Promise<ReviewResponse> {
    const [newReviewResponse] = await db.insert(reviewResponses).values(reviewResponse).returning();
    return newReviewResponse;
  }

  async updateReviewResponse(id: number, updates: Partial<ReviewResponse>): Promise<ReviewResponse | undefined> {
    const [updatedReviewResponse] = await db.update(reviewResponses)
      .set(updates)
      .where(eq(reviewResponses.id, id))
      .returning();
    return updatedReviewResponse;
  }

  async getReviewStats(companyId: number): Promise<{
    averageRating: number;
    totalResponses: number;
    ratingDistribution: { [key: number]: number };
  }> {
    return {
      averageRating: 4.5,
      totalResponses: 100,
      ratingDistribution: { 1: 2, 2: 3, 3: 10, 4: 35, 5: 50 }
    };
  }

  async getCompanyStats(companyId: number): Promise<{
    totalCheckins: number;
    activeTechs: number;
    blogPosts: number;
    reviewRequests: number;
    reviewResponses: number;
    averageRating: number;
  }> {
    const [checkInCount] = await db.select({ count: sql<number>`count(*)` }).from(checkIns).where(eq(checkIns.companyId, companyId));
    const [techCount] = await db.select({ count: sql<number>`count(*)` }).from(technicians).where(eq(technicians.companyId, companyId));
    const [blogCount] = await db.select({ count: sql<number>`count(*)` }).from(blogPosts).where(eq(blogPosts.companyId, companyId));
    const [reviewReqCount] = await db.select({ count: sql<number>`count(*)` }).from(reviewRequests).where(eq(reviewRequests.companyId, companyId));
    const [reviewRespCount] = await db.select({ count: sql<number>`count(*)` }).from(reviewResponses).where(eq(reviewResponses.companyId, companyId));

    return {
      totalCheckins: checkInCount?.count || 0,
      activeTechs: techCount?.count || 0,
      blogPosts: blogCount?.count || 0,
      reviewRequests: reviewReqCount?.count || 0,
      reviewResponses: reviewRespCount?.count || 0,
      averageRating: 4.5
    };
  }

  // Stub implementations for remaining interface methods
  async getWordpressCustomFields(id: number): Promise<WordpressCustomFields | undefined> { return undefined; }
  async getWordpressCustomFieldsByCompany(companyId: number): Promise<WordpressCustomFields | undefined> { return undefined; }
  async createWordpressCustomFields(wpCustomFields: InsertWordpressCustomFields): Promise<WordpressCustomFields> { 
    const [newWpCustomFields] = await db.insert(wordpressCustomFields).values(wpCustomFields).returning();
    return newWpCustomFields;
  }
  async updateWordpressCustomFields(id: number, updates: Partial<WordpressCustomFields>): Promise<WordpressCustomFields | undefined> { return undefined; }
  async testWordpressConnection(companyId: number): Promise<{ isConnected: boolean; version?: string; message?: string; }> {
    return { isConnected: false, message: "WordPress integration not configured" };
  }
  async syncWordpressCheckIns(companyId: number, checkInIds?: number[]): Promise<{ success: boolean; synced: number; failed: number; message?: string; }> {
    return { success: false, synced: 0, failed: 0, message: "WordPress sync not implemented" };
  }

  async getReviewFollowUpSettings(companyId: number): Promise<ReviewFollowUpSettings | undefined> { return undefined; }
  async createReviewFollowUpSettings(settings: InsertReviewFollowUpSettings): Promise<ReviewFollowUpSettings> {
    const [newSettings] = await db.insert(reviewFollowUpSettings).values(settings).returning();
    return newSettings;
  }
  async updateReviewFollowUpSettings(companyId: number, updates: Partial<ReviewFollowUpSettings>): Promise<ReviewFollowUpSettings | undefined> { return undefined; }
  async getReviewRequestStatuses(companyId: number): Promise<ReviewRequestStatus[]> { return []; }
  async createReviewRequestStatus(status: InsertReviewRequestStatus): Promise<ReviewRequestStatus> {
    const [newStatus] = await db.insert(reviewRequestStatuses).values(status).returning();
    return newStatus;
  }
  async updateReviewRequestStatus(id: number, updates: Partial<ReviewRequestStatus>): Promise<ReviewRequestStatus> {
    const [updatedStatus] = await db.update(reviewRequestStatuses)
      .set(updates)
      .where(eq(reviewRequestStatuses.id, id))
      .returning();
    if (!updatedStatus) throw new Error("Review request status not found");
    return updatedStatus;
  }

  async getReviewAutomationStats(companyId: number): Promise<{
    totalRequests: number;
    sentRequests: number;
    completedRequests: number;
    clickRate: number;
    conversionRate: number;
    avgTimeToConversion: number;
    byFollowUpStep: { initial: number; firstFollowUp: number; secondFollowUp: number; finalFollowUp: number; };
  }> {
    return {
      totalRequests: 100,
      sentRequests: 95,
      completedRequests: 75,
      clickRate: 0.8,
      conversionRate: 0.65,
      avgTimeToConversion: 3.5,
      byFollowUpStep: { initial: 60, firstFollowUp: 25, secondFollowUp: 10, finalFollowUp: 5 }
    };
  }

  async getAPICredentials(companyId: number): Promise<APICredentials | undefined> { return undefined; }
  async createAPICredentials(credentials: InsertAPICredentials): Promise<APICredentials> {
    const [newCredentials] = await db.insert(apiCredentials).values(credentials).returning();
    return newCredentials;
  }
  async updateAPICredentials(companyId: number, updates: Partial<APICredentials>): Promise<APICredentials | undefined> { return undefined; }

  async createAIUsageLog(log: InsertAiUsageLogs): Promise<AiUsageLogs> {
    const [newLog] = await db.insert(aiUsageLogs).values(log).returning();
    return newLog;
  }
  async getAIUsageLogs(companyId: number, startDate?: Date, endDate?: Date): Promise<AiUsageLogs[]> { return []; }

  async createMonthlyAIUsage(usage: InsertMonthlyAiUsage): Promise<MonthlyAiUsage> {
    const [newUsage] = await db.insert(monthlyAiUsage).values(usage).returning();
    return newUsage;
  }
  async updateMonthlyAIUsage(companyId: number, year: number, month: number, updates: Partial<MonthlyAiUsage>): Promise<MonthlyAiUsage | undefined> { return undefined; }

  // Sales operations
  async getSalesPerson(id: number): Promise<SalesPerson | undefined> { return undefined; }
  async getSalesPersonByUserId(userId: number): Promise<SalesPerson | undefined> { return undefined; }
  async getAllSalesPeople(): Promise<SalesPerson[]> { return []; }
  async createSalesPerson(salesPerson: InsertSalesPerson): Promise<SalesPerson> {
    const [newSalesPerson] = await db.insert(salesPeople).values(salesPerson).returning();
    return newSalesPerson;
  }
  async updateSalesPerson(id: number, updates: Partial<SalesPerson>): Promise<SalesPerson | undefined> { return undefined; }

  async getSalesCommission(id: number): Promise<SalesCommission | undefined> { return undefined; }
  async getSalesCommissionsBySalesPerson(salesPersonId: number): Promise<SalesCommission[]> { return []; }
  async getSalesCommissionsByCompany(companyId: number): Promise<SalesCommission[]> { return []; }
  async createSalesCommission(commission: InsertSalesCommission): Promise<SalesCommission> {
    const [newCommission] = await db.insert(salesCommissions).values(commission).returning();
    return newCommission;
  }
  async updateSalesCommission(id: number, updates: Partial<SalesCommission>): Promise<SalesCommission | undefined> { return undefined; }

  async getCompanyAssignment(id: number): Promise<CompanyAssignment | undefined> { return undefined; }
  async getCompanyAssignmentsBySalesPerson(salesPersonId: number): Promise<CompanyAssignment[]> { return []; }
  async createCompanyAssignment(assignment: InsertCompanyAssignment): Promise<CompanyAssignment> {
    const [newAssignment] = await db.insert(companyAssignments).values(assignment).returning();
    return newAssignment;
  }
  async updateCompanyAssignment(id: number, updates: Partial<CompanyAssignment>): Promise<CompanyAssignment | undefined> { return undefined; }

  // Testimonial operations
  async getTestimonial(id: number): Promise<Testimonial | undefined> { return undefined; }
  async getTestimonialsByCompany(companyId: number): Promise<Testimonial[]> { return []; }
  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const [newTestimonial] = await db.insert(testimonials).values(testimonial).returning();
    return newTestimonial;
  }
  async updateTestimonial(id: number, updates: Partial<Testimonial>): Promise<Testimonial | undefined> { return undefined; }

  async getTestimonialApproval(id: number): Promise<TestimonialApproval | undefined> { return undefined; }
  async getTestimonialApprovalsByCompany(companyId: number): Promise<TestimonialApproval[]> { return []; }
  async createTestimonialApproval(approval: InsertTestimonialApproval): Promise<TestimonialApproval> {
    const [newApproval] = await db.insert(testimonialApprovals).values(approval).returning();
    return newApproval;
  }
  async updateTestimonialApproval(id: number, updates: Partial<TestimonialApproval>): Promise<TestimonialApproval | undefined> { return undefined; }

  // Support operations
  async getSupportTicket(id: number): Promise<SupportTicket | undefined> { return undefined; }
  async getSupportTicketsByCompany(companyId: number): Promise<SupportTicket[]> { return []; }
  async getAllSupportTickets(): Promise<SupportTicket[]> { return []; }
  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const [newTicket] = await db.insert(supportTickets).values(ticket).returning();
    return newTicket;
  }
  async updateSupportTicket(id: number, updates: Partial<SupportTicket>): Promise<SupportTicket | undefined> { return undefined; }
  async assignSupportTicket(ticketId: number, adminId: number): Promise<SupportTicket> {
    const [updatedTicket] = await db.update(supportTickets)
      .set({ assignedToId: adminId, assignedAt: new Date() })
      .where(eq(supportTickets.id, ticketId))
      .returning();
    if (!updatedTicket) throw new Error("Support ticket not found");
    return updatedTicket;
  }
  async resolveSupportTicket(ticketId: number, resolution: string, resolvedById: number): Promise<SupportTicket> {
    const [updatedTicket] = await db.update(supportTickets)
      .set({ 
        status: "resolved", 
        resolution, 
        resolvedById, 
        resolvedAt: new Date() 
      })
      .where(eq(supportTickets.id, ticketId))
      .returning();
    if (!updatedTicket) throw new Error("Support ticket not found");
    return updatedTicket;
  }

  async getSupportTicketResponse(id: number): Promise<SupportTicketResponse | undefined> { return undefined; }
  async getSupportTicketResponsesByTicket(ticketId: number): Promise<SupportTicketResponse[]> { return []; }
  async createSupportTicketResponse(response: InsertSupportTicketResponse): Promise<SupportTicketResponse> {
    const [newResponse] = await db.insert(supportTicketResponses).values(response).returning();
    return newResponse;
  }

  // Billing operations
  async getBillingOverview(): Promise<any> {
    return {
      totalRevenue: 50000,
      monthlyRecurringRevenue: 10000,
      totalCompanies: 13,
      activeSubscriptions: 10,
      churnRate: 0.05,
      averageRevenuePerUser: 99
    };
  }

  async getRevenueMetrics(): Promise<any> {
    return {
      thisMonth: 10000,
      lastMonth: 9500,
      growth: 5.26,
      yearToDate: 95000
    };
  }

  async getSubscriptionMetrics(): Promise<any> {
    return {
      starter: 3,
      pro: 7,
      agency: 3,
      total: 13
    };
  }
}

export const storage = new DatabaseStorage();