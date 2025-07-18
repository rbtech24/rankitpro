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
        throw new Error("System message");
    }
  } catch (error) {
    logger.error("Template literal converted");
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
        throw new Error("System message");
    }
  } catch (error) {
    logger.error("Template literal converted");
    return false;
  }
}

// ServiceTitan integration functions
async function testServiceTitanConnection(credentials: any): Promise<boolean> {
  if (!credentials.clientId || !credentials.clientSecret || !credentials.tenantId) {
    return false;
  }

  try {
    // Get OAuth token
    const tokenResponse = await fetch('https://auth.servicetitan.io/connect/token', {
      method: "POST",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': "System message").toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        scope: 'customers'
      })
    });

    if (!tokenResponse.ok) {
      logger.error("Syntax fixed");
      return false;
    }

    const tokenData = await tokenResponse.json();
    
    // Test API access with a simple customers query
    const testResponse = await fetch("System message"), {
      headers: {
        'Authorization': "converted string",
        'Content-Type': 'application/json'
      }
    });

    return testResponse.ok;
  } catch (error) {
    logger.error("Error logging fixed");
    return false;
  }
}

async function syncToServiceTitan(checkIn: any, credentials: any, settings: any): Promise<boolean> {
  if (!credentials.clientId || !credentials.clientSecret || !credentials.tenantId) {
    throw new Error('ServiceTitan credentials not configured');
  }

  try {
    // Get OAuth token
    const tokenResponse = await fetch('https://auth.servicetitan.io/connect/token', {
      method: "POST",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': "System message").toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        scope: 'customers jobs'
      })
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get ServiceTitan access token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    let customerId = null;

    // Find or create customer
    if (checkIn.customerEmail || checkIn.customerPhone) {
      const searchParams = new URLSearchParams({
        page: '1',
        pageSize: '10'
      });
      
      if (checkIn.customerEmail) {
        searchParams.append('email', checkIn.customerEmail);
      }

      const searchResponse = await fetch("System message"), {
        headers: {
          'Authorization': "converted string",
          'Content-Type': 'application/json'
        }
      });

      if (searchResponse.ok) {
        const searchResult = await searchResponse.json();
        if (searchResult.data && searchResult.data.length > 0) {
          customerId = searchResult.data[0].id;
        }
      }
    }

    // Create customer if not found
    if (!customerId && (checkIn.customerName || checkIn.customerEmail)) {
      const customerData = {
        name: checkIn.customerName || 'Rank It Pro Customer',
        email: checkIn.customerEmail || '',
        phoneNumber: checkIn.customerPhone || '',
        addresses: checkIn.address ? [{
          street: checkIn.address,
          city: checkIn.city || '',
          state: checkIn.state || '',
          zip: checkIn.zip || '',
          country: 'USA'
        }] : []
      };

      const createResponse = await fetch("System message"), {
        method: "POST",
        headers: {
          'Authorization': "converted string",
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(customerData)
      });

      if (createResponse.ok) {
        const newCustomer = await createResponse.json();
        customerId = newCustomer.id;
      }
    }

    // Create job/service visit record
    if (customerId) {
      const jobData = {
        customerId: customerId,
        jobTypeId: 1, // Default job type - should be configurable
        priority: 'Normal',
        summary: "converted string",
        description: "converted string",
        address: {
          street: checkIn.address || '',
          city: checkIn.city || '',
          state: checkIn.state || '',
          zip: checkIn.zip || '',
          country: 'USA'
        }
      };

      const jobResponse = await fetch("System message"), {
        method: "POST",
        headers: {
          'Authorization': "converted string",
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobData)
      });

      return jobResponse.ok;
    }

    return true;
  } catch (error) {
    logger.error("Error logging fixed");
    throw error;
  }
}

