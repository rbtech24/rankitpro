import { Router } from 'express';
import { storage } from '../storage';
import { isAuthenticated, isCompanyAdmin } from '../middleware/auth';
import { apiCredentialService } from '../services/api-credentials';

const router = Router();

// Get API credentials for a company
router.get('/', isAuthenticated, isCompanyAdmin, async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({ message: 'No company associated with this user' });
    }

    const credentials = await storage.getAPICredentialsByCompany(companyId);
    res.json(credentials);
  } catch (error) {
    console.error('Error fetching API credentials:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new API credentials
router.post('/', isAuthenticated, isCompanyAdmin, async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({ message: 'No company associated with this user' });
    }

    const credentials = await apiCredentialService.createAPICredentials(companyId, req.body.name || 'API Key');
    res.json(credentials);
  } catch (error) {
    console.error('Error creating API credentials:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Deactivate API credentials
router.delete('/:id', isAuthenticated, isCompanyAdmin, async (req, res) => {
  try {
    const credentialId = parseInt(req.params.id);
    const companyId = req.user?.companyId;
    
    if (!companyId) {
      return res.status(400).json({ message: 'No company associated with this user' });
    }

    await apiCredentialService.deactivateAPICredentials(credentialId, companyId);
    res.json({ message: 'API credentials deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating API credentials:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Regenerate secret key
router.post('/:id/regenerate', isAuthenticated, isCompanyAdmin, async (req, res) => {
  try {
    const credentialId = parseInt(req.params.id);
    const companyId = req.user?.companyId;
    
    if (!companyId) {
      return res.status(400).json({ message: 'No company associated with this user' });
    }

    const credentials = await apiCredentialService.regenerateSecretKey(credentialId, companyId);
    res.json(credentials);
  } catch (error) {
    console.error('Error regenerating secret key:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;