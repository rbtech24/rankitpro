// CRM Integration Service
// Provides functionality for managing CRM integrations

export interface CRM {
  id: string;
  name: string;
  description: string;
  logo?: string;
  features: string[];
  authType: 'oauth2' | 'api_key' | 'username_password';
  setupComplexity: 'low' | 'medium' | 'high';
  isPopular: boolean;
}

/**
 * Get list of supported CRM systems
 */
export function getSupportedCRMs(): CRM[] {
  return [
    {
      id: 'servicetitan',
      name: 'ServiceTitan',
      description: 'Complete field service management platform with scheduling, dispatching, and customer management',
      logo: '/api/crm/logos/servicetitan.png',
      features: ['Customer Management', 'Job Scheduling', 'Invoicing', 'Technician Tracking'],
      authType: 'oauth2',
      setupComplexity: 'high',
      isPopular: true
    },
    {
      id: 'housecallpro',
      name: 'Housecall Pro',
      description: 'Simple field service software for scheduling, dispatching, and customer communication',
      logo: '/api/crm/logos/housecallpro.png',
      features: ['Scheduling', 'Customer Communication', 'Invoicing', 'Photo Documentation'],
      authType: 'api_key',
      setupComplexity: 'medium',
      isPopular: true
    },
    {
      id: 'jobber',
      name: 'Jobber',
      description: 'Home service business management software with quoting, scheduling, and invoicing',
      logo: '/api/crm/logos/jobber.png',
      features: ['Quoting', 'Scheduling', 'Customer Management', 'Payment Processing'],
      authType: 'oauth2',
      setupComplexity: 'medium',
      isPopular: true
    },
    {
      id: 'fieldedge',
      name: 'FieldEdge',
      description: 'Field service management solution for HVAC, plumbing, and electrical contractors',
      logo: '/api/crm/logos/fieldedge.png',
      features: ['Work Order Management', 'GPS Tracking', 'Inventory Management', 'Customer Portal'],
      authType: 'api_key',
      setupComplexity: 'high',
      isPopular: false
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      description: 'Comprehensive CRM platform with sales, marketing, and customer service tools',
      logo: '/api/crm/logos/hubspot.png',
      features: ['Contact Management', 'Deal Tracking', 'Email Marketing', 'Analytics'],
      authType: 'oauth2',
      setupComplexity: 'medium',
      isPopular: true
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      description: 'Enterprise-grade CRM with advanced customization and automation capabilities',
      logo: '/api/crm/logos/salesforce.png',
      features: ['Lead Management', 'Opportunity Tracking', 'Custom Objects', 'Workflow Automation'],
      authType: 'oauth2',
      setupComplexity: 'high',
      isPopular: true
    }
  ];
}

/**
 * Test connection to a CRM system
 */
export async function testCRMConnection(crmType: string, credentials: any): Promise<boolean> {
  try {
    switch (crmType) {
      case 'servicetitan':
        return await testServiceTitanConnection(credentials);
      case 'housecallpro':
        return await testHousecallProConnection(credentials);
      case 'jobber':
        return await testJobberConnection(credentials);
      case 'fieldedge':
        return await testFieldEdgeConnection(credentials);
      case 'hubspot':
        return await testHubSpotConnection(credentials);
      case 'salesforce':
        return await testSalesforceConnection(credentials);
      default:
        throw new Error(`Unsupported CRM type: ${crmType}`);
    }
  } catch (error) {
    console.error(`CRM connection test failed for ${crmType}:`, error);
    return false;
  }
}

/**
 * Sync a check-in to a CRM system
 */
export async function syncCheckInToCRM(
  checkIn: any,
  crmType: string,
  credentials: any,
  settings: any
): Promise<boolean> {
  try {
    switch (crmType) {
      case 'servicetitan':
        return await syncToServiceTitan(checkIn, credentials, settings);
      case 'housecallpro':
        return await syncToHousecallPro(checkIn, credentials, settings);
      case 'jobber':
        return await syncToJobber(checkIn, credentials, settings);
      case 'fieldedge':
        return await syncToFieldEdge(checkIn, credentials, settings);
      case 'hubspot':
        return await syncToHubSpot(checkIn, credentials, settings);
      case 'salesforce':
        return await syncToSalesforce(checkIn, credentials, settings);
      default:
        throw new Error(`Unsupported CRM type: ${crmType}`);
    }
  } catch (error) {
    console.error(`CRM sync failed for ${crmType}:`, error);
    return false;
  }
}

// ServiceTitan integration functions
async function testServiceTitanConnection(credentials: any): Promise<boolean> {
  // TODO: Implement actual ServiceTitan API connection test
  // For now, validate that required credentials are present
  return !!(credentials.clientId && credentials.clientSecret && credentials.tenantId);
}