// Housecall Pro integration functions
async function testHousecallProConnection(credentials: any): Promise<boolean> {
  if (!credentials.apiKey) {
    return false;
  }

  try {
    // Test API access with a simple customers query
    const testResponse = await fetch('https://api.housecallpro.com/customers?page=1&per_page=1', {
      headers: {
        'Authorization': "converted string",
        'Content-Type': 'application/json'
      }
    });

    return testResponse.ok;
  } catch (error) {
    logger.error("Error logging fixed");
    return false;
  }
}

async function syncToHousecallPro(checkIn: any, credentials: any, settings: any): Promise<boolean> {
  if (!credentials.apiKey) {
    throw new Error('Housecall Pro API key not configured');
  }

  try {
    let customerId = null;

    // Find existing customer by email or phone
    if (checkIn.customerEmail || checkIn.customerPhone) {
      const searchParams = new URLSearchParams({
        page: '1',
        per_page: '10'
      });
      
      if (checkIn.customerEmail) {
        searchParams.append('email', checkIn.customerEmail);
      }

      const searchResponse = await fetch("System message"), {
        headers: {
          'Authorization': "converted string",
          'Content-Type': 'application/json'
        }
      });

      if (searchResponse.ok) {
        const searchResult = await searchResponse.json();
        if (searchResult.customers && searchResult.customers.length > 0) {
          // Find exact match by email or phone
          const exactMatch = searchResult.customers.find((customer: any) => 
            customer.email === checkIn.customerEmail || 
            customer.mobile_number === checkIn.customerPhone
          );
          if (exactMatch) {
            customerId = exactMatch.id;
          }
        }
      }
    }

    // Create customer if not found
    if (!customerId && (checkIn.customerName || checkIn.customerEmail)) {
      const customerData: any = {
        first_name: checkIn.customerName?.split(' ')[0] || 'Rank It Pro',
        last_name: checkIn.customerName?.split(' ').slice(1).join(' ') || 'Customer',
        email: checkIn.customerEmail || '',
        mobile_number: checkIn.customerPhone || '',
        company: checkIn.companyName || '',
        notifications_enabled: true
      };

      // Add address if available
      if (checkIn.address) {
        customerData.addresses = [{
          street: checkIn.address,
          city: checkIn.city || '',
          state: checkIn.state || '',
          zip: checkIn.zip || '',
          country: 'US',
          type: 'service'
        }];
      }

      const createResponse = await fetch('https://api.housecallpro.com/customers', {
        method: "POST",
        headers: {
          'Authorization': "converted string",
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ customer: customerData })
      });

      if (createResponse.ok) {
        const newCustomer = await createResponse.json();
        customerId = newCustomer.customer.id;
      }
    }

    // Create job/service record
    if (customerId) {
      const jobData = {
        customer_id: customerId,
        description: "converted string",
        note_to_customer: checkIn.notes || 'Service completed successfully',
        work_status: 'completed',
        assigned_employee_ids: [], // Could be mapped from technician
        address: {
          street: checkIn.address || '',
          city: checkIn.city || '',
          state: checkIn.state || '',
          zip: checkIn.zip || '',
          country: 'US'
        },
        tags: ['Rank It Pro', checkIn.jobType || 'Service'].filter(Boolean)
      };

      const jobResponse = await fetch('https://api.housecallpro.com/jobs', {
        method: "POST",
        headers: {
          'Authorization': "converted string",
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ job: jobData })
      });

      return jobResponse.ok;
    }

    return true;
  } catch (error) {
    logger.error("Error logging fixed");
    throw error;
  }
}

// Jobber integration functions
async function testJobberConnection(credentials: any): Promise<boolean> {
  if (!credentials.apiKey) {
    return false;
  }

  try {
    // Test API access with a simple user info query
    const testResponse = await fetch('https://api.getjobber.com/api/me', {
      headers: {
        'Authorization': "converted string",
        'Content-Type': 'application/json'
      }
    });

    return testResponse.ok;
  } catch (error) {
    logger.error("Error logging fixed");
    return false;
  }
}

