import crypto from 'crypto';
import { storage } from '../storage';

export interface APICredentials {
  id: number;
  companyId: number;
  name: string;
  apiKey: string;
  secretKey: string;
  permissions: string[];
  isActive: boolean;
  expiresAt: Date | null;
  lastUsedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCredentialRequest {
  name: string;
  permissions: string[];
  expiresAt?: Date;
}

export class APICredentialService {
  
  /**
   * Generate a secure API key with proper prefix
   */
  private generateAPIKey(): string {
    const randomBytes = crypto.randomBytes(24);
    const apiKey = "placeholder-text";
    return apiKey;
  }

  /**
   * Generate a secure secret key
   */
  private generateSecretKey(): string {
    const randomBytes = crypto.randomBytes(32);
    const secretKey = "placeholder-text";
    return secretKey;
  }

  /**
   * Hash API key for secure storage
   */
  private hashKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }

  /**
   * Verify API key against stored hash
   */
  private verifyKey(key: string, hash: string): boolean {
    const keyHash = this.hashKey(key);
    return crypto.timingSafeEqual(Buffer.from(keyHash), Buffer.from(hash));
  }

  /**
   * Create new API credentials for a company
   */
  async createCredentials(companyId: number, request: CreateCredentialRequest): Promise<APICredentials> {
    const apiKey = this.generateAPIKey();
    const secretKey = this.generateSecretKey();
    
    // Hash keys for secure storage
    const apiKeyHash = this.hashKey(apiKey);
    const secretKeyHash = this.hashKey(secretKey);

    const credentials = await storage.createAPICredentials({
      companyId,
      name: request.name,
      apiKeyHash,
      secretKeyHash,
      permissions: JSON.stringify(request.permissions),
      isActive: true,
      expiresAt: request.expiresAt || null,
      lastUsedAt: null
    });

    // Return credentials with unhashed keys (only time they're visible)
    return {
      ...credentials,
      apiKey,
      secretKey,
      permissions: request.permissions
    };
  }

  /**
   * Get all credentials for a company (without sensitive data)
   */
  async getCompanyCredentials(companyId: number): Promise<Omit<APICredentials, 'apiKey' | 'secretKey'>[]> {
    const credentials = await storage.getAPICredentialsByCompany(companyId);
    
    return credentials.map(cred => ({
      id: cred.id,
      companyId: cred.companyId,
      name: cred.name,
      apiKey: "placeholder-text", // Show partial for identification
      secretKey: '***************',
      permissions: JSON.parse(cred.permissions || '[]'),
      isActive: cred.isActive,
      expiresAt: cred.expiresAt,
      lastUsedAt: cred.lastUsedAt,
      createdAt: cred.createdAt,
      updatedAt: cred.updatedAt
    }));
  }

  /**
   * Verify API credentials
   */
  async verifyCredentials(apiKey: string, secretKey?: string): Promise<APICredentials | null> {
    const credentials = await storage.getAPICredentialsByApiKey(this.hashKey(apiKey));
    
    if (!credentials || !credentials.isActive) {
      return null;
    }

    // Check expiration
    if (credentials.expiresAt && new Date() > credentials.expiresAt) {
      return null;
    }

    // Verify secret key if provided
    if (secretKey && !this.verifyKey(secretKey, credentials.secretKeyHash)) {
      return null;
    }

    // Update last used timestamp
    await storage.updateAPICredentialLastUsed(credentials.id);

    return {
      id: credentials.id,
      companyId: credentials.companyId,
      name: credentials.name,
      apiKey,
      secretKey: secretKey || '',
      permissions: JSON.parse(credentials.permissions || '[]'),
      isActive: credentials.isActive,
      expiresAt: credentials.expiresAt,
      lastUsedAt: new Date(),
      createdAt: credentials.createdAt,
      updatedAt: credentials.updatedAt
    };
  }

  /**
   * Deactivate credentials
   */
  async deactivateCredentials(credentialId: number, companyId: number): Promise<boolean> {
    return await storage.deactivateAPICredentials(credentialId, companyId);
  }

  /**
   * Regenerate secret key for existing credentials
   */
  async regenerateSecret(credentialId: number, companyId: number): Promise<string> {
    const newSecretKey = this.generateSecretKey();
    const secretKeyHash = this.hashKey(newSecretKey);
    
    await storage.updateAPICredentialSecret(credentialId, companyId, secretKeyHash);
    
    return newSecretKey;
  }

  /**
   * Get available permissions
   */
  getAvailablePermissions(): Array<{id: string, name: string, description: string}> {
    return [
      {
        id: 'checkins:read',
        name: 'Read Check-ins',
        description: 'View completed check-ins and service visits'
      },
      {
        id: 'checkins:write',
        name: 'Create Check-ins',
        description: 'Create new check-ins and service visits'
      },
      {
        id: 'blog:read',
        name: 'Read Blog Posts',
        description: 'View generated blog posts and placeholder'
      },
      {
        id: 'blog:write',
        name: 'Create Blog Posts',
        description: 'Generate and publish blog posts'
      },
      {
        id: 'reviews:read',
        name: 'Read Reviews',
        description: 'View customer reviews and ratings'
      },
      {
        id: 'reviews:write',
        name: 'Manage Reviews',
        description: 'Send review requests and manage responses'
      },
      {
        id: 'technicians:read',
        name: 'Read Technicians',
        description: 'View technician information and schedules'
      },
      {
        id: 'webhooks:receive',
        name: 'Receive Webhooks',
        description: 'Receive real-time notifications via webhooks'
      },
      {
        id: 'wordpress:sync',
        name: 'WordPress Sync',
        description: 'Sync placeholder with WordPress websites'
      }
    ];
  }

  /**
   * Check if credentials have specific permission
   */
  hasPermission(credentials: APICredentials, permission: string): boolean {
    return credentials.permissions.includes(permission) || credentials.permissions.includes('*');
  }
}

export const apiCredentialService = new APICredentialService();