import { 
  User, InsertUser, Company, InsertCompany, CompanyLocation, InsertCompanyLocation,
  Technician, InsertTechnician, CheckIn, InsertCheckIn, BlogPost, InsertBlogPost, 
  ReviewRequest, InsertReviewRequest, ReviewResponse, InsertReviewResponse, 
  CheckInWithTechnician, TechnicianWithStats, ReviewFollowUpSettings, InsertReviewFollowUpSettings, 
  ReviewRequestStatus, InsertReviewRequestStatus, WordpressCustomFields, InsertWordpressCustomFields, 
  AiUsageLogs, InsertAiUsageLogs, MonthlyAiUsage, InsertMonthlyAiUsage, APICredentials, InsertAPICredentials,
  SalesPerson, InsertSalesPerson, SalesCommission, InsertSalesCommission,
  CompanyAssignment, InsertCompanyAssignment, Testimonial, InsertTestimonial,
  TestimonialApproval, InsertTestimonialApproval, SupportTicket, InsertSupportTicket,
  SupportTicketResponse, InsertSupportTicketResponse, HelpTopic, InsertHelpTopic,
  HelpTopicReply, InsertHelpTopicReply, HelpTopicLike, InsertHelpTopicLike,
  SupportAgent, InsertSupportAgent, ChatSession, InsertChatSession, ChatMessage, InsertChatMessage,
  ChatQuickReply, InsertChatQuickReply, ChatSessionWithDetails, ChatMessageWithSender
} from "@shared/schema";
import { db, queryWithRetry } from "./db";
import { eq, and, or, desc, asc, gte, lt, lte, sql, not, like, ilike } from "drizzle-orm";
import * as schema from "@shared/schema";
import { neon } from "@neondatabase/serverless";
import { createHash } from "crypto";
import { startOfMonth } from "date-fns";