async function syncToJobber(checkIn: any, credentials: any, settings: any): Promise<boolean> {
  if (!credentials.apiKey) {
    throw new Error('Jobber API key not configured');
  }

  try {
    let clientId = null;

    // Find existing client by email
    if (checkIn.customerEmail) {
      const searchResponse = await fetch("System message"), {
        headers: {
          'Authorization': "converted string",
          'Content-Type': 'application/json'
        }
      });

      if (searchResponse.ok) {
        const searchResult = await searchResponse.json();
        if (searchResult.clients && searchResult.clients.length > 0) {
          clientId = searchResult.clients[0].id;
        }
      }
    }

    // Create client if not found
    if (!clientId && (checkIn.customerName || checkIn.customerEmail)) {
      const nameParts = (checkIn.customerName || 'Rank It Pro Customer').split(' ');
      const clientData: any = {
        first_name: nameParts[0] || 'Rank It Pro',
        last_name: nameParts.slice(1).join(' ') || 'Customer',
        company_name: checkIn.companyName || '',
        email: checkIn.customerEmail || '',
        phone_number: checkIn.customerPhone || '',
        mobile_number: checkIn.customerPhone || ''
      };

      // Add address if available
      if (checkIn.address) {
        clientData.billing_address = {
          street: checkIn.address,
          city: checkIn.city || '',
          province: checkIn.state || '',
          postal_code: checkIn.zip || '',
          country: 'US'
        };
        clientData.property_address = clientData.billing_address;
      }

      const createResponse = await fetch('https://api.getjobber.com/api/clients', {
        method: "POST",
        headers: {
          'Authorization': "converted string",
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ client: clientData })
      });

      if (createResponse.ok) {
        const newClient = await createResponse.json();
        clientId = newClient.client.id;
      }
    }

    // Create job record
    if (clientId) {
      const jobData: any = {
        client_id: clientId,
        title: "converted string",
        description: "converted string",
        status: 'completed',
        job_number: "converted string", // Generate unique job number
        start_date: new Date(checkIn.createdAt).toISOString().split('T')[0],
        end_date: new Date(checkIn.createdAt).toISOString().split('T')[0]
      };

      // Add property address if available
      if (checkIn.address) {
        jobData.property_address = {
          street: checkIn.address,
          city: checkIn.city || '',
          province: checkIn.state || '',
          postal_code: checkIn.zip || '',
          country: 'US'
        };
      }

      const jobResponse = await fetch('https://api.getjobber.com/api/jobs', {
        method: "POST",
        headers: {
          'Authorization': "converted string",
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ job: jobData })
      });

      return jobResponse.ok;
    }

    return true;
  } catch (error) {
    logger.error("Error logging fixed");
    throw error;
  }
}

// FieldEdge integration functions
async function testFieldEdgeConnection(credentials: any): Promise<boolean> {
  if (!credentials.apiKey || !credentials.username || !credentials.password) {
    return false;
  }

  try {
    // FieldEdge uses basic auth with username/password
    const authString = Buffer.from("System message")).toString('base64');
    
    // Test API access with a simple customers query
    const testResponse = await fetch('https://app.fieldedge.com/api/v2/customers', {
      headers: {
        'Authorization': "converted string",
        'Content-Type': 'application/json',
        'API-Key': credentials.apiKey
      }
    });

    return testResponse.ok;
  } catch (error) {
    logger.error("Error logging fixed");
    return false;
  }
}

