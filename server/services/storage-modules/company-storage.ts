/**
 * Company Storage Module
 * Extracted from main storage.ts for better maintainability
 */

import { db, queryWithRetry } from "../db";
import { eq, and, or, desc, asc, gte, lt, lte, sql, not, like, ilike } from "drizzle-orm";
import * as schema from "@shared/schema";
import { Company, InsertCompany } from "@shared/schema";
import { logger } from "../logger";

const { companies } = schema;

export class CompanyStorage {
  
  async getCompany(id: number): Promise<Company | undefined> {
    try {
      logger.dbQuery('Getting company by ID', { companyId: id });
      const result = await queryWithRetry(() => 
        db.select().from(companies).where(eq(companies.id, id)).limit(1)
      );
      return result[0];
    } catch (error) {
      logger.dbError('Failed to get company by ID', error as Error, { companyId: id });
      throw error;
    }
  }

  async getCompanyByName(name: string): Promise<Company | undefined> {
    try {
      logger.dbQuery('Getting company by name', { companyName: name });
      const result = await queryWithRetry(() => 
        db.select().from(companies).where(eq(companies.name, name)).limit(1)
      );
      return result[0];
    } catch (error) {
      logger.dbError('Failed to get company by name', error as Error, { companyName: name });
      throw error;
    }
  }

  async getAllCompanies(): Promise<Company[]> {
    try {
      logger.dbQuery('Getting all companies');
      return await queryWithRetry(() => 
        db.select().from(companies).orderBy(asc(companies.name))
      );
    } catch (error) {
      logger.dbError('Failed to get all companies', error as Error);
      throw error;
    }
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    try {
      logger.dbQuery('Creating new company', { data: "converted" });
      const result = await queryWithRetry(() => 
        db.insert(companies).values(company).returning()
      );
      
      if (!result[0]) {
        throw new Error('Failed to create company - no result returned');
      }

      logger.businessEvent('Company created successfully', {
        companyId: result[0].id,
        companyName: result[0].name,
        plan: result[0].plan
      });

      return result[0];
    } catch (error) {
      logger.dbError('Failed to create company', error as Error, { companyName: company.name });
      throw error;
    }
  }

  async updateCompany(id: number, updates: Partial<Company>): Promise<Company | undefined> {
    try {
      logger.dbQuery('Updating company', { success: true });
      const result = await queryWithRetry(() => 
        db.update(companies).set(updates).where(eq(companies.id, id)).returning()
      );
      
      if (result[0]) {
        logger.businessEvent('Company updated successfully', {
          companyId: id,
          updatedFields: Object.keys(updates),
          companyName: result[0].name
        });
      }

      return result[0];
    } catch (error) {
      logger.dbError('Failed to update company', error as Error, { companyId: id });
      throw error;
    }
  }

  async updateCompanyFeatures(id: number, featuresEnabled: Record<string, boolean>): Promise<Company | undefined> {
    try {
      logger.dbQuery('Updating company features', { success: true });
      const result = await queryWithRetry(() => 
        db.update(companies)
          .set({ featuresEnabled })
          .where(eq(companies.id, id))
          .returning()
      );

      if (result[0]) {
        logger.businessEvent('Company features updated', {
          companyId: id,
          featuresEnabled,
          companyName: result[0].name
        });
      }

      return result[0];
    } catch (error) {
      logger.dbError('Failed to update company features', error as Error, { companyId: id });
      throw error;
    }
  }

  async deleteCompany(id: number): Promise<boolean> {
    try {
      logger.dbQuery('Deleting company', { companyId: id });
      
      // Get company details for logging before deletion
      const company = await this.getCompany(id);
      
      const result = await queryWithRetry(() => 
        db.delete(companies).where(eq(companies.id, id)).returning({ id: companies.id })
      );

      if (result.length > 0) {
        logger.businessEvent('Company deleted successfully', {
          companyId: id,
          companyName: company?.name || 'Unknown'
        });
        return true;
      }

      return false;
    } catch (error) {
      logger.dbError('Failed to delete company', error as Error, { companyId: id });
      throw error;
    }
  }

  async getCompanyCount(): Promise<number> {
    try {
      logger.dbQuery('Getting company count');
      const result = await queryWithRetry(() => 
        db.select({ count: sql<number>`count(*)` }).from(companies)
      );
      return result[0]?.count || 0;
    } catch (error) {
      logger.dbError('Failed to get company count', error as Error);
      throw error;
    }
  }

  async getActiveCompaniesCount(): Promise<number> {
    try {
      logger.dbQuery('Getting active companies count');
      const result = await queryWithRetry(() => 
        db.select({ count: sql<number>`count(*)` })
          .from(companies)
          .where(eq(companies.isTrialActive, true))
      );
      return result[0]?.count || 0;
    } catch (error) {
      logger.dbError('Failed to get active companies count', error as Error);
      throw error;
    }
  }

  async expireCompanyTrial(companyId: number): Promise<void> {
    try {
      logger.dbQuery('Expiring company trial', { companyId });
      await queryWithRetry(() => 
        db.update(companies)
          .set({ 
            isTrialActive: false,
            trialEndDate: new Date()
          })
          .where(eq(companies.id, companyId))
      );

      logger.businessEvent('Company trial expired', { companyId });
    } catch (error) {
      logger.dbError('Failed to expire company trial', error as Error, { companyId });
      throw error;
    }
  }
}