import { logger } from './services/logger';
const {
  users, companies, companyLocations, technicians, checkIns, blogPosts, reviewRequests, reviewResponses,
  reviewFollowUpSettings, reviewRequestStatuses, apiCredentials, aiUsageLogs, 
  wordpressIntegrations, monthlyAiUsage, salesPeople, salesCommissions, 
  companyAssignments, testimonials, testimonialApprovals, wordpressCustomFields,
  supportTickets, supportTicketResponses, subscriptionStatus, paymentTransactions,
  subscriptionPlans, jobTypes, helpTopics, helpTopicReplies, helpTopicLikes,
  supportAgents, chatSessions, chatMessages, chatQuickReplies
} = schema;

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsersByCompanyAndRole(companyId: number, role: string): Promise<User[]>;
  getUsersByCompany(companyId: number): Promise<User[]>;
  getAllUsers(): Promise<User[]>;
  getAdminUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  updateUserStripeInfo(userId: number, stripeInfo: { success: true }): Promise<User | undefined>;
  updateUserPassword(userId: number, hashedPassword: string): Promise<void>;
  deleteUser(id: number): Promise<boolean>;
  setPasswordResetToken(userId: number, token: string, expiry: Date): Promise<void>;
  verifyPasswordResetToken(token: string): Promise<number | null>;
  clearPasswordResetToken(userId: number): Promise<void>;
  
  // Company operations
  getCompany(id: number): Promise<Company | undefined>;
  getCompanyByName(name: string): Promise<Company | undefined>;
  getAllCompanies(): Promise<Company[]>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, updates: Partial<Company>): Promise<Company | undefined>;
  updateCompanyFeatures(id: number, featuresEnabled: Record<string, boolean>): Promise<Company | undefined>;
  deleteCompany(id: number): Promise<boolean>;
  getCompanyCount(): Promise<number>;
  getActiveCompaniesCount(): Promise<number>;
  expireCompanyTrial(companyId: number): Promise<void>;
  
  // Company Location operations
  getCompanyLocation(id: number): Promise<CompanyLocation | undefined>;
  getLocationsByCompany(companyId: number): Promise<CompanyLocation[]>;
  createCompanyLocation(location: InsertCompanyLocation): Promise<CompanyLocation>;
  updateCompanyLocation(id: number, updates: Partial<CompanyLocation>): Promise<CompanyLocation | undefined>;
  deleteCompanyLocation(id: number): Promise<boolean>;
  
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
    ratingDistribution: { success: true };
  }>;
  
  // Reviews operations (new table)
  getReviewsByCompany(companyId: number): Promise<ReviewResponse[]>;
  getAllReviews(): Promise<ReviewResponse[]>;
  
  // Testimonials operations (new table)
  getTestimonialsByCompany(companyId: number): Promise<Testimonial[]>;
  
  // Analytics operations - CRITICAL FOR DASHBOARD
  getAllCheckIns(): Promise<CheckIn[]>;
  getAllBlogPosts(): Promise<BlogPost[]>;
  
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
  getCheckInChartData(): Promise<Array<{ date: string; count: number }>>;
  getReviewChartData(): Promise<{ success: true }[]>;
  getCompanyGrowthData(): Promise<{ success: true }[]>;
  getRevenueData(): Promise<{ success: true }[]>;
  getAllCompaniesForAdmin(): Promise<Company[]>;
  getRecentSystemActivity(): Promise<{
    action: string;
    description: string;
    timestamp: string;
    companyName?: string;
    userName?: string;
  }[]>;
  
  // API Credentials operations
  getAPICredentials(companyId: number): Promise<APICredentials[]>;
  getAllAPICredentials(): Promise<APICredentials[]>;
  createAPICredentials(credentials: InsertAPICredentials): Promise<APICredentials>;
  updateAPICredentialsLastUsed(id: number): Promise<void>;
  deactivateAPICredentials(id: number, companyId: number): Promise<boolean>;
  regenerateAPICredentialsSecret(id: number, companyId: number): Promise<string | null>;
  
  // AI Usage Logs operations
  createAIUsageLog(log: InsertAiUsageLogs): Promise<AiUsageLogs>;
  getAIUsageLogs(companyId: number, startDate?: Date, endDate?: Date): Promise<AiUsageLogs[]>;
  
  // Monthly AI Usage operations
  createMonthlyAIUsage(usage: InsertMonthlyAiUsage): Promise<MonthlyAiUsage>;
  updateMonthlyAIUsage(companyId: number, year: number, month: number, updates: Partial<MonthlyAiUsage>): Promise<MonthlyAiUsage | undefined>;
  
  // Subscription Plan operations
  getSubscriptionPlans(): Promise<any[]>;
  getActiveSubscriptionPlans(): Promise<any[]>;
  getSubscriptionPlan(id: number): Promise<any | undefined>;
  createSubscriptionPlan(plan: any): Promise<any>;
  updateSubscriptionPlan(id: number, updates: any): Promise<any | undefined>;
  deleteSubscriptionPlan(id: number): Promise<boolean>;
  getSubscriberCountForPlan(planId: number): Promise<number>;

  // Enhanced Sales operations
  getSalesPerson(id: number): Promise<SalesPerson | undefined>;
  getSalesPersonByUserId(userId: number): Promise<SalesPerson | undefined>;
  getSalesPersonByEmail(email: string): Promise<SalesPerson | undefined>;
  getAllSalesPeople(): Promise<any[]>; // Returns with stats
  getActiveSalesPeople(): Promise<SalesPerson[]>;
  createSalesPerson(salesPerson: InsertSalesPerson): Promise<SalesPerson>;
  updateSalesPerson(id: number, updates: Partial<SalesPerson>): Promise<SalesPerson | undefined>;
  deleteSalesPerson(id: number): Promise<boolean>;
  
  // Commission operations
  getSalesCommission(id: number): Promise<SalesCommission | undefined>;
  getSalesCommissionsBySalesPerson(salesPersonId: number, status?: string): Promise<any[]>; // Returns with details
  getSalesCommissionsByCompany(companyId: number): Promise<SalesCommission[]>;
  getPendingCommissions(): Promise<any[]>; // For admin dashboard
  getPendingCommissionsBySalesPerson(salesPersonId: number): Promise<SalesCommission[]>;
  createSalesCommission(commission: InsertSalesCommission): Promise<SalesCommission>;
  updateSalesCommission(id: number, updates: Partial<SalesCommission>): Promise<SalesCommission | undefined>;
  approvePendingCommissions(commissionIds: number[]): Promise<void>;
  
  // Company assignment operations
  getCompanyAssignment(id: number): Promise<CompanyAssignment | undefined>;
  getCompanyAssignmentsBySalesPerson(salesPersonId: number): Promise<any[]>; // Returns with company details
  getCompanyAssignmentByCompanyId(companyId: number): Promise<CompanyAssignment | undefined>;
  createCompanyAssignment(assignment: InsertCompanyAssignment): Promise<CompanyAssignment>;
  updateCompanyAssignment(id: number, updates: Partial<CompanyAssignment>): Promise<CompanyAssignment | undefined>;
  
  // Commission payout operations
  createCommissionPayout(payout: any): Promise<any>;
  getCommissionPayoutsBySalesPerson(salesPersonId: number): Promise<any[]>;
  getAllCommissionPayouts(): Promise<any[]>;
  updateCommissionPayout(id: number, updates: any): Promise<any>;
  
  // Sales analytics
  getSalesPersonStats(salesPersonId: number): Promise<{
    totalCustomers: number;
    monthlyEarnings: number;
    pendingPayouts: number;
    conversionRate: number;
    lastSale: Date | null;
  }>;
  getTotalSalesRevenue(): Promise<number>;
  getMonthlyCommissionsSummary(): Promise<{ success: true }[]>;
  
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
  
  // Help Topics operations (Community Features)
  getHelpTopics(category?: string, search?: string): Promise<schema.HelpTopic[]>;
  getHelpTopic(id: number): Promise<schema.HelpTopic | undefined>;
  createHelpTopic(topic: schema.InsertHelpTopic): Promise<schema.HelpTopic>;
  updateHelpTopic(id: number, updates: Partial<schema.HelpTopic>): Promise<schema.HelpTopic | undefined>;
  deleteHelpTopic(id: number): Promise<boolean>;
  likeHelpTopic(topicId: number, userId: number): Promise<boolean>;
  unlikeHelpTopic(topicId: number, userId: number): Promise<boolean>;
  
  // Help Topic Replies operations
  getHelpTopicReplies(topicId: number): Promise<schema.HelpTopicReply[]>;
  createHelpTopicReply(reply: schema.InsertHelpTopicReply): Promise<schema.HelpTopicReply>;
  updateHelpTopicReply(id: number, updates: Partial<schema.HelpTopicReply>): Promise<schema.HelpTopicReply | undefined>;
  deleteHelpTopicReply(id: number): Promise<boolean>;
  likeHelpTopicReply(replyId: number, userId: number): Promise<boolean>;
  unlikeHelpTopicReply(replyId: number, userId: number): Promise<boolean>;
  
  // Bug Reports operations
  getBugReport(id: number): Promise<any | undefined>;
  getBugReports(): Promise<any[]>;
  getBugReportsByCompany(companyId: number): Promise<any[]>;
  createBugReport(bugReport: any): Promise<any>;
  updateBugReport(id: number, updates: any): Promise<any | undefined>;
  assignBugReport(id: number, assigneeId: number): Promise<any>;
  resolveBugReport(id: number, resolution: string, resolvedById: number): Promise<any>;
  
  // Feature Requests operations
  getFeatureRequest(id: number): Promise<any | undefined>;
  getFeatureRequests(): Promise<any[]>;
  getFeatureRequestsByCompany(companyId: number): Promise<any[]>;
  createFeatureRequest(featureRequest: any): Promise<any>;
  updateFeatureRequest(id: number, updates: any): Promise<any | undefined>;
  voteFeatureRequest(id: number): Promise<any>;
  assignFeatureRequest(id: number, assigneeId: number): Promise<any>;
  completeFeatureRequest(id: number, completedById: number): Promise<any>;
  
  // Chat Support System operations
  // Support Agent operations
  getSupportAgent(id: number): Promise<SupportAgent | undefined>;
  getSupportAgentByUserId(userId: number): Promise<SupportAgent | undefined>;
  getAllSupportAgents(): Promise<SupportAgent[]>;
  getOnlineSupportAgents(): Promise<SupportAgent[]>;
  getAvailableSupportAgents(expertiseArea?: string): Promise<SupportAgent[]>;
  createSupportAgent(agent: InsertSupportAgent): Promise<SupportAgent>;
  updateSupportAgent(id: number, updates: Partial<SupportAgent>): Promise<SupportAgent | undefined>;
  updateSupportAgentStatus(id: number, isOnline: boolean, isAvailable: boolean): Promise<void>;
  incrementAgentChatCount(agentId: number): Promise<void>;
  decrementAgentChatCount(agentId: number): Promise<void>;
  
  // Chat Session operations
  getChatSession(id: number): Promise<ChatSession | undefined>;
  getChatSessionBySessionId(sessionId: string): Promise<ChatSession | undefined>;
  getChatSessionsWithDetails(): Promise<ChatSessionWithDetails[]>;
  getActiveChatSessions(): Promise<ChatSessionWithDetails[]>;
  getChatSessionsByAgent(agentId: number): Promise<ChatSessionWithDetails[]>;
  getChatSessionsByUser(userId: number): Promise<ChatSession[]>;
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  updateChatSession(id: number, updates: Partial<ChatSession>): Promise<ChatSession | undefined>;
  assignChatToAgent(sessionId: number, agentId: number): Promise<ChatSession | undefined>;
  closeChatSession(sessionId: number, feedback?: { success: true }): Promise<ChatSession | undefined>;
  
  // Chat Message operations
  getChatMessage(id: number): Promise<ChatMessage | undefined>;
  getChatMessagesBySession(sessionId: number): Promise<ChatMessageWithSender[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  markMessageAsRead(messageId: number, readAt?: Date): Promise<void>;
  editChatMessage(messageId: number, newContent: string): Promise<ChatMessage | undefined>;
  
  // Quick Reply operations
  getChatQuickReply(id: number): Promise<ChatQuickReply | undefined>;
  getChatQuickRepliesByCategory(category: string): Promise<ChatQuickReply[]>;
  getAllChatQuickReplies(): Promise<ChatQuickReply[]>;
  createChatQuickReply(quickReply: InsertChatQuickReply): Promise<ChatQuickReply>;
  updateChatQuickReply(id: number, updates: Partial<ChatQuickReply>): Promise<ChatQuickReply | undefined>;
  incrementQuickReplyUsage(id: number): Promise<void>;
  
  // Chat Analytics operations
  getChatSessionStats(): Promise<{
    totalSessions: number;
    activeSessions: number;
    averageResolutionTime: number;
    customerSatisfactionRating: number;
    messagesPerSession: number;
  }>;
  getAgentPerformanceStats(agentId: number): Promise<{
    totalChats: number;
    averageRating: number;
    averageResponseTime: number;
    resolutionRate: number;
  }>;
  getChatSessionsByDateRange(startDate: Date, endDate: Date): Promise<any[]>;

  // Subscription Plans operations
  getAllSubscriptionPlans(): Promise<any[]>;
  getSubscriptionPlan(id: number): Promise<any | undefined>;
  createSubscriptionPlan(plan: any): Promise<any>;
  updateSubscriptionPlan(id: number, updates: any): Promise<any | undefined>;
  deleteSubscriptionPlan(id: number): Promise<boolean>;
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

  async updateUserStripeInfo(userId: number, stripeInfo: { success: true; customerId?: string; subscriptionId?: string }): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set({
        stripeCustomerId: stripeInfo.customerId || null,
        stripeSubscriptionId: stripeInfo.subscriptionId || null
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
    logger.info("Syntax processed");
  }

  async verifyPasswordResetToken(token: string): Promise<number | null> {
    // In a real implementation, this would verify the token from the database
    logger.info("Parameter processed");
    return null; // Mock implementation
  }

  async clearPasswordResetToken(userId: number): Promise<void> {
    // In a real implementation, this would clear the token from the database
    logger.info("Password reset token cleared for user ", {});
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
    try {
      // Get companies with technician counts using a simpler approach
      const companiesList = await db.select().from(companies).orderBy(companies.name);
      
      // Add technician counts for each company individually
      const companiesWithStats = await Promise.all(
        companiesList.map(async (company) => {
          try {
            // Get technician count for this company using a simpler count query
            const techCountResult = await db.select({ count: sql<number>`COUNT(*)` })
              .from(technicians)
              .where(eq(technicians.companyId, company.id));
            
            const techCount = Number(techCountResult[0]?.count) || 0;
            
            logger.info(`Company technician count: ${company.name} has ${techCount} technicians`, {
              companyId: company.id,
              companyName: company.name,
              techCount: techCount,
              rawResult: techCountResult[0]
            });
            
            return {
              ...company,
              userCount: techCount, // Add userCount for frontend compatibility
              stats: {
                totalTechnicians: techCount
              }
            };
          } catch (error) {
            logger.error("Error calculating company technician count", { 
              companyId: company.id, 
              companyName: company.name,
              errorMessage: error instanceof Error ? error.message : String(error)
            });
            return {
              ...company,
              userCount: 0,
              stats: {
                totalTechnicians: 0
              }
            };
          }
        })
      );
      
      return companiesWithStats;
      
    } catch (error) {
      logger.error("Error in getAllCompanies", { 
        errorMessage: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
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
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
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
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
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

  // Company Location operations
  async getCompanyLocation(id: number): Promise<CompanyLocation | undefined> {
    return queryWithRetry(async () => {
      const [location] = await db.select().from(companyLocations).where(eq(companyLocations.id, id));
      return location;
    });
  }

  async getLocationsByCompany(companyId: number): Promise<CompanyLocation[]> {
    return queryWithRetry(async () => {
      return await db.select().from(companyLocations)
        .where(eq(companyLocations.companyId, companyId))
        .orderBy(asc(companyLocations.name));
    });
  }

  async createCompanyLocation(location: InsertCompanyLocation): Promise<CompanyLocation> {
    return queryWithRetry(async () => {
      const [newLocation] = await db.insert(companyLocations).values(location).returning();
      return newLocation;
    });
  }

  async updateCompanyLocation(id: number, updates: Partial<CompanyLocation>): Promise<CompanyLocation | undefined> {
    return queryWithRetry(async () => {
      const [updatedLocation] = await db.update(companyLocations)
        .set(updates)
        .where(eq(companyLocations.id, id))
        .returning();
      return updatedLocation;
    });
  }

  async deleteCompanyLocation(id: number): Promise<boolean> {
    try {
      const result = await db.delete(companyLocations).where(eq(companyLocations.id, id));
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      throw error;
    }
  }

  // AI Usage operations
  async getAIUsageToday(provider: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const result = await db.select({
      usage: sql<number>`SUM(COALESCE(tokens_used, 0))`
    })
    .from(aiUsageLogs)
    .where(
      and(
        eq(aiUsageLogs.provider, provider as any),
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
    try {
      const startTime = Date.now();

      // Test database connection
      let dbStatus = 'connected';
      let activeConnections = 0;
      try {
        const testQuery = await db.select({ count: sql`count(*)` }).from(users);
        activeConnections = testQuery.length > 0 ? 1 : 0;
      } catch (error) {
        dbStatus = 'error';
      }

      // Memory usage
      const memUsage = process.memoryUsage();
      const memoryUsage = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100);

      // API response time
      const responseTime = Date.now() - startTime;

      // Determine overall status
      let status: "healthy" | "degraded" | "down" = "healthy";
      
      if (dbStatus !== 'connected') {
        status = "down";
      } else if (memoryUsage > 90 || responseTime > 2000) {
        status = "down";
      } else if (memoryUsage > 70 || responseTime > 1000) {
        status = "degraded";
      }

      // Test external services
      const servicesHealthy = await this.testExternalServices();
      if (!servicesHealthy && status === "healthy") {
        status = "degraded";
      }

      return {
        status,
        uptime: Math.floor(process.uptime()),
        memoryUsage,
        activeConnections,
        lastBackup: new Date()
      };
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return {
        status: "down",
        uptime: Math.floor(process.uptime()),
        memoryUsage: 0,
        activeConnections: 0,
        lastBackup: new Date()
      };
    }
  }

  private async testExternalServices(): Promise<boolean> {
    try {
      let servicesOk = true;

      // Test Stripe if configured
      if (process.env.STRIPE_SECRET_KEY) {
        try {
          const stripe = await import('stripe').then(Stripe => new Stripe.default(process.env.STRIPE_SECRET_KEY || ''));
          await stripe.prices.list({ limit: 1 });
        } catch (error) {
          servicesOk = false;
        }
      }

      // Test email service if configured
      if (process.env.RESEND_API_KEY) {
        // Could add actual test here, for now just check if key exists
        servicesOk = servicesOk && true;
      }

      return servicesOk;
    } catch (error) {
      return false;
    }
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

  async getAdminUsers(): Promise<User[]> {
    const result = await db.select()
      .from(users)
      .where(or(eq(users.role, 'super_admin'), eq(users.role, 'company_admin')))
      .orderBy(users.email);
    return result;
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      const result = await db.delete(users).where(eq(users.id, id));
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      logger.error('Failed to delete user', { userId: id, errorMessage: error instanceof Error ? error.message : String(error) });
      return false;
    }
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
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
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
          logger.warn("Syntax processed");
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
          gte(checkIns.createdAt, startOfMonth)
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
            gte(checkIns.createdAt, startOfMonth)
          )
        ),
      
      // Count monthly review requests
      db.select({ count: sql`COUNT(*)::int` })
        .from(reviewRequests)
        .where(
          and(
            eq(reviewRequests.companyId, companyId),
            gte(reviewRequests.createdAt, startOfMonth)
          )
        )
    ]);

    const checkInsCount: number = checkInsResult[0]?.count as number || 0;
    const reviewsCount: number = reviewsResult[0]?.count as number || 0;

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



  async getCheckInsWithTechnician(companyId: number): Promise<CheckInWithTechnician[]> {
    const checkInData = await db.select({
      checkIn: checkIns,
      technician: technicians
    })
    .from(checkIns)
    .leftJoin(technicians, eq(checkIns.technicianId, technicians.id))
    .where(eq(checkIns.companyId, companyId));
    
    return checkInData.map(data => ({
      ...data.checkIn,
      technician: data.technician || {
        id: 0,
        email: "unknown@staff.com",
        name: "Unknown Technician",
        createdAt: new Date(),
        companyId: companyId,
        active: false,
        phone: "000-000-0000",
        specialty: "General",
        location: "Unknown Location",
        userId: 0
      }
    }));
  }

  async getRecentCheckIns(companyId: number, limit = 10): Promise<CheckInWithTechnician[]> {
    const checkInData = await db.select({
      checkIn: checkIns,
      technician: technicians
    })
    .from(checkIns)
    .leftJoin(technicians, eq(checkIns.technicianId, technicians.id))
    .where(eq(checkIns.companyId, companyId))
    .orderBy(desc(checkIns.createdAt))
    .limit(limit);
    
    return checkInData.map(data => ({
      ...data.checkIn,
      technician: data.technician || {
        id: 0,
        email: "unknown@staff.com",
        name: "Unknown Technician",
        createdAt: new Date(),
        companyId: companyId,
        active: false,
        phone: "000-000-0000",
        specialty: "General",
        location: "Unknown Location",
        userId: 0
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
    ratingDistribution: { success: true };
  }> {
    return {
      averageRating: 4.5,
      totalResponses: 100,
      ratingDistribution: { success: true }
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
    try {
      // Current counts
      const [checkInCount] = await db.select({ count: sql<number>`count(*)` }).from(checkIns).where(eq(checkIns.companyId, companyId));
      const [techCount] = await db.select({ count: sql<number>`count(*)` }).from(technicians).where(eq(technicians.companyId, companyId));
      const [blogCount] = await db.select({ count: sql<number>`count(*)` }).from(blogPosts).where(eq(blogPosts.companyId, companyId));
      const [reviewReqCount] = await db.select({ count: sql<number>`count(*)` }).from(reviewRequests).where(eq(reviewRequests.companyId, companyId));
      const [reviewRespCount] = await db.select({ count: sql<number>`count(*)` }).from(reviewResponses).where(eq(reviewResponses.companyId, companyId));

      // Calculate average rating from reviewResponses table (only numeric ratings)
      const [avgRating] = await db.select({ 
        avg: sql<number>`COALESCE(AVG(CASE WHEN rating IS NOT NULL AND rating::text != '' AND rating != 0 THEN GREATEST(1, LEAST(5, rating)) ELSE NULL END), 0)` 
      }).from(reviewResponses).where(eq(reviewResponses.companyId, companyId));

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
        averageRating: Number(avgRating?.avg) || 0,
        trends: {
          checkinsChange: calculateChange(recentCheckIns?.count || 0, previousCheckIns?.count || 0),
          techsChange: 0, // Techs change is typically 0 unless adding/removing
          blogPostsChange: calculateChange(recentBlogs?.count || 0, previousBlogs?.count || 0),
          reviewRequestsChange: calculateChange(recentReviews?.count || 0, previousReviews?.count || 0)
        }
      };
    } catch (error) {
      logger.error("Error calculating company stats", { companyId, errorMessage: error instanceof Error ? error.message : String(error) });
      return {
        totalCheckins: 0,
        activeTechs: 0,
        blogPosts: 0,
        reviewRequests: 0,
        reviewResponses: 0,
        averageRating: 0,
        trends: {
          checkinsChange: 0,
          techsChange: 0,
          blogPostsChange: 0,
          reviewRequestsChange: 0
        }
      };
    }
  }

  // Missing technician methods
  async getTechnicianByEmail(email: string): Promise<Technician | undefined> {
    const [technician] = await db.select().from(technicians).where(eq(technicians.email, email));
    return technician;
  }

  async getAllTechnicians(): Promise<any[]> {
    try {
      const techniciansData = await db.select({
        id: technicians.id,
        name: technicians.name,
        email: technicians.email,
        phone: technicians.phone,
        specialty: technicians.specialty,
        location: technicians.location,
        companyId: technicians.companyId,
        active: technicians.active,
        createdAt: technicians.createdAt,
        companyName: companies.name,
        companyPlan: companies.plan
      })
      .from(technicians)
      .leftJoin(companies, eq(technicians.companyId, companies.id))
      .orderBy(desc(technicians.createdAt));

      return techniciansData.map(tech => ({
        ...tech,
        company: {
          id: tech.companyId,
          name: tech.companyName || 'Unknown Company',
          plan: tech.companyPlan || 'unknown'
        }
      }));
    } catch (error) {
      logger.error("Error getting all technicians", { errorMessage: error instanceof Error ? error.message : String(error) });
      return [];
    }
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
        { success: true }
      ];
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return [{ success: true }];
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
      { success: true }
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
      { success: true }
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
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return [
        { success: true }
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
  // Admin analytics methods
  async getSystemReviewStats(): Promise<any> {
    try {
      const result = await db.select({
        totalReviews: sql<number>`COUNT(*)`,
        averageRating: sql<number>`COALESCE(AVG(CASE WHEN status = 'completed' THEN 5 ELSE 0 END), 0)`
      }).from(reviewRequests);
      
      return {
        totalReviews: result[0]?.totalReviews || 0,
        averageRating: Number(result[0]?.averageRating || 0)
      };
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return { success: true };
    }
  }

  async getCheckInChartData(): Promise<Array<{ date: string; count: number }>> {
    try {
      // Get data from the last 30 days for more detailed daily chart
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const result = await db.select({
        date: sql<string>`DATE(created_at)::text`,
        count: sql<number>`COUNT(*)`
      })
      .from(checkIns)
      .where(gte(checkIns.createdAt, thirtyDaysAgo))
      .groupBy(sql`DATE(created_at)`)
      .orderBy(sql`DATE(created_at)`);
      
      // Convert to proper date format for the chart
      const chartData = result.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        count: item.count
      }));
      
      return chartData;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return [];
    }
  }





  async getRecentActivity(): Promise<Array<{ success: true }>> {
    try {
      const recentCompanies = await db.select({
        id: companies.id,
        name: companies.name,
        createdAt: companies.createdAt
      })
      .from(companies)
      .orderBy(desc(companies.createdAt))
      .limit(5);

      const recentCheckIns = await db.select({
        id: checkIns.id,
        createdAt: checkIns.createdAt
      })
      .from(checkIns)
      .orderBy(desc(checkIns.createdAt))
      .limit(5);

      const activities = [
        ...recentCompanies.map(company => ({
          type: 'company_created',
          description: `New company registered: ${company.name}`,
          timestamp: company.createdAt || new Date()
        })),
        ...recentCheckIns.map(checkIn => ({
          type: 'check_in_created',
          description: `New check-in completed (ID: ${checkIn.id})`,
          timestamp: checkIn.createdAt || new Date()
        }))
      ];

      return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return [];
    }
  }

  async getRecentActivities(): Promise<any[]> {
    try {
      const activities: any[] = [];
      
      // Get recent check-ins with company information
      const recentCheckIns = await db.select({
        id: checkIns.id,
        customerName: checkIns.customerName,
        location: checkIns.location,
        jobType: checkIns.jobType,
        createdAt: checkIns.createdAt,
        companyId: checkIns.companyId,
        companyName: companies.name
      }).from(checkIns)
      .leftJoin(companies, eq(checkIns.companyId, companies.id))
      .orderBy(desc(checkIns.createdAt))
      .limit(10);

      recentCheckIns.forEach(checkIn => {
        activities.push({
          id: `checkin-${checkIn.id}`,
          type: 'check-in',
          title: 'Service Check-in Completed',
          description: `${checkIn.jobType || 'Service'} completed for ${checkIn.customerName || 'customer'}`,
          company: checkIn.companyName || 'Unknown Company',
          timestamp: checkIn.createdAt,
          metadata: {
            location: checkIn.location,
            jobType: checkIn.jobType,
            customer: checkIn.customerName
          }
        });
      });

      // Get recent reviews
      const recentReviews = await db.select({
        id: reviewResponses.id,
        rating: reviewResponses.rating,
        customerName: reviewResponses.customerName,
        feedback: reviewResponses.feedback,
        createdAt: reviewResponses.createdAt,
        companyId: reviewResponses.companyId,
        companyName: companies.name
      }).from(reviewResponses)
      .leftJoin(companies, eq(reviewResponses.companyId, companies.id))
      .orderBy(desc(reviewResponses.createdAt))
      .limit(10);

      recentReviews.forEach(review => {
        activities.push({
          id: `review-${review.id}`,
          type: 'review',
          title: 'New Customer Review',
          description: `${review.rating}-star review from ${review.customerName || 'customer'}`,
          company: review.companyName || 'Unknown Company',
          timestamp: review.createdAt,
          metadata: {
            rating: review.rating,
            customer: review.customerName
          }
        });
      });

      // Get recent user registrations
      const recentUsers = await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        companyId: users.companyId,
        companyName: companies.name
      }).from(users)
      .leftJoin(companies, eq(users.companyId, companies.id))
      .orderBy(desc(users.createdAt))
      .limit(5);

      recentUsers.forEach(user => {
        activities.push({
          id: "WordPress API test successful",
          type: 'user-registration',
          title: 'New User Registration',
          description: "WordPress API test successful",
          company: user.companyName || 'Platform',
          timestamp: user.createdAt,
          metadata: {
            username: user.username,
            role: user.role,
            email: user.email
          }
        });
      });

      // Get recent company registrations
      const recentCompanies = await db.select({
        id: companies.id,
        name: companies.name,
        plan: companies.plan,
        createdAt: companies.createdAt
      }).from(companies)
      .orderBy(desc(companies.createdAt))
      .limit(5);

      recentCompanies.forEach(company => {
        activities.push({
          id: "WordPress API test successful",
          type: 'company-registration',
          title: 'New Company Registration',
          description: "WordPress API test successful",
          company: company.name,
          timestamp: company.createdAt,
          metadata: {
            plan: company.plan
          }
        });
      });

      // Sort all activities by timestamp and return latest 20
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 20);
        
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return [];
    }
  }

  async getSystemStats(): Promise<any> {
    try {
      const totalCompanies = await this.getCompanyCount();
      const activeCompanies = await this.getActiveCompaniesCount();
      const totalUsers = await this.getUserCount();
      const totalTechnicians = await this.getTechnicianCount();
      const totalCheckIns = await this.getCheckInCount();
      const reviewStats = await this.getSystemReviewStats();

      return {
        totalCompanies,
        activeCompanies,
        totalUsers,
        totalTechnicians,
        totalCheckIns,
        avgRating: reviewStats.averageRating || 0,
        totalReviews: reviewStats.totalReviews || 0
      };
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return {
        totalCompanies: 0,
        activeCompanies: 0,
        totalUsers: 0,
        totalTechnicians: 0,
        totalCheckIns: 0,
        avgRating: 0,
        totalReviews: 0
      };
    }
  }



  async getFinancialMetrics(): Promise<any> {
    try {
      // Get all database companies for baseline metrics
      const allCompanies = await db.select({
        id: companies.id,
        name: companies.name,
        plan: companies.plan,
        stripeCustomerId: companies.stripeCustomerId,
        createdAt: companies.createdAt,
        isTrialActive: companies.isTrialActive
      }).from(companies);

      // Calculate metrics from database companies (fallback/baseline data)
      const planPrices = { starter: 29, pro: 79, agency: 149 };
      const activeCompanies = allCompanies.filter(company => !company.isTrialActive);
      
      let baselineMonthlyRevenue = 0;
      activeCompanies.forEach(company => {
        baselineMonthlyRevenue += planPrices[company.plan as keyof typeof planPrices] || 29;
      });

      // Calculate monthly signups
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);
      
      const monthlySignups = allCompanies.filter(company => 
        company.createdAt && new Date(company.createdAt) >= currentMonth
      ).length;

      // If Stripe is configured, try to get real financial data
      if (process.env.STRIPE_SECRET_KEY) {
        try {
          const stripe = await import('stripe').then(Stripe => new Stripe.default(process.env.STRIPE_SECRET_KEY || ''));

          // Get active subscriptions from Stripe
          const subscriptions = await stripe.subscriptions.list({
            status: 'active',
            limit: 100
          });

          let stripeMonthlyRevenue = 0;
          let activeSubscriptions = 0;

          // Calculate revenue from active Stripe subscriptions
          for (const subscription of subscriptions.data) {
            if (subscription.status === 'active') {
              activeSubscriptions++;
              
              for (const item of subscription.items.data) {
          const price = item.price;
                if (price.recurring?.interval === 'month') {
                  stripeMonthlyRevenue += (price.unit_amount || 0) / 100;
                } else if (price.recurring?.interval === 'year') {
                  stripeMonthlyRevenue += ((price.unit_amount || 0) / 100) / 12;
                }
              }
            }
          }

          // Get total revenue from successful charges (last 12 months)
          const since = Math.floor(Date.now() / 1000) - (365 * 24 * 60 * 60);
          const charges = await stripe.charges.list({
            created: { gte: since },
            limit: 100
          });

          let totalRevenue = 0;
          let totalPayments = 0;
          let failedPayments = 0;

          for (const charge of charges.data) {
            totalPayments++;
            if (charge.status === 'succeeded') {
              totalRevenue += charge.amount / 100;
            } else if (charge.status === 'failed') {
              failedPayments++;
            }
          }

          // Calculate refunds
          const refunds = await stripe.refunds.list({
            created: { gte: since },
            limit: 100
          });

          let totalRefunds = 0;
          for (const refund of refunds.data) {
            if (refund.status === 'succeeded') {
              totalRefunds += refund.amount / 100;
            }
          }

          // Use Stripe data if we have active subscriptions, otherwise use baseline
          const monthlyRecurringRevenue = activeSubscriptions > 0 ? stripeMonthlyRevenue : baselineMonthlyRevenue;
          const finalActiveSubscriptions = activeSubscriptions > 0 ? activeSubscriptions : activeCompanies.length;

          return {
            totalRevenue,
            monthlyRecurringRevenue,
            annualRecurringRevenue: monthlyRecurringRevenue * 12,
            totalCompanies: allCompanies.length,
            activeSubscriptions: finalActiveSubscriptions,
            monthlySignups,
            churnRate: 0, // Would need historical tracking to calculate properly
            averageRevenuePerUser: finalActiveSubscriptions > 0 ? monthlyRecurringRevenue / finalActiveSubscriptions : 0,
            totalPayments,
            failedPayments,
            refunds: totalRefunds,
            netRevenue: totalRevenue - totalRefunds,
            dataSource: activeSubscriptions > 0 ? 'stripe' : 'database'
          };
        } catch (stripeError) {
          logger.warn('Stripe API error, using database baseline:', { stripeError });
          // Fall through to database baseline
        }
      }

      // Return REAL financial data - no fake revenue calculations
      return {
        totalRevenue: 0,
        monthlyRecurringRevenue: 0,
        annualRecurringRevenue: 0,
        totalCompanies: allCompanies.length,
        activeSubscriptions: 0,
        monthlySignups,
        churnRate: 0,
        averageRevenuePerUser: 0,
        totalPayments: 0,
        failedPayments: 0,
        refunds: 0,
        netRevenue: 0,
        dataSource: 'database'
      };
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return {
        totalRevenue: 0,
        monthlyRecurringRevenue: 0,
        annualRecurringRevenue: 0,
        totalCompanies: 0,
        activeSubscriptions: 0,
        monthlySignups: 0,
        churnRate: 0,
        averageRevenuePerUser: 0,
        totalPayments: 0,
        failedPayments: 0,
        refunds: 0,
        netRevenue: 0,
        dataSource: 'error'
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
      const monthlyData: { [key: string]: { month: string; signups: number; revenue: number } } = {};
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
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
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
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
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
          WHEN $2 = 'starter' THEN 29
          WHEN $2 = 'pro' THEN 79
          WHEN $2 = 'agency' THEN 149
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
        id: `transaction-${transaction.id}`,
        companyName: transaction.companyName,
        plan: transaction.plan,
        amount: transaction.amount,
        status: transaction.status,
        type: transaction.type,
        date: transaction.createdAt,
        transactionId: transaction.id
      }));
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
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
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return [];
    }
  }

  async getSystemHealthMetrics(): Promise<any> {
    try {
      const totalCompanies = await this.getCompanyCount();
      const activeCompanies = await this.getActiveCompaniesCount();
      const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
      const totalCheckIns = await this.getCheckInCount();
      const totalReviews = await this.getReviewCount();
      
      // Real system metrics
      const memoryUsage = process.memoryUsage();
      const memoryPercentage = Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100);
      
      // Calculate uptime
      const uptimeSeconds = process.uptime();
      const uptimeHours = Math.floor(uptimeSeconds / 3600);
      const uptimeMinutes = Math.floor((uptimeSeconds % 3600) / 60);
      
      // Database performance test
      const dbStart = Date.now();
      await db.select({ count: sql<number>`count(*)` }).from(companies);
      const dbResponseTime = Date.now() - dbStart;
      
      // Get AI usage statistics
      const aiUsageToday = await this.getAIUsageToday('openai');
      
      const health = activeCompanies > 0 ? 'healthy' : totalCompanies > 0 ? 'warning' : 'critical';
      
      return {
        status: health,
        uptime: "WordPress API test successful",
        responseTime: "WordPress API test successful",
        errorRate: totalCheckIns > 0 ? '0.2%' : '0%',
        activeConnections: activeCompanies,
        totalUsers: totalUsers[0]?.count || 0,
        systemLoad: memoryPercentage < 70 ? 'Low' : memoryPercentage < 85 ? 'Medium' : 'High',
        memoryUsage: "WordPress API test successful",
        memoryDetails: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          external: Math.round(memoryUsage.external / 1024 / 1024)
        },
        databaseHealth: {
          responseTime: "WordPress API test successful",
          status: dbResponseTime < 100 ? 'excellent' : dbResponseTime < 300 ? 'good' : 'slow'
        },
        apiStats: {
          totalCheckIns,
          totalReviews,
          aiCallsToday: aiUsageToday
        }
      };
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return {
        status: 'critical',
        uptime: '0s',
        responseTime: 'N/A',
        errorRate: 'N/A',
        activeConnections: 0,
        totalUsers: 0,
        systemLoad: 'N/A',
        memoryUsage: 'N/A',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }



  async getSubscriptionBreakdown(): Promise<any[]> {
    try {
      // Get subscription breakdown from actual database data
      const planCounts = await db.select({
        plan: companies.plan,
        count: sql<number>`count(*)`,
        totalRevenue: sql<number>`
          CASE 
            WHEN $1 = 'starter' THEN count(*) * 29
            WHEN $1 = 'pro' THEN count(*) * 79
            WHEN $1 = 'agency' THEN count(*) * 149
            ELSE count(*) * 29
          END
        `
      }).from(companies)
      .groupBy(companies.plan);

      const totalRevenue = planCounts.reduce((sum, plan) => sum + plan.totalRevenue, 0);

      return planCounts.map(plan => ({
        planName: plan.plan,
        subscribers: plan.count,
        revenue: plan.totalRevenue,
        percentage: totalRevenue > 0 ? Math.round((plan.totalRevenue / totalRevenue) * 100) : 0,
        monthlyRevenue: plan.totalRevenue,
        growthRate: 0 // TODO: Calculate based on historical plan changes
      }));
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return [
        { success: true },
        { success: true },
        { success: true }
      ];
    }
  }

  async getRevenueChartData(): Promise<any[]> {
    try {
      // Get revenue data from actual subscriptions over time
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(endDate.getMonth() - 6);

      const companiesWithRevenue = await db.select({
        plan: companies.plan,
        createdAt: companies.createdAt,
        revenue: sql<number>`
          CASE 
            WHEN plan = 'starter' THEN 29
            WHEN plan = 'pro' THEN 79
            WHEN plan = 'agency' THEN 149
            ELSE 29
          END
        `
      }).from(companies)
      .where(
        and(
          gte(companies.createdAt, startDate),
          lte(companies.createdAt, endDate)
        )
      )
      .orderBy(companies.createdAt);

      // Group by month
      const monthlyRevenue: { [key: string]: number } = {};
      
      companiesWithRevenue.forEach(company => {
        if (company.createdAt) {
          const month = company.createdAt.toISOString().substring(0, 7);
          monthlyRevenue[month] = (monthlyRevenue[month] || 0) + company.revenue;
        }
      });

      return Object.entries(monthlyRevenue)
        .map(([month, revenue]) => ({ month, revenue }))
        .sort((a, b) => a.month.localeCompare(b.month));
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return [];
    }
  }

  async getCheckInCountByCompany(companyId: number): Promise<number> {
    try {
      const result = await db.select({ count: sql<number>`count(*)` })
        .from(checkIns)
        .where(eq(checkIns.companyId, companyId));
      return result[0]?.count || 0;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return 0;
    }
  }

  async getReviewCountByCompany(companyId: number): Promise<number> {
    try {
      const result = await db.select({ count: sql<number>`count(*)` })
        .from(reviewResponses)
        .where(eq(reviewResponses.companyId, companyId));
      return result[0]?.count || 0;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return 0;
    }
  }

  async getUserCountByCompany(companyId: number): Promise<number> {
    try {
      const result = await db.select({ count: sql<number>`count(*)` })
        .from(users)
        .where(eq(users.companyId, companyId));
      return result[0]?.count || 0;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return 0;
    }
  }

  async getAverageRatingByCompany(companyId: number): Promise<number> {
    try {
      const result = await db.select({ data: "converted" })
        .from(reviewResponses)
        .where(eq(reviewResponses.companyId, companyId));
      return Math.round((result[0]?.avg || 0) * 10) / 10;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return 0;
    }
  }

  async getLastActivityByCompany(companyId: number): Promise<string> {
    try {
      const lastCheckIn = await db.select({ createdAt: checkIns.createdAt })
        .from(checkIns)
        .where(eq(checkIns.companyId, companyId))
        .orderBy(desc(checkIns.createdAt))
        .limit(1);

      if (lastCheckIn.length > 0 && lastCheckIn[0].createdAt) {
        return lastCheckIn[0].createdAt.toISOString();
      }

      return 'No activity';
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return 'Unknown';
    }
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
  async testWordpressConnection(companyId: number): Promise<any> {
    try {
      const company = await this.getCompany(companyId);
      if (!company?.wordpressConfig) {
        return { 
          isConnected: false, 
          message: "WordPress configuration must be set up" 
        };
      }

      let wpConfig;
      try {
        wpConfig = JSON.parse(company.wordpressConfig);
      } catch (error) {
        return { 
          isConnected: false, 
          message: "WordPress configuration is invalid" 
        };
      }

      if (!wpConfig?.url || !wpConfig?.apiKey) {
        return { 
          isConnected: false, 
          message: "WordPress URL and API key must be configured" 
        };
      }

      const wpUrl = wpConfig.url.replace(/\$/, "");
      const response = await fetch(`${wpUrl}/wp-json/wp/v2/users/me`, {
        headers: {
          "Authorization": `Bearer ${wpConfig.apiKey}`,
          "Content-Type": "application/json"
        }
      });

      if (postResponse.ok) {
        const userData = await response.json();
        return {
          isConnected: true,
          version: "2.0",
          message: "WordPress API test successful"
        };
      } else {
        return {
          isConnected: false,
          message: "WordPress API connection failed"
        };
      }
    } catch (error) {
      return {
        isConnected: false,
        message: "WordPress API test successful"
      };
    }
  }
  async syncWordpressCheckIns(companyId: number, checkInIds?: number[]): Promise<any> {
    try {
      const company = await this.getCompany(companyId);
      if (!company?.wordpressConfig) {
        return {
          success: false,
          synced: 0,
          failed: 0,
          message: "WordPress connection not configured"
        };
      }

      let checkInsToSync: CheckIn[];
      if (checkInIds) {
        checkInsToSync = [];
        for (const id of checkInIds) {
          const checkIn = await this.getCheckIn(id);
          if (checkIn && checkIn.companyId === companyId) {
            checkInsToSync.push(checkIn);
          }
        }
      } else {
        checkInsToSync = await db.select()
          .from(checkIns)
          .where(
            and(
              eq(checkIns.companyId, companyId),
              eq(checkIns.isBlog, true),
              sql`created_at >= ${startOfMonth}`
            )
          )
          .limit(10);
      }

      if (checkInsToSync.length === 0) {
        return {
          success: true,
          synced: 0,
          failed: 0,
          message: "No check-ins to sync"
        };
      }

      let synced = 0;
      let failed = 0;
      let wpConfig;
      try {
        wpConfig = JSON.parse(company.wordpressConfig);
      } catch (error) {
        return {
          success: false,
          synced: 0,
          failed: 0,
          message: "WordPress configuration is invalid"
        };
      }

      if (!wpConfig?.url || !wpConfig?.apiKey) {
        return {
          success: false,
          synced: 0,
          failed: 0,
          message: "WordPress URL and API key must be configured"
        };
      }

      const wpUrl = wpConfig.url.replace(/\/$/, '');

      for (const checkIn of checkInsToSync) {
        try {
          const technician = await this.getTechnician(checkIn.technicianId);
          
          const postData = {
            title: "WordPress API test successful",
            placeholder: `
              <div class="service-post">
                <h2>Professional placeholder Service</h2>
                
                <div class="service-details">
                  <p><strong>Service Type:</strong> placeholder</p>
                  <p><strong>Location:</strong> placeholder</p>
                  <p><strong>Technician:</strong> placeholder</p>
                  <p><strong>Date:</strong> placeholder</p>
                </div>

                <div class="service-description">
                  <h3>Service Details</h3>
                  <p>placeholder</p>
                </div>

                ${(checkIn.beforePhotos as string[])?.length > 0 ? `
                  <div class="service-photos">
                    <h3>Service Documentation</h3>
                    <img src="placeholder" alt="Service documentation" class="service-photo" />
                    placeholder" alt="Completed service" class="service-photo" />` : ''}
                  </div>

                <div class="call-to-action">
                  <h3>Need Similar Service?</h3>
                  <p>Contact us today for professional placeholder service in your area. Our experienced technicians are ready to help!</p>
                </div>
              </div>
            `,
            status: 'publish',
            categories: [1],
            tags: [checkIn.jobType.toLowerCase().replace(/\s+/g, '-')],
            meta: {
              'service_type': checkIn.jobType,
              'service_location': checkIn.location,
              'technician_name': technician?.name,
              'service_date': checkIn.createdAt
            }
          };

          const postResponse = await fetch(`${wpUrl}/wp-json/wp/v2/posts`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${wpConfig.apiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(postData)
          });

          if (postResponse.ok) {
            const wpPost = await postResponse.json();
            await db.update(checkIns)
              .set({
                wordpressSyncStatus: 'synced',
                wordpressPostId: wpPost.id,
                wordpressPostUrl: wpPost.link
              })
              .where(eq(checkIns.id, checkIn.id));
            
            synced++;
          } else {
      const errorText = await postResponse.text(); logger.error("Parameter processed");
            await db.update(checkIns)
              .set({ wordpressSyncStatus: 'failed' })
              .where(eq(checkIns.id, checkIn.id));
            failed++;
          }
        } catch (error) {
          logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
          await db.update(checkIns)
            .set({ wordpressSyncStatus: 'failed' })
            .where(eq(checkIns.id, checkIn.id));
          failed++;
        }
      }

      return {
        success: synced > 0,
        synced,
        failed,
        message: "WordPress API test successful"
      };
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return {
        success: false,
        synced: 0,
        failed: 0,
        message: "WordPress API test successful"
      };
    }
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
    byFollowUpStep: { success: true };
  }> {
    return {
      totalRequests: 100,
      sentRequests: 95,
      completedRequests: 75,
      clickRate: 0.8,
      conversionRate: 0.65,
      avgTimeToConversion: 3.5,
      byFollowUpStep: { success: true }
    };
  }


  async getAPICredentialsByCompany(companyId: number): Promise<APICredentials[]> {
    const results = await db.select().from(apiCredentials)
      .where(eq(apiCredentials.companyId, companyId))
      .orderBy(desc(apiCredentials.createdAt));
    return results;
  }


  async updateAPICredentials(companyId: number, updates: Partial<APICredentials>): Promise<APICredentials | undefined> { return undefined; }

  // Reviews operations (new table)
  async getReviewsByCompany(companyId: number): Promise<any[]> {
    try {
      const result = await db.execute(sql`
        SELECT * FROM reviews 
        WHERE company_id = ${companyId} AND status = 'approved'
        ORDER BY created_at DESC
      `);
      return result.rows;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return [];
    }
  }
  
  // Testimonials operations (new table)
  async getTestimonialsByCompany(companyId: number): Promise<any[]> {
    try {
      logger.info("Parameter processed");
      
      // Use direct SQL query since table structure doesn't match drizzle schema
      const neonSql = neon(process.env.DATABASE_URL!);
      const result = await neonSql`
        SELECT id, customer_name, customer_email, content, type, media_url, status, created_at 
        FROM testimonials 
        WHERE company_id = ${companyId}
        ORDER BY created_at DESC
      `;
      
      logger.info("Parameter processed");
      
      if (result.length > 0) {
      logger.info("Operation completed");
      }
      
      return result;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return [];
    }
  }

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

  // Enhanced Sales operations
  async getSalesPerson(id: number): Promise<SalesPerson | undefined> {
    try {
      const [salesPerson] = await db.select().from(salesPeople).where(eq(salesPeople.id, id));
      return salesPerson;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return undefined;
    }
  }

  async getSalesPersonByUserId(userId: number): Promise<SalesPerson | undefined> {
    try {
      const [salesPerson] = await db.select().from(salesPeople).where(eq(salesPeople.userId, userId));
      return salesPerson;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return undefined;
    }
  }

  async getSalesPersonByEmail(email: string): Promise<SalesPerson | undefined> {
    try {
      const [salesPerson] = await db.select().from(salesPeople).where(eq(salesPeople.email, email));
      return salesPerson;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return undefined;
    }
  }

  async getAllSalesPeople(): Promise<any[]> {
    try {
      // Get sales people with comprehensive stats
      const salesPeopleWithStats = await db
        .select({
          id: salesPeople.id,
          userId: salesPeople.userId,
          name: salesPeople.name,
          email: salesPeople.email,
          phone: salesPeople.phone,
          commissionRate: salesPeople.commissionRate,
          isActive: salesPeople.isActive,
          stripeAccountId: salesPeople.stripeAccountId,
          totalEarnings: salesPeople.totalEarnings,
          pendingCommissions: salesPeople.pendingCommissions,
          createdAt: salesPeople.createdAt,
          updatedAt: salesPeople.updatedAt,
          totalCustomers: sql<number>`(
            SELECT COUNT(*) FROM company_assignments 
            WHERE sales_person_id = ${salesPeople.id}
          )`,
          monthlyEarnings: sql<number>`(
            SELECT COALESCE(SUM(amount), 0) FROM sales_commissions 
            WHERE sales_person_id = ${salesPeople.id} 
            AND payment_date >= DATE_TRUNC('month', CURRENT_DATE)
            AND status = 'paid'
          )`,
          pendingPayouts: sql<number>`(
            SELECT COALESCE(SUM(amount), 0) FROM sales_commissions 
            WHERE sales_person_id = ${salesPeople.id} 
            AND status = 'approved'
            AND is_paid = false
          )`
        })
        .from(salesPeople)
        .orderBy(desc(salesPeople.createdAt));

      return salesPeopleWithStats;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return [];
    }
  }

  async getActiveSalesPeople(): Promise<SalesPerson[]> {
    try {
      return await db.select().from(salesPeople).where(eq(salesPeople.isActive, true));
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return [];
    }
  }

  async createSalesPerson(salesPerson: InsertSalesPerson): Promise<SalesPerson> {
    const [newSalesPerson] = await db.insert(salesPeople).values(salesPerson).returning();
    return newSalesPerson;
  }

  async updateSalesPerson(id: number, updates: Partial<SalesPerson>): Promise<SalesPerson | undefined> {
    try {
      const [updatedSalesPerson] = await db
        .update(salesPeople)
        .set({ data: "converted" })
        .where(eq(salesPeople.id, id))
        .returning();
      return updatedSalesPerson;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return undefined;
    }
  }

  async deleteSalesPerson(id: number): Promise<boolean> {
    try {
      // First, delete all related foreign key references
      await db.delete(companyAssignments).where(eq(companyAssignments.salesPersonId, id));
      await db.delete(salesCommissions).where(eq(salesCommissions.salesPersonId, id));
      
      // Get the sales person to find their user ID
      const salesPerson = await db.select().from(salesPeople).where(eq(salesPeople.id, id)).limit(1);
      
      // Delete the sales person record
      const result = await db.delete(salesPeople).where(eq(salesPeople.id, id));
      
      // Delete the associated user account if it exists
      if (salesPerson.length > 0 && salesPerson[0].userId) {
        await db.delete(users).where(eq(users.id, salesPerson[0].userId));
      }
      
      return result.rowCount > 0;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      throw error;
    }
  }

  // Enhanced Commission operations
  async getSalesCommission(id: number): Promise<SalesCommission | undefined> {
    try {
      const [commission] = await db.select().from(salesCommissions).where(eq(salesCommissions.id, id));
      return commission;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return undefined;
    }
  }

  async getSalesCommissionsBySalesPerson(salesPersonId: number, status?: string): Promise<any[]> {
    try {
      const conditions = [eq(salesCommissions.salesPersonId, salesPersonId)];
      if (status) {
        conditions.push(eq(salesCommissions.status, status as any));
      }
      const whereCondition = conditions.length > 1 ? and(...conditions) : conditions[0];

      return await db
        .select({
          id: salesCommissions.id,
          salesPersonId: salesCommissions.salesPersonId,
          companyId: salesCommissions.companyId,
          subscriptionId: salesCommissions.subscriptionId,
          amount: salesCommissions.amount,
          commissionRate: salesCommissions.commissionRate,
          baseAmount: salesCommissions.baseAmount,
          billingPeriod: salesCommissions.billingPeriod,
          type: salesCommissions.type,
          status: salesCommissions.status,
          isPaid: salesCommissions.isPaid,
          paidAt: salesCommissions.paidAt,
          paymentDate: salesCommissions.paymentDate,
          createdAt: salesCommissions.createdAt,
          // Include company details
          companyName: companies.name
        })
        .from(salesCommissions)
        .leftJoin(companies, eq(salesCommissions.companyId, companies.id))
        .where(whereCondition)
        .orderBy(desc(salesCommissions.createdAt));
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return [];
    }
  }

  async getSalesCommissionsByCompany(companyId: number): Promise<SalesCommission[]> {
    try {
      return await db.select().from(salesCommissions)
        .where(eq(salesCommissions.companyId, companyId))
        .orderBy(desc(salesCommissions.createdAt));
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return [];
    }
  }

  async getPendingCommissions(): Promise<any[]> {
    try {
      return await db
        .select({
          id: salesCommissions.id,
          salesPersonId: salesCommissions.salesPersonId,
          companyId: salesCommissions.companyId,
          amount: salesCommissions.amount,
          type: salesCommissions.type,
          paymentDate: salesCommissions.paymentDate,
          createdAt: salesCommissions.createdAt,
          salesPersonName: salesPeople.name,
          salesPersonEmail: salesPeople.email,
          companyName: companies.name
        })
        .from(salesCommissions)
        .leftJoin(salesPeople, eq(salesCommissions.salesPersonId, salesPeople.id))
        .leftJoin(companies, eq(salesCommissions.companyId, companies.id))
        .where(eq(salesCommissions.status, 'pending'))
        .orderBy(desc(salesCommissions.createdAt));
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return [];
    }
  }

  async getPendingCommissionsBySalesPerson(salesPersonId: number): Promise<SalesCommission[]> {
    try {
      return await db.select().from(salesCommissions)
        .where(and(
          eq(salesCommissions.salesPersonId, salesPersonId),
          eq(salesCommissions.status, 'pending')
        ))
        .orderBy(desc(salesCommissions.createdAt));
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return [];
    }
  }

  async createSalesCommission(commission: InsertSalesCommission): Promise<SalesCommission> {
    const [newCommission] = await db.insert(salesCommissions).values(commission).returning();
    return newCommission;
  }

  async updateSalesCommission(id: number, updates: Partial<SalesCommission>): Promise<SalesCommission | undefined> {
    try {
      const [updatedCommission] = await db
        .update(salesCommissions)
        .set({ data: "converted" })
        .where(eq(salesCommissions.id, id))
        .returning();
      return updatedCommission;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return undefined;
    }
  }

  async approvePendingCommissions(commissionIds: number[]): Promise<void> {
    try {
      await db
        .update(salesCommissions)
        .set({ success: true })
        .where(sql`created_at >= ${startOfMonth}`);
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      throw error;
    }
  }

  // Enhanced Company Assignment operations
  async getCompanyAssignment(id: number): Promise<CompanyAssignment | undefined> {
    try {
      const [assignment] = await db.select().from(companyAssignments).where(eq(companyAssignments.id, id));
      return assignment;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return undefined;
    }
  }

  async getCompanyAssignmentsBySalesPerson(salesPersonId: number): Promise<any[]> {
    try {
      return await db
        .select({
          id: companyAssignments.id,
          salesPersonId: companyAssignments.salesPersonId,
          companyId: companyAssignments.companyId,
          signupDate: companyAssignments.signupDate,
          subscriptionPlan: companyAssignments.subscriptionPlan,
          initialPlanPrice: companyAssignments.initialPlanPrice,
          currentPlanPrice: companyAssignments.currentPlanPrice,
          billingPeriod: companyAssignments.billingPeriod,
          status: companyAssignments.status,
          createdAt: companyAssignments.createdAt,
          // Include company details
          companyName: companies.name,
          companyPlan: companies.plan,
          companyStatus: companies.isTrialActive
        })
        .from(companyAssignments)
        .leftJoin(companies, eq(companyAssignments.companyId, companies.id))
        .where(eq(companyAssignments.salesPersonId, salesPersonId))
        .orderBy(desc(companyAssignments.createdAt));
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return [];
    }
  }

  async getCompanyAssignmentByCompanyId(companyId: number): Promise<CompanyAssignment | undefined> {
    try {
      const [assignment] = await db.select().from(companyAssignments)
        .where(eq(companyAssignments.companyId, companyId));
      return assignment;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return undefined;
    }
  }

  async createCompanyAssignment(assignment: InsertCompanyAssignment): Promise<CompanyAssignment> {
    const [newAssignment] = await db.insert(companyAssignments).values(assignment).returning();
    return newAssignment;
  }

  async updateCompanyAssignment(id: number, updates: Partial<CompanyAssignment>): Promise<CompanyAssignment | undefined> {
    try {
      const [updatedAssignment] = await db
        .update(companyAssignments)
        .set({ data: "converted" })
        .where(eq(companyAssignments.id, id))
        .returning();
      return updatedAssignment;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return undefined;
    }
  }

  // Testimonial operations
  async getTestimonial(id: number): Promise<Testimonial | undefined> { return undefined; }
  // Removed - implemented above
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
    const ticketNumber = "WordPress API test successful";
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
      .set({ success: true })
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
    try {
      // Get real company data
      const allCompanies = await db.select().from(companies);
      const activeCompanies = allCompanies.filter(c => !c.isTrialActive && c.subscriptionPlanId !== null);
      
      // Get REAL revenue from actual payment transactions
      const revenueResult = await db
        .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
        .from(paymentTransactions)
        .where(eq(paymentTransactions.status, 'success'));
      
      const totalRevenue = Number(revenueResult[0]?.total) || 0;

      // Calculate monthly recurring revenue from this month's payments
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      
      const monthlyRevenueResult = await db
        .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
        .from(paymentTransactions)
        .where(and(
          eq(paymentTransactions.status, 'success'),
          eq(paymentTransactions.billingPeriod, 'monthly'),
          gte(paymentTransactions.createdAt, thisMonth)
        ));
      
      const monthlyRecurringRevenue = Number(monthlyRevenueResult[0]?.total) || 0;

      // Count companies with successful payments (active subscriptions)
      const transactionCountResult = await db
        .select({ count: sql<number>`COUNT(DISTINCT company_id)` })
        .from(paymentTransactions)
        .where(eq(paymentTransactions.status, 'success'));
      
      const activeSubscriptions = Number(transactionCountResult[0]?.count) || 0;

      // Calculate average revenue per user based on actual payments
      const averageRevenuePerUser = activeSubscriptions > 0 ? totalRevenue / activeSubscriptions : 0;

      // Calculate churn rate based on recent activity
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      const recentActivity = await db
        .select({ companyId: checkIns.companyId })
        .from(checkIns)
        .where(gte(checkIns.createdAt, oneMonthAgo));
      
      const activeInLastMonth = new Set(recentActivity.map(c => c.companyId)).size;
      const churnRate = activeCompanies.length > 0 ? 
        Math.max(0, (activeCompanies.length - activeInLastMonth) / activeCompanies.length) : 0;

      return {
        totalRevenue,
        monthlyRecurringRevenue,
        totalCompanies: allCompanies.length,
        activeSubscriptions,
        churnRate: Math.round(churnRate * 100) / 100,
        averageRevenuePerUser: Math.round(averageRevenuePerUser * 100) / 100
      };
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return {
        totalRevenue: 0,
        monthlyRecurringRevenue: 0,
        totalCompanies: 0,
        activeSubscriptions: 0,
        churnRate: 0,
        averageRevenuePerUser: 0
      };
    }
  }

  async getRevenueMetrics(): Promise<any> {
    try {
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const yearStart = new Date(now.getFullYear(), 0, 1);

      // Get actual revenue from payment transactions this month
      const thisMonthResult = await db
        .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
        .from(paymentTransactions)
        .where(and(
          eq(paymentTransactions.status, 'success'),
          gte(paymentTransactions.createdAt, thisMonth)
        ));

      // Get actual revenue from payment transactions last month
      const lastMonthResult = await db
        .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
        .from(paymentTransactions)
        .where(and(
          eq(paymentTransactions.status, 'success'),
          gte(paymentTransactions.createdAt, lastMonth),
          lt(paymentTransactions.createdAt, thisMonth)
        ));

      // Get actual revenue from payment transactions this year
      const yearToDateResult = await db
        .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
        .from(paymentTransactions)
        .where(and(
          eq(paymentTransactions.status, 'success'),
          gte(paymentTransactions.createdAt, yearStart)
        ));

      const thisMonthRevenue = Number(thisMonthResult[0]?.total) || 0;
      const lastMonthRevenue = Number(lastMonthResult[0]?.total) || 0;
      const yearToDateRevenue = Number(yearToDateResult[0]?.total) || 0;

      // Calculate growth percentage based on actual payments
      const growth = lastMonthRevenue > 0 ? 
        ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 
        thisMonthRevenue > 0 ? 100 : 0;

      return {
        thisMonth: thisMonthRevenue,
        lastMonth: lastMonthRevenue,
        growth: Math.round(growth * 100) / 100,
        yearToDate: yearToDateRevenue
      };
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return {
        thisMonth: 0,
        lastMonth: 0,
        growth: 0,
        yearToDate: 0
      };
    }
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
  async getAdminCheckInChartData(): Promise<{ success: true }[]> {
    try {
      // Get check-ins data from the last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const checkInData = await db
        .select({
          date: sql<string>`DATE_TRUNC('month', created_at)::text`,
          count: sql<number>`COUNT(*)`
        })
        .from(checkIns)
        .where(gte(checkIns.createdAt, sixMonthsAgo))
        .groupBy(sql`DATE_TRUNC('month', created_at)`)
        .orderBy(sql`DATE_TRUNC('month', created_at)`);

      return checkInData.map(row => ({
        date: new Date(row.date).toISOString().slice(0, 7), // Format as YYYY-MM
        count: row.count
      }));
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return [];
    }
  }

  async getReviewChartData(): Promise<{ success: true }[]> {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const reviewData = await db
        .select({
          month: sql<string>`DATE_TRUNC('month', created_at)::text`,
          reviews: sql<number>`count(*)`
        })
        .from(reviewResponses)
        .where(gte(reviewResponses.createdAt, sixMonthsAgo))
        .groupBy(sql`DATE_TRUNC('month', created_at)`)
        .orderBy(sql`DATE_TRUNC('month', created_at)`);

      return reviewData.map(row => ({
        month: new Date(row.month + '-01').toLocaleDateString('en-US', { month: 'short' }),
        reviews: row.reviews
      }));
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return [];
    }
  }

  async getCompanyGrowthData(): Promise<{ success: true }[]> {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const companyData = await db
        .select({
          month: sql<string>"WordPress API test successful",
          companies: sql<number>`COUNT(*)`
        })
        .from(companies)
        .where(gte(companies.createdAt, sixMonthsAgo))
        .groupBy(sql`created_at >= ${startOfMonth}`)
        .orderBy(sql`created_at >= ${startOfMonth}`);

      return companyData.map(row => ({
        month: new Date(row.month).toLocaleDateString('en-US', { month: 'short' }),
        companies: row.companies
      }));
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return [];
    }
  }

  async getRevenueData(): Promise<{ success: true }[]> {
    return this.getSystemRevenueData();
  }

  async getSystemRevenueData(): Promise<{ success: true }[]> {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      // Calculate revenue based on subscription plans
      const revenueData = await db
        .select({
          month: sql<string>"WordPress API test successful",
          plan: companies.plan,
          count: sql<number>`COUNT(*)`
        })
        .from(companies)
        .where(gte(companies.createdAt, sixMonthsAgo))
        .groupBy(sql`created_at >= ${startOfMonth}`, companies.plan)
        .orderBy(sql`created_at >= ${startOfMonth}`);

      // Convert to revenue data by applying plan pricing
      const planPricing = { starter: 29, pro: 79, agency: 149 };
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
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
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
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
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
            description: "WordPress API test successful",
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
            description: "WordPress API test successful",
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
            description: "WordPress API test successful",
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
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
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
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return [];
    }
  }

  async getActiveSubscriptionPlans(): Promise<any[]> {
    try {
      // Get only active subscription plans from database
      const plans = await db.select().from(subscriptionPlans)
        .where(eq(subscriptionPlans.isActive, true))
        .orderBy(subscriptionPlans.price);
      
      return plans.map(plan => ({
        id: plan.id,
        name: plan.name,
        price: parseFloat(plan.price.toString()),
        yearlyPrice: plan.yearlyPrice ? parseFloat(plan.yearlyPrice.toString()) : null,
        billingPeriod: plan.billingPeriod,
        maxTechnicians: plan.maxTechnicians,
        maxCheckIns: plan.maxCheckIns,
        features: plan.features,
        stripeProductId: plan.stripeProductId,
        stripePriceId: plan.stripePriceId
      }));
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return [];
    }
  }

  async getSubscriptionPlan(id: number): Promise<any | undefined> {
    try {
      const plan = await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.id, id))
        .limit(1);
      
      if (plan.length === 0) return undefined;
      
      return {
        id: plan[0].id,
        name: plan[0].name,
        price: parseFloat(plan[0].price.toString()),
        yearlyPrice: plan[0].yearlyPrice ? parseFloat(plan[0].yearlyPrice.toString()) : null,
        billingPeriod: plan[0].billingPeriod,
        maxTechnicians: plan[0].maxTechnicians,
        maxCheckIns: plan[0].maxCheckIns,
        features: plan[0].features,
        stripeProductId: plan[0].stripeProductId,
        stripePriceId: plan[0].stripePriceId
      };
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return undefined;
    }
  }







  async getSubscriberCountForPlan(planId: number): Promise<number> {
    try {
      // Count companies using each plan
      const planNames = { success: true };
      const planName = planNames[planId as keyof typeof planNames];
      
      if (!planName) return 0;

      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(companies)
        .where(sql`created_at >= ${startOfMonth}`);

      return result[0]?.count || 0;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return 0;
    }
  }

  async deleteCheckIn(id: number): Promise<boolean> {
    try {
      const result = await db.delete(checkIns).where(eq(checkIns.id, id));
      return (result.rowCount || 0) > 0;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return false;
    }
  }

  async deleteBlogPost(id: number): Promise<boolean> {
    try {
      const result = await db.delete(blogPosts).where(eq(blogPosts.id, id));
      return (result.rowCount || 0) > 0;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return false;
    }
  }

  async deleteReviewResponse(id: number): Promise<boolean> {
    try {
      const result = await db.delete(reviewResponses).where(eq(reviewResponses.id, id));
      return (result.rowCount || 0) > 0;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
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
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return null;
    }
  }

  async getMonthlyRevenueForPlan(planId: number): Promise<number> {
    try {
      const result = await db
        .select({
          revenue: sql<number>"WordPress API test successful"
        })
        .from(companies)
        .innerJoin(subscriptionPlans, eq(companies.plan, subscriptionPlans.name))
        .where(and(
          eq(subscriptionPlans.id, planId),
          eq(companies.isEmailVerified, true)
        ));
      
      return result[0]?.revenue || 0;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
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
      return (result.rowCount || 0) > 0;
    });
  }

  // Add missing deleteAPICredentials method to satisfy IStorage interface
  async deleteAPICredentials(id: number): Promise<void> {
    return queryWithRetry(async () => {
      await db.delete(apiCredentials).where(eq(apiCredentials.id, id));
    });
  }

  // Commission Payout operations
  async createCommissionPayout(payout: any): Promise<any> {
    try {
      const [newPayout] = await db.insert(schema.commissionPayouts).values(payout).returning();
      return newPayout;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      throw error;
    }
  }

  async getCommissionPayoutsBySalesPerson(salesPersonId: number): Promise<any[]> {
    try {
      return await db.select().from(schema.commissionPayouts)
        .where(eq(schema.commissionPayouts.salesPersonId, salesPersonId))
        .orderBy(desc(schema.commissionPayouts.createdAt));
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return [];
    }
  }

  async getAllCommissionPayouts(): Promise<any[]> {
    try {
      return await db
        .select({
          id: schema.commissionPayouts.id,
          salesPersonId: schema.commissionPayouts.salesPersonId,
          totalAmount: schema.commissionPayouts.totalAmount,
          commissionIds: schema.commissionPayouts.commissionIds,
          stripePayoutId: schema.commissionPayouts.stripePayoutId,
          payoutDate: schema.commissionPayouts.payoutDate,
          status: schema.commissionPayouts.status,
          createdAt: schema.commissionPayouts.createdAt,
          salesPersonName: salesPeople.name,
          salesPersonEmail: salesPeople.email
        })
        .from(schema.commissionPayouts)
        .leftJoin(salesPeople, eq(schema.commissionPayouts.salesPersonId, salesPeople.id))
        .orderBy(desc(schema.commissionPayouts.createdAt));
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return [];
    }
  }

  async updateCommissionPayout(id: number, updates: any): Promise<any> {
    try {
      const [updatedPayout] = await db
        .update(schema.commissionPayouts)
        .set(updates)
        .where(eq(schema.commissionPayouts.id, id))
        .returning();
      return updatedPayout;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      throw error;
    }
  }

  // Sales analytics
  async getSalesPersonStats(salesPersonId: number): Promise<{
    totalCustomers: number;
    monthlyEarnings: number;
    pendingPayouts: number;
    conversionRate: number;
    lastSale: Date | null;
  }> {
    try {
      // Get total customers (company assignments)
      const totalCustomersResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(companyAssignments)
        .where(eq(companyAssignments.salesPersonId, salesPersonId));

      // Get monthly earnings (paid commissions this month)
      const monthlyEarningsResult = await db
        .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
        .from(salesCommissions)
        .where(and(
          eq(salesCommissions.salesPersonId, salesPersonId),
          eq(salesCommissions.status, 'paid'),
          gte(salesCommissions.paymentDate, sql`DATE_TRUNC('month', CURRENT_DATE)`)
        ));

      // Get pending payouts (approved but not paid)
      const pendingPayoutsResult = await db
        .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
        .from(salesCommissions)
        .where(and(
          eq(salesCommissions.salesPersonId, salesPersonId),
          eq(salesCommissions.status, 'approved'),
          eq(salesCommissions.isPaid, false)
        ));

      // Get last sale date
      const lastSaleResult = await db
        .select({ lastSale: companyAssignments.signupDate })
        .from(companyAssignments)
        .where(eq(companyAssignments.salesPersonId, salesPersonId))
        .orderBy(desc(companyAssignments.signupDate))
        .limit(1);

      // Calculate actual conversion rate from review requests to signups
      const reviewRequestsResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(reviewRequests)
        .where(eq(reviewRequests.technicianId, salesPersonId));

      const totalReviewRequests = reviewRequestsResult[0]?.count || 0;
      const conversionRate = totalReviewRequests > 0 ? 
        Math.min(1, (totalCustomersResult[0]?.count || 0) / totalReviewRequests) : 0;

      return {
        totalCustomers: totalCustomersResult[0]?.count || 0,
        monthlyEarnings: monthlyEarningsResult[0]?.total || 0,
        pendingPayouts: pendingPayoutsResult[0]?.total || 0,
        conversionRate: Math.round(conversionRate * 100) / 100,
        lastSale: lastSaleResult[0]?.lastSale || null
      };
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return {
        totalCustomers: 0,
        monthlyEarnings: 0,
        pendingPayouts: 0,
        conversionRate: 0,
        lastSale: null
      };
    }
  }

  async getTotalSalesRevenue(): Promise<number> {
    try {
      const result = await db
        .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
        .from(salesCommissions)
        .where(eq(salesCommissions.status, 'paid'));

      return result[0]?.total || 0;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return 0;
    }
  }

  async getMonthlyCommissionsSummary(): Promise<{ success: true }[]> {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const commissionsData = await db
        .select({
          month: sql<string>"WordPress API test successful",
          totalAmount: sql<number>"WordPress API test successful",
          paidAmount: sql<number>"WordPress API test successful"
        })
        .from(salesCommissions)
        .where(gte(salesCommissions.paymentDate, sixMonthsAgo))
        .groupBy(sql`created_at >= ${startOfMonth}`)
        .orderBy(sql`created_at >= ${startOfMonth}`);

      return commissionsData.map(row => ({
        month: new Date(row.month).toLocaleDateString('en-US', { month: 'short' }),
        total: row.totalAmount,
        paid: row.paidAmount
      }));
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return [];
    }
  }

  // CRITICAL MISSING METHODS FOR ANALYTICS DASHBOARD
  async getAllCheckIns(): Promise<CheckIn[]> {
    try {
      return await db.select().from(checkIns).orderBy(desc(checkIns.createdAt));
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return [];
    }
  }

  async getAllReviews(): Promise<any[]> {
    try {
      return await db.select().from(reviewResponses).orderBy(desc(reviewResponses.createdAt));
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return [];
    }
  }

  async getAllBlogPosts(): Promise<BlogPost[]> {
    try {
      return await db.select().from(blogPosts).orderBy(desc(blogPosts.publishDate));
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return [];
    }
  }

  async getFinancialExportData(period: string = '12months'): Promise<any[]> {
    try {
      let startDate = new Date();
      
      switch (period) {
        case '1month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case '3months':
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case '6months':
          startDate.setMonth(startDate.getMonth() - 6);
          break;
        case '12months':
        default:
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      // Get comprehensive financial data for export
      const financialData = await db
        .select({
          date: sql<string>`${companies.createdAt}::text`,
          companyName: companies.name,
          plan: companies.plan,
          isTrialActive: companies.isTrialActive,
          revenue: sql<number>`
            CASE 
              WHEN ${companies.plan} = 'starter' THEN 49
              WHEN ${companies.plan} = 'pro' THEN 79
              WHEN ${companies.plan} = 'agency' THEN 149
              ELSE 0
            END
          `,
          mrr: sql<number>`
            CASE 
              WHEN ${companies.isTrialActive} = false THEN
                CASE 
                  WHEN ${companies.plan} = 'starter' THEN 49
                  WHEN ${companies.plan} = 'pro' THEN 79
                  WHEN ${companies.plan} = 'agency' THEN 149
                  ELSE 0
                END
              ELSE 0
            END
          `,
          status: sql<string>`
            CASE 
              WHEN ${companies.isTrialActive} = true THEN 'trial'
              ELSE 'active'
            END
          `
        })
        .from(companies)
        .where(gte(companies.createdAt, startDate))
        .orderBy(desc(sql`created_at >= ${startOfMonth}`));

      return financialData.map(row => ({
        month: new Date(row.date).toISOString().slice(0, 7),
        companyName: row.companyName,
        plan: row.plan,
        status: row.status,
        monthlyRevenue: row.revenue,
        mrr: row.mrr,
        isTrialActive: row.isTrialActive
      }));
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return [];
    }
  }

  // Help Topics operations (Community Features)
  async getHelpTopics(category?: string, search?: string): Promise<HelpTopic[]> {
    try {
      let whereConditions = [];
      
      if (category) {
        whereConditions.push(eq(helpTopics.category, category));
      }
      
      if (search) {
        whereConditions.push(like(helpTopics.title, "WordPress API test successful"));
      }
      
      const query = db.select().from(helpTopics);
      
      if (whereConditions.length > 0) {
        return await query.where(and(...whereConditions)).orderBy(desc(helpTopics.lastActivity));
      } else {
        return await query.orderBy(desc(helpTopics.lastActivity));
      }
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return [];
    }
  }

  async getHelpTopic(id: number): Promise<HelpTopic | undefined> {
    try {
      const topic = await db.select().from(helpTopics).where(eq(helpTopics.id, id)).limit(1);
      
      if (topic.length > 0) {
        // Increment view count
        await db.update(helpTopics)
          .set({ views: sql`created_at >= ${startOfMonth}` })
          .where(eq(helpTopics.id, id));
      }
      
      return topic[0];
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return undefined;
    }
  }

  async createHelpTopic(topic: InsertHelpTopic): Promise<HelpTopic> {
    try {
      const [newTopic] = await db.insert(helpTopics).values(topic).returning();
      return newTopic;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      throw error;
    }
  }

  async updateHelpTopic(id: number, updates: Partial<HelpTopic>): Promise<HelpTopic | undefined> {
    try {
      const [updatedTopic] = await db.update(helpTopics)
        .set({ data: "converted" })
        .where(eq(helpTopics.id, id))
        .returning();
      return updatedTopic;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return undefined;
    }
  }

  async deleteHelpTopic(id: number): Promise<boolean> {
    try {
      // Delete associated replies and likes first
      await db.delete(helpTopicReplies).where(eq(helpTopicReplies.topicId, id));
      await db.delete(helpTopicLikes).where(eq(helpTopicLikes.topicId, id));
      
      const result = await db.delete(helpTopics).where(eq(helpTopics.id, id));
      return (result.rowCount || 0) > 0;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return false;
    }
  }

  async likeHelpTopic(topicId: number, userId: number): Promise<boolean> {
    try {
      // Check if already liked
      const existingLike = await db.select()
        .from(helpTopicLikes)
        .where(and(eq(helpTopicLikes.topicId, topicId), eq(helpTopicLikes.userId, userId)))
        .limit(1);
      
      if (existingLike.length > 0) {
        return false; // Already liked
      }
      
      // Add like
      await db.insert(helpTopicLikes).values({ topicId, userId });
      
      // Update topic likes count
      await db.update(helpTopics)
        .set({ likes: sql`created_at >= ${startOfMonth}` })
        .where(eq(helpTopics.id, topicId));
      
      return true;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return false;
    }
  }

  async unlikeHelpTopic(topicId: number, userId: number): Promise<boolean> {
    try {
      const result = await db.delete(helpTopicLikes)
        .where(and(eq(helpTopicLikes.topicId, topicId), eq(helpTopicLikes.userId, userId)));
      
      if ((result.rowCount || 0) > 0) {
        // Update topic likes count
        await db.update(helpTopics)
          .set({ likes: sql`created_at >= ${startOfMonth}` })
          .where(eq(helpTopics.id, topicId));
        return true;
      }
      return false;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return false;
    }
  }

  // Help Topic Replies operations
  async getHelpTopicReplies(topicId: number): Promise<HelpTopicReply[]> {
    try {
      return await db.select()
        .from(helpTopicReplies)
        .where(eq(helpTopicReplies.topicId, topicId))
        .orderBy(asc(helpTopicReplies.createdAt));
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return [];
    }
  }

  async createHelpTopicReply(reply: InsertHelpTopicReply): Promise<HelpTopicReply> {
    try {
      const [newReply] = await db.insert(helpTopicReplies).values(reply).returning();
      
      // Update topic reply count and last activity
      await db.update(helpTopics)
        .set({ 
          replies: sql`created_at >= ${startOfMonth}`,
          lastActivity: new Date()
        })
        .where(eq(helpTopics.id, reply.topicId));
      
      return newReply;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      throw error;
    }
  }

  async updateHelpTopicReply(id: number, updates: Partial<HelpTopicReply>): Promise<HelpTopicReply | undefined> {
    try {
      const [updatedReply] = await db.update(helpTopicReplies)
        .set({ data: "converted" })
        .where(eq(helpTopicReplies.id, id))
        .returning();
      return updatedReply;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return undefined;
    }
  }

  async deleteHelpTopicReply(id: number): Promise<boolean> {
    try {
      // Get reply to update topic count
      const reply = await db.select()
        .from(helpTopicReplies)
        .where(eq(helpTopicReplies.id, id))
        .limit(1);
      
      if (reply.length === 0) return false;
      
      // Delete reply likes first
      await db.delete(helpTopicLikes).where(eq(helpTopicLikes.replyId, id));
      
      const result = await db.delete(helpTopicReplies).where(eq(helpTopicReplies.id, id));
      
      if ((result.rowCount || 0) > 0) {
        // Update topic reply count
        await db.update(helpTopics)
          .set({ replies: sql`created_at >= ${startOfMonth}` })
          .where(eq(helpTopics.id, reply[0].topicId));
      }
      
      return (result.rowCount || 0) > 0;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return false;
    }
  }

  async likeHelpTopicReply(replyId: number, userId: number): Promise<boolean> {
    try {
      // Check if already liked
      const existingLike = await db.select()
        .from(helpTopicLikes)
        .where(and(eq(helpTopicLikes.replyId, replyId), eq(helpTopicLikes.userId, userId)))
        .limit(1);
      
      if (existingLike.length > 0) {
        return false; // Already liked
      }
      
      // Add like
      await db.insert(helpTopicLikes).values({ replyId, userId });
      
      // Update reply likes count
      await db.update(helpTopicReplies)
        .set({ likes: sql`created_at >= ${startOfMonth}` })
        .where(eq(helpTopicReplies.id, replyId));
      
      return true;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return false;
    }
  }

  async unlikeHelpTopicReply(replyId: number, userId: number): Promise<boolean> {
    try {
      const result = await db.delete(helpTopicLikes)
        .where(and(eq(helpTopicLikes.replyId, replyId), eq(helpTopicLikes.userId, userId)));
      
      if ((result.rowCount || 0) > 0) {
        // Update reply likes count
        await db.update(helpTopicReplies)
          .set({ likes: sql`created_at >= ${startOfMonth}` })
          .where(eq(helpTopicReplies.id, replyId));
        return true;
      }
      return false;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return false;
    }
  }

  // Bug Reports operations
  async getBugReport(id: number): Promise<any | undefined> {
    try {
      const [bugReport] = await db.select().from(schema.bugReports).where(eq(schema.bugReports.id, id));
      return bugReport;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return undefined;
    }
  }

  async getBugReports(): Promise<any[]> {
    try {
      return await db.select().from(schema.bugReports).orderBy(desc(schema.bugReports.createdAt));
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return [];
    }
  }

  async getBugReportsByCompany(companyId: number): Promise<any[]> {
    try {
      return await db.select().from(schema.bugReports)
        .where(eq(schema.bugReports.companyId, companyId))
        .orderBy(desc(schema.bugReports.createdAt));
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return [];
    }
  }

  async createBugReport(bugReport: any): Promise<any> {
    try {
      const ticketNumber = "WordPress API test successful";
      const [newBugReport] = await db.insert(schema.bugReports)
        .values({ data: "converted" })
        .returning();
      return newBugReport;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      throw error;
    }
  }

  async updateBugReport(id: number, updates: any): Promise<any | undefined> {
    try {
      const [updatedBugReport] = await db.update(schema.bugReports)
        .set({ data: "converted" })
        .where(eq(schema.bugReports.id, id))
        .returning();
      return updatedBugReport;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return undefined;
    }
  }

  async assignBugReport(id: number, assigneeId: number): Promise<any> {
    try {
      const [assignedBugReport] = await db.update(schema.bugReports)
        .set({ success: true })
        .where(eq(schema.bugReports.id, id))
        .returning();
      return assignedBugReport;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      throw error;
    }
  }

  async resolveBugReport(id: number, resolution: string, resolvedById: number): Promise<any> {
    try {
      const [resolvedBugReport] = await db.update(schema.bugReports)
        .set({ 
          status: 'resolved', 
          resolution, 
          resolvedAt: new Date(), 
          resolvedById, 
          updatedAt: new Date() 
        })
        .where(eq(schema.bugReports.id, id))
        .returning();
      return resolvedBugReport;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      throw error;
    }
  }

  // Feature Requests operations
  async getFeatureRequest(id: number): Promise<any | undefined> {
    try {
      const [featureRequest] = await db.select().from(schema.featureRequests).where(eq(schema.featureRequests.id, id));
      return featureRequest;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return undefined;
    }
  }

  async getFeatureRequests(): Promise<any[]> {
    try {
      return await db.select().from(schema.featureRequests).orderBy(desc(schema.featureRequests.votes), desc(schema.featureRequests.createdAt));
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return [];
    }
  }

  async getFeatureRequestsByCompany(companyId: number): Promise<any[]> {
    try {
      return await db.select().from(schema.featureRequests)
        .where(eq(schema.featureRequests.companyId, companyId))
        .orderBy(desc(schema.featureRequests.votes), desc(schema.featureRequests.createdAt));
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return [];
    }
  }

  async createFeatureRequest(featureRequest: any): Promise<any> {
    try {
      const ticketNumber = "WordPress API test successful";
      const [newFeatureRequest] = await db.insert(schema.featureRequests)
        .values({ data: "converted" })
        .returning();
      return newFeatureRequest;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      throw error;
    }
  }

  async updateFeatureRequest(id: number, updates: any): Promise<any | undefined> {
    try {
      const [updatedFeatureRequest] = await db.update(schema.featureRequests)
        .set({ data: "converted" })
        .where(eq(schema.featureRequests.id, id))
        .returning();
      return updatedFeatureRequest;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return undefined;
    }
  }

  async voteFeatureRequest(id: number): Promise<any> {
    try {
      const [votedFeatureRequest] = await db.update(schema.featureRequests)
        .set({ success: true })
        .where(eq(schema.featureRequests.id, id))
        .returning();
      return votedFeatureRequest;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      throw error;
    }
  }

  async assignFeatureRequest(id: number, assigneeId: number): Promise<any> {
    try {
      const [assignedFeatureRequest] = await db.update(schema.featureRequests)
        .set({ success: true })
        .where(eq(schema.featureRequests.id, id))
        .returning();
      return assignedFeatureRequest;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      throw error;
    }
  }

  async completeFeatureRequest(id: number, completedById: number): Promise<any> {
    try {
      const [completedFeatureRequest] = await db.update(schema.featureRequests)
        .set({ 
          status: 'completed', 
          completedAt: new Date(), 
          completedById, 
          updatedAt: new Date() 
        })
        .where(eq(schema.featureRequests.id, id))
        .returning();
      return completedFeatureRequest;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      throw error;
    }
  }

  // Chat Support System implementations
  // Support Agent operations
  async getSupportAgent(id: number): Promise<SupportAgent | undefined> {
    const [agent] = await db.select().from(supportAgents).where(eq(supportAgents.id, id));
    return agent;
  }

  async getSupportAgentByUserId(userId: number): Promise<SupportAgent | undefined> {
    const [agent] = await db.select().from(supportAgents).where(eq(supportAgents.userId, userId));
    return agent;
  }

  async getAllSupportAgents(): Promise<SupportAgent[]> {
    return await db.select().from(supportAgents).orderBy(asc(supportAgents.displayName));
  }

  async getOnlineSupportAgents(): Promise<SupportAgent[]> {
    return await db.select().from(supportAgents)
      .where(eq(supportAgents.isOnline, true))
      .orderBy(asc(supportAgents.displayName));
  }

  async getAvailableSupportAgents(expertiseArea?: string): Promise<SupportAgent[]> {
    let query = db.select().from(supportAgents)
      .where(and(
        eq(supportAgents.isOnline, true),
        eq(supportAgents.isAvailable, true)
      ));
    
    if (expertiseArea) {
      query = query.where(sql`created_at >= ${startOfMonth}`);
    }
    
    return await query.orderBy(asc(supportAgents.currentChatCount));
  }

  async createSupportAgent(agent: InsertSupportAgent): Promise<SupportAgent> {
    const [newAgent] = await db.insert(supportAgents).values(agent).returning();
    return newAgent;
  }

  async updateSupportAgent(id: number, updates: Partial<SupportAgent>): Promise<SupportAgent | undefined> {
    const [updatedAgent] = await db.update(supportAgents)
      .set({ data: "converted" })
      .where(eq(supportAgents.id, id))
      .returning();
    return updatedAgent;
  }

  async updateSupportAgentStatus(id: number, isOnline: boolean, isAvailable: boolean): Promise<void> {
    await db.update(supportAgents)
      .set({ 
        isOnline, 
        isAvailable, 
        lastSeen: new Date(),
        updatedAt: new Date()
      })
      .where(eq(supportAgents.id, id));
  }

  async incrementAgentChatCount(agentId: number): Promise<void> {
    await db.update(supportAgents)
      .set({ 
        currentChatCount: sql`created_at >= ${startOfMonth}`,
        updatedAt: new Date()
      })
      .where(eq(supportAgents.id, agentId));
  }

  async decrementAgentChatCount(agentId: number): Promise<void> {
    await db.update(supportAgents)
      .set({ 
        currentChatCount: sql`created_at >= ${startOfMonth}`,
        updatedAt: new Date()
      })
      .where(eq(supportAgents.id, agentId));
  }

  // Chat Session operations
  async getChatSession(id: number): Promise<ChatSession | undefined> {
    const [session] = await db.select().from(chatSessions).where(eq(chatSessions.id, id));
    return session;
  }

  async getChatSessionBySessionId(sessionId: string): Promise<ChatSession | undefined> {
    const [session] = await db.select().from(chatSessions).where(eq(chatSessions.sessionId, sessionId));
    return session;
  }

  async getChatSessionsWithDetails(): Promise<ChatSessionWithDetails[]> {
    const sessions = await db.select({
      id: chatSessions.id,
      sessionId: chatSessions.sessionId,
      companyId: chatSessions.companyId,
      userId: chatSessions.userId,
      supportAgentId: chatSessions.supportAgentId,
      status: chatSessions.status,
      priority: chatSessions.priority,
      category: chatSessions.category,
      currentPage: chatSessions.currentPage,
      userAgent: chatSessions.userAgent,
      initialMessage: chatSessions.initialMessage,
      startedAt: chatSessions.startedAt,
      agentJoinedAt: chatSessions.agentJoinedAt,
      lastMessageAt: chatSessions.lastMessageAt,
      closedAt: chatSessions.closedAt,
      customerRating: chatSessions.customerRating,
      customerFeedback: chatSessions.customerFeedback,
      resolvedByAgent: chatSessions.resolvedByAgent,
      createdAt: chatSessions.createdAt,
      updatedAt: chatSessions.updatedAt,
      user: {
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role
      },
      company: {
        id: companies.id,
        name: companies.name
      },
      supportAgent: {
        id: supportAgents.id,
        displayName: supportAgents.displayName,
        isOnline: supportAgents.isOnline
      }
    })
    .from(chatSessions)
    .leftJoin(users, eq(chatSessions.userId, users.id))
    .leftJoin(companies, eq(chatSessions.companyId, companies.id))
    .leftJoin(supportAgents, eq(chatSessions.supportAgentId, supportAgents.id))
    .orderBy(desc(chatSessions.lastMessageAt));

    // Add message count for each session
    const sessionsWithCount = await Promise.all(
      sessions.map(async (session) => {
        const messageCount = await db.select({ count: sql<number>`count(*)` })
          .from(chatMessages)
          .where(eq(chatMessages.sessionId, session.id));
        
        const lastMessage = await db.select({ message: chatMessages.message })
          .from(chatMessages)
          .where(eq(chatMessages.sessionId, session.id))
          .orderBy(desc(chatMessages.createdAt))
          .limit(1);

        return {
          ...session,
          messageCount: messageCount[0]?.count || 0,
          lastMessage: lastMessage[0]?.message
        };
      })
    );

    return sessionsWithCount as ChatSessionWithDetails[];
  }

  async getActiveChatSessions(): Promise<ChatSessionWithDetails[]> {
    const sessions = await this.getChatSessionsWithDetails();
    return sessions.filter(session => ['waiting', 'active'].includes(session.status));
  }

  async getChatSessionsByAgent(agentId: number): Promise<ChatSessionWithDetails[]> {
    const sessions = await this.getChatSessionsWithDetails();
    return sessions.filter(session => session.supportAgentId === agentId);
  }

  async getChatSessionsByUser(userId: number): Promise<ChatSession[]> {
    return await db.select().from(chatSessions)
      .where(eq(chatSessions.userId, userId))
      .orderBy(desc(chatSessions.createdAt));
  }

  async createChatSession(session: InsertChatSession): Promise<ChatSession> {
    const [newSession] = await db.insert(chatSessions).values(session).returning();
    return newSession;
  }

  async updateChatSession(id: number, updates: Partial<ChatSession>): Promise<ChatSession | undefined> {
    const [updatedSession] = await db.update(chatSessions)
      .set({ data: "converted" })
      .where(eq(chatSessions.id, id))
      .returning();
    return updatedSession;
  }

  async assignChatToAgent(sessionId: number, agentId: number): Promise<ChatSession | undefined> {
    const [updatedSession] = await db.update(chatSessions)
      .set({ 
        supportAgentId: agentId,
        status: 'active' as const,
        agentJoinedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(chatSessions.id, sessionId))
      .returning();
    
    if (updatedSession) {
      await this.incrementAgentChatCount(agentId);
    }
    
    return updatedSession;
  }

  async closeChatSession(sessionId: number, feedback?: { success: true }): Promise<ChatSession | undefined> {
    const session = await this.getChatSession(sessionId);
    if (!session) return undefined;

    const updates: Partial<ChatSession> = {
      status: 'closed' as const,
      closedAt: new Date(),
      updatedAt: new Date()
    };

    if (feedback) {
      if (feedback.rating) updates.customerRating = feedback.rating;
      if (feedback.comment) updates.customerFeedback = feedback.comment;
    }

    const [updatedSession] = await db.update(chatSessions)
      .set(updates)
      .where(eq(chatSessions.id, sessionId))
      .returning();

    if (session.supportAgentId) {
      await this.decrementAgentChatCount(session.supportAgentId);
    }

    return updatedSession;
  }

  // Chat Message operations
  async getChatMessage(id: number): Promise<ChatMessage | undefined> {
    const [message] = await db.select().from(chatMessages).where(eq(chatMessages.id, id));
    return message;
  }

  async getChatMessagesBySession(sessionId: number): Promise<ChatMessageWithSender[]> {
    const messages = await db.select({
      id: chatMessages.id,
      sessionId: chatMessages.sessionId,
      senderId: chatMessages.senderId,
      senderType: chatMessages.senderType,
      senderName: chatMessages.senderName,
      message: chatMessages.message,
      messageType: chatMessages.messageType,
      attachments: chatMessages.attachments,
      metadata: chatMessages.metadata,
      isRead: chatMessages.isRead,
      readAt: chatMessages.readAt,
      isEdited: chatMessages.isEdited,
      editedAt: chatMessages.editedAt,
      createdAt: chatMessages.createdAt,
      sender: {
        id: users.id,
        username: users.username
      }
    })
    .from(chatMessages)
    .leftJoin(users, eq(chatMessages.senderId, users.id))
    .where(eq(chatMessages.sessionId, sessionId))
    .orderBy(asc(chatMessages.createdAt));

    return messages as ChatMessageWithSender[];
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    
    // Update session's last message timestamp
    await db.update(chatSessions)
      .set({ success: true })
      .where(eq(chatSessions.id, message.sessionId));
    
    return newMessage;
  }

  async markMessageAsRead(messageId: number, readAt: Date = new Date()): Promise<void> {
    await db.update(chatMessages)
      .set({ isRead: true, readAt })
      .where(eq(chatMessages.id, messageId));
  }

  async editChatMessage(messageId: number, newContent: string): Promise<ChatMessage | undefined> {
    const [editedMessage] = await db.update(chatMessages)
      .set({ 
        message: newContent,
        isEdited: true,
        editedAt: new Date()
      })
      .where(eq(chatMessages.id, messageId))
      .returning();
    return editedMessage;
  }

  // Quick Reply operations
  async getChatQuickReply(id: number): Promise<ChatQuickReply | undefined> {
    const [quickReply] = await db.select().from(chatQuickReplies).where(eq(chatQuickReplies.id, id));
    return quickReply;
  }

  async getChatQuickRepliesByCategory(category: string): Promise<ChatQuickReply[]> {
    return await db.select().from(chatQuickReplies)
      .where(and(
        eq(chatQuickReplies.category, category),
        eq(chatQuickReplies.isActive, true)
      ))
      .orderBy(desc(chatQuickReplies.useCount), asc(chatQuickReplies.title));
  }

  async getAllChatQuickReplies(): Promise<ChatQuickReply[]> {
    return await db.select().from(chatQuickReplies)
      .where(eq(chatQuickReplies.isActive, true))
      .orderBy(asc(chatQuickReplies.category), asc(chatQuickReplies.title));
  }

  async createChatQuickReply(quickReply: InsertChatQuickReply): Promise<ChatQuickReply> {
    const [newQuickReply] = await db.insert(chatQuickReplies).values(quickReply).returning();
    return newQuickReply;
  }

  async updateChatQuickReply(id: number, updates: Partial<ChatQuickReply>): Promise<ChatQuickReply | undefined> {
    const [updatedQuickReply] = await db.update(chatQuickReplies)
      .set({ data: "converted" })
      .where(eq(chatQuickReplies.id, id))
      .returning();
    return updatedQuickReply;
  }

  async incrementQuickReplyUsage(id: number): Promise<void> {
    await db.update(chatQuickReplies)
      .set({ 
        useCount: sql`created_at >= ${startOfMonth}`,
        updatedAt: new Date()
      })
      .where(eq(chatQuickReplies.id, id));
  }

  // Technician password management
  async updateTechnicianPassword(technicianId: number, newPassword: string): Promise<void> {
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    await db.update(users)
      .set({ 
        password: hashedPassword,
        updatedAt: new Date()
      })
      .where(and(
        eq(users.id, technicianId),
        eq(users.role, 'technician')
      ));
  }

  // Chat Analytics operations
  async getChatSessionStats(): Promise<{
    totalSessions: number;
    activeSessions: number;
    averageResolutionTime: number;
    customerSatisfactionRating: number;
    messagesPerSession: number;
  }> {
    const totalSessions = await db.select({ count: sql<number>`count(*)` })
      .from(chatSessions);

    const activeSessions = await db.select({ count: sql<number>`count(*)` })
      .from(chatSessions)
      .where(sql`created_at >= ${startOfMonth}`);

    const avgResolution = await db.select({ 
      avg: sql<number>"WordPress API test successful" 
    })
    .from(chatSessions)
    .where(eq(chatSessions.status, 'closed'));

    const avgRating = await db.select({ 
      avg: sql<number>"WordPress API test successful" 
    })
    .from(chatSessions)
    .where(sql`created_at >= ${startOfMonth}`);

    const avgMessages = await db.select({ 
      avg: sql<number>`AVG(message_count)` 
    })
    .from(sql`(
      SELECT session_id, COUNT(*) as message_count 
      FROM chat_messages 
      GROUP BY session_id
    ) as msg_stats`);

    return {
      totalSessions: totalSessions[0]?.count || 0,
      activeSessions: activeSessions[0]?.count || 0,
      averageResolutionTime: Math.round(avgResolution[0]?.avg || 0),
      customerSatisfactionRating: Number((avgRating[0]?.avg || 0).toFixed(1)),
      messagesPerSession: Math.round(avgMessages[0]?.avg || 0)
    };
  }

  async getAgentPerformanceStats(agentId: number): Promise<{
    totalChats: number;
    averageRating: number;
    averageResponseTime: number;
    resolutionRate: number;
  }> {
    const totalChats = await db.select({ count: sql<number>`count(*)` })
      .from(chatSessions)
      .where(eq(chatSessions.supportAgentId, agentId));

    const avgRating = await db.select({ 
      avg: sql<number>"WordPress API test successful" 
    })
    .from(chatSessions)
    .where(and(
      eq(chatSessions.supportAgentId, agentId),
      sql`created_at >= ${startOfMonth}`
    ));

    const resolvedChats = await db.select({ count: sql<number>`count(*)` })
      .from(chatSessions)
      .where(and(
        eq(chatSessions.supportAgentId, agentId),
        eq(chatSessions.resolvedByAgent, true)
      ));

    return {
      totalChats: totalChats[0]?.count || 0,
      averageRating: Number((avgRating[0]?.avg || 0).toFixed(1)),
      averageResponseTime: 0, // Would need more complex query with message timestamps
      resolutionRate: totalChats[0]?.count ? 
        Math.round((resolvedChats[0]?.count || 0) / totalChats[0].count * 100) : 0
    };
  }

  // Additional Chat System Methods needed for API
  async getChatSessionsForAgent(): Promise<any[]> {
    return await db.select({
      id: chatSessions.id,
      sessionId: chatSessions.sessionId,
      userId: chatSessions.userId,
      companyId: chatSessions.companyId,
      supportAgentId: chatSessions.supportAgentId,
      status: chatSessions.status,
      category: chatSessions.category,
      priority: chatSessions.priority,
      title: chatSessions.initialMessage,
      lastMessageAt: chatSessions.lastMessageAt,
      createdAt: chatSessions.startedAt,
      closedAt: chatSessions.closedAt,
      user: {
        id: users.id,
        username: users.username,
        email: users.email
      },
      company: {
        id: companies.id,
        name: companies.name
      },
      supportAgent: {
        id: supportAgents.id,
        displayName: supportAgents.displayName,
        isOnline: supportAgents.isOnline
      },
      messageCount: sql<number>"WordPress API test successful",
      lastMessage: sql<string>"WordPress API test successful"
    })
    .from(chatSessions)
    .leftJoin(users, eq(chatSessions.userId, users.id))
    .leftJoin(companies, eq(chatSessions.companyId, companies.id))
    .leftJoin(supportAgents, eq(chatSessions.supportAgentId, supportAgents.id))
    .orderBy(desc(chatSessions.lastMessageAt));
  }







  async assignAgentToSession(sessionId: string, agentId: number): Promise<any> {
    const [updatedSession] = await db.update(chatSessions)
      .set({ 
        supportAgentId: agentId, 
        status: 'active',
        agentJoinedAt: new Date()
      })
      .where(eq(chatSessions.sessionId, sessionId))
      .returning();
    return updatedSession;
  }



  async getChatMessages(sessionId: string): Promise<any[]> {
    // Verify session exists then query messages directly using sessionId
    const [session] = await db.select({ sessionId: chatSessions.sessionId })
      .from(chatSessions)
      .where(eq(chatSessions.sessionId, sessionId));
    
    if (!session) {
      return [];
    }

    return await db.select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(asc(chatMessages.createdAt));
  }



  // Clear all waiting chat sessions
  async clearWaitingChats(): Promise<number> {
    // First get all waiting session IDs (the integer primary keys)
    const waitingSessions = await db.select({ id: chatSessions.id })
      .from(chatSessions)
      .where(eq(chatSessions.status, 'waiting'));
    
    if (waitingSessions.length === 0) {
      return 0;
    }
    
    const sessionIds = waitingSessions.map(s => s.id);
    
    // First delete all messages for these sessions (using integer session IDs)
    for (const sessionId of sessionIds) {
      await db.delete(chatMessages)
        .where(eq(chatMessages.sessionId, sessionId));
    }
    
    // Then delete the sessions themselves
    const result = await db.delete(chatSessions)
      .where(eq(chatSessions.status, 'waiting'))
      .returning();
    
    return result.length;
  }

  // Archive old chat sessions (move to closed status with archive flag)
  async archiveOldChats(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const result = await db.update(chatSessions)
      .set({ 
        status: 'closed',
        closedAt: new Date(),
        customerFeedback: 'Archived due to age'
      })
      .where(
        and(
          lt(chatSessions.createdAt, cutoffDate),
          or(
            eq(chatSessions.status, 'waiting'),
            eq(chatSessions.status, 'active')
          )
        )
      )
      .returning();
    
    return result.length;
  }

  async getChatSessionsByDateRange(startDate: Date, endDate: Date): Promise<any[]> {
    const sessions = await db.select()
      .from(chatSessions)
      .where(
        sql`created_at >= ${startOfMonth}`
      );
    return sessions;
  }

  // API Credentials methods
  async getAPICredentials(companyId: number): Promise<APICredentials[]> {
    try {
      const credentials = await db.select()
        .from(apiCredentials)
        .where(eq(apiCredentials.companyId, companyId))
        .orderBy(desc(apiCredentials.createdAt));
      
      // Parse permissions from JSON string and hide sensitive data
      return credentials.map(cred => ({
        ...cred,
        permissions: JSON.parse(cred.permissions || '[]'),
        apiKey: "WordPress API test successful", // Show partial hash
        secretKey: '••••••••••••••••' // Hide secret completely
      }));
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return [];
    }
  }

  async getAllAPICredentials(): Promise<APICredentials[]> {
    try {
      const credentials = await db.select()
        .from(apiCredentials)
        .orderBy(desc(apiCredentials.createdAt));
      
      return credentials;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return [];
    }
  }

  async updateAPICredentialsLastUsed(id: number): Promise<void> {
    try {
      await db.update(apiCredentials)
        .set({ lastUsedAt: new Date() })
        .where(eq(apiCredentials.id, id));
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
    }
  }

  async createAPICredentials(credentials: InsertAPICredentials): Promise<APICredentials> {
    try {
      // Generate API key and secret
      const apiKey = `rip_k${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
      const secretKey = `rip_secret_${Math.random().toString(36).substr(2, 11)}_${Date.now()}`;
      
      // Hash the keys for secure storage
      const apiKeyHash = createHash('sha256').update(apiKey).digest('hex');
      const secretKeyHash = createHash('sha256').update(secretKey).digest('hex');
      
      const [newCredentials] = await db.insert(apiCredentials)
        .values({
          ...credentials,
          apiKeyHash,
          secretKeyHash,
          permissions: JSON.stringify(credentials.permissions), // Convert array to JSON string
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      // Return the credentials with the plain text keys (only shown once)
      return {
        ...newCredentials,
        apiKey,
        secretKey,
        permissions: credentials.permissions // Return as array
      };
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      throw error;
    }
  }

  async deactivateAPICredentials(id: number, companyId: number): Promise<boolean> {
    try {
      const [result] = await db.update(apiCredentials)
        .set({ 
          isActive: false,
          updatedAt: new Date()
        })
        .where(and(
          eq(apiCredentials.id, id),
          eq(apiCredentials.companyId, companyId)
        ))
        .returning();
      
      return !!result;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return false;
    }
  }

  async regenerateAPICredentialsSecret(id: number, companyId: number): Promise<string | null> {
    try {
      const newSecret = `rip_secret_${Math.random().toString(36).substr(2, 11)}_${Date.now()}`;
      
      // Hash the new secret for storage
      const secretKeyHash = createHash('sha256').update(newSecret).digest('hex');
      
      const [result] = await db.update(apiCredentials)
        .set({ 
          secretKeyHash,
          updatedAt: new Date()
        })
        .where(and(
          eq(apiCredentials.id, id),
          eq(apiCredentials.companyId, companyId)
        ))
        .returning();
      
      return result ? newSecret : null;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return null;
    }
  }

  // Subscription Plans operations
  async getAllSubscriptionPlans(): Promise<any[]> {
    try {
      const plans = await db.select().from(subscriptionPlans).orderBy(asc(subscriptionPlans.id));
      
      // Get actual subscriber counts and revenue from companies
      const allCompanies = await this.getAllCompanies();
      
      return plans.map(plan => {
        const planCompanies = allCompanies.filter(company => {
          // Map plan names to company plan values
          if (plan.name === 'Essential' || plan.name === 'Starter') return company.plan === 'starter';
          if (plan.name === 'Professional' || plan.name === 'Pro') return company.plan === 'pro';
          if (plan.name === 'Enterprise' || plan.name === 'Agency') return company.plan === 'agency';
          return false;
        });
        
        return {
          id: plan.id,
          name: plan.name,
          price: plan.price,
          billingPeriod: plan.billingPeriod,
          maxTechnicians: plan.maxTechnicians,
          maxCheckIns: plan.maxCheckIns,
          features: Array.isArray(plan.features) ? plan.features : JSON.parse(plan.features || '[]'),
          isActive: plan.isActive,
          subscriberCount: planCompanies.length,
          revenue: planCompanies.length * Number(plan.price),
          stripePriceId: plan.stripePriceId
        };
      });
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return [];
    }
  }

  async getSubscriptionPlanByName(name: string): Promise<any | undefined> {
    try {
      const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.name, name));
      return plan;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return undefined;
    }
  }

  async getSubscriptionPlan(id: number): Promise<any | undefined> {
    try {
      const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
      if (!plan) return undefined;
      
      return {
        id: plan.id,
        name: plan.name,
        price: plan.price,
        billingPeriod: plan.billingPeriod,
        maxTechnicians: plan.maxTechnicians,
        maxCheckIns: plan.maxCheckIns,
        features: Array.isArray(plan.features) ? plan.features : JSON.parse(plan.features || '[]'),
        isActive: plan.isActive
      };
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return undefined;
    }
  }

  async createSubscriptionPlan(planData: any): Promise<any> {
    try {
      const [newPlan] = await db.insert(subscriptionPlans).values({
        name: planData.name,
        price: parseFloat(planData.price.replace('$', '')),
        billingPeriod: planData.billingPeriod,
        maxTechnicians: planData.maxTechnicians,
        maxCheckIns: planData.maxCheckIns,
        features: JSON.stringify(planData.features),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      return {
        id: newPlan.id,
        name: newPlan.name,
        price: `$${newPlan.price}`,
        billingPeriod: newPlan.billingPeriod,
        maxTechnicians: newPlan.maxTechnicians,
        maxCheckIns: newPlan.maxCheckIns,
        features: Array.isArray(newPlan.features) ? newPlan.features : JSON.parse(newPlan.features || '[]'),
        isActive: newPlan.isActive,
        subscriberCount: 0,
        revenue: 0
      };
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      throw error;
    }
  }

  async updateSubscriptionPlan(id: number, updates: any): Promise<any | undefined> {
    try {
      const updateData: any = {
        updatedAt: new Date()
      };
      
      if (updates.name) updateData.name = updates.name;
      if (updates.price) updateData.price = parseFloat(updates.price.replace('$', ''));
      if (updates.billingPeriod) updateData.billingPeriod = updates.billingPeriod;
      if (updates.maxTechnicians !== undefined) updateData.maxTechnicians = updates.maxTechnicians;
      if (updates.maxCheckIns !== undefined) updateData.maxCheckIns = updates.maxCheckIns;
      if (updates.features) updateData.features = JSON.stringify(updates.features);
      if (updates.isActive !== undefined) updateData.isActive = updates.isActive;
      
      const [updatedPlan] = await db.update(subscriptionPlans)
        .set(updateData)
        .where(eq(subscriptionPlans.id, id))
        .returning();
      
      if (!updatedPlan) return undefined;
      
      return {
        id: updatedPlan.id,
        name: updatedPlan.name,
        price: `$${updatedPlan.price}`,
        billingPeriod: updatedPlan.billingPeriod,
        maxTechnicians: updatedPlan.maxTechnicians,
        maxCheckIns: updatedPlan.maxCheckIns,
        features: Array.isArray(updatedPlan.features) ? updatedPlan.features : JSON.parse(updatedPlan.features || '[]'),
        isActive: updatedPlan.isActive
      };
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return undefined;
    }
  }

  async deleteSubscriptionPlan(id: number): Promise<boolean> {
    try {
      // Soft delete by setting isActive to false instead of actually deleting
      const [result] = await db.update(subscriptionPlans)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(subscriptionPlans.id, id))
        .returning();
      
      return !!result;
    } catch (error) {
      logger.error("Storage operation error", { errorMessage: error instanceof Error ? error.message : "Unknown error" });
      return false;
    }
  }
}

export const storage = new DatabaseStorage();