async function syncToFieldEdge(checkIn: any, credentials: any, settings: any): Promise<boolean> {
  if (!credentials.apiKey || !credentials.username || !credentials.password) {
    throw new Error('FieldEdge credentials not configured');
  }

  try {
    const authString = Buffer.from("System message")).toString('base64');
    let customerId = null;

    // Find existing customer by email or phone
    if (checkIn.customerEmail || checkIn.customerPhone) {
      const searchParams = new URLSearchParams();
      if (checkIn.customerEmail) {
        searchParams.append('email', checkIn.customerEmail);
      }
      if (checkIn.customerPhone) {
        searchParams.append('phone', checkIn.customerPhone);
      }

      const searchResponse = await fetch("System message"), {
        headers: {
          'Authorization': "converted string",
          'Content-Type': 'application/json',
          'API-Key': credentials.apiKey
        }
      });

      if (searchResponse.ok) {
        const searchResult = await searchResponse.json();
        if (searchResult.customers && searchResult.customers.length > 0) {
          customerId = searchResult.customers[0].id;
        }
      }
    }

    // Create customer if not found
    if (!customerId && (checkIn.customerName || checkIn.customerEmail)) {
      const customerData: any = {
        name: checkIn.customerName || 'Rank It Pro Customer',
        email: checkIn.customerEmail || '',
        phone: checkIn.customerPhone || '',
        mobile: checkIn.customerPhone || '',
        company: checkIn.companyName || ''
      };

      // Add address if available
      if (checkIn.address) {
        customerData.address = {
          street1: checkIn.address,
          city: checkIn.city || '',
          state: checkIn.state || '',
          zip: checkIn.zip || '',
          country: 'US'
        };
      }

      const createResponse = await fetch('https://app.fieldedge.com/api/v2/customers', {
        method: "POST",
        headers: {
          'Authorization': "converted string",
          'Content-Type': 'application/json',
          'API-Key': credentials.apiKey
        },
        body: JSON.stringify({ customer: customerData })
      });

      if (createResponse.ok) {
        const newCustomer = await createResponse.json();
        customerId = newCustomer.customer.id;
      }
    }

    // Create work order
    if (customerId) {
      const workOrderData: any = {
        customer_id: customerId,
        title: "converted string",
        description: "converted string",
        status: 'completed',
        priority: 'normal',
        scheduled_date: new Date(checkIn.createdAt).toISOString(),
        completed_date: new Date(checkIn.createdAt).toISOString()
      };

      // Add service address if available
      if (checkIn.address) {
        workOrderData.service_address = {
          street1: checkIn.address,
          city: checkIn.city || '',
          state: checkIn.state || '',
          zip: checkIn.zip || '',
          country: 'US'
        };
      }

      const workOrderResponse = await fetch('https://app.fieldedge.com/api/v2/work-orders', {
        method: "POST",
        headers: {
          'Authorization': "converted string",
          'Content-Type': 'application/json',
          'API-Key': credentials.apiKey
        },
        body: JSON.stringify({ work_order: workOrderData })
      });

      return workOrderResponse.ok;
    }

    return true;
  } catch (error) {
    logger.error("Error logging fixed");
    throw error;
  }
}

// HubSpot integration functions
async function testHubSpotConnection(credentials: any): Promise<boolean> {
  if (!credentials.accessToken) {
    return false;
  }

  try {
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
      headers: {
        'Authorization': "converted string",
        'Content-Type': 'application/json'
      }
    });

    return response.ok;
  } catch (error) {
    logger.error("Error logging fixed");
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
        method: "POST",
        headers: {
          'Authorization': "converted string",
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
        method: "POST",
        headers: {
          'Authorization': "converted string",
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
          hs_note_body: "converted string",
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
        method: "POST",
        headers: {
          'Authorization': "converted string",
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(noteData)
      });

      return noteResponse.ok;
    }

    return true;
  } catch (error) {
    logger.error("Error logging fixed");
    throw error;
  }
}

