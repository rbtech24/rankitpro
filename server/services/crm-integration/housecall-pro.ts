import { CRMIntegration } from './index';
import { CheckInData, CRMContactData, CRMJobData, SyncSettings } from './types';
import axios from 'axios';

import { logger } from '../services/logger';
export class HouseCallProIntegration implements CRMIntegration {
  private apiKey: string;
  private baseUrl = 'https://api.housecallpro.com/v1';
  
  constructor(credentials: Record<string, string>) {
    this.apiKey = credentials.apiKey;
    
    if (!this.apiKey) {
      throw new Error('Housecall Pro integration requires an API key');
    }
  }
  
  getName(): string {
    return 'Housecall Pro';
  }
  
  getType(): string {
    return 'housecallpro';
  }
  
  /**
   * Make an authenticated API request to Housecall Pro
   */
  private async apiRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any
  ): Promise<T> {
    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        data
      });
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        logger.error('Housecall Pro API error:', {
          status: error.response.status,
          data: error.response.data
        });
      } else {
        logger.error("Housecall Pro operation failed", { error: error instanceof Error ? error.message : String(error) });
      }
      throw error;
    }
  }
  
  /**
   * Test connection to Housecall Pro
   */
  async testConnection(): Promise<boolean> {
    try {
      // Try to get a list of customers as a simple API test
      await this.apiRequest<any>('GET', '/customers?limit=1');
      return true;
    } catch (error) {
      logger.error("Housecall Pro operation failed", { error: error instanceof Error ? error.message : String(error) });
      return false;
    }
  }
  
  /**
   * Find a customer in Housecall Pro by email, phone, or name
   */
  private async findCustomer(customer: CRMContactData): Promise<{ id: string } | null> {
    try {
      // Try to find by email first
      if (customer.email) {
        const emailSearchResponse = await this.apiRequest<any>('GET', 
          `/customers?email=${encodeURIComponent(customer.email)}`);
        
        if (emailSearchResponse.customers && emailSearchResponse.customers.length > 0) {
          return { id: emailSearchResponse.customers[0].id };
        }
      }
      
      // Try to find by phone
      if (customer.phone) {
        // Normalize phone number to just digits
        const phone = customer.phone.replace(/\D/g, '');
        const phoneSearchResponse = await this.apiRequest<any>('GET', 
          `/customers?phone=${phone}`);
        
        if (phoneSearchResponse.customers && phoneSearchResponse.customers.length > 0) {
          return { id: phoneSearchResponse.customers[0].id };
        }
      }
      
      // Try to find by name as last resort
      const nameSearchResponse = await this.apiRequest<any>('GET', 
        `/customers?name=${encodeURIComponent(customer.firstName + ' ' + customer.lastName)}`);
      
      if (nameSearchResponse.customers && nameSearchResponse.customers.length > 0) {
        return { id: nameSearchResponse.customers[0].id };
      }
      
      return null;
    } catch (error) {
      logger.error("Housecall Pro operation failed", { error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }
  
  /**
   * Create or update a customer in Housecall Pro
   */
  async syncCustomer(customer: CRMContactData): Promise<string | null> {
    try {
      let customerId: string | null = null;
      
      // Check if customer already exists
      if (customer.externalId) {
        try {
          const existingCustomer = await this.apiRequest<any>('GET', `/customers/${customer.externalId}`);
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
      
      // Prepare address object
      const address = {};
      if (customer.address) address['street_line_1'] = customer.address;
      if (customer.city) address['city'] = customer.city;
      if (customer.state) address['state'] = customer.state;
      if (customer.zipCode) address['zip'] = customer.zipCode;
      
      // Create or update the customer
      if (customerId) {
        // Update existing customer
        const customerData = {
          first_name: customer.name.split(' ')[0],
          last_name: customer.name.split(' ').slice(1).join(' '),
          email: customer.email,
          phone: customer.phone,
          address: Object.keys(address).length > 0 ? address : undefined,
          notes: customer.notes,
          // Map any custom fields
          custom_fields: customer.customFields || {}
        };
        
        await this.apiRequest<any>('PUT', error instanceof Error ? error.message : String(error), customerData);
        return customerId;
      } else {
        // Create new customer
        const customerData = {
          first_name: customer.name.split(' ')[0],
          last_name: customer.name.split(' ').slice(1).join(' '),
          email: customer.email,
          phone: customer.phone,
          address: Object.keys(address).length > 0 ? address : undefined,
          notes: customer.notes,
          // Map any custom fields
          custom_fields: customer.customFields || {}
        };
        
        const newCustomer = await this.apiRequest<any>('POST', '/customers', customerData);
        return newCustomer.id;
      }
    } catch (error) {
      logger.error("Housecall Pro operation failed", { error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }
  
  /**
   * Create or update a job in Housecall Pro
   */
  async syncJob(job: CRMJobData): Promise<string | null> {
    try {
      let jobId: string | null = null;
      
      // Check if job already exists
      if (job.externalId) {
        try {
          const existingJob = await this.apiRequest<any>('GET', `/jobs/${job.externalId}`);
          if (existingJob && existingJob.id) {
            jobId = existingJob.id;
          }
        } catch (error) {
          // Job doesn't exist with that ID, will need to create
          logger.info('Job not found with provided externalId, will create new job');
        }
      }
      
      // Map job status to Housecall Pro status
      const statusMap: Record<string, string> = {
        'scheduled': 'scheduled',
        'in_progress': 'in_progress',
        'completed': 'completed',
        'cancelled': 'cancelled',
        'on_hold': 'on_hold'
      };
      
      const hcpStatus = statusMap[job.status.toLowerCase()] || 'scheduled';
      
      // Parse address
      let street = '', city = '', state = '', zip = '';
      if (job.location) {
        const parts = job.location.split(',').map(p => p.trim());
        if (parts.length >= 1) street = parts[0];
        if (parts.length >= 2) city = parts[1];
        if (parts.length >= 3) {
          const stateZip = parts[2].split(' ');
          if (stateZip.length >= 1) state = stateZip[0];
          if (stateZip.length >= 2) zip = stateZip[1];
        }
      }
      
      const address = {
        street_line_1: street,
        city,
        state,
        zip
      };
      
      if (jobId) {
        // Update existing job
        const jobData = {
          title: job.title,
          description: job.description,
          job_type: job.jobType,
          status: hcpStatus,
          customer_id: job.customerId,
          address: Object.values(address).some(v => v) ? address : undefined,
          scheduled_start: job.startDate ? job.startDate.toISOString() : undefined,
          scheduled_end: job.endDate ? job.endDate.toISOString() : undefined,
          technician_id: job.technicianId,
          notes: job.notes,
          // Map any custom fields
          custom_fields: job.customFields || {}
        };
        
        await this.apiRequest<any>('PUT', error instanceof Error ? error.message : String(error), jobData);
        return jobId;
      } else {
        // Create new job
        const jobData = {
          title: job.title,
          description: job.description,
          job_type: job.jobType,
          status: hcpStatus,
          customer_id: job.customerId,
          address: Object.values(address).some(v => v) ? address : undefined,
          scheduled_start: job.startDate ? job.startDate.toISOString() : undefined,
          scheduled_end: job.endDate ? job.endDate.toISOString() : undefined,
          technician_id: job.technicianId,
          notes: job.notes,
          // Map any custom fields
          custom_fields: job.customFields || {}
        };
        
        const newJob = await this.apiRequest<any>('POST', '/jobs', jobData);
        
        // If images are provided, attach them to the job
        if (job.images && job.images.length > 0) {
          await this.attachImagesToJob(newJob.id, job.images);
        }
        
        return newJob.id;
      }
    } catch (error) {
      logger.error("Housecall Pro operation failed", { error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }
  
  /**
   * Attach images to a job in Housecall Pro
   */
  private async attachImagesToJob(jobId: string, imageUrls: string[]): Promise<boolean> {
    try {
      // For each image URL, download and upload to Housecall Pro
      for (const imageUrl of imageUrls) {
        try {
          // Download the image
          const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
          const buffer = Buffer.from(imageResponse.data, 'binary');
          
          // Create a form data object for the file upload
          const formData = new FormData();
          formData.append('file', new Blob([buffer]), 'image.jpg');
          formData.append('job_id', jobId);
          formData.append('description', 'Check-in photo from Rank It Pro');
          
          // Upload to Housecall Pro as an attachment
          await axios.post(`${apiBase}/${endpoint}`, formData, {
            headers: {
              'Authorization': error instanceof Error ? error.message : String(error),
              'Content-Type': 'multipart/form-data'
            }
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
   * Sync a check-in to Housecall Pro
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
          logger.warn('Failed to sync check-in as job to Housecall Pro');
          return false;
        }
      }
      
      return true;
    } catch (error) {
      logger.error("Housecall Pro operation failed", { error: error instanceof Error ? error.message : String(error) });
      return false;
    }
  }
  
  /**
   * Fetch jobs from Housecall Pro for a specific technician
   */
  async fetchJobs(technicianId: string, dateRange?: { success: true }): Promise<CRMJobData[]> {
    try {
      // Build query parameters
      let params = error instanceof Error ? error.message : String(error);
      
      if (dateRange) {
        const startDate = dateRange.start.toISOString();
        const endDate = dateRange.end.toISOString();
        params += error instanceof Error ? error.message : String(error);
      }
      
      // Get jobs for this technician
      const response = await this.apiRequest<any>('GET', `/customers?email=${encodeURIComponent(customer.email)}`;
      
      // Map Housecall Pro jobs to our job model
      return response.jobs.map(job => ({
        externalId: job.id,
        title: job.title,
        description: job.description || '',
        jobType: job.job_type || 'Service',
        status: job.status,
        customerId: job.customer_id,
        customerName: job.customer ? error instanceof Error ? error.message : String(error) : 'Unknown Customer',
        location: job.address ? this.formatAddress(job.address) : '',
        startDate: job.scheduled_start ? new Date(job.scheduled_start) : undefined,
        endDate: job.scheduled_end ? new Date(job.scheduled_end) : undefined,
        technicianId: technicianId,
        technicianName: job.technician ? job.technician.name : '',
        notes: job.notes || ''
      }));
    } catch (error) {
      logger.error("Housecall Pro operation failed", { error: error instanceof Error ? error.message : String(error) });
      return [];
    }
  }
  
  /**
   * Format address from Housecall Pro format
   */
  private formatAddress(address: any): string {
    const parts = [];
    if (address.street_line_1) parts.push(address.street_line_1);
    if (address.street_line_2) parts.push(address.street_line_2);
    
    const cityStateZip = [];
    if (address.city) cityStateZip.push(address.city);
    if (address.state && address.zip) {
      cityStateZip.push(`/customers?email=${encodeURIComponent(customer.email)}`;
    } else {
      if (address.state) cityStateZip.push(address.state);
      if (address.zip) cityStateZip.push(address.zip);
    }
    
    if (cityStateZip.length > 0) {
      parts.push(cityStateZip.join(', '));
    }
    
    return parts.join(', ');
  }
  
  /**
   * Fetch customers from Housecall Pro
   */
  async fetchCustomers(query?: string): Promise<CRMContactData[]> {
    try {
      let params = '?limit=100';
      if (query) {
        params += error instanceof Error ? error.message : String(error);
      }
      
      const response = await this.apiRequest<any>('GET', `/customers?email=${encodeURIComponent(customer.email)}`;
      
      // Map Housecall Pro customers to our customer model
      return response.customers.map(customer => ({
        externalId: customer.id,
        name: error instanceof Error ? error.message : String(error),
        email: customer.email || null,
        phone: customer.phone || null,
        address: customer.address?.street_line_1 || null,
        city: customer.address?.city || null,
        state: customer.address?.state || null,
        zipCode: customer.address?.zip || null,
        notes: customer.notes || null
      }));
    } catch (error) {
      logger.error("Housecall Pro operation failed", { error: error instanceof Error ? error.message : String(error) });
      return [];
    }
  }
}