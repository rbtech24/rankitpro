/**
 * User Storage Module
 * Extracted from main storage.ts for better maintainability
 */

import { db, queryWithRetry } from "../db";
import { eq, and, or, desc, asc, gte, lt, lte, sql, not, like, ilike } from "drizzle-orm";
import * as schema from "@shared/schema";
import { User, InsertUser } from "@shared/schema";
import { logger } from "../logger";

const { users } = schema;

export class UserStorage {
  
  async getUser(id: number): Promise<User | undefined> {
    try {
      logger.dbQuery('Getting user by ID', { userId: id });
      const result = await queryWithRetry(() => 
        db.select().from(users).where(eq(users.id, id)).limit(1)
      );
      return result[0];
    } catch (error) {
      logger.dbError('Failed to get user by ID', error as Error, { userId: id });
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      logger.dbQuery('Getting user by email', { email });
      const result = await queryWithRetry(() => 
        db.select().from(users).where(eq(users.email, email)).limit(1)
      );
      return result[0];
    } catch (error) {
      logger.dbError('Failed to get user by email', error as Error, { email });
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      logger.dbQuery('Getting user by username', { username });
      const result = await queryWithRetry(() => 
        db.select().from(users).where(eq(users.username, username)).limit(1)
      );
      return result[0];
    } catch (error) {
      logger.dbError('Failed to get user by username', error as Error, { username });
      throw error;
    }
  }

  async getUsersByCompanyAndRole(companyId: number, role: string): Promise<User[]> {
    try {
      logger.dbQuery('Getting users by company and role', { companyId, role });
      return await queryWithRetry(() => 
        db.select().from(users)
          .where(and(eq(users.companyId, companyId), eq(users.role, role)))
          .orderBy(asc(users.username))
      );
    } catch (error) {
      logger.dbError('Failed to get users by company and role', error as Error, { companyId, role });
      throw error;
    }
  }

  async getUsersByCompany(companyId: number): Promise<User[]> {
    try {
      logger.dbQuery('Getting users by company', { companyId });
      return await queryWithRetry(() => 
        db.select().from(users)
          .where(eq(users.companyId, companyId))
          .orderBy(asc(users.username))
      );
    } catch (error) {
      logger.dbError('Failed to get users by company', error as Error, { companyId });
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      logger.dbQuery('Getting all users');
      return await queryWithRetry(() => 
        db.select().from(users).orderBy(asc(users.username))
      );
    } catch (error) {
      logger.dbError('Failed to get all users', error as Error);
      throw error;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      logger.dbQuery('Creating new user', { data: "converted" });
      const result = await queryWithRetry(() => 
        db.insert(users).values(user).returning()
      );
      
      if (!result[0]) {
        throw new Error('Failed to create user - no result returned');
      }

      logger.businessEvent('User created successfully', {
        userId: result[0].id,
        email: result[0].email,
        role: result[0].role,
        companyId: result[0].companyId
      });

      return result[0];
    } catch (error) {
      logger.dbError('Failed to create user', error as Error, { email: user.email });
      throw error;
    }
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    try {
      logger.dbQuery('Updating user', { success: true });
      const result = await queryWithRetry(() => 
        db.update(users).set(updates).where(eq(users.id, id)).returning()
      );
      
      if (result[0]) {
        logger.businessEvent('User updated successfully', {
          userId: id,
          updatedFields: Object.keys(updates),
          email: result[0].email
        });
      }

      return result[0];
    } catch (error) {
      logger.dbError('Failed to update user', error as Error, { userId: id });
      throw error;
    }
  }

  async updateUserStripeInfo(userId: number, stripeInfo: { success: true }): Promise<User | undefined> {
    try {
      logger.dbQuery('Updating user Stripe info', { userId });
      const result = await queryWithRetry(() => 
        db.update(users)
          .set({
            stripeCustomerId: stripeInfo.customerId,
            stripeSubscriptionId: stripeInfo.subscriptionId
          })
          .where(eq(users.id, userId))
          .returning()
      );

      if (result[0]) {
        logger.businessEvent('User Stripe info updated', {
          userId,
          stripeCustomerId: stripeInfo.customerId
        });
      }

      return result[0];
    } catch (error) {
      logger.dbError('Failed to update user Stripe info', error as Error, { userId });
      throw error;
    }
  }

  async updateUserPassword(userId: number, hashedPassword: string): Promise<void> {
    try {
      logger.dbQuery('Updating user password', { userId });
      await queryWithRetry(() => 
        db.update(users)
          .set({ password: hashedPassword })
          .where(eq(users.id, userId))
      );

      logger.businessEvent('User password updated', { userId });
    } catch (error) {
      logger.dbError('Failed to update user password', error as Error, { userId });
      throw error;
    }
  }

  async setPasswordResetToken(userId: number, token: string, expiry: Date): Promise<void> {
    try {
      logger.dbQuery('Setting password reset token', { userId });
      await queryWithRetry(() => 
        db.update(users)
          .set({ 
            passwordResetToken: token,
            passwordResetExpiry: expiry
          })
          .where(eq(users.id, userId))
      );

      logger.businessEvent('Password reset token set', { userId });
    } catch (error) {
      logger.dbError('Failed to set password reset token', error as Error, { userId });
      throw error;
    }
  }

  async verifyPasswordResetToken(token: string): Promise<number | null> {
    try {
      logger.dbQuery('Verifying password reset token');
      const result = await queryWithRetry(() => 
        db.select({ id: users.id })
          .from(users)
          .where(and(
            eq(users.passwordResetToken, token),
            gte(users.passwordResetExpiry, new Date())
          ))
          .limit(1)
      );

      return result[0]?.id || null;
    } catch (error) {
      logger.dbError('Failed to verify password reset token', error as Error);
      throw error;
    }
  }

  async clearPasswordResetToken(userId: number): Promise<void> {
    try {
      logger.dbQuery('Clearing password reset token', { userId });
      await queryWithRetry(() => 
        db.update(users)
          .set({ 
            passwordResetToken: null,
            passwordResetExpiry: null
          })
          .where(eq(users.id, userId))
      );

      logger.businessEvent('Password reset token cleared', { userId });
    } catch (error) {
      logger.dbError('Failed to clear password reset token', error as Error, { userId });
      throw error;
    }
  }
}