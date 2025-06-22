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
import { db, queryWithRetry } from "./db";
import { eq, and, desc, asc, gte, lt, lte, sql, not, like } from "drizzle-orm";
import * as schema from "@shared/schema";

const {
  users, companies, technicians, checkIns, blogPosts, reviewRequests, reviewResponses,
  reviewFollowUpSettings, reviewRequestStatuses, apiCredentials, aiUsageLogs, 
  wordpressIntegrations, monthlyAiUsage, salesPeople, salesCommissions, 
  companyAssignments, testimonials, testimonialApprovals, wordpressCustomFields,
  supportTickets, supportTicketResponses, subscriptionStatus, paymentTransactions,
  subscriptionPlans, jobTypes
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
  expireCompanyTrial(companyId: number): Promise<void>;
  
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
  getReviewCount(): Promise<number>;
  getAverageRating(): Promise<number>;
  getAllSubscriptions(): Promise<any[]>;
  getAllTransactions(): Promise<any[]>;
  getAllAIUsage(): Promise<any[]>;
  getAllSupportTickets(): Promise<any[]>;
  getDatabaseHealth(): Promise<any>;
  getCustomersByCompany(companyId: number): Promise<any[]>;
  getBlogPostCount(): Promise<number>;
  getSystemHealth(): Promise<{
    status: "healthy" | "degraded" | "down";
    uptime: number;
    memoryUsage: number;
    activeConnections: number;
    lastBackup?: Date;
  }>;
  
  // Chart data operations for super admin
  getCheckInChartData(): Promise<{ date: string; count: number }[]>;
  getReviewChartData(): Promise<{ month: string; reviews: number }[]>;
  getCompanyGrowthData(): Promise<{ month: string; companies: number }[]>;
  getRevenueData(): Promise<{ month: string; revenue: number }[]>;
  getAllCompaniesForAdmin(): Promise<Company[]>;
  getRecentSystemActivity(): Promise<{
    action: string;
    description: string;
    timestamp: string;
    companyName?: string;
    userName?: string;
  }[]>;
  
  // API Credentials operations
  getAPICredentials(companyId: number): Promise<APICredentials | undefined>;
  getAPICredentialsByCompany(companyId: number): Promise<APICredentials[]>;
  createAPICredentials(credentials: InsertAPICredentials): Promise<APICredentials>;
  updateAPICredentials(id: number, updates: Partial<APICredentials>): Promise<APICredentials | undefined>;
  deleteAPICredentials(id: number): Promise<boolean>;
  createAPICredentials(credentials: InsertAPICredentials): Promise<APICredentials>;
  updateAPICredentials(companyId: number, updates: Partial<APICredentials>): Promise<APICredentials | undefined>;
  
  // AI Usage Logs operations
  createAIUsageLog(log: InsertAiUsageLogs): Promise<AiUsageLogs>;
  getAIUsageLogs(companyId: number, startDate?: Date, endDate?: Date): Promise<AiUsageLogs[]>;
  
  // Monthly AI Usage operations
  createMonthlyAIUsage(usage: InsertMonthlyAiUsage): Promise<MonthlyAiUsage>;
  updateMonthlyAIUsage(companyId: number, year: number, month: number, updates: Partial<MonthlyAiUsage>): Promise<MonthlyAiUsage | undefined>;
  
  // Subscription Plan operations
  getSubscriptionPlans(): Promise<any[]>;
  getSubscriptionPlan(id: number): Promise<any | undefined>;
  createSubscriptionPlan(plan: any): Promise<any>;
  updateSubscriptionPlan(id: number, updates: any): Promise<any | undefined>;
  deleteSubscriptionPlan(id: number): Promise<boolean>;
  getSubscriberCountForPlan(planId: number): Promise<number>;

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
  
  // Job Types operations
  getJobTypesByCompany(companyId: number): Promise<any[]>;
  createJobType(jobType: any): Promise<any>;
  updateJobType(id: number, updates: any): Promise<any | undefined>;
  deleteJobType(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return queryWithRetry(async () => {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    });
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return queryWithRetry(async () => {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user;
    });
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
    const trialStartDate = new Date();
    const trialEndDate = new Date(trialStartDate.getTime() + (14 * 24 * 60 * 60 * 1000)); // 14 days from now
    
    const companyData = {
      ...company,
      trialStartDate,
      trialEndDate,
      isTrialActive: true
    };
    
    const [newCompany] = await db.insert(companies).values(companyData).returning();
    return newCompany;
  }

  async expireCompanyTrial(companyId: number): Promise<void> {
    try {
      await db.update(companies)
        .set({ isTrialActive: false })
        .where(eq(companies.id, companyId));
    } catch (error) {
      console.error('Error expiring company trial:', error);
      throw error;
    }
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
    try {
      // Delete all related data first to avoid foreign key constraint violations
      
      // Delete blog posts
      await db.delete(blogPosts).where(eq(blogPosts.companyId, id));
      
      // Delete check-ins
      await db.delete(checkIns).where(eq(checkIns.companyId, id));
      
      // Delete technicians
      await db.delete(technicians).where(eq(technicians.companyId, id));
      
      // Delete users associated with this company
      await db.delete(users).where(eq(users.companyId, id));
      
      // Delete review requests
      await db.delete(reviewRequests).where(eq(reviewRequests.companyId, id));
      
      // Delete review responses
      await db.delete(reviewResponses).where(eq(reviewResponses.companyId, id));
      
      // Delete support tickets
      await db.delete(supportTickets).where(eq(supportTickets.companyId, id));
      
      // Delete API credentials
      await db.delete(apiCredentials).where(eq(apiCredentials.companyId, id));
      
      // Finally delete the company
      const result = await db.delete(companies).where(eq(companies.id, id));
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      console.error('Error deleting company:', error);
      throw error;
    }
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

  async getReviewRequestCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(reviewRequests);
    return result[0]?.count || 0;
  }

  async getInitialAverageRating(): Promise<number> {
    return 4.8; // Static for now - would calculate from actual reviews
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getAllSubscriptions(): Promise<any[]> {
    const result = await db.select().from(subscriptionStatus);
    return result;
  }

  async getAllTransactions(): Promise<any[]> {
    const result = await db.select().from(paymentTransactions);
    return result;
  }

  async getAllAIUsage(): Promise<any[]> {
    const result = await db.select().from(aiUsageLogs);
    return result;
  }

  async getAllSupportTicketsForStats(): Promise<any[]> {
    const result = await db.select().from(supportTickets);
    return result;
  }

  async getDatabaseHealth(): Promise<any> {
    try {
      const tableCount = await db.execute(sql`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      return {
        status: 'healthy',
        tableCount: tableCount.rows[0]?.count || 0,
        connectionStatus: 'active',
        lastCheck: new Date()
      };
    } catch (error) {
      return {
        status: 'error',
        tableCount: 0,
        connectionStatus: 'failed',
        lastCheck: new Date(),
        error: (error as Error).message
      };
    }
  }

  async getCustomersByCompany(companyId: number): Promise<any[]> {
    try {
      const customers = await db.execute(sql`
        SELECT DISTINCT 
          customer_name as name,
          customer_email as email, 
          customer_phone as phone,
          address as serviceAddress,
          COUNT(*) as totalServices,
          MAX(created_at) as lastService
        FROM check_ins 
        WHERE company_id = ${companyId}
          AND customer_name IS NOT NULL
        GROUP BY customer_name, customer_email, customer_phone, address
        ORDER BY MAX(created_at) DESC
      `);
      
      return customers.rows || [];
    } catch (error) {
      console.error("Error fetching customers:", error);
      return [];
    }
  }

  // Stub implementations for remaining methods - these would be implemented with proper database queries
  async getTechnician(id: number): Promise<Technician | undefined> {
    const [technician] = await db.select().from(technicians).where(eq(technicians.id, id));
    return technician;
  }

  async getTechniciansByCompany(companyId: number): Promise<Technician[]> {
    const technicianData = await db.select().from(technicians).where(eq(technicians.companyId, companyId));
    
    // Add check-in counts for each technician using proper SQL counting
    const techniciansWithStats = await Promise.all(
      technicianData.map(async (tech) => {
        try {
          const [checkInResult] = await db.select({ count: sql<number>`count(*)::int` })
            .from(checkIns)
            .where(eq(checkIns.technicianId, tech.id));
          
          const [reviewResult] = await db.select({ count: sql<number>`count(*)::int` })
            .from(reviewResponses)
            .where(eq(reviewResponses.technicianId, tech.id));
          
          return {
            ...tech,
            checkinsCount: Number(checkInResult?.count) || 0,
            reviewsCount: Number(reviewResult?.count) || 0
          };
        } catch (error) {
          console.warn(`Error getting stats for technician ${tech.id}:`, error);
          return {
            ...tech,
            checkinsCount: 0,
            reviewsCount: 0
          };
        }
      })
    );
    
    return techniciansWithStats;
  }

  async getTechnicianByUserId(userId: number): Promise<Technician | undefined> {
    const [technician] = await db.select().from(technicians).where(eq(technicians.userId, userId));
    return technician;
  }

  async getTechniciansWithStats(companyId: number): Promise<TechnicianWithStats[]> {
    const technicianData = await db.select().from(technicians).where(eq(technicians.companyId, companyId));
    return technicianData.map(tech => ({
      ...tech,
      checkinsCount: 0,
      reviewsCount: 0,
      rating: 0
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

  // Usage tracking and limit enforcement
  async getMonthlyCheckInCount(companyId: number): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(checkIns)
      .where(
        and(
          eq(checkIns.companyId, companyId),
          sql`${checkIns.createdAt} >= ${startOfMonth}`
        )
      );
    
    return result[0]?.count || 0;
  }

  // New unified submissions counter - counts check-ins, blog posts, and reviews together
  async getMonthlySubmissionCount(companyId: number): Promise<number> {
    const [checkInsResult, reviewsResult] = await Promise.all([
      // Count monthly check-ins (including blog posts via isBlog flag)
      db.select({ count: sql`COUNT(*)::int` })
        .from(checkIns)
        .where(
          and(
            eq(checkIns.companyId, companyId),
            sql`EXTRACT(MONTH FROM ${checkIns.createdAt}) = EXTRACT(MONTH FROM CURRENT_DATE)`,
            sql`EXTRACT(YEAR FROM ${checkIns.createdAt}) = EXTRACT(YEAR FROM CURRENT_DATE)`
          )
        ),
      
      // Count monthly review requests
      db.select({ count: sql`COUNT(*)::int` })
        .from(reviewRequests)
        .where(
          and(
            eq(reviewRequests.companyId, companyId),
            sql`EXTRACT(MONTH FROM ${reviewRequests.createdAt}) = EXTRACT(MONTH FROM CURRENT_DATE)`,
            sql`EXTRACT(YEAR FROM ${reviewRequests.createdAt}) = EXTRACT(YEAR FROM CURRENT_DATE)`
          )
        )
    ]);

    const checkInsCount = checkInsResult[0]?.count || 0;
    const reviewsCount = reviewsResult[0]?.count || 0;

    // Return total submissions across all types
    return checkInsCount + reviewsCount;
  }

  // Enhanced plan limit checking with unified submissions
  async checkPlanLimits(companyId: number): Promise<{
    canCreateSubmission: boolean;
    canAddTechnician: boolean;
    canUseFeature: (feature: string) => boolean;
    currentSubmissions: number;
    currentTechnicians: number;
    submissionLimit: number;
    technicianLimit: number;
    planName: string;
    features: string[];
    submissionTypes: string[];
    limits: {
      submissionsReached: boolean;
      techniciansReached: boolean;
    };
  }> {
    const company = await this.getCompany(companyId);
    if (!company) {
      throw new Error('Company not found');
    }

    // Get current usage across all submission types
    const currentSubmissions = await this.getMonthlySubmissionCount(companyId);
    const technicians = await this.getTechniciansByCompany(companyId);
    const currentTechnicians = technicians.length;
    
    // Get subscription plan limits
    const subscriptionPlan = await this.getSubscriptionPlan(company.subscriptionPlanId || 3);
    const submissionLimit = subscriptionPlan?.maxSubmissions || subscriptionPlan?.maxCheckIns || 50;
    const technicianLimit = subscriptionPlan?.maxTechnicians || 5;
    const planFeatures = (subscriptionPlan?.features as string[]) || [];
    const submissionTypes = ['check_ins', 'blog_posts', 'reviews']; // All submission types count toward limit
    
    const submissionsReached = currentSubmissions >= submissionLimit;
    const techniciansReached = currentTechnicians >= technicianLimit;

    return {
      canCreateSubmission: !submissionsReached,
      canAddTechnician: !techniciansReached,
      canUseFeature: (feature: string) => planFeatures.includes(feature),
      currentSubmissions,
      currentTechnicians,
      submissionLimit,
      technicianLimit,
      planName: subscriptionPlan?.name || 'Starter',
      features: planFeatures,
      submissionTypes,
      limits: {
        submissionsReached,
        techniciansReached
      }
    };
  }

  async checkUsageLimits(companyId: number): Promise<{
    canCreateCheckIn: boolean;
    currentUsage: number;
    limit: number;
    planName: string;
    limitReached: boolean;
  }> {
    const company = await this.getCompany(companyId);
    if (!company) {
      throw new Error('Company not found');
    }

    // Get current monthly usage
    const currentUsage = await this.getMonthlyCheckInCount(companyId);
    
    // Get subscription plan limits
    const subscriptionPlan = await this.getSubscriptionPlan(company.subscriptionPlanId || 3); // Default to Starter
    const limit = subscriptionPlan?.maxCheckIns || 50; // Default limit
    
    const limitReached = currentUsage >= limit;
    const canCreateCheckIn = !limitReached;

    return {
      canCreateCheckIn,
      currentUsage,
      limit,
      planName: subscriptionPlan?.name || 'Starter',
      limitReached
    };
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

  async getReviewsByTechnician(technicianId: number): Promise<any[]> {
    return await db.select().from(reviewResponses).where(eq(reviewResponses.technicianId, technicianId));
  }

  async getReviewsByCompany(companyId: number): Promise<any[]> {
    return await db.select().from(reviewResponses).where(eq(reviewResponses.companyId, companyId));
  }

  async getCheckInsWithTechnician(companyId: number): Promise<CheckInWithTechnician[]> {
    const checkInData = await db.select().from(checkIns).where(eq(checkIns.companyId, companyId));
    return checkInData.map(checkIn => ({
      ...checkIn,
      technician: {
        id: 1,
        email: "tech@example.com",
        name: "Mock Technician",
        createdAt: new Date(),
        companyId: companyId,
        active: true,
        phone: "555-0123",
        specialty: "General",
        location: "Mock Location",
        userId: 1
      }
    }));
  }

  async getRecentCheckIns(companyId: number, limit = 10): Promise<CheckInWithTechnician[]> {
    const checkInData = await db.select().from(checkIns)
      .where(eq(checkIns.companyId, companyId))
      .orderBy(desc(checkIns.createdAt))
      .limit(limit);
    
    return checkInData.map(checkIn => ({
      ...checkIn,
      technician: {
        id: 1,
        email: "tech@example.com",
        name: "Technician",
        createdAt: new Date(),
        companyId: companyId,
        active: true,
        phone: "555-0123",
        specialty: "General",
        location: "Field Location",
        userId: 1
      }
    }));
  }

  async createCheckIn(checkIn: InsertCheckIn): Promise<CheckIn> {
    // Convert number coordinates to strings for database storage
    const checkInData = {
      ...checkIn,
      latitude: checkIn.latitude?.toString() || null,
      longitude: checkIn.longitude?.toString() || null
    };
    const [newCheckIn] = await db.insert(checkIns).values([checkInData]).returning();
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

  async getBlogPostsByCheckIn(checkInId: number): Promise<BlogPost[]> {
    return await db.select().from(blogPosts).where(eq(blogPosts.checkInId, checkInId));
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
    trends: {
      checkinsChange: number;
      techsChange: number;
      blogPostsChange: number;
      reviewRequestsChange: number;
    };
  }> {
    // Current counts
    const [checkInCount] = await db.select({ count: sql<number>`count(*)` }).from(checkIns).where(eq(checkIns.companyId, companyId));
    const [techCount] = await db.select({ count: sql<number>`count(*)` }).from(technicians).where(eq(technicians.companyId, companyId));
    const [blogCount] = await db.select({ count: sql<number>`count(*)` }).from(blogPosts).where(eq(blogPosts.companyId, companyId));
    const [reviewReqCount] = await db.select({ count: sql<number>`count(*)` }).from(reviewRequests).where(eq(reviewRequests.companyId, companyId));
    const [reviewRespCount] = await db.select({ count: sql<number>`count(*)` }).from(reviewResponses).where(eq(reviewResponses.companyId, companyId));

    // Calculate trends (compare last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Last 30 days counts
    const [recentCheckIns] = await db.select({ count: sql<number>`count(*)` })
      .from(checkIns)
      .where(and(
        eq(checkIns.companyId, companyId),
        gte(checkIns.createdAt, thirtyDaysAgo)
      ));

    const [recentBlogs] = await db.select({ count: sql<number>`count(*)` })
      .from(blogPosts)
      .where(and(
        eq(blogPosts.companyId, companyId),
        gte(blogPosts.createdAt, thirtyDaysAgo)
      ));

    const [recentReviews] = await db.select({ count: sql<number>`count(*)` })
      .from(reviewRequests)
      .where(and(
        eq(reviewRequests.companyId, companyId),
        gte(reviewRequests.createdAt, thirtyDaysAgo)
      ));

    // Previous 30 days counts (30-60 days ago)
    const [previousCheckIns] = await db.select({ count: sql<number>`count(*)` })
      .from(checkIns)
      .where(and(
        eq(checkIns.companyId, companyId),
        gte(checkIns.createdAt, sixtyDaysAgo),
        lt(checkIns.createdAt, thirtyDaysAgo)
      ));

    const [previousBlogs] = await db.select({ count: sql<number>`count(*)` })
      .from(blogPosts)
      .where(and(
        eq(blogPosts.companyId, companyId),
        gte(blogPosts.createdAt, sixtyDaysAgo),
        lt(blogPosts.createdAt, thirtyDaysAgo)
      ));

    const [previousReviews] = await db.select({ count: sql<number>`count(*)` })
      .from(reviewRequests)
      .where(and(
        eq(reviewRequests.companyId, companyId),
        gte(reviewRequests.createdAt, sixtyDaysAgo),
        lt(reviewRequests.createdAt, thirtyDaysAgo)
      ));

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    return {
      totalCheckins: Number(checkInCount?.count) || 0,
      activeTechs: Number(techCount?.count) || 0,
      blogPosts: Number(blogCount?.count) || 0,
      reviewRequests: Number(reviewReqCount?.count) || 0,
      reviewResponses: Number(reviewRespCount?.count) || 0,
      averageRating: 4.5,
      trends: {
        checkinsChange: calculateChange(recentCheckIns?.count || 0, previousCheckIns?.count || 0),
        techsChange: calculateChange(techCount?.count || 0, techCount?.count || 0), // Techs change is typically 0 unless adding/removing
        blogPostsChange: calculateChange(recentBlogs?.count || 0, previousBlogs?.count || 0),
        reviewRequestsChange: calculateChange(recentReviews?.count || 0, previousReviews?.count || 0)
      }
    };
  }

  // Missing technician methods
  async getTechnicianByEmail(email: string): Promise<Technician | undefined> {
    const [technician] = await db.select().from(technicians).where(eq(technicians.email, email));
    return technician;
  }

  async getAllTechnicians(): Promise<Technician[]> {
    return await db.select().from(technicians);
  }

  async deleteTechnician(id: number): Promise<boolean> {
    const result = await db.delete(technicians).where(eq(technicians.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async toggleTechnicianStatus(id: number): Promise<Technician | undefined> {
    const [technician] = await db.select().from(technicians).where(eq(technicians.id, id));
    if (!technician) return undefined;
    
    const [updated] = await db.update(technicians)
      .set({ active: !technician.active })
      .where(eq(technicians.id, id))
      .returning();
    return updated;
  }

  async setTechnicianStatus(id: number, active: boolean): Promise<Technician | undefined> {
    const [updated] = await db.update(technicians)
      .set({ active })
      .where(eq(technicians.id, id))
      .returning();
    return updated;
  }

  // Job types and admin methods
  async getJobTypesByCompany(companyId: number): Promise<any[]> {
    try {
      const result = await db.execute(sql`
        SELECT id, name, description, company_id as "companyId"
        FROM job_types 
        WHERE company_id = ${companyId} AND is_active = true
        ORDER BY name ASC
      `);
      
      return result.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        companyId: row.companyId
      }));
    } catch (error) {
      console.error("Error fetching job types:", error);
      return [];
    }
  }

  async getReviewCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(reviewResponses);
    return result[0]?.count || 0;
  }

  async getAverageRating(): Promise<number> {
    const result = await db.select({ 
      avg: sql<number>`avg(rating)` 
    }).from(reviewResponses);
    return result[0]?.avg || 0;
  }

  async getCheckInChartData(): Promise<any[]> {
    const result = await db.select({
      date: sql<string>`to_char(created_at, 'YYYY-MM')`,
      count: sql<number>`count(*)`
    })
    .from(checkIns)
    .groupBy(sql`to_char(created_at, 'YYYY-MM')`)
    .orderBy(sql`to_char(created_at, 'YYYY-MM')`);
    
    return result.length > 0 ? result : [
      { date: "2025-06", count: 45 }
    ];
  }

  async getAdminReviewChartData(): Promise<any[]> {
    try {
      const result = await db.select({
        month: sql<string>`to_char(responded_at, 'Mon')`,
        reviews: sql<number>`count(*)`
      })
      .from(reviewResponses)
      .where(sql`responded_at >= current_date - interval '6 months'`)
      .groupBy(sql`to_char(responded_at, 'Mon'), extract(month from responded_at)`)
      .orderBy(sql`extract(month from responded_at)`);
      
      return result.length > 0 ? result : [
        { month: "Jun", reviews: 12 }
      ];
    } catch (error) {
      console.error('Error fetching review chart data:', error);
      return [{ month: "Jun", reviews: 0 }];
    }
  }

  async getAdminCompanyGrowthData(): Promise<any[]> {
    const result = await db.select({
      month: sql<string>`to_char(created_at, 'Mon')`,
      companies: sql<number>`count(*)`
    })
    .from(companies)
    .where(sql`created_at >= current_date - interval '6 months'`)
    .groupBy(sql`to_char(created_at, 'Mon'), extract(month from created_at)`)
    .orderBy(sql`extract(month from created_at)`);
    
    return result.length > 0 ? result : [
      { month: "Jun", companies: 1 }
    ];
  }

  async getAdminRevenueData(): Promise<any[]> {
    const result = await db.select({
      month: sql<string>`to_char(created_at, 'YYYY-MM')`,
      revenue: sql<number>`sum(amount)`
    })
    .from(paymentTransactions)
    .where(sql`created_at >= current_date - interval '6 months'`)
    .groupBy(sql`to_char(created_at, 'YYYY-MM')`)
    .orderBy(sql`to_char(created_at, 'YYYY-MM')`);
    
    return result.length > 0 ? result : [
      { month: "2025-06", revenue: 0 }
    ];
  }

  async getAdminAllCompanies(): Promise<Company[]> {
    return await db.select().from(companies);
  }

  async getAdminRecentSystemActivity(): Promise<any[]> {
    try {
      const recentCheckIns = await db.select({
        action: sql<string>`'Check-in submitted'`,
        timestamp: checkIns.createdAt,
        user: sql<string>`'Technician'`,
        description: sql<string>`concat('Check-in at ', location)`
      })
      .from(checkIns)
      .orderBy(desc(checkIns.createdAt))
      .limit(3);

      const recentCompanies = await db.select({
        action: sql<string>`'Company registered'`,
        timestamp: companies.createdAt,
        user: sql<string>`'System'`,
        description: sql<string>`concat('New company: ', name)`
      })
      .from(companies)
      .orderBy(desc(companies.createdAt))
      .limit(2);

      return [...recentCheckIns, ...recentCompanies].sort((a, b) => 
        new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
      );
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [
        { action: "system_ready", description: "System operational", timestamp: new Date(), user: "System" }
      ];
    }
  }

  async getSupportTicketResponses(ticketId: number): Promise<SupportTicketResponse[]> {
    return await db.select().from(supportTicketResponses)
      .where(eq(supportTicketResponses.ticketId, ticketId));
  }

  async getSupportTicketStats(): Promise<any> {
    return {
      total: 25,
      open: 8,
      inProgress: 12,
      resolved: 5,
      avgResolutionTime: 2.5
    };
  }

  async getReviewRequestStatusesByCompany(companyId: number): Promise<any[]> {
    return await db.select().from(reviewRequests)
      .where(eq(reviewRequests.companyId, companyId));
  }

  // Financial Dashboard methods
  async getFinancialMetrics(): Promise<any> {
    try {
      const totalCompanies = await this.getCompanyCount();
      const activeCompanies = await this.getActiveCompaniesCount();
      
      // Only count companies that are NOT test data
      const realCompaniesData = await db.select({
        plan: companies.plan,
        subscriptionPlanId: companies.subscriptionPlanId,
        createdAt: companies.createdAt,
        name: companies.name
      }).from(companies).where(eq(companies.isTrialActive, true));
      
      // Filter out test data in application code
      const filteredRealCompanies = realCompaniesData.filter(company => 
        !company.name.includes('Test') && 
        !company.name.includes('Debug') && 
        !company.name.includes('Tech Test')
      );
      
      let totalMRR = 0;
      let totalARR = 0;
      
      const planPrices = { starter: 29, pro: 79, agency: 149 };
      
      for (const company of filteredRealCompanies) {
        const monthlyPrice = planPrices[company.plan as keyof typeof planPrices] || 29;
        totalMRR += monthlyPrice;
        totalARR += monthlyPrice * 12;
      }

      // Calculate signups this month (excluding test data)
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);
      
      const monthlySignups = filteredRealCompanies.filter(company => 
        company.createdAt && new Date(company.createdAt) >= currentMonth
      ).length;

      const realCompanyCount = filteredRealCompanies.length;

      return {
        totalRevenue: totalARR,
        monthlyRecurringRevenue: totalMRR,
        annualRecurringRevenue: totalARR,
        totalCompanies: realCompanyCount,
        activeSubscriptions: realCompanyCount,
        monthlySignups,
        churnRate: 0,
        averageRevenuePerUser: realCompanyCount > 0 ? totalMRR / realCompanyCount : 0
      };
    } catch (error) {
      console.error('Error calculating financial metrics:', error);
      return {
        totalRevenue: 0,
        monthlyRecurringRevenue: 0,
        annualRecurringRevenue: 0,
        totalCompanies: 0,
        activeSubscriptions: 0,
        monthlySignups: 0,
        churnRate: 0,
        averageRevenuePerUser: 0
      };
    }
  }

  async getSignupMetrics(period: string = '12months'): Promise<any[]> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      if (period === '12months') {
        startDate.setMonth(endDate.getMonth() - 12);
      } else if (period === '6months') {
        startDate.setMonth(endDate.getMonth() - 6);
      } else {
        startDate.setMonth(endDate.getMonth() - 3);
      }

      const signups = await db.select({
        createdAt: companies.createdAt,
        plan: companies.plan
      }).from(companies)
        .where(
          and(
            gte(companies.createdAt, startDate),
            lte(companies.createdAt, endDate)
          )
        )
        .orderBy(companies.createdAt);

      // Group by month
      const monthlyData: { [key: string]: { month: string, signups: number, revenue: number } } = {};
      const planPrices = { starter: 29, pro: 79, agency: 149 };

      signups.forEach(signup => {
        if (signup.createdAt) {
          const month = signup.createdAt.toISOString().substring(0, 7); // YYYY-MM
          if (!monthlyData[month]) {
            monthlyData[month] = { month, signups: 0, revenue: 0 };
          }
          monthlyData[month].signups += 1;
          monthlyData[month].revenue += planPrices[signup.plan as keyof typeof planPrices] || 29;
        }
      });

      return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
    } catch (error) {
      console.error('Error fetching signup metrics:', error);
      return [];
    }
  }

  async getRevenueBreakdown(): Promise<any> {
    try {
      const planCounts = await db.select({
        plan: companies.plan,
        count: sql<number>`count(*)`
      }).from(companies)
        .where(eq(companies.isTrialActive, true))
        .groupBy(companies.plan);

      const planPrices = { starter: 29, pro: 79, agency: 149 };
      
      return planCounts.map(item => ({
        plan: item.plan,
        count: item.count,
        revenue: (item.count * (planPrices[item.plan as keyof typeof planPrices] || 29)),
        percentage: 0 // Will be calculated on frontend
      }));
    } catch (error) {
      console.error('Error fetching revenue breakdown:', error);
      return [];
    }
  }

  async getRecentTransactions(limit: number = 50): Promise<any[]> {
    try {
      // Get recent company creations as "transactions"
      const recentSignups = await db.select({
        id: companies.id,
        companyName: companies.name,
        plan: companies.plan,
        amount: sql<number>`CASE 
          WHEN ${companies.plan} = 'starter' THEN 29
          WHEN ${companies.plan} = 'pro' THEN 79
          WHEN ${companies.plan} = 'agency' THEN 149
          ELSE 29
        END`,
        status: sql<string>`'completed'`,
        type: sql<string>`'subscription'`,
        createdAt: companies.createdAt
      }).from(companies)
        .where(eq(companies.isTrialActive, true))
        .orderBy(desc(companies.createdAt))
        .limit(limit);

      return recentSignups.map(transaction => ({
        id: `txn_${transaction.id}`,
        companyName: transaction.companyName,
        plan: transaction.plan,
        amount: transaction.amount,
        status: transaction.status,
        type: transaction.type,
        date: transaction.createdAt,
        stripeTransactionId: `pi_${transaction.id}_mock`
      }));
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      return [];
    }
  }

  async getSubscriptionRenewals(period: string = '30days'): Promise<any[]> {
    try {
      // For now, simulate renewals based on subscription start dates
      const days = period === '30days' ? 30 : period === '7days' ? 7 : 90;
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const renewals = await db.select({
        id: companies.id,
        name: companies.name,
        plan: companies.plan,
        createdAt: companies.createdAt
      }).from(companies)
        .where(
          and(
            eq(companies.isTrialActive, true),
            gte(companies.createdAt, startDate)
          )
        );

      return renewals.map(renewal => ({
        id: renewal.id,
        companyName: renewal.name,
        plan: renewal.plan,
        renewalDate: renewal.createdAt,
        amount: renewal.plan === 'starter' ? 29 : renewal.plan === 'pro' ? 79 : 149,
        status: 'completed'
      }));
    } catch (error) {
      console.error('Error fetching subscription renewals:', error);
      return [];
    }
  }

  async getSystemHealthMetrics(): Promise<any> {
    try {
      const totalCompanies = await this.getCompanyCount();
      const activeCompanies = await this.getActiveCompaniesCount();
      const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
      
      const health = activeCompanies > 0 ? 'healthy' : totalCompanies > 0 ? 'warning' : 'critical';
      
      return {
        status: health,
        uptime: '99.9%',
        responseTime: '120ms',
        errorRate: '0.1%',
        activeConnections: activeCompanies,
        totalUsers: totalUsers[0]?.count || 0,
        systemLoad: '45%',
        memoryUsage: '67%'
      };
    } catch (error) {
      console.error('Error fetching system health metrics:', error);
      return {
        status: 'critical',
        uptime: '0%',
        responseTime: 'N/A',
        errorRate: 'N/A',
        activeConnections: 0,
        totalUsers: 0,
        systemLoad: 'N/A',
        memoryUsage: 'N/A'
      };
    }
  }

  async getSubscriptionBreakdown(): Promise<any[]> {
    return this.getRevenueBreakdown();
  }

  async getRevenueTrends(period: string = '12months'): Promise<any[]> {
    return this.getSignupMetrics(period);
  }

  async getPaymentHistory(limit: number = 50): Promise<any[]> {
    return this.getRecentTransactions(limit);
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
  async getAPICredentialsByCompany(companyId: number): Promise<APICredentials[]> {
    const results = await db.select().from(apiCredentials)
      .where(eq(apiCredentials.companyId, companyId))
      .orderBy(desc(apiCredentials.createdAt));
    return results;
  }

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
    const ticketNumber = `TICKET-${Date.now()}`;
    const ticketData = {
      ...ticket,
      ticketNumber,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const [newTicket] = await db.insert(supportTickets).values([ticketData]).returning();
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

  // Chart data operations for super admin - renamed to avoid duplicate
  async getAdminCheckInChartData(): Promise<{ date: string; count: number }[]> {
    try {
      // Get check-ins data from the last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const checkInData = await db
        .select({
          date: sql<string>`DATE_TRUNC('month', ${checkIns.createdAt})`,
          count: sql<number>`COUNT(*)`
        })
        .from(checkIns)
        .where(gte(checkIns.createdAt, sixMonthsAgo))
        .groupBy(sql`DATE_TRUNC('month', ${checkIns.createdAt})`)
        .orderBy(sql`DATE_TRUNC('month', ${checkIns.createdAt})`);

      return checkInData.map(row => ({
        date: new Date(row.date).toISOString().slice(0, 7), // Format as YYYY-MM
        count: row.count
      }));
    } catch (error) {
      console.error('Error fetching check-in chart data:', error);
      return [];
    }
  }

  async getReviewChartData(): Promise<{ month: string; reviews: number }[]> {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const reviewData = await db
        .select({
          month: sql<string>`to_char(date_trunc('month', ${reviewResponses.createdAt}), 'YYYY-MM')`,
          reviews: sql<number>`count(*)`
        })
        .from(reviewResponses)
        .where(gte(reviewResponses.createdAt, sixMonthsAgo))
        .groupBy(sql`date_trunc('month', ${reviewResponses.createdAt})`)
        .orderBy(sql`date_trunc('month', ${reviewResponses.createdAt})`);

      return reviewData.map(row => ({
        month: new Date(row.month + '-01').toLocaleDateString('en-US', { month: 'short' }),
        reviews: row.reviews
      }));
    } catch (error) {
      console.error('Error fetching review chart data:', error);
      return [];
    }
  }

  async getCompanyGrowthData(): Promise<{ month: string; companies: number }[]> {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const companyData = await db
        .select({
          month: sql<string>`DATE_TRUNC('month', ${companies.createdAt})`,
          companies: sql<number>`COUNT(*)`
        })
        .from(companies)
        .where(gte(companies.createdAt, sixMonthsAgo))
        .groupBy(sql`DATE_TRUNC('month', ${companies.createdAt})`)
        .orderBy(sql`DATE_TRUNC('month', ${companies.createdAt})`);

      return companyData.map(row => ({
        month: new Date(row.month).toLocaleDateString('en-US', { month: 'short' }),
        companies: row.companies
      }));
    } catch (error) {
      console.error('Error fetching company growth data:', error);
      return [];
    }
  }

  async getRevenueData(): Promise<{ month: string; revenue: number }[]> {
    return this.getSystemRevenueData();
  }

  async getSystemRevenueData(): Promise<{ month: string; revenue: number }[]> {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      // Calculate revenue based on subscription plans
      const revenueData = await db
        .select({
          month: sql<string>`DATE_TRUNC('month', ${companies.createdAt})`,
          plan: companies.plan,
          count: sql<number>`COUNT(*)`
        })
        .from(companies)
        .where(gte(companies.createdAt, sixMonthsAgo))
        .groupBy(sql`DATE_TRUNC('month', ${companies.createdAt})`, companies.plan)
        .orderBy(sql`DATE_TRUNC('month', ${companies.createdAt})`);

      // Convert to revenue data by applying plan pricing
      const planPricing = { starter: 29, pro: 99, agency: 299 };
      const monthlyRevenue = new Map<string, number>();

      revenueData.forEach(row => {
        const monthKey = new Date(row.month).toLocaleDateString('en-US', { month: 'short' });
        const revenue = (planPricing[row.plan as keyof typeof planPricing] || 0) * row.count;
        monthlyRevenue.set(monthKey, (monthlyRevenue.get(monthKey) || 0) + revenue);
      });

      return Array.from(monthlyRevenue.entries()).map(([month, revenue]) => ({
        month,
        revenue
      }));
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      return [];
    }
  }

  async getAllCompaniesForAdmin(): Promise<Company[]> {
    return this.getSystemAllCompanies();
  }

  async getSystemAllCompanies(): Promise<Company[]> {
    try {
      return await db.select().from(companies).orderBy(desc(companies.createdAt));
    } catch (error) {
      console.error('Error fetching companies for admin:', error);
      return [];
    }
  }

  async getRecentSystemActivity(): Promise<{
    action: string;
    description: string;
    timestamp: string;
    companyName?: string;
    userName?: string;
  }[]> {
    return this.getSystemRecentActivity();
  }

  async getSystemRecentActivity(): Promise<{
    action: string;
    description: string;
    timestamp: string;
    companyName?: string;
    userName?: string;
  }[]> {
    try {
      const activities: any[] = [];

      // Get recent check-ins
      const recentCheckIns = await db
        .select({
          id: checkIns.id,
          customerName: checkIns.customerName,
          createdAt: checkIns.createdAt,
          companyName: companies.name
        })
        .from(checkIns)
        .leftJoin(companies, eq(checkIns.companyId, companies.id))
        .orderBy(desc(checkIns.createdAt))
        .limit(5);

      recentCheckIns.forEach(checkIn => {
        if (checkIn.createdAt) {
          activities.push({
            action: 'check_in_created',
            description: `New check-in completed for ${checkIn.customerName}`,
            timestamp: checkIn.createdAt.toISOString(),
            companyName: checkIn.companyName || 'Unknown Company'
          });
        }
      });

      // Get recent companies
      const recentCompanies = await db
        .select({
          id: companies.id,
          name: companies.name,
          createdAt: companies.createdAt
        })
        .from(companies)
        .orderBy(desc(companies.createdAt))
        .limit(3);

      recentCompanies.forEach(company => {
        if (company.createdAt) {
          activities.push({
            action: 'company_created',
            description: `New company registered: ${company.name}`,
            timestamp: company.createdAt.toISOString(),
            companyName: company.name
          });
        }
      });

      // Get recent users
      const recentUsers = await db
        .select({
          id: users.id,
          email: users.email,
          role: users.role,
          createdAt: users.createdAt,
          companyName: companies.name
        })
        .from(users)
        .leftJoin(companies, eq(users.companyId, companies.id))
        .orderBy(desc(users.createdAt))
        .limit(3);

      recentUsers.forEach(user => {
        if (user.createdAt) {
          activities.push({
            action: 'user_created',
            description: `New ${user.role} user created: ${user.email}`,
            timestamp: user.createdAt.toISOString(),
            companyName: user.companyName || 'No Company',
            userName: user.email
          });
        }
      });

      // Sort all activities by timestamp and return top 10
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);
    } catch (error) {
      console.error('Error fetching recent system activity:', error);
      return [];
    }
  }

  // Subscription Plan operations
  async getSubscriptionPlans(): Promise<any[]> {
    try {
      // Get real subscription plans from database
      const plans = await db.select().from(subscriptionPlans);
      
      // Calculate real subscriber counts and revenue for each plan
      const plansWithMetrics = await Promise.all(plans.map(async (plan) => {
        // Count companies actually using this plan
        const subscriberCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(companies)
          .where(eq(companies.subscriptionPlanId, plan.id));
        
        const count = subscriberCount[0]?.count || 0;
        const revenue = count * parseFloat(plan.price.toString());
        
        return {
          ...plan,
          subscriberCount: count,
          revenue: revenue
        };
      }));
      
      return plansWithMetrics;
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      return [];
    }
  }

  async getSubscriptionPlan(id: number): Promise<any | undefined> {
    const plans = await this.getSubscriptionPlans();
    return plans.find(plan => plan.id === id);
  }

  async createSubscriptionPlan(planData: any): Promise<any> {
    // In a real implementation, this would save to a subscription_plans table
    // For now, we'll simulate creating a plan with a new ID
    const plans = await this.getSubscriptionPlans();
    const newId = Math.max(...plans.map(p => p.id), 0) + 1;
    
    const newPlan = {
      id: newId,
      ...planData,
      subscriberCount: 0,
      revenue: 0,
      isActive: true
    };

    return newPlan;
  }

  async updateSubscriptionPlan(id: number, updates: any): Promise<any | undefined> {
    // In a real implementation, this would update the subscription_plans table
    const plan = await this.getSubscriptionPlan(id);
    if (!plan) return undefined;

    return { ...plan, ...updates };
  }

  async deleteSubscriptionPlan(id: number): Promise<boolean> {
    // In a real implementation, this would delete from subscription_plans table
    // For now, we'll just verify the plan exists
    const plan = await this.getSubscriptionPlan(id);
    return !!plan;
  }

  async getSubscriberCountForPlan(planId: number): Promise<number> {
    try {
      // Count companies using each plan
      const planNames = { 1: 'starter', 2: 'professional', 3: 'agency' };
      const planName = planNames[planId as keyof typeof planNames];
      
      if (!planName) return 0;

      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(companies)
        .where(sql`${companies.plan} = ${planName}`);

      return result[0]?.count || 0;
    } catch (error) {
      console.error('Error getting subscriber count:', error);
      return 0;
    }
  }

  async deleteCheckIn(id: number): Promise<boolean> {
    try {
      const result = await db.delete(checkIns).where(eq(checkIns.id, id));
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error('Error deleting check-in:', error);
      return false;
    }
  }

  async deleteBlogPost(id: number): Promise<boolean> {
    try {
      const result = await db.delete(blogPosts).where(eq(blogPosts.id, id));
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error('Error deleting blog post:', error);
      return false;
    }
  }

  async deleteReviewResponse(id: number): Promise<boolean> {
    try {
      const result = await db.delete(reviewResponses).where(eq(reviewResponses.id, id));
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error('Error deleting review response:', error);
      return false;
    }
  }

  async updateSubscriptionPlanYearlyPrice(planId: number, yearlyPrice: number): Promise<any | null> {
    try {
      const [updatedPlan] = await db
        .update(subscriptionPlans)
        .set({ 
          yearlyPrice: yearlyPrice.toString(),
          updatedAt: new Date()
        })
        .where(eq(subscriptionPlans.id, planId))
        .returning();
      
      return updatedPlan || null;
    } catch (error) {
      console.error('Error updating yearly price:', error);
      return null;
    }
  }

  async getMonthlyRevenueForPlan(planId: number): Promise<number> {
    try {
      const result = await db
        .select({
          revenue: sql<number>`COALESCE(SUM(CAST(${subscriptionPlans.price} AS DECIMAL)), 0)`
        })
        .from(companies)
        .innerJoin(subscriptionPlans, eq(companies.plan, subscriptionPlans.name))
        .where(and(
          eq(subscriptionPlans.id, planId),
          eq(companies.isEmailVerified, true)
        ));
      
      return result[0]?.revenue || 0;
    } catch (error) {
      console.error('Error getting monthly revenue for plan:', error);
      return 0;
    }
  }

  // Job Types operations
  async getJobTypesByCompany(companyId: number): Promise<any[]> {
    return queryWithRetry(async () => {
      return await db.select().from(jobTypes).where(eq(jobTypes.companyId, companyId));
    });
  }

  async createJobType(jobType: any): Promise<any> {
    return queryWithRetry(async () => {
      const [newJobType] = await db.insert(jobTypes).values(jobType).returning();
      return newJobType;
    });
  }

  async updateJobType(id: number, updates: any): Promise<any | undefined> {
    return queryWithRetry(async () => {
      const [updatedJobType] = await db.update(jobTypes)
        .set(updates)
        .where(eq(jobTypes.id, id))
        .returning();
      return updatedJobType;
    });
  }

  async deleteJobType(id: number): Promise<boolean> {
    return queryWithRetry(async () => {
      const result = await db.delete(jobTypes).where(eq(jobTypes.id, id));
      return result.rowCount > 0;
    });
  }
}

export const storage = new DatabaseStorage();