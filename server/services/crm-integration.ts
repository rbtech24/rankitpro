import { CheckIn } from '../../shared/schema';
import { logger } from './logger';

export interface CRMCredentials {
  type: 'salesforce' | 'servicetitan' | 'housecallpro';
  clientId: string;
  clientSecret: string;
  instanceUrl?: string;
  tenantId?: string;
  apiKey?: string;
}

export interface CRMSyncResult {
  success: boolean;
  recordId?: string;
  message: string;
  error?: string;
}

// Base CRM Service Class
abstract class BaseCRMService {
  abstract authenticate(credentials: CRMCredentials): Promise<any>;
  abstract syncCheckIn(credentials: CRMCredentials, checkIn: CheckIn): Promise<CRMSyncResult>;
  abstract testConnection(credentials: CRMCredentials): Promise<boolean>;
}

// Salesforce CRM Service
class SalesforceService extends BaseCRMService {
  async authenticate(credentials: CRMCredentials): Promise<any> {
    try {
      const tokenUrl = `${credentials.instanceUrl}/services/oauth2/token`;
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: credentials.clientId,
          client_secret: credentials.clientSecret
        })
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Salesforce authentication failed', { 
        message: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }

  async syncCheckIn(credentials: CRMCredentials, checkIn: CheckIn): Promise<CRMSyncResult> {
    try {
      const tokenData = await this.authenticate(credentials);
      
      const recordData = {
        Name: `Check-in: ${checkIn.customerName || 'Unknown Customer'}`,
        Description: checkIn.notes || 'Service visit check-in',
        Type: 'Service Visit',
        Status: 'Completed',
        Location__c: `${checkIn.address}, ${checkIn.city}, ${checkIn.state}`,
        Service_Date__c: checkIn.createdAt?.toISOString().split('T')[0],
        Technician_Name__c: checkIn.technicianId?.toString()
      };

      const response = await fetch(`${credentials.instanceUrl}/services/data/v57.0/sobjects/Case`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(recordData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create record: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        recordId: result.id,
        message: 'Check-in synced successfully to Salesforce'
      };
    } catch (error) {
      logger.error('Salesforce sync failed', { 
        message: error instanceof Error ? error.message : String(error) 
      });
      return {
        success: false,
        message: 'Failed to sync with Salesforce',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  async testConnection(credentials: CRMCredentials): Promise<boolean> {
    try {
      await this.authenticate(credentials);
      return true;
    } catch (error) {
      return false;
    }
  }
}

// ServiceTitan CRM Service
class ServiceTitanService extends BaseCRMService {
  async authenticate(credentials: CRMCredentials): Promise<any> {
    try {
      const tokenUrl = 'https://auth.servicetitan.io/connect/token';
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${credentials.clientId}:${credentials.clientSecret}`).toString('base64')}`
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          scope: 'offline_access'
        })
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('ServiceTitan authentication failed', { 
        message: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }

  async syncCheckIn(credentials: CRMCredentials, checkIn: CheckIn): Promise<CRMSyncResult> {
    try {
      const tokenData = await this.authenticate(credentials);
      
      // Create customer if needed
      const customerData = {
        name: checkIn.customerName || 'Unknown Customer',
        address: {
          street: checkIn.address,
          city: checkIn.city,
          state: checkIn.state,
          zip: checkIn.zipCode
        },
        phoneNumber: checkIn.customerPhone
      };

      const customerResponse = await fetch(`https://api.servicetitan.io/customers/v2/${credentials.tenantId}/customers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
          'ST-App-Key': credentials.apiKey || ''
        },
        body: JSON.stringify(customerData)
      });

      const customer = await customerResponse.json();
      const customerId = customer.id;

      // Create job
      const jobData = {
        customerId: customerId,
        jobTypeId: 1,
        priority: 'Normal',
        summary: `Service visit: ${checkIn.notes || 'Check-in completed'}`,
        description: checkIn.notes,
        location: {
          street: checkIn.address,
          city: checkIn.city,
          state: checkIn.state,
          zip: checkIn.zipCode
        }
      };

      const jobResponse = await fetch(`https://api.servicetitan.io/jpm/v2/${credentials.tenantId}/jobs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
          'ST-App-Key': credentials.apiKey || ''
        },
        body: JSON.stringify(jobData)
      });

      const job = await jobResponse.json();
      
      return {
        success: true,
        recordId: job.id,
        message: 'Check-in synced successfully to ServiceTitan'
      };
    } catch (error) {
      logger.error('ServiceTitan sync failed', { 
        message: error instanceof Error ? error.message : String(error) 
      });
      return {
        success: false,
        message: 'Failed to sync with ServiceTitan',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  async testConnection(credentials: CRMCredentials): Promise<boolean> {
    try {
      const tokenData = await this.authenticate(credentials);
      
      const response = await fetch(`https://api.servicetitan.io/settings/v2/${credentials.tenantId}/tenant-info`, {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'ST-App-Key': credentials.apiKey || ''
        }
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// HousecallPro CRM Service
class HousecallProService extends BaseCRMService {
  async authenticate(credentials: CRMCredentials): Promise<any> {
    return { api_key: credentials.apiKey };
  }

  async syncCheckIn(credentials: CRMCredentials, checkIn: CheckIn): Promise<CRMSyncResult> {
    try {
      const customerData = {
        first_name: checkIn.customerName?.split(' ')[0] || 'Unknown',
        last_name: checkIn.customerName?.split(' ').slice(1).join(' ') || 'Customer',
        email: checkIn.customerEmail,
        mobile_number: checkIn.customerPhone,
        address: checkIn.address,
        city: checkIn.city,
        state: checkIn.state,
        zip_code: checkIn.zipCode
      };

      const customerResponse = await fetch('https://api.housecallpro.com/customers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(customerData)
      });

      const customer = await customerResponse.json();
      
      const jobData = {
        customer_id: customer.id,
        description: checkIn.notes || 'Service visit completed',
        work_status: 'completed',
        scheduled_start: checkIn.createdAt?.toISOString(),
        scheduled_end: checkIn.createdAt?.toISOString()
      };

      const jobResponse = await fetch('https://api.housecallpro.com/jobs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobData)
      });

      const job = await jobResponse.json();
      
      return {
        success: true,
        recordId: job.id,
        message: 'Check-in synced successfully to HousecallPro'
      };
    } catch (error) {
      logger.error('HousecallPro sync failed', { 
        message: error instanceof Error ? error.message : String(error) 
      });
      return {
        success: false,
        message: 'Failed to sync with HousecallPro',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  async testConnection(credentials: CRMCredentials): Promise<boolean> {
    try {
      const response = await fetch('https://api.housecallpro.com/me', {
        headers: {
          'Authorization': `Bearer ${credentials.apiKey}`
        }
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// CRM Service Factory
export class CRMServiceFactory {
  static createService(type: string): BaseCRMService {
    switch (type) {
      case 'salesforce':
        return new SalesforceService();
      case 'servicetitan':
        return new ServiceTitanService();
      case 'housecallpro':
        return new HousecallProService();
      default:
        throw new Error(`Unsupported CRM type: ${type}`);
    }
  }
}

// Main CRM Integration Service
export class CRMIntegrationService {
  static async syncCheckIn(credentials: CRMCredentials, checkIn: CheckIn): Promise<CRMSyncResult> {
    try {
      const service = CRMServiceFactory.createService(credentials.type);
      return await service.syncCheckIn(credentials, checkIn);
    } catch (error) {
      logger.error('CRM integration failed', { 
        message: error instanceof Error ? error.message : String(error) 
      });
      return {
        success: false,
        message: 'CRM integration failed',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  static async testConnection(credentials: CRMCredentials): Promise<boolean> {
    try {
      const service = CRMServiceFactory.createService(credentials.type);
      return await service.testConnection(credentials);
    } catch (error) {
      logger.error('CRM connection test failed', { 
        message: error instanceof Error ? error.message : String(error) 
      });
      return false;
    }
  }
}

// Supported CRMs
export function getSupportedCRMs() {
  return [
    {
      id: 'salesforce',
      name: 'Salesforce',
      description: 'Sync check-ins as Cases in Salesforce CRM',
      fields: ['instanceUrl', 'clientId', 'clientSecret']
    },
    {
      id: 'servicetitan',
      name: 'ServiceTitan',
      description: 'Create customers and jobs in ServiceTitan',
      fields: ['tenantId', 'clientId', 'clientSecret', 'apiKey']
    },
    {
      id: 'housecallpro',
      name: 'HousecallPro',
      description: 'Sync customer information and jobs to HousecallPro',
      fields: ['apiKey']
    }
  ];
}