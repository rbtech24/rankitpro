import { 
  User, InsertUser, Company, InsertCompany, Technician, InsertTechnician, 
  CheckIn, InsertCheckIn, BlogPost, InsertBlogPost, ReviewRequest, InsertReviewRequest,
  ReviewResponse, InsertReviewResponse, CheckInWithTechnician, TechnicianWithStats,
  Testimonial, InsertTestimonial, APICredentials, InsertAPICredentials
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUsersByCompany(companyId: number): Promise<User[]>;
  updateUserPassword(id: number, password: string): Promise<User | undefined>;
  setPasswordResetToken(email: string, token: string, expires: Date): Promise<void>;
  verifyPasswordResetToken(token: string): Promise<User | undefined>;
  clearPasswordResetToken(userId: number): Promise<void>;
  
  // Company operations
  getCompany(id: number): Promise<Company | undefined>;
  getAllCompanies(): Promise<Company[]>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, updates: Partial<Company>): Promise<Company | undefined>;
  updateCompanyFeatures(id: number, features: any): Promise<Company | undefined>;
  getCompanyStats(id: number): Promise<any>;
  
  // Technician operations
  getTechnician(id: number): Promise<Technician | undefined>;
  getTechniciansByCompany(companyId: number): Promise<Technician[]>;
  getTechniciansWithStats(companyId: number): Promise<TechnicianWithStats[]>;
  getTechnicianByEmail(email: string): Promise<Technician | undefined>;
  createTechnician(technician: InsertTechnician): Promise<Technician>;
  updateTechnician(id: number, updates: Partial<Technician>): Promise<Technician | undefined>;
  deleteTechnician(id: number): Promise<boolean>;
  
  // Check-in operations
  getCheckIn(id: number): Promise<CheckIn | undefined>;
  getCheckInsByCompany(companyId: number): Promise<CheckInWithTechnician[]>;
  getCheckInsByTechnician(technicianId: number): Promise<CheckIn[]>;
  createCheckIn(checkIn: InsertCheckIn): Promise<CheckIn>;
  
  // Blog operations
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  getBlogPostsByCompany(companyId: number): Promise<BlogPost[]>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, updates: Partial<BlogPost>): Promise<BlogPost | undefined>;
  
  // Review operations
  getReviewRequestsByCompany(companyId: number): Promise<ReviewRequest[]>;
  getReviewResponsesByCompany(companyId: number): Promise<ReviewResponse[]>;
  createReviewRequest(request: InsertReviewRequest): Promise<ReviewRequest>;
  
  // Platform metrics for admin
  getPlatformMetrics(): Promise<{
    totalUsers: number;
    totalCompanies: number;
    totalCheckIns: number;
    totalBlogPosts: number;
    activeUsers: number;
    recentActivity: any[];
    topCompanies: any[];
  }>;
}

export class MemStorage implements IStorage {
  private users = new Map<number, User>();
  private companies = new Map<number, Company>();
  private technicians = new Map<number, Technician>();
  private checkIns = new Map<number, CheckIn>();
  private blogPosts = new Map<number, BlogPost>();
  private reviewRequests = new Map<number, ReviewRequest>();
  private reviewResponses = new Map<number, ReviewResponse>();
  private passwordResets = new Map<string, { userId: number; expires: Date }>();
  
  private nextUserId = 1;
  private nextCompanyId = 1;
  private nextTechnicianId = 1;
  private nextCheckInId = 1;
  private nextBlogPostId = 1;
  private nextReviewRequestId = 1;
  private nextReviewResponseId = 1;

  private initialized = false;

