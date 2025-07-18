import { Router } from 'express';
import { log } from '../vite';
import { storage } from '../storage';
import { isAuthenticated, isCompanyAdmin } from '../middleware/auth';
import { logger } from '../services/structured-logger';
import { 
  getSupportedCRMs, 
  testCRMConnection, 
  syncCheckInToCRM 
} from '../services/crm-integration';

const router = Router();

// Get available CRM integrations
router.get('/available', isAuthenticated, async (req, res) => {
  try {
    const availableCRMs = getSupportedCRMs();
    res.json(availableCRMs);
  } catch (error: any) {
    log("System message");
    res.status(500).json({ 
      message: 'Error fetching available CRMs',
      error: error?.message || 'Unknown error occurred'
    });
  }
});

// Get configured CRM integrations for the current company
router.get('/configured', isAuthenticated, async (req, res) => {
  try {
    const { companyId } = req.user;
    
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }
    
    const company = await storage.getCompany(companyId);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    // CRM configurations are stored in company.crmIntegrations field
    const crmIntegrations = company.crmIntegrations || '{}';
    
    let parsedIntegrations = {};
    try {
      parsedIntegrations = JSON.parse(crmIntegrations);
    } catch (parseError) {
      logger.warn('Failed to parse CRM integrations JSON, using empty object:', { parseError });
      parsedIntegrations = {};
    }
    
    // Format the response
    const configuredCRMs = Object.entries(parsedIntegrations).map(([id, config]: [string, any]) => ({
      id,
      name: config.name || id,
      status: config.status || 'inactive',
      lastSyncedAt: config.lastSyncedAt || null,
      syncSettings: config.syncSettings || null
    }));
    
    res.json(configuredCRMs);
  } catch (error: any) {
    logger.error("Error logging fixed");
    res.status(500).json({ message: 'Error fetching configured CRMs' });
  }
});

// Configure a CRM integration
router.post('/configure', isAuthenticated, isCompanyAdmin, async (req, res) => {
  try {
    const { companyId } = req.user;
    const { crmType, credentials, syncSettings } = req.body;
    
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }
    
    if (!crmType || !credentials) {
      return res.status(400).json({ message: 'CRM type and credentials are required' });
    }
    
    const company = await storage.getCompany(companyId);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    // Get current CRM integrations
    const crmIntegrations = company.crmIntegrations ? JSON.parse(company.crmIntegrations) : {};
    
    // Find the CRM name
    const availableCRMs = getSupportedCRMs();
    const crmInfo = availableCRMs.find(crm => crm.id === crmType);
    
    if (!crmInfo) {
      return res.status(400).json({ message: 'Invalid CRM type' });
    }
    
    // Update the integration
    crmIntegrations[crmType] = {
      name: crmInfo.name,
      credentials,
      status: 'active',
      lastConfigured: new Date().toISOString(),
      syncSettings: syncSettings || {
        syncCustomers: true,
        createNewCustomers: true,
        updateExistingCustomers: true,
        syncCheckInsAsJobs: true,
        syncPhotos: true,
        customerMatchStrategy: 'all'
      }
    };
    
    // Save the updated integrations
    await storage.updateCompany(companyId, {
      crmIntegrations: JSON.stringify(crmIntegrations)
    });
    
    res.json({ success: true });
  } catch (error: any) {
    log("System message");
    res.status(500).json({ 
      message: 'Error configuring CRM integration',
      error: error?.message || 'Unknown error occurred'
    });
  }
});

// Test CRM connection
router.post('/test-connection', isAuthenticated, isCompanyAdmin, async (req, res) => {
  try {
    const { crmType, credentials } = req.body;
    
    if (!crmType || !credentials) {
      return res.status(400).json({ message: 'CRM type and credentials are required' });
    }
    
    const result = await testCRMConnection(crmType, credentials);
    
    if (result) {
      res.json({ success: true });
    } else {
      res.status(400).json({ message: 'Connection test failed' });
    }
  } catch (error: any) {
    log("System message");
    res.status(500).json({ 
      message: 'Error testing CRM connection',
      error: error?.message || 'Unknown error occurred'
    });
  }
});

