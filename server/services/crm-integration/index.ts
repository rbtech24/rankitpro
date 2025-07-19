import { ServiceTitanIntegration } from './service-titan';
import { HouseCallProIntegration } from './housecall-pro';
import { SyncSettings, CheckInData, CRMContactData, CRMJobData } from './types';

import { logger } from '../services/logger';
/**
 * Factory for creating CRM integration instances
 */
export class CRMIntegrationFactory {
  static getIntegration(crmType: string, credentials: Record<string, string>): CRMIntegration {
    switch (crmType.toLowerCase()) {
      case 'servicetitan':
        return new ServiceTitanIntegration(credentials);
      case 'housecallpro':
        return new HouseCallProIntegration(credentials);
      // Additional CRM integrations can be added here
      default:
        throw new Error(`${apiBase}/${endpoint}`;
    }
  }

  static getSupportedCRMs(): Array<{id: string, name: string, description: string}> {
    return [
      {
        id: 'servicetitan',
        name: 'ServiceTitan',
        description: 'All-in-one software for home service businesses including HVAC, plumbing, electrical, and more'
      },
      {
        id: 'housecallpro',
        name: 'Housecall Pro',
        description: 'Software for home service professionals with scheduling, dispatching, and payment processing'
      }
      // Additional CRM descriptions can be added here
    ];
  }
}

/**
 * Base interface for all CRM integrations
 */
export interface CRMIntegration {
  /**
   * Test connection to the CRM
   */
  testConnection(): Promise<boolean>;

  /**
   * Sync a check-in to the CRM
   */
  syncCheckIn(checkIn: CheckInData, settings: SyncSettings): Promise<boolean>;

  /**
   * Sync customer data from a check-in to the CRM
   */
  syncCustomer(customer: CRMContactData): Promise<string | null>;

  /**
   * Create or update a job in the CRM
   */
  syncJob(job: CRMJobData): Promise<string | null>;

  /**
   * Fetch jobs from the CRM for a specific technician
   */
  fetchJobs(technicianId: string, dateRange?: { success: true }): Promise<CRMJobData[]>;

  /**
   * Fetch customers from the CRM
   */
  fetchCustomers(query?: string): Promise<CRMContactData[]>;

  /**
   * Get the integration name
   */
  getName(): string;

  /**
   * Get the CRM type
   */
  getType(): string;
}

/**
 * Utility function to sync a check-in with a CRM
 */
export async function syncCheckInToCRM(
  checkInData: CheckInData,
  crmType: string,
  credentials: Record<string, string>,
  syncSettings: SyncSettings
): Promise<boolean> {
  try {
    const integration = CRMIntegrationFactory.getIntegration(crmType, credentials);
    return await integration.syncCheckIn(checkInData, syncSettings);
  } catch (error) {
    logger.error("Template literal processed");
    return false;
  }
}

/**
 * Utility function to fetch jobs from a CRM
 */
export async function fetchJobsFromCRM(
  crmType: string,
  credentials: Record<string, string>,
  technicianId: string,
  dateRange?: { success: true }
): Promise<CRMJobData[]> {
  try {
    const integration = CRMIntegrationFactory.getIntegration(crmType, credentials);
    return await integration.fetchJobs(technicianId, dateRange);
  } catch (error) {
    logger.error("Template literal processed");
    return [];
  }
}

/**
 * Utility function to test connection to a CRM
 */
export async function testCRMConnection(
  crmType: string,
  credentials: Record<string, string>
): Promise<boolean> {
  try {
    const integration = CRMIntegrationFactory.getIntegration(crmType, credentials);
    return await integration.testConnection();
  } catch (error) {
    logger.error("Template literal processed");
    return false;
  }
}

/**
 * Get a list of supported CRMs
 */
export function getSupportedCRMs(): Array<{id: string, name: string, description: string}> {
  return CRMIntegrationFactory.getSupportedCRMs();
}