  private async ensureInitialized() {
    if (this.initialized) return;
    
    const bcrypt = await import('bcrypt');
    
    // Create super admin account
    const superAdmin: User = {
      id: this.nextUserId++,
      email: 'bill@mrsprinklerrepair.com',
      username: 'billsprinkler',
      password: await bcrypt.hash('TempAdmin2024!', 12),
      role: 'super_admin',
      companyId: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      createdAt: new Date(),
      active: true
    };
    this.users.set(superAdmin.id, superAdmin);

    // Create test company
    const testCompany: Company = {
      id: this.nextCompanyId++,
      name: 'Test Company Ltd',
      plan: 'pro',
      usageLimit: 1000,
      wordpressConfig: null,
      javaScriptEmbedConfig: null,
      reviewSettings: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      features: {},
      customBranding: null,
      onboardingCompleted: false,
      totalCheckIns: 0,
      totalReviews: 0,
      averageRating: 0,
      createdAt: new Date()
    };
    this.companies.set(testCompany.id, testCompany);

    // Create company admin account
    const companyAdmin: User = {
      id: this.nextUserId++,
      email: 'admin@testcompany.com',
      username: 'companyadmin',
      password: await bcrypt.hash('company123', 12),
      role: 'company_admin',
      companyId: testCompany.id,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      createdAt: new Date(),
      active: true
    };
    this.users.set(companyAdmin.id, companyAdmin);

    // Create technician account
    const technician: User = {
      id: this.nextUserId++,
      email: 'tech@testcompany.com',
      username: 'techuser',
      password: await bcrypt.hash('tech1234', 12),
      role: 'technician',
      companyId: testCompany.id,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      createdAt: new Date(),
      active: true
    };
    this.users.set(technician.id, technician);

    this.initialized = true;
    console.log('✅ Test accounts initialized:');
    console.log('- Super Admin: bill@mrsprinklerrepair.com / TempAdmin2024!');
    console.log('- Company Admin: admin@testcompany.com / company123');
    console.log('- Technician: tech@testcompany.com / tech1234');
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    await this.ensureInitialized();
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) return user;
    }
    return undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const user: User = {
      id: this.nextUserId++,
      ...userData,
      createdAt: new Date()
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getCompany(id: number): Promise<Company | undefined> {
    return this.companies.get(id);
  }

  async getAllCompanies(): Promise<Company[]> {
    return Array.from(this.companies.values());
  }

  async createCompany(companyData: InsertCompany): Promise<Company> {
    const company: Company = {
      id: this.nextCompanyId++,
      ...companyData,
      createdAt: new Date()
    };
    this.companies.set(company.id, company);
    return company;
  }

  async updateCompany(id: number, updates: Partial<Company>): Promise<Company | undefined> {
    const company = this.companies.get(id);
    if (!company) return undefined;
    
    const updatedCompany = { ...company, ...updates };
    this.companies.set(id, updatedCompany);
    return updatedCompany;
  }

  async getTechnician(id: number): Promise<Technician | undefined> {
    return this.technicians.get(id);
  }

  async getTechniciansByCompany(companyId: number): Promise<Technician[]> {
    return Array.from(this.technicians.values()).filter(tech => tech.companyId === companyId);
  }

  async createTechnician(technicianData: InsertTechnician): Promise<Technician> {
    const technician: Technician = {
      id: this.nextTechnicianId++,
      ...technicianData,
      createdAt: new Date()
    };
    this.technicians.set(technician.id, technician);
    return technician;
  }

  async getCheckIn(id: number): Promise<CheckIn | undefined> {
    return this.checkIns.get(id);
  }

  async getCheckInsByCompany(companyId: number): Promise<CheckInWithTechnician[]> {
    const checkIns = Array.from(this.checkIns.values()).filter(checkIn => checkIn.companyId === companyId);
    return checkIns.map(checkIn => {
      const technician = this.technicians.get(checkIn.technicianId);
      return {
        ...checkIn,
        technician: technician || {
          id: 0,
          name: "Unknown",
          email: "",
          phone: "",
          location: "",
          specialty: null,
          companyId: 0,
          userId: null,
          createdAt: new Date()
        }
      };
    });
  }

  async createCheckIn(checkInData: InsertCheckIn): Promise<CheckIn> {
    const checkIn: CheckIn = {
      id: this.nextCheckInId++,
      ...checkInData,
      createdAt: new Date()
    };
    this.checkIns.set(checkIn.id, checkIn);
    return checkIn;
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    return this.blogPosts.get(id);
  }

  async getBlogPostsByCompany(companyId: number): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values()).filter(post => post.companyId === companyId);
  }

  async createBlogPost(postData: InsertBlogPost): Promise<BlogPost> {
    const post: BlogPost = {
      id: this.nextBlogPostId++,
      ...postData,
      createdAt: new Date()
    };
    this.blogPosts.set(post.id, post);
    return post;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUsersByCompany(companyId: number): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.companyId === companyId);
  }

  async updateUserPassword(id: number, password: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, password };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async setPasswordResetToken(email: string, token: string, expires: Date): Promise<void> {
    const user = await this.getUserByEmail(email);
    if (user) {
      this.passwordResets.set(token, { userId: user.id, expires });
    }
  }

  async verifyPasswordResetToken(token: string): Promise<User | undefined> {
    const reset = this.passwordResets.get(token);
    if (!reset || reset.expires < new Date()) {
      this.passwordResets.delete(token);
      return undefined;
    }
    return this.users.get(reset.userId);
  }

  async clearPasswordResetToken(userId: number): Promise<void> {
    for (const [token, reset] of this.passwordResets.entries()) {
      if (reset.userId === userId) {
        this.passwordResets.delete(token);
        break;
      }
    }
  }

  async updateCompanyFeatures(id: number, features: any): Promise<Company | undefined> {
    const company = this.companies.get(id);
    if (!company) return undefined;
    
    const updatedCompany = { ...company, features };
    this.companies.set(id, updatedCompany);
    return updatedCompany;
  }

  async getCompanyStats(id: number): Promise<any> {
    const company = this.companies.get(id);
    if (!company) return null;
    
    const technicians = Array.from(this.technicians.values()).filter(t => t.companyId === id);
    const checkIns = Array.from(this.checkIns.values()).filter(c => c.companyId === id);
    const blogPosts = Array.from(this.blogPosts.values()).filter(p => p.companyId === id);
    
    return {
      company,
      totalTechnicians: technicians.length,
      totalCheckIns: checkIns.length,
      totalBlogPosts: blogPosts.length,
      recentCheckIns: checkIns.slice(-5)
    };
  }

  async getTechniciansWithStats(companyId: number): Promise<TechnicianWithStats[]> {
    const technicians = Array.from(this.technicians.values()).filter(t => t.companyId === companyId);
    return technicians.map(technician => ({
      ...technician,
      checkInCount: Array.from(this.checkIns.values()).filter(c => c.technicianId === technician.id).length,
      lastCheckIn: new Date()
    }));
  }

  async getTechnicianByEmail(email: string): Promise<Technician | undefined> {
    for (const technician of this.technicians.values()) {
      if (technician.email === email) return technician;
    }
    return undefined;
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

  async getCheckInsByTechnician(technicianId: number): Promise<CheckIn[]> {
    return Array.from(this.checkIns.values()).filter(checkIn => checkIn.technicianId === technicianId);
  }

  async updateBlogPost(id: number, updates: Partial<BlogPost>): Promise<BlogPost | undefined> {
    const post = this.blogPosts.get(id);
    if (!post) return undefined;
    
    const updatedPost = { ...post, ...updates };
    this.blogPosts.set(id, updatedPost);
    return updatedPost;
  }

  async getReviewRequestsByCompany(companyId: number): Promise<ReviewRequest[]> {
    return Array.from(this.reviewRequests.values()).filter(req => req.companyId === companyId);
  }

  async getReviewResponsesByCompany(companyId: number): Promise<ReviewResponse[]> {
    return Array.from(this.reviewResponses.values()).filter(res => res.companyId === companyId);
  }

  async createReviewRequest(requestData: InsertReviewRequest): Promise<ReviewRequest> {
    const request: ReviewRequest = {
      id: this.nextReviewRequestId++,
      ...requestData,
      createdAt: new Date()
    };
    this.reviewRequests.set(request.id, request);
    return request;
  }

  async getPlatformMetrics(): Promise<{
    totalUsers: number;
    totalCompanies: number;
    totalCheckIns: number;
    totalBlogPosts: number;
    activeUsers: number;
    recentActivity: any[];
    topCompanies: any[];
  }> {
    return {
      totalUsers: this.users.size,
      totalCompanies: this.companies.size,
      totalCheckIns: this.checkIns.size,
      totalBlogPosts: this.blogPosts.size,
      activeUsers: Array.from(this.users.values()).filter(u => u.active).length,
      recentActivity: [],
      topCompanies: Array.from(this.companies.values()).slice(0, 5)
    };
  }
}

export const storage = new MemStorage();