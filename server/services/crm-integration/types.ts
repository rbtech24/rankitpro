/**
 * Common types for CRM integrations
 */

export interface SyncSettings {
  /**
   * Whether to sync customer data from check-ins
   */
  syncCustomers: boolean;
  
  /**
   * Whether to create new customer records if they don't exist
   */
  createNewCustomers: boolean;
  
  /**
   * Whether to update existing customer records
   */
  updateExistingCustomers: boolean;
  
  /**
   * Whether to sync check-ins as jobs/activities
   */
  syncCheckInsAsJobs: boolean;
  
  /**
   * Whether to sync photos from check-ins
   */
  syncPhotos: boolean;
  
  /**
   * Auto-match customers based on email, phone, or name
   */
  customerMatchStrategy: 'email' | 'phone' | 'name' | 'all';
  
  /**
   * Map of custom fields to sync (fieldName => crmFieldName)
   */
  customFieldMapping: Record<string, string>;
}

export interface CheckInData {
  /**
   * The ID of the check-in in Rank It Pro
   */
  id: number;
  
  /**
   * The technician who performed the check-in
   */
  technicianId: number;
  
  /**
   * The company the check-in belongs to
   */
  companyId: number;
  
  /**
   * The type of job performed
   */
  jobType: string;
  
  /**
   * Notes about the job
   */
  notes: string | null;
  
  /**
   * Work performed description
   */
  workPerformed: string | null;
  
  /**
   * Materials used during the job
   */
  materialsUsed: string | null;
  
  /**
   * Customer name
   */
  customerName: string | null;
  
  /**
   * Customer email
   */
  customerEmail: string | null;
  
  /**
   * Customer phone
   */
  customerPhone: string | null;
  
  /**
   * Service address
   */
  address: string | null;
  
  /**
   * City
   */
  city: string | null;
  
  /**
   * State/province
   */
  state: string | null;
  
  /**
   * ZIP/Postal code
   */
  zipCode: string | null;
  
  /**
   * GPS latitude
   */
  latitude: string | null;
  
  /**
   * GPS longitude
   */
  longitude: string | null;
  
  /**
   * Array of photo URLs
   */
  photos?: { url: string }[];
  
  /**
   * Date/time the check-in was created
   */
  createdAt: Date;
  
  /**
   * Date/time the check-in was completed (if applicable)
   */
  completedAt?: Date | null;
  
  /**
   * Whether the job is billable
   */
  isBillable?: boolean;
  
  /**
   * Whether follow-up is required
   */
  followUpRequired?: boolean;
  
  /**
   * Additional metadata fields that can be mapped to CRM custom fields
   */
  metadata?: Record<string, any>;
}

export interface CRMContactData {
  /**
   * External ID in the CRM (if exists)
   */
  externalId?: string;
  
  /**
   * Customer name
   */
  name: string;
  
  /**
   * Customer email
   */
  email: string | null;
  
  /**
   * Customer phone
   */
  phone: string | null;
  
  /**
   * Service address
   */
  address?: string | null;
  
  /**
   * City
   */
  city?: string | null;
  
  /**
   * State/province
   */
  state?: string | null;
  
  /**
   * ZIP/Postal code
   */
  zipCode?: string | null;
  
  /**
   * Customer type (residential/commercial)
   */
  type?: 'residential' | 'commercial';
  
  /**
   * Additional contact info
   */
  notes?: string | null;
  
  /**
   * Custom fields specific to the CRM
   */
  customFields?: Record<string, any>;
}

export interface CRMJobData {
  /**
   * External ID in the CRM (if exists)
   */
  externalId?: string;
  
  /**
   * Job title
   */
  title: string;
  
  /**
   * Job description
   */
  description: string;
  
  /**
   * Job type/category
   */
  jobType: string;
  
  /**
   * Job status
   */
  status: string;
  
  /**
   * Associated customer ID in CRM
   */
  customerId: string;
  
  /**
   * Associated customer name
   */
  customerName: string;
  
  /**
   * Service address
   */
  location?: string;
  
  /**
   * Start date/time
   */
  startDate?: Date;
  
  /**
   * End date/time
   */
  endDate?: Date;
  
  /**
   * Assigned technician ID in CRM
   */
  technicianId?: string;
  
  /**
   * Assigned technician name
   */
  technicianName?: string;
  
  /**
   * Notes or work performed
   */
  notes?: string;
  
  /**
   * Image URLs
   */
  images?: string[];
  
  /**
   * Custom fields specific to the CRM
   */
  customFields?: Record<string, any>;
}