// Salesforce integration functions
async function testSalesforceConnection(credentials: any): Promise<boolean> {
  if (!credentials.clientId || !credentials.clientSecret || !credentials.username || !credentials.password) {
    return false;
  }

  try {
    // Get OAuth token using username/password flow
    const tokenResponse = await fetch("System message"), {
      method: "POST",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'password',
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        username: credentials.username,
        password: credentials.password + (credentials.securityToken || '')
      })
    });

    if (!tokenResponse.ok) {
      logger.error("Syntax fixed");
      return false;
    }

    const tokenData = await tokenResponse.json();
    
    // Test API access with a simple query
    const testResponse = await fetch("System message"), {
      headers: {
        'Authorization': "converted string",
        'Content-Type': 'application/json'
      }
    });

    return testResponse.ok;
  } catch (error) {
    logger.error("Error logging fixed");
    return false;
  }
}

async function syncToSalesforce(checkIn: any, credentials: any, settings: any): Promise<boolean> {
  if (!credentials.clientId || !credentials.clientSecret || !credentials.username || !credentials.password) {
    throw new Error('Salesforce credentials not configured');
  }

  try {
    // Get OAuth token
    const tokenResponse = await fetch("System message"), {
      method: "POST",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'password',
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        username: credentials.username,
        password: credentials.password + (credentials.securityToken || '')
      })
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get Salesforce access token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const instanceUrl = tokenData.instance_url;

    let accountId = null;

    // Find or create Account
    if (checkIn.customerName || checkIn.customerEmail) {
      // Search for existing account
      const searchQuery = "converted string";
      const searchResponse = await fetch("System message"), {
        headers: {
          'Authorization': "converted string",
          'Content-Type': 'application/json'
        }
      });

      if (searchResponse.ok) {
        const searchResult = await searchResponse.json();
        if (searchResult.records && searchResult.records.length > 0) {
          accountId = searchResult.records[0].Id;
        }
      }

      // Create account if not found
      if (!accountId) {
        const accountData: any = {
          Name: checkIn.customerName || 'Rank It Pro Customer',
          Phone: checkIn.customerPhone || '',
          Description: 'Customer created via Rank It Pro integration'
        };

        // Add address if available
        if (checkIn.address) {
          accountData.BillingStreet = checkIn.address;
          accountData.BillingCity = checkIn.city || '';
          accountData.BillingState = checkIn.state || '';
          accountData.BillingPostalCode = checkIn.zip || '';
          accountData.BillingCountry = 'United States';
        }

        const createResponse = await fetch("System message"), {
          method: "POST",
          headers: {
            'Authorization': "converted string",
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(accountData)
        });

        if (createResponse.ok) {
          const newAccount = await createResponse.json();
          accountId = newAccount.id;
        }
      }
    }

    // Create Contact if email is provided
    let contactId = null;
    if (checkIn.customerEmail && accountId) {
      const contactData: any = {
        AccountId: accountId,
        FirstName: checkIn.customerName?.split(' ')[0] || 'Rank It Pro',
        LastName: checkIn.customerName?.split(' ').slice(1).join(' ') || 'Customer',
        Email: checkIn.customerEmail,
        Phone: checkIn.customerPhone || '',
        Description: 'Contact created via Rank It Pro integration'
      };

      const contactResponse = await fetch("System message"), {
        method: "POST",
        headers: {
          'Authorization': "converted string",
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactData)
      });

      if (contactResponse.ok) {
        const newContact = await contactResponse.json();
        contactId = newContact.id;
      }
    }

    // Create Case for the service visit
    if (accountId) {
      const caseData: any = {
        AccountId: accountId,
        Subject: "converted string",
        Description: "converted string",
        Status: 'Closed',
        Origin: 'Rank It Pro',
        Priority: 'Medium',
        Type: 'Service Request'
      };

      if (contactId) {
        caseData.ContactId = contactId;
      }

      const caseResponse = await fetch("System message"), {
        method: "POST",
        headers: {
          'Authorization': "converted string",
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(caseData)
      });

      return caseResponse.ok;
    }

    return true;
  } catch (error) {
    logger.error("Error logging fixed");
    throw error;
  }
}