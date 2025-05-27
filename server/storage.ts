import { 
  User, InsertUser, Company, InsertCompany, Technician, InsertTechnician, 
  CheckIn, InsertCheckIn, BlogPost, InsertBlogPost, ReviewRequest, InsertReviewRequest,
  ReviewResponse, InsertReviewResponse, CheckInWithTechnician, TechnicianWithStats,
  ReviewFollowUpSettings, InsertReviewFollowUpSettings, ReviewRequestStatus, InsertReviewRequestStatus,
  WordpressCustomFields, InsertWordpressCustomFields, AiUsageTracking, InsertAiUsageTracking,
  MonthlyAiUsage, InsertMonthlyAiUsage, APICredentials, InsertAPICredentials
} from "@shared/schema";

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
  
  // Technician operations
  getTechnician(id: number): Promise<Technician | undefined>;
  getTechnicianByEmail(email: string): Promise<Technician | undefined>;
  getTechniciansByCompany(companyId: number): Promise<Technician[]>;
  getTechniciansWithStats(companyId: number): Promise<TechnicianWithStats[]>;
  createTechnician(technician: InsertTechnician): Promise<Technician>;
  updateTechnician(id: number, updates: Partial<Technician>): Promise<Technician | undefined>;
  deleteTechnician(id: number): Promise<boolean>;
  
  // Check-in operations
  getCheckIn(id: number): Promise<CheckIn | undefined>;
  getCheckInsByCompany(companyId: number, limit?: number): Promise<CheckInWithTechnician[]>;
  getCheckInsByTechnician(technicianId: number, limit?: number): Promise<CheckIn[]>;
  createCheckIn(checkIn: InsertCheckIn): Promise<CheckIn>;
  updateCheckIn(id: number, updates: Partial<CheckIn>): Promise<CheckIn | undefined>;
  deleteCheckIn(id: number): Promise<boolean>;
  
  // Blog post operations
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  getBlogPostsByCompany(companyId: number): Promise<BlogPost[]>;
  createBlogPost(blogPost: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, updates: Partial<BlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: number): Promise<boolean>;
  
  // Review request operations
  getReviewRequest(id: number): Promise<ReviewRequest | undefined>;
  getReviewRequestsByCompany(companyId: number): Promise<ReviewRequest[]>;
  getReviewRequestByToken(token: string): Promise<ReviewRequest | undefined>;
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
  
  // Review Automation operations
  getReviewFollowUpSettings(companyId: number): Promise<ReviewFollowUpSettings | null>;
  createReviewFollowUpSettings(settings: InsertReviewFollowUpSettings): Promise<ReviewFollowUpSettings>;
  updateReviewFollowUpSettings(id: number, updates: Partial<ReviewFollowUpSettings>): Promise<ReviewFollowUpSettings>;
  
  getReviewRequestStatusesByCompany(companyId: number): Promise<ReviewRequestStatus[]>;
  getReviewRequestStatusByRequestId(requestId: number): Promise<ReviewRequestStatus | null>;
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
  
  // AI Usage Tracking operations
  createAiUsageTracking(usage: InsertAiUsageTracking): Promise<AiUsageTracking>;
  getMonthlyAiUsage(companyId: number, year: number, month: number): Promise<MonthlyAiUsage | null>;
  getDailyAiUsage(companyId: number, date: Date): Promise<number>;
  updateMonthlyAiUsage(companyId: number, year: number, month: number, updates: {
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    [key: string]: number;
  }): Promise<void>;

  // API Credentials operations
  createAPICredentials(credentials: InsertAPICredentials): Promise<APICredentials>;
  getAPICredentialsByCompany(companyId: number): Promise<APICredentials[]>;
  getAPICredentialsByApiKey(apiKeyHash: string): Promise<APICredentials | null>;
  updateAPICredentialLastUsed(credentialId: number): Promise<void>;
  deactivateAPICredentials(credentialId: number, companyId: number): Promise<boolean>;
  updateAPICredentialSecret(credentialId: number, companyId: number, secretKeyHash: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private companies: Map<number, Company>;
  private technicians: Map<number, Technician>;
  private checkIns: Map<number, CheckIn>;
  private blogPosts: Map<number, BlogPost>;
  private reviewRequests: Map<number, ReviewRequest>;
  private reviewResponses: Map<number, ReviewResponse>;
  private reviewFollowUpSettings: Map<number, ReviewFollowUpSettings>;
  private reviewRequestStatuses: Map<number, ReviewRequestStatus>;
  private reviewRequestTokens: Map<string, number>; // Map token to requestId
  private passwordResetTokens: Map<string, { userId: number; expiry: Date }>; // Map token to user and expiry
  private wordpressCustomFields: Map<number, WordpressCustomFields>;
  private aiUsageTracking: Map<number, AiUsageTracking>;
  private monthlyAiUsage: Map<string, MonthlyAiUsage>;
  
  private userId: number;
  private companyId: number;
  private technicianId: number;
  private checkInId: number;
  private blogPostId: number;
  private reviewRequestId: number;
  private reviewResponseId: number;
  private reviewFollowUpSettingsId: number;
  private reviewRequestStatusId: number;
  
  private wordpressCustomFieldsId: number;
  
  constructor() {
    this.users = new Map();
    this.companies = new Map();
    this.technicians = new Map();
    this.checkIns = new Map();
    this.blogPosts = new Map();
    this.reviewRequests = new Map();
    this.reviewResponses = new Map();
    this.reviewFollowUpSettings = new Map();
    this.reviewRequestStatuses = new Map();
    this.reviewRequestTokens = new Map();
    this.passwordResetTokens = new Map();
    this.wordpressCustomFields = new Map();
    this.aiUsageTracking = new Map();
    this.monthlyAiUsage = new Map();
    
    this.userId = 1;
    this.companyId = 1;
    this.technicianId = 1;
    this.checkInId = 1;
    this.blogPostId = 1;
    this.reviewRequestId = 1;
    this.reviewResponseId = 1;
    this.reviewFollowUpSettingsId = 1;
    this.reviewRequestStatusId = 1;
    this.wordpressCustomFieldsId = 1;
    
    // Add a default super admin
    this.createUser({
      username: "admin",
      email: "admin@checkinpro.com",
      password: "$2b$10$WOcqvEQUqkgQozHp4OYV0eFNB3jA3S.NtT2tgN1b3JfNXBXs0VUZW", // "adminpassword" hashed
      role: "super_admin"
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async getUsersByCompanyAndRole(companyId: number, role: string): Promise<User[]> {
    return Array.from(this.users.values())
      .filter(user => user.companyId === companyId && user.role === role);
  }
  
  async getUsersByCompany(companyId: number): Promise<User[]> {
    return Array.from(this.users.values())
      .filter(user => user.companyId === companyId);
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const createdAt = new Date();
    const newUser: User = { ...user, id, createdAt };
    
    this.users.set(id, newUser);
    return newUser;
  }
  
  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUserStripeInfo(userId: number, stripeInfo: { customerId: string, subscriptionId: string }): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedUser = { 
      ...user, 
      stripeCustomerId: stripeInfo.customerId, 
      stripeSubscriptionId: stripeInfo.subscriptionId 
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  // Company operations
  async getCompany(id: number): Promise<Company | undefined> {
    return this.companies.get(id);
  }
  
  async getCompanyByName(name: string): Promise<Company | undefined> {
    return Array.from(this.companies.values()).find(company => company.name === name);
  }
  
  async getAllCompanies(): Promise<Company[]> {
    return Array.from(this.companies.values());
  }
  
  async createCompany(company: InsertCompany): Promise<Company> {
    const id = this.companyId++;
    const createdAt = new Date();
    const newCompany: Company = { ...company, id, createdAt };
    
    this.companies.set(id, newCompany);
    return newCompany;
  }
  
  async updateCompany(id: number, updates: Partial<Company>): Promise<Company | undefined> {
    const company = this.companies.get(id);
    if (!company) return undefined;
    
    const updatedCompany = { ...company, ...updates };
    this.companies.set(id, updatedCompany);
    return updatedCompany;
  }
  
  // Technician operations
  async getTechnician(id: number): Promise<Technician | undefined> {
    return this.technicians.get(id);
  }
  
  async getTechnicianByEmail(email: string): Promise<Technician | undefined> {
    return Array.from(this.technicians.values()).find(tech => tech.email === email);
  }
  
  async getTechniciansByCompany(companyId: number): Promise<Technician[]> {
    return Array.from(this.technicians.values()).filter(tech => tech.companyId === companyId);
  }
  
  async getTechniciansWithStats(companyId: number): Promise<TechnicianWithStats[]> {
    const technicians = await this.getTechniciansByCompany(companyId);
    
    return technicians.map(tech => {
      const techCheckIns = Array.from(this.checkIns.values()).filter(
        checkIn => checkIn.technicianId === tech.id
      );
      
      const techReviews = Array.from(this.reviewRequests.values()).filter(
        review => review.technicianId === tech.id
      );
      
      // Simulate rating based on number of reviews (in a real app this would come from customer ratings)
      const rating = techReviews.length > 0 
        ? 4.5 + (Math.random() * 0.5) // Random rating between 4.5 and 5.0
        : 0;
      
      return {
        ...tech,
        checkinsCount: techCheckIns.length,
        reviewsCount: techReviews.length,
        rating: rating
      };
    });
  }
  
  async createTechnician(technician: InsertTechnician): Promise<Technician> {
    const id = this.technicianId++;
    const createdAt = new Date();
    const newTechnician: Technician = { ...technician, id, createdAt };
    
    this.technicians.set(id, newTechnician);
    return newTechnician;
  }
  
  async updateTechnician(id: number, updates: Partial<Technician>): Promise<Technician | undefined> {
    const technician = this.technicians.get(id);
    if (!technician) return undefined;
    
    const updatedTechnician = { ...technician, ...updates };
    this.technicians.set(id, updatedTechnician);
    return updatedTechnician;
  }
  
  async deleteTechnician(id: number): Promise<boolean> {
    return this.technicians.delete(id);
  }
  
  // Check-in operations
  async getCheckIn(id: number): Promise<CheckIn | undefined> {
    return this.checkIns.get(id);
  }
  
  async getCheckInsByCompany(companyId: number, limit?: number): Promise<CheckInWithTechnician[]> {
    const companyCheckIns = Array.from(this.checkIns.values())
      .filter(checkIn => checkIn.companyId === companyId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    const result = await Promise.all(
      (limit ? companyCheckIns.slice(0, limit) : companyCheckIns).map(async checkIn => {
        const technician = await this.getTechnician(checkIn.technicianId);
        return {
          ...checkIn,
          technician: technician!
        };
      })
    );
    
    return result;
  }
  
  async getCheckInsByTechnician(technicianId: number, limit?: number): Promise<CheckIn[]> {
    const techCheckIns = Array.from(this.checkIns.values())
      .filter(checkIn => checkIn.technicianId === technicianId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return limit ? techCheckIns.slice(0, limit) : techCheckIns;
  }
  
  async createCheckIn(checkIn: InsertCheckIn): Promise<CheckIn> {
    const id = this.checkInId++;
    const createdAt = new Date();
    const newCheckIn: CheckIn = { ...checkIn, id, createdAt };
    
    this.checkIns.set(id, newCheckIn);
    return newCheckIn;
  }
  
  async updateCheckIn(id: number, updates: Partial<CheckIn>): Promise<CheckIn | undefined> {
    const checkIn = this.checkIns.get(id);
    if (!checkIn) return undefined;
    
    const updatedCheckIn = { ...checkIn, ...updates };
    this.checkIns.set(id, updatedCheckIn);
    return updatedCheckIn;
  }
  
  async deleteCheckIn(id: number): Promise<boolean> {
    return this.checkIns.delete(id);
  }
  
  // Blog post operations
  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    return this.blogPosts.get(id);
  }
  
  async getBlogPostsByCompany(companyId: number): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values())
      .filter(post => post.companyId === companyId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createBlogPost(blogPost: InsertBlogPost): Promise<BlogPost> {
    const id = this.blogPostId++;
    const createdAt = new Date();
    const newBlogPost: BlogPost = { ...blogPost, id, createdAt };
    
    this.blogPosts.set(id, newBlogPost);
    return newBlogPost;
  }
  
  async updateBlogPost(id: number, updates: Partial<BlogPost>): Promise<BlogPost | undefined> {
    const blogPost = this.blogPosts.get(id);
    if (!blogPost) return undefined;
    
    const updatedBlogPost = { ...blogPost, ...updates };
    this.blogPosts.set(id, updatedBlogPost);
    return updatedBlogPost;
  }
  
  async deleteBlogPost(id: number): Promise<boolean> {
    return this.blogPosts.delete(id);
  }
  
  // Review request operations
  async getReviewRequest(id: number): Promise<ReviewRequest | undefined> {
    return this.reviewRequests.get(id);
  }
  
  async getReviewRequestsByCompany(companyId: number): Promise<ReviewRequest[]> {
    return Array.from(this.reviewRequests.values())
      .filter(request => request.companyId === companyId)
      .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());
  }
  
  async createReviewRequest(reviewRequest: InsertReviewRequest): Promise<ReviewRequest> {
    const id = this.reviewRequestId++;
    const sentAt = new Date();
    const newReviewRequest: ReviewRequest = { ...reviewRequest, id, sentAt };
    
    this.reviewRequests.set(id, newReviewRequest);
    return newReviewRequest;
  }
  
  async updateReviewRequest(id: number, updates: Partial<ReviewRequest>): Promise<ReviewRequest | undefined> {
    const reviewRequest = this.reviewRequests.get(id);
    if (!reviewRequest) {
      return undefined;
    }
    
    const updatedReviewRequest = { ...reviewRequest, ...updates };
    this.reviewRequests.set(id, updatedReviewRequest);
    
    return updatedReviewRequest;
  }
  
  // Stats operations
  // Review response operations
  async getReviewResponse(id: number): Promise<ReviewResponse | undefined> {
    return this.reviewResponses.get(id);
  }

  async getReviewResponsesByCompany(companyId: number): Promise<ReviewResponse[]> {
    return Array.from(this.reviewResponses.values())
      .filter(response => response.companyId === companyId)
      .sort((a, b) => {
        // Sort by most recent respondedAt date
        if (a.respondedAt && b.respondedAt) {
          return b.respondedAt.getTime() - a.respondedAt.getTime();
        }
        return 0;
      });
  }

  async getReviewResponsesByTechnician(technicianId: number): Promise<ReviewResponse[]> {
    return Array.from(this.reviewResponses.values())
      .filter(response => response.technicianId === technicianId)
      .sort((a, b) => {
        // Sort by most recent respondedAt date
        if (a.respondedAt && b.respondedAt) {
          return b.respondedAt.getTime() - a.respondedAt.getTime();
        }
        return 0;
      });
  }

  async getReviewResponseForRequest(reviewRequestId: number): Promise<ReviewResponse | undefined> {
    const responses = Array.from(this.reviewResponses.values());
    return responses.find(response => response.reviewRequestId === reviewRequestId);
  }

  async createReviewResponse(reviewResponse: InsertReviewResponse): Promise<ReviewResponse> {
    const id = this.reviewResponseId++;
    const respondedAt = new Date();
    
    const newReviewResponse: ReviewResponse = { ...reviewResponse, id, respondedAt };
    this.reviewResponses.set(id, newReviewResponse);
    
    return newReviewResponse;
  }

  async updateReviewResponse(id: number, updates: Partial<ReviewResponse>): Promise<ReviewResponse | undefined> {
    const reviewResponse = this.reviewResponses.get(id);
    
    if (!reviewResponse) {
      return undefined;
    }
    
    const updatedResponse = { ...reviewResponse, ...updates };
    this.reviewResponses.set(id, updatedResponse);
    
    return updatedResponse;
  }

  async getReviewStats(companyId: number): Promise<{
    averageRating: number;
    totalResponses: number;
    ratingDistribution: { [key: number]: number };
  }> {
    const responses = await this.getReviewResponsesByCompany(companyId);
    
    if (responses.length === 0) {
      return {
        averageRating: 0,
        totalResponses: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }
    
    // Calculate the average rating
    const sum = responses.reduce((total, response) => total + response.rating, 0);
    const averageRating = sum / responses.length;
    
    // Calculate the rating distribution
    const ratingDistribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    responses.forEach(response => {
      if (response.rating >= 1 && response.rating <= 5) {
        ratingDistribution[response.rating]++;
      }
    });
    
    return {
      averageRating,
      totalResponses: responses.length,
      ratingDistribution
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
    const totalCheckins = Array.from(this.checkIns.values()).filter(
      checkIn => checkIn.companyId === companyId
    ).length;
    
    const activeTechs = Array.from(this.technicians.values()).filter(
      tech => tech.companyId === companyId
    ).length;
    
    const blogPostsCount = Array.from(this.blogPosts.values()).filter(
      post => post.companyId === companyId
    ).length;
    
    const reviewRequestsCount = Array.from(this.reviewRequests.values()).filter(
      request => request.companyId === companyId
    ).length;
    
    // Get review responses data
    const responses = Array.from(this.reviewResponses.values()).filter(
      response => response.companyId === companyId
    );
    
    const reviewResponsesCount = responses.length;
    
    // Calculate average rating
    const averageRating = reviewResponsesCount > 0 
      ? responses.reduce((sum, response) => sum + response.rating, 0) / reviewResponsesCount 
      : 0;
    
    return {
      totalCheckins,
      activeTechs,
      blogPosts: blogPostsCount,
      reviewRequests: reviewRequestsCount,
      reviewResponses: reviewResponsesCount,
      averageRating
    };
  }

  // Review Request By Token methods
  async getReviewRequestByToken(token: string): Promise<ReviewRequest | undefined> {
    const requestId = this.reviewRequestTokens.get(token);
    if (!requestId) {
      return undefined;
    }
    return this.getReviewRequest(requestId);
  }

  // Review Automation methods
  async getReviewRequestStatusesByCompany(companyId: number): Promise<ReviewRequestStatus[]> {
    const statuses: ReviewRequestStatus[] = [];
    
    for (const status of this.reviewRequestStatuses.values()) {
      const request = await this.getReviewRequest(status.reviewRequestId);
      if (request && request.companyId === companyId) {
        statuses.push(status);
      }
    }
    
    return statuses;
  }

  async getReviewRequestStatusByRequestId(requestId: number): Promise<ReviewRequestStatus | null> {
    for (const status of this.reviewRequestStatuses.values()) {
      if (status.reviewRequestId === requestId) {
        return status;
      }
    }
    return null;
  }

  async createReviewRequestStatus(status: InsertReviewRequestStatus): Promise<ReviewRequestStatus> {
    const id = this.reviewRequestStatusId++;
    const createdAt = new Date();
    
    const newStatus: ReviewRequestStatus = {
      ...status,
      id,
      createdAt,
    };
    
    this.reviewRequestStatuses.set(id, newStatus);
    return newStatus;
  }

  async updateReviewRequestStatus(id: number, updates: Partial<ReviewRequestStatus>): Promise<ReviewRequestStatus> {
    const status = this.reviewRequestStatuses.get(id);
    
    if (!status) {
      throw new Error(`Review request status with ID ${id} not found`);
    }
    
    const updatedStatus = {
      ...status,
      ...updates
    };
    
    this.reviewRequestStatuses.set(id, updatedStatus);
    return updatedStatus;
  }

  async getReviewFollowUpSettings(companyId: number): Promise<ReviewFollowUpSettings | null> {
    for (const settings of this.reviewFollowUpSettings.values()) {
      if (settings.companyId === companyId) {
        return settings;
      }
    }
    return null;
  }

  async createReviewFollowUpSettings(settings: InsertReviewFollowUpSettings): Promise<ReviewFollowUpSettings> {
    const id = this.reviewFollowUpSettingsId++;
    const createdAt = new Date();
    
    const newSettings: ReviewFollowUpSettings = {
      ...settings,
      id,
      createdAt,
      updatedAt: createdAt
    };
    
    this.reviewFollowUpSettings.set(id, newSettings);
    return newSettings;
  }

  async updateReviewFollowUpSettings(id: number, updates: Partial<ReviewFollowUpSettings>): Promise<ReviewFollowUpSettings> {
    const settings = this.reviewFollowUpSettings.get(id);
    
    if (!settings) {
      throw new Error(`Review follow-up settings with ID ${id} not found`);
    }
    
    const updatedSettings = {
      ...settings,
      ...updates,
      updatedAt: new Date()
    };
    
    this.reviewFollowUpSettings.set(id, updatedSettings);
    return updatedSettings;
  }

  // WordPress Custom Fields operations
  async getWordpressCustomFields(id: number): Promise<WordpressCustomFields | undefined> {
    return this.wordpressCustomFields.get(id);
  }
  
  async getWordpressCustomFieldsByCompany(companyId: number): Promise<WordpressCustomFields | undefined> {
    return Array.from(this.wordpressCustomFields.values()).find(
      (wpcf) => wpcf.companyId === companyId
    );
  }
  
  async createWordpressCustomFields(wpCustomFields: InsertWordpressCustomFields): Promise<WordpressCustomFields> {
    const id = this.wordpressCustomFieldsId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    
    const newWpCustomFields: WordpressCustomFields = {
      ...wpCustomFields,
      id,
      createdAt,
      updatedAt,
      lastSync: null
    };
    
    this.wordpressCustomFields.set(id, newWpCustomFields);
    return newWpCustomFields;
  }
  
  async updateWordpressCustomFields(id: number, updates: Partial<WordpressCustomFields>): Promise<WordpressCustomFields | undefined> {
    const wpCustomFields = this.wordpressCustomFields.get(id);
    if (!wpCustomFields) {
      return undefined;
    }
    
    const updatedWpCustomFields = {
      ...wpCustomFields,
      ...updates,
      updatedAt: new Date()
    };
    
    this.wordpressCustomFields.set(id, updatedWpCustomFields);
    return updatedWpCustomFields;
  }
  
  async testWordpressConnection(companyId: number): Promise<{
    isConnected: boolean;
    version?: string;
    message?: string;
  }> {
    // In a real implementation, this would make an actual connection test
    // For now, simulate a successful connection
    const wpCustomFields = await this.getWordpressCustomFieldsByCompany(companyId);
    
    if (!wpCustomFields) {
      return {
        isConnected: false,
        message: "WordPress integration not configured for this company"
      };
    }
    
    // Simulate a connection test based on values
    if (wpCustomFields.siteUrl.includes('example.com')) {
      return {
        isConnected: false,
        message: "Could not connect to WordPress site. Please verify URL and credentials."
      };
    }
    
    // Simulate a successful connection
    return {
      isConnected: true,
      version: "6.4.2",
      message: "Successfully connected to WordPress site"
    };
  }
  
  async syncWordpressCheckIns(companyId: number, checkInIds?: number[]): Promise<{
    success: boolean;
    synced: number;
    failed: number;
    message?: string;
  }> {
    // In a real implementation, this would sync check-ins to WordPress
    const wpCustomFields = await this.getWordpressCustomFieldsByCompany(companyId);
    
    if (!wpCustomFields) {
      return {
        success: false,
        synced: 0,
        failed: 0,
        message: "WordPress integration not configured for this company"
      };
    }
    
    // Get check-ins to sync
    let checkInsToSync: CheckIn[] = [];
    
    if (checkInIds && checkInIds.length > 0) {
      // Sync specific check-ins
      checkInsToSync = checkInIds
        .map(id => this.checkIns.get(id))
        .filter((checkIn): checkIn is CheckIn => !!checkIn && checkIn.companyId === companyId);
    } else {
      // Sync all check-ins for the company
      checkInsToSync = Array.from(this.checkIns.values())
        .filter(checkIn => checkIn.companyId === companyId)
        .slice(0, 10); // Limit to 10 for simulation purposes
    }
    
    if (checkInsToSync.length === 0) {
      return {
        success: true,
        synced: 0,
        failed: 0,
        message: "No check-ins to sync"
      };
    }
    
    // Simulate sync with some random success/failure
    const synced = Math.floor(checkInsToSync.length * 0.8); // 80% success rate for simulation
    const failed = checkInsToSync.length - synced;
    
    // Update last sync time
    await this.updateWordpressCustomFields(wpCustomFields.id, {
      lastSync: new Date(),
      lastSyncStatus: `Synced ${synced} check-ins, ${failed} failed`
    });
    
    return {
      success: true,
      synced,
      failed,
      message: `Successfully synced ${synced} check-ins to WordPress. ${failed} failed.`
    };
  }
  
  async getReviewAutomationStats(companyId: number): Promise<{
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
  }> {
    const requests = await this.getReviewRequestsByCompany(companyId);
    const statuses = await this.getReviewRequestStatusesByCompany(companyId);
    const responses = await this.getReviewResponsesByCompany(companyId);
    
    // Calculate how many requests have been sent
    const sentRequests = requests.filter(req => req.sentAt !== null).length;
    
    // Calculate completed requests (have a response)
    const completedRequestIds = responses.map(resp => resp.reviewRequestId);
    const completedRequests = completedRequestIds.length;
    
    // Calculate click rate (opened / sent)
    const clickedStatuses = statuses.filter(status => status.linkClicked);
    const clickRate = sentRequests > 0 ? clickedStatuses.length / sentRequests : 0;
    
    // Calculate conversion rate (completed / sent)
    const conversionRate = sentRequests > 0 ? completedRequests / sentRequests : 0;
    
    // Calculate average time to conversion
    let totalConversionTime = 0;
    let conversionCount = 0;
    
    for (const response of responses) {
      const request = requests.find(req => req.id === response.reviewRequestId);
      if (request && request.sentAt && response.respondedAt) {
        const conversionTime = response.respondedAt.getTime() - request.sentAt.getTime();
        totalConversionTime += conversionTime;
        conversionCount++;
      }
    }
    
    const avgTimeToConversion = conversionCount > 0 ? totalConversionTime / conversionCount / (1000 * 60 * 60) : 0; // In hours
    
    // Calculate conversions by follow-up step
    const byFollowUpStep = {
      initial: 0,
      firstFollowUp: 0,
      secondFollowUp: 0,
      finalFollowUp: 0
    };
    
    for (const status of statuses) {
      if (completedRequestIds.includes(status.reviewRequestId)) {
        if (status.firstFollowUpSent && !status.secondFollowUpSent) {
          byFollowUpStep.firstFollowUp++;
        } else if (status.secondFollowUpSent && !status.finalFollowUpSent) {
          byFollowUpStep.secondFollowUp++;
        } else if (status.finalFollowUpSent) {
          byFollowUpStep.finalFollowUp++;
        } else {
          byFollowUpStep.initial++;
        }
      }
    }
    
    return {
      totalRequests: requests.length,
      sentRequests,
      completedRequests,
      clickRate,
      conversionRate,
      avgTimeToConversion,
      byFollowUpStep
    };
  }

  // AI Usage Tracking methods
  async createAiUsageTracking(usage: InsertAiUsageTracking): Promise<AiUsageTracking> {
    const id = this.aiUsageTrackingId++;
    const createdAt = new Date();
    const newUsage: AiUsageTracking = { ...usage, id, createdAt };
    this.aiUsageTracking.set(id, newUsage);
    
    // Update monthly usage
    const year = createdAt.getFullYear();
    const month = createdAt.getMonth() + 1;
    await this.updateMonthlyAiUsage(usage.companyId, year, month, {
      totalRequests: 1,
      totalTokens: usage.tokensUsed,
      totalCost: usage.estimatedCost
    });
    
    return newUsage;
  }

  async getMonthlyAiUsage(companyId: number, year: number, month: number): Promise<MonthlyAiUsage | null> {
    const key = `${companyId}-${year}-${month}`;
    return this.monthlyAiUsage.get(key) || null;
  }

  async getDailyAiUsage(companyId: number, date: Date): Promise<number> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return Array.from(this.aiUsageTracking.values())
      .filter(usage => 
        usage.companyId === companyId &&
        usage.createdAt >= startOfDay &&
        usage.createdAt <= endOfDay
      ).length;
  }

  async updateMonthlyAiUsage(companyId: number, year: number, month: number, updates: {
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    [key: string]: number;
  }): Promise<void> {
    const key = `${companyId}-${year}-${month}`;
    const existing = this.monthlyAiUsage.get(key);
    
    if (existing) {
      this.monthlyAiUsage.set(key, {
        ...existing,
        totalRequests: existing.totalRequests + updates.totalRequests,
        totalTokens: existing.totalTokens + updates.totalTokens,
        totalCost: existing.totalCost + updates.totalCost,
        updatedAt: new Date()
      });
    } else {
      const newUsage: MonthlyAiUsage = {
        id: this.monthlyAiUsageId++,
        companyId,
        year,
        month,
        totalRequests: updates.totalRequests,
        totalTokens: updates.totalTokens,
        totalCost: updates.totalCost,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.monthlyAiUsage.set(key, newUsage);
    }
  }

  private aiUsageTrackingId: number = 1;
  private monthlyAiUsageId: number = 1;

  // Password reset methods
  async updateUserPassword(userId: number, hashedPassword: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.password = hashedPassword;
      this.users.set(userId, user);
    }
  }

  async setPasswordResetToken(userId: number, token: string, expiry: Date): Promise<void> {
    this.passwordResetTokens.set(token, { userId, expiry });
  }

  async verifyPasswordResetToken(token: string): Promise<number | null> {
    const tokenData = this.passwordResetTokens.get(token);
    if (!tokenData) {
      return null;
    }

    // Check if token has expired
    if (new Date() > tokenData.expiry) {
      this.passwordResetTokens.delete(token);
      return null;
    }

    return tokenData.userId;
  }

  async clearPasswordResetToken(userId: number): Promise<void> {
    // Find and remove all tokens for this user
    for (const [token, tokenData] of this.passwordResetTokens.entries()) {
      if (tokenData.userId === userId) {
        this.passwordResetTokens.delete(token);
      }
    }
  }
}

export const storage = new MemStorage();