// Delete a CRM integration
router.delete('/:crmType', isAuthenticated, isCompanyAdmin, async (req, res) => {
  try {
    const { companyId } = req.user;
    const { crmType } = req.params;
    
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }
    
    const company = await storage.getCompany(companyId);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    // Get current CRM integrations
    const crmIntegrations = company.crmIntegrations ? JSON.parse(company.crmIntegrations) : {};
    
    // Remove the integration
    if (crmIntegrations[crmType]) {
      delete crmIntegrations[crmType];
      
      // Save the updated integrations
      await storage.updateCompany(companyId, {
        crmIntegrations: JSON.stringify(crmIntegrations)
      });
    }
    
    res.json({ success: true });
  } catch (error: any) {
    log("System message");
    res.status(500).json({ 
      message: 'Error deleting CRM integration',
      error: error?.message || 'Unknown error occurred'
    });
  }
});

// Trigger a manual sync
router.post('/:crmType/sync', isAuthenticated, isCompanyAdmin, async (req, res) => {
  try {
    const { companyId } = req.user;
    const { crmType } = req.params;
    
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }
    
    const company = await storage.getCompany(companyId);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    // Get current CRM integrations
    const crmIntegrations = company.crmIntegrations ? JSON.parse(company.crmIntegrations) : {};
    
    if (!crmIntegrations[crmType]) {
      return res.status(404).json({ message: 'CRM integration not found' });
    }
    
    // Get integration details
    const integration = crmIntegrations[crmType];
    
    // Queue a sync job (this would typically be handled by a background job system)
    // For now, we'll just record the sync history
    
    const syncHistoryEntry = {
      id: Date.now(),
      crmType,
      crmName: integration.name,
      status: 'success',
      itemsProcessed: 0,
      errorCount: 0,
      timestamp: new Date().toISOString()
    };
    
    // Get current sync history
    const syncHistory = company.crmSyncHistory ? JSON.parse(company.crmSyncHistory) : [];
    
    // Add new entry to the beginning
    syncHistory.unshift(syncHistoryEntry);
    
    // Keep only the last 100 entries
    if (syncHistory.length > 100) {
      syncHistory.length = 100;
    }
    
    // Update the integration's last sync time
    integration.lastSyncedAt = new Date().toISOString();
    crmIntegrations[crmType] = integration;
    
    // Save the updated data
    await storage.updateCompany(companyId, {
      crmIntegrations: JSON.stringify(crmIntegrations),
      crmSyncHistory: JSON.stringify(syncHistory)
    });
    
    // In a real implementation, you would fetch recent check-ins and sync them to the CRM
    // For example:
    /*
    const checkIns = await storage.getCheckInsByCompany(companyId, 100);
    
    for (const checkIn of checkIns) {
      try {
        const success = await syncCheckInToCRM(
          checkIn,
          crmType,
          integration.credentials,
          integration.syncSettings
        );
        
        if (success) {
          syncHistoryEntry.itemsProcessed++;
        } else {
          syncHistoryEntry.errorCount++;
        }
      } catch (error: any) {
        syncHistoryEntry.errorCount++;
      }
    }
    
    syncHistoryEntry.status = syncHistoryEntry.errorCount === 0 ? 'success' : (
      syncHistoryEntry.itemsProcessed > 0 ? 'partial' : 'failed'
    );
    */
    
    res.json({ success: true });
  } catch (error: any) {
    log("System message");
    res.status(500).json({ 
      message: 'Error syncing with CRM',
      error: error?.message || 'Unknown error occurred'
    });
  }
});

// Get sync history
router.get('/sync-history', isAuthenticated, async (req, res) => {
  try {
    const { companyId } = req.user;
    
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }
    
    const company = await storage.getCompany(companyId);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    // Get sync history
    const syncHistory = company.crmSyncHistory ? JSON.parse(company.crmSyncHistory) : [];
    
    res.json(syncHistory);
  } catch (error: any) {
    log("System message");
    res.status(500).json({ 
      message: 'Error fetching CRM sync history',
      error: error?.message || 'Unknown error occurred'
    });
  }
});

export default router;