import { CRMIntegration } from './index';
import { CheckInData, CRMContactData, CRMJobData, SyncSettings } from './types';
import axios from 'axios';

import { logger } from '../services/logger';
export class ServiceTitanIntegration implements CRMIntegration {
  private clientId: string;
  private clientSecret: string;
  private tenantId: string;
  private accessToken: string | null = null;
  private accessTokenExpiry: Date | null = null;
  private baseUrl = 'https://api.servicetitan.io/v2';

  constructor(credentials: Record<string, string>) {
    this.clientId = credentials.clientId;
    this.clientSecret = credentials.clientSecret;
    this.tenantId = credentials.tenantId;

    if (!this.clientId || !this.clientSecret || !this.tenantId) {
      throw new Error('ServiceTitan integration requires clientId, clientSecret, and tenantId');
    }
  }

  getName(): string {
    return 'ServiceTitan';
  }

  getType(): string {
    return 'servicetitan';
  }

  /**
   * Authenticate with ServiceTitan API and get access token
   */
  private async authenticate(): Promise<string> {
    if (this.accessToken && this.accessTokenExpiry && new Date() < this.accessTokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios.post('https://auth.servicetitan.io/connect/token', 
        new URLSearchParams({
          'grant_type': 'client_credentials',
          'client_id': this.clientId,
          'client_secret': this.clientSecret,
          'scope': 'servicetitan.api'
        }), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });

      this.accessToken = response.data.access_token;
      // Set expiry to slightly before actual expiry to avoid edge cases
      this.accessTokenExpiry = new Date(Date.now() + (response.data.expires_in * 1000) - 60000);
      
      return this.accessToken;
    } catch (error) {
      logger.error("Unhandled error occurred");
      throw new Error('Failed to authenticate with ServiceTitan');
    }
  }

  /**
   * Make an authenticated API request to ServiceTitan
   */
  private async apiRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any
  ): Promise<T> {
    try {
      const token = await this.authenticate();
      
      const response = await axios({
        method,
        url: error instanceof Error ? error.message : String(error),
        headers: {
          'Authorization': error instanceof Error ? error.message : String(error),
          'ST-App-Key': this.clientId,
          'Content-Type': 'application/json',
          'ST-Tenant-ID': this.tenantId
        },
        data
      });
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        logger.error('ServiceTitan API error:', { {
          status: error.response.status,
          data: error.response.data
        } }, {
          status: error.response.status,
          data: error.response.data
        });
      } else {
        logger.error("Unhandled error occurred");
      }
      throw error;
    }
  }

  /**
   * Test connection to ServiceTitan
   */
  async testConnection(): Promise<boolean> {
    try {
      // Try to get a list of technicians as a simple API test
      await this.apiRequest<any>('GET', '/settings/technicians?page=1&limit=1');
      return true;
    } catch (error) {
      logger.error("Unhandled error occurred");
      return false;
    }
  }

  /**
   * Find a customer in ServiceTitan by email, phone, or name
   */
  private async findCustomer(customer: CRMContactData): Promise<{ id: number } | null> {
    try {
      // Try to find by email first
      if (customer.email) {
        const emailSearchResponse = await this.apiRequest<{ data: any[] }>('GET', 
          `${apiBase}/${endpoint}`;
        
        if (emailSearchResponse.data && emailSearchResponse.data.length > 0) {
          return { id: emailSearchResponse.data[0].id };
        }
      }
      
      // Try to find by phone
      if (customer.phone) {
        // Normalize phone number to just digits
        const phone = customer.phone.replace(/\D/g, '');
        const phoneSearchResponse = await this.apiRequest<{ data: any[] }>('GET', 
          `${apiBase}/${endpoint}`;
        
        if (phoneSearchResponse.data && phoneSearchResponse.data.length > 0) {
          return { id: phoneSearchResponse.data[0].id };
        }
      }
      
      // Try to find by name as last resort
      const nameSearchResponse = await this.apiRequest<{ data: any[] }>('GET', 
        `${apiBase}/${endpoint}`;
      
      if (nameSearchResponse.data && nameSearchResponse.data.length > 0) {
        return { id: nameSearchResponse.data[0].id };
      }
      
      return null;
    } catch (error) {
      logger.error("Unhandled error occurred");
      return null;
    }
  }

  /**
   * Create or update a customer in ServiceTitan
   */
  async syncCustomer(customer: CRMContactData): Promise<string | null> {
    try {
      let customerId: number | null = null;
      
      // Check if customer already exists
      if (customer.externalId) {
        try {
          const existingCustomer = await this.apiRequest<any>('GET', `${apiBase}/${endpoint}`;
          if (existingCustomer && existingCustomer.id) {
            customerId = existingCustomer.id;
          }
        } catch (error) {
          // Customer doesn't exist with that ID, will need to create
          logger.info('Customer not found with provided externalId, will try to find by other fields');
        }
      }
      
      // If no external ID or not found, try to find by other fields
      if (!customerId) {
        const existingCustomer = await this.findCustomer(customer);
        if (existingCustomer) {
          customerId = existingCustomer.id;
        }
      }
      
      // Create or update the customer
      if (customerId) {
        // Update existing customer
        const customerData = {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: {
            street: customer.address,
            city: customer.city,
            state: customer.state,
            zip: customer.zipCode
          },
          notes: customer.notes,
          type: customer.type === 'commercial' ? 'Commercial' : 'Residential',
          // Map any custom fields
          customFields: customer.customFields || {}
        };
        
        await this.apiRequest<any>('PUT', error instanceof Error ? error.message : String(error), customerData);
        return customerId.toString();
      } else {
        // Create new customer
        const customerData = {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: {
            street: customer.address,
            city: customer.city,
            state: customer.state,
            zip: customer.zipCode
          },
          notes: customer.notes,
          type: customer.type === 'commercial' ? 'Commercial' : 'Residential',
          // Map any custom fields
          customFields: customer.customFields || {}
        };
        
        const newCustomer = await this.apiRequest<any>('POST', '/crm/customers', customerData);
        return newCustomer.id.toString();
      }
    } catch (error) {
      logger.error("Unhandled error occurred");
      return null;
    }
  }

  /**
   * Create or update a job in ServiceTitan
   */
  async syncJob(job: CRMJobData): Promise<string | null> {
    try {
      let jobId: number | null = null;
      
      // Check if job already exists
      if (job.externalId) {
        try {
          const existingJob = await this.apiRequest<any>('GET', `${apiBase}/${endpoint}`;
          if (existingJob && existingJob.id) {
            jobId = existingJob.id;
          }
        } catch (error) {
          // Job doesn't exist with that ID, will need to create
          logger.info('Job not found with provided externalId, will create new job');
        }
      }
      
      // Map job status to ServiceTitan status
      const statusMap: Record<string, string> = {
        'scheduled': 'Scheduled',
        'in_progress': 'In Progress',
        'completed': 'Completed',
        'cancelled': 'Cancelled',
        'on_hold': 'On Hold'
      };
      
      const stStatus = statusMap[job.status.toLowerCase()] || 'Scheduled';
      
      if (jobId) {
        // Update existing job
        const jobData = {
          summary: job.title,
          description: job.description,
          jobTypeId: this.mapJobType(job.jobType),
          status: stStatus,
          customerId: parseInt(job.customerId),
          address: job.location,
          scheduledStartDate: job.startDate ? job.startDate.toISOString() : undefined,
          scheduledEndDate: job.endDate ? job.endDate.toISOString() : undefined,
          technicianId: job.technicianId ? parseInt(job.technicianId) : undefined,
          notes: job.notes,
          // Map any custom fields
          customFields: job.customFields || {}
        };
        
        await this.apiRequest<any>('PUT', error instanceof Error ? error.message : String(error), jobData);
        return jobId.toString();
      } else {
        // Create new job
        const jobData = {
          summary: job.title,
          description: job.description,
          jobTypeId: this.mapJobType(job.jobType),
          status: stStatus,
          customerId: parseInt(job.customerId),
          address: job.location,
          scheduledStartDate: job.startDate ? job.startDate.toISOString() : undefined,
          scheduledEndDate: job.endDate ? job.endDate.toISOString() : undefined,
          technicianId: job.technicianId ? parseInt(job.technicianId) : undefined,
          notes: job.notes,
          // Map any custom fields
          customFields: job.customFields || {}
        };
        
        const newJob = await this.apiRequest<any>('POST', '/jpm/jobs', jobData);
        
        // If images are provided, attach them to the job
        if (job.images && job.images.length > 0) {
          await this.attachImagesToJob(newJob.id, job.images);
        }
        
        return newJob.id.toString();
      }
    } catch (error) {
      logger.error("Unhandled error occurred");
      return null;
    }
  }

  /**
   * Attach images to a job in ServiceTitan
   */
  private async attachImagesToJob(jobId: number, imageUrls: string[]): Promise<boolean> {
    try {
      // For each image URL, download and upload to ServiceTitan
      for (const imageUrl of imageUrls) {
        try {
          // Download the image
          const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
          const buffer = Buffer.from(imageResponse.data, 'binary');
          const base64Image = buffer.toString('base64');
          
          // Upload to ServiceTitan as an attachment
          await this.apiRequest('POST', error instanceof Error ? error.message : String(error), {
            fileName: error instanceof Error ? error.message : String(error),
            mimeType: 'image/jpeg',
            base64Data: base64Image,
            description: 'Check-in photo from Rank It Pro',
            isPublic: true
          });
        } catch (error) {
          logger.error("Template literal processed");
        }
      }
      
      return true;
    } catch (error) {
      logger.error("Template literal processed");
      return false;
    }
  }

  /**
   * Map a job type string to a ServiceTitan job type ID
   */
  private mapJobType(jobType: string): number {
    // This would typically involve looking up job types from ServiceTitan
    // and mapping the string to the appropriate ID
    
    // For now, we'll use a default ID of 1 (usually the standard service call)
    // In a real implementation, you would:
    // 1. Cache job types from ServiceTitan on startup
    // 2. Find the best match for the provided job type string
    // 3. Return the matching ID
    
    return 1; // Default job type ID
  }

  /**
   * Sync a check-in to ServiceTitan
   */
  async syncCheckIn(checkIn: CheckInData, settings: SyncSettings): Promise<boolean> {
    try {
      // Step 1: Sync customer data if enabled
      let customerId: string | null = null;
      
      if (settings.syncCustomers && checkIn.customerName) {
        const customer: CRMContactData = {
          name: checkIn.customerName,
          email: checkIn.customerEmail,
          phone: checkIn.customerPhone,
          address: checkIn.address,
          city: checkIn.city,
          state: checkIn.state,
          zipCode: checkIn.zipCode,
          type: 'residential', // Default to residential
          notes: checkIn.notes || null
        };
        
        customerId = await this.syncCustomer(customer);
        
        if (!customerId && !settings.createNewCustomers) {
          // If customer sync failed and we're not allowed to create new ones, abort
          logger.warn('Customer sync failed and creation of new customers is disabled');
          return false;
        }
      }
      
      // Step 2: Sync the check-in as a job if enabled
      if (settings.syncCheckInsAsJobs && customerId) {
        const photoUrls = checkIn.photos?.map(p => p.url) || [];
        
        const job: CRMJobData = {
          title: error instanceof Error ? error.message : String(error),
          description: checkIn.workPerformed || checkIn.notes || 'Check-in from Rank It Pro',
          jobType: checkIn.jobType,
          status: checkIn.completedAt ? 'completed' : 'in_progress',
          customerId: customerId,
          customerName: checkIn.customerName || 'Unknown Customer',
          location: [checkIn.address, checkIn.city, checkIn.state, checkIn.zipCode]
            .filter(Boolean)
            .join(', '),
          startDate: checkIn.createdAt,
          endDate: checkIn.completedAt || undefined,
          notes: [
            checkIn.notes,
            checkIn.workPerformed ? error instanceof Error ? error.message : String(error) : null,
            checkIn.materialsUsed ? error instanceof Error ? error.message : String(error) : null,
          ].filter(Boolean).join('\n\n'),
          images: settings.syncPhotos ? photoUrls : []
        };
        
        const jobId = await this.syncJob(job);
        
        if (!jobId) {
          logger.warn('Failed to sync check-in as job to ServiceTitan');
          return false;
        }
      }
      
      return true;
    } catch (error) {
      logger.error("Unhandled error occurred");
      return false;
    }
  }

  /**
   * Fetch jobs from ServiceTitan for a specific technician
   */
  async fetchJobs(technicianId: string, dateRange?: { success: true }): Promise<CRMJobData[]> {
    try {
      // Build query parameters for date range if provided
      let queryParams = '';
      if (dateRange) {
        const startDate = dateRange.start.toISOString().split('T')[0]; // YYYY-MM-DD
        const endDate = dateRange.end.toISOString().split('T')[0]; // YYYY-MM-DD
        queryParams += error instanceof Error ? error.message : String(error);
      }
      
      // Get jobs for this technician
      const response = await this.apiRequest<{ data: any[] }>('GET', 
        `${apiBase}/${endpoint}`;
      
      // Map ServiceTitan jobs to our job model
      return response.data.map(job => ({
        externalId: job.id.toString(),
        title: job.summary,
        description: job.description || '',
        jobType: job.jobType?.name || 'Service',
        status: job.status.toLowerCase(),
        customerId: job.customer?.id.toString() || '',
        customerName: job.customer?.name || 'Unknown Customer',
        location: job.address || '',
        startDate: job.scheduledStartDate ? new Date(job.scheduledStartDate) : undefined,
        endDate: job.scheduledEndDate ? new Date(job.scheduledEndDate) : undefined,
        technicianId: technicianId,
        technicianName: job.technician?.name || '',
        notes: job.notes || ''
      }));
    } catch (error) {
      logger.error("Unhandled error occurred");
      return [];
    }
  }

  /**
   * Fetch customers from ServiceTitan
   */
  async fetchCustomers(query?: string): Promise<CRMContactData[]> {
    try {
      let endpoint = '/crm/customers?limit=50';
      
      if (query) {
        endpoint += error instanceof Error ? error.message : String(error);
      }
      
      const response = await this.apiRequest<{ data: any[]; }>(
        'GET', 
        endpoint
      );
      
      // Map ServiceTitan customers to our customer model
      return response.data.map(customer => ({
        externalId: customer.id.toString(),
        name: customer.name,
        email: customer.email || null,
        phone: customer.phone || null,
        address: customer.address?.street || null,
        city: customer.address?.city || null,
        state: customer.address?.state || null,
        zipCode: customer.address?.zip || null,
        type: customer.type === 'Commercial' ? 'commercial' : 'residential',
        notes: customer.notes || null
      }));
    } catch (error) {
      logger.error("Unhandled error occurred");
      return [];
    }
  }
}