async function syncToServiceTitan(checkIn: any, credentials: any, settings: any): Promise<boolean> {
  // TODO: Implement actual ServiceTitan API sync
  console.log('ServiceTitan sync would occur here', { checkIn: checkIn.id, settings });
  return true;
}

// Housecall Pro integration functions
async function testHousecallProConnection(credentials: any): Promise<boolean> {
  // TODO: Implement actual Housecall Pro API connection test
  return !!(credentials.apiKey);
}

async function syncToHousecallPro(checkIn: any, credentials: any, settings: any): Promise<boolean> {
  // TODO: Implement actual Housecall Pro API sync
  console.log('Housecall Pro sync would occur here', { checkIn: checkIn.id, settings });
  return true;
}

// Jobber integration functions
async function testJobberConnection(credentials: any): Promise<boolean> {
  // TODO: Implement actual Jobber API connection test
  return !!(credentials.apiKey);
}

async function syncToJobber(checkIn: any, credentials: any, settings: any): Promise<boolean> {
  // TODO: Implement actual Jobber API sync
  console.log('Jobber sync would occur here', { checkIn: checkIn.id, settings });
  return true;
}

// FieldEdge integration functions
async function testFieldEdgeConnection(credentials: any): Promise<boolean> {
  // TODO: Implement actual FieldEdge API connection test
  return !!(credentials.apiKey);
}

async function syncToFieldEdge(checkIn: any, credentials: any, settings: any): Promise<boolean> {
  // TODO: Implement actual FieldEdge API sync
  console.log('FieldEdge sync would occur here', { checkIn: checkIn.id, settings });
  return true;
}

// HubSpot integration functions
async function testHubSpotConnection(credentials: any): Promise<boolean> {
  if (!credentials.accessToken) {
    return false;
  }

  try {
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
      headers: {
        'Authorization': `Bearer ${credentials.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    return response.ok;
  } catch (error) {
    console.error('HubSpot connection test failed:', error);
    return false;
  }
}

async function syncToHubSpot(checkIn: any, credentials: any, settings: any): Promise<boolean> {
  if (!credentials.accessToken) {
    throw new Error('HubSpot access token not configured');
  }

  try {
    let contactId = null;
    
    // First, try to find existing contact by email
    if (checkIn.customerEmail) {
      const searchResponse = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filterGroups: [{
            filters: [{
              propertyName: 'email',
              operator: 'EQ',
              value: checkIn.customerEmail
            }]
          }]
        })
      });

      if (searchResponse.ok) {
        const searchResult = await searchResponse.json();
        if (searchResult.results && searchResult.results.length > 0) {
          contactId = searchResult.results[0].id;
        }
      }
    }

    // Create new contact if not found
    if (!contactId && checkIn.customerEmail) {
      const contactData = {
        properties: {
          email: checkIn.customerEmail,
          firstname: checkIn.customerName?.split(' ')[0] || '',
          lastname: checkIn.customerName?.split(' ').slice(1).join(' ') || '',
          phone: checkIn.customerPhone || '',
          address: checkIn.address || '',
          city: checkIn.city || '',
          state: checkIn.state || '',
          zip: checkIn.zip || '',
          source: 'Rank It Pro',
          lifecycle_stage: 'customer'
        }
      };

      const createResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactData)
      });

      if (createResponse.ok) {
        const newContact = await createResponse.json();
        contactId = newContact.id;
      }
    }

    // Create service visit note
    if (contactId) {
      const noteData = {
        properties: {
          hs_note_body: `Service Visit Completed\n\nJob Type: ${checkIn.jobType}\nLocation: ${checkIn.location || 'On-site'}\nNotes: ${checkIn.notes || 'Service completed successfully'}\n\nCompleted via Rank It Pro`,
          hs_timestamp: new Date(checkIn.createdAt).getTime()
        },
        associations: [
          {
            to: {
              id: contactId
            },
            types: [
              {
                associationCategory: 'HUBSPOT_DEFINED',
                associationTypeId: 202
              }
            ]
          }
        ]
      };

      const noteResponse = await fetch('https://api.hubapi.com/crm/v3/objects/notes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(noteData)
      });

      return noteResponse.ok;
    }

    return true;
  } catch (error) {
    console.error('HubSpot sync failed:', error);
    throw error;
  }
}

// Salesforce integration functions
async function testSalesforceConnection(credentials: any): Promise<boolean> {
  // TODO: Implement actual Salesforce API connection test
  return !!(credentials.clientId && credentials.clientSecret);
}

async function syncToSalesforce(checkIn: any, credentials: any, settings: any): Promise<boolean> {
  // TODO: Implement actual Salesforce API sync
  console.log('Salesforce sync would occur here', { checkIn: checkIn.id, settings });
  return true;
}