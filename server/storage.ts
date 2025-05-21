import { 
  User, InsertUser, Company, InsertCompany, Technician, InsertTechnician, 
  CheckIn, InsertCheckIn, BlogPost, InsertBlogPost, ReviewRequest, InsertReviewRequest,
  ReviewResponse, InsertReviewResponse, CheckInWithTechnician, TechnicianWithStats,
  ReviewFollowUpSettings, InsertReviewFollowUpSettings, ReviewRequestStatus, InsertReviewRequestStatus
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
  
  private userId: number;
  private companyId: number;
  private technicianId: number;
  private checkInId: number;
  private blogPostId: number;
  private reviewRequestId: number;
  private reviewResponseId: number;
  private reviewFollowUpSettingsId: number;
  private reviewRequestStatusId: number;
  
  constructor() {
    this.users = new Map();
    this.companies = new Map();
    this.technicians = new Map();
    this.checkIns = new Map();
    this.blogPosts = new Map();
    this.reviewRequests = new Map();
    this.reviewResponses = new Map();
    
    this.userId = 1;
    this.companyId = 1;
    this.technicianId = 1;
    this.checkInId = 1;
    this.blogPostId = 1;
    this.reviewRequestId = 1;
    this.reviewResponseId = 1;
    
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
}

export const storage = new MemStorage();
