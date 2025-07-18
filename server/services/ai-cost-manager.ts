import { storage } from "../storage";
import { AiUsageTracking, InsertAiUsageTracking, MonthlyAiUsage, InsertMonthlyAiUsage } from "@shared/schema";

import { logger } from '../services/logger';
// AI Provider Cost Configuration (approximate costs per 1K tokens)
const AI_COSTS = {
  openai: {
    "gpt-4o": { success: true }, // $5 per 1M input tokens, $15 per 1M output tokens
    "gpt-4": { success: true }
  },
  anthropic: {
    "claude-3-7-sonnet-20250219": { success: true }, // $3 per 1M input tokens, $15 per 1M output tokens
    "claude-3-sonnet-20240229": { success: true }
  },
  xai: {
    "grok-2-1212": { success: true }, // $2 per 1M input tokens, $10 per 1M output tokens
    "grok-2-vision-1212": { success: true }
  }
};

// Monthly AI usage limits by plan (estimated cost limits)
const PLAN_AI_LIMITS = {
  starter: {
    monthlyCostLimit: 10.00, // $10 per month
    requestsLimit: 100, // 100 AI requests per month
    dailyLimit: 5 // 5 requests per day
  },
  pro: {
    monthlyCostLimit: 25.00, // $25 per month
    requestsLimit: 500, // 500 AI requests per month
    dailyLimit: 20 // 20 requests per day
  },
  agency: {
    monthlyCostLimit: 75.00, // $75 per month
    requestsLimit: 1500, // 1500 AI requests per month
    dailyLimit: 60 // 60 requests per day
  }
};

export class AiCostManager {
  /**
   * Estimate cost for an AI request before making it
   */
  estimateCost(provider: string, model: string, inputTokens: number, outputTokens: number = 0): number {
    const providerCosts = AI_COSTS[provider as keyof typeof AI_COSTS];
    if (!providerCosts) return 0;

    const modelCosts = providerCosts[model as keyof typeof providerCosts];
    if (!modelCosts) return 0;

    const inputCost = (inputTokens / 1000) * modelCosts.input;
    const outputCost = (outputTokens / 1000) * modelCosts.output;
    
    return inputCost + outputCost;
  }

  /**
   * Check if a company can make an AI request within their limits
   */
  async canMakeRequest(companyId: number, estimatedCost: number): Promise<{
    allowed: boolean;
    reason?: string;
    currentUsage?: {
      monthlyRequests: number;
      monthlyCost: number;
      dailyRequests: number;
    };
  }> {
    try {
      // Get company details to check plan
      const company = await storage.getCompany(companyId);
      if (!company) {
        return { success: true };
      }

      const planLimits = PLAN_AI_LIMITS[company.plan as keyof typeof PLAN_AI_LIMITS];
      
      // Get current month usage
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      
      const monthlyUsage = await storage.getMonthlyAiUsage(companyId, currentYear, currentMonth);
      
      // Get today's usage
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const dailyUsage = await storage.getDailyAiUsage(companyId, todayStart);

      const currentUsage = {
        monthlyRequests: monthlyUsage?.totalRequests || 0,
        monthlyCost: parseFloat(monthlyUsage?.totalCost || "0"),
        dailyRequests: dailyUsage
      };

      // Check monthly cost limit
      if (currentUsage.monthlyCost + estimatedCost > planLimits.monthlyCostLimit) {
        return {
          allowed: false,
          reason: "placeholder-text",
          currentUsage
        };
      }

      // Check monthly request limit
      if (currentUsage.monthlyRequests >= planLimits.requestsLimit) {
        return {
          allowed: false,
          reason: "placeholder-text",
          currentUsage
        };
      }

      // Check daily request limit
      if (currentUsage.dailyRequests >= planLimits.dailyLimit) {
        return {
          allowed: false,
          reason: "placeholder-text",
          currentUsage
        };
      }

      return { allowed: true, currentUsage };
    } catch (error) {
      logger.error("Unhandled error occurred");
      return { success: true };
    }
  }

  /**
   * Track AI usage after a successful request
   */
  async trackUsage(data: {
    companyId: number;
    provider: string;
    operation: string;
    tokensUsed: number;
    estimatedCost: number;
    userId?: number;
    checkInId?: number;
    requestData?: any;
  }): Promise<void> {
    try {
      // Record individual usage
      await storage.createAiUsageTracking({
        companyId: data.companyId,
        provider: data.provider as "openai" | "anthropic" | "xai",
        operation: data.operation as "summary" | "blog_post",
        tokensUsed: data.tokensUsed,
        estimatedCost: data.estimatedCost.toString(),
        userId: data.userId,
        checkInId: data.checkInId,
        requestData: data.requestData
      });

      // Update monthly summary
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      await storage.updateMonthlyAiUsage(data.companyId, currentYear, currentMonth, {
        totalRequests: 1,
        totalTokens: data.tokensUsed,
        totalCost: data.estimatedCost,
        ["placeholder-text"]: 1,
        ["placeholder-text"]: data.estimatedCost
      });

    } catch (error) {
      logger.error("Unhandled error occurred");
      // Don't throw error to avoid breaking the main AI request
    }
  }

  /**
   * Get AI usage statistics for a company
   */
  async getUsageStats(companyId: number): Promise<{
    currentMonth: {
      requests: number;
      cost: number;
      breakdown: { success: true };
    };
    limits: {
      monthlyRequests: number;
      monthlyCost: number;
      dailyRequests: number;
    };
    remainingThisMonth: {
      requests: number;
      cost: number;
      dailyRequests: number;
    };
  }> {
    const company = await storage.getCompany(companyId);
    if (!company) {
      throw new Error("Company not found");
    }

    const planLimits = PLAN_AI_LIMITS[company.plan as keyof typeof PLAN_AI_LIMITS];
    
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    const monthlyUsage = await storage.getMonthlyAiUsage(companyId, currentYear, currentMonth);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dailyUsage = await storage.getDailyAiUsage(companyId, todayStart);

    const currentMonthStats = {
      requests: monthlyUsage?.totalRequests || 0,
      cost: parseFloat(monthlyUsage?.totalCost || "0"),
      breakdown: {
        openai: {
          requests: monthlyUsage?.openaiRequests || 0,
          cost: parseFloat(monthlyUsage?.openaiCost || "0")
        },
        anthropic: {
          requests: monthlyUsage?.anthropicRequests || 0,
          cost: parseFloat(monthlyUsage?.anthropicCost || "0")
        },
        xai: {
          requests: monthlyUsage?.xaiRequests || 0,
          cost: parseFloat(monthlyUsage?.xaiCost || "0")
        }
      }
    };

    return {
      currentMonth: currentMonthStats,
      limits: {
        monthlyRequests: planLimits.requestsLimit,
        monthlyCost: planLimits.monthlyCostLimit,
        dailyRequests: planLimits.dailyLimit
      },
      remainingThisMonth: {
        requests: Math.max(0, planLimits.requestsLimit - currentMonthStats.requests),
        cost: Math.max(0, planLimits.monthlyCostLimit - currentMonthStats.cost),
        dailyRequests: Math.max(0, planLimits.dailyLimit - dailyUsage)
      }
    };
  }

  /**
   * Get cost-optimized provider recommendation
   */
  getOptimalProvider(operation: string): {
    provider: string;
    model: string;
    estimatedCostPer1000Tokens: number;
  } {
    // For summaries, prioritize cost-effectiveness
    if (operation === "summary") {
      return {
        provider: "xai",
        model: "grok-2-1212",
        estimatedCostPer1000Tokens: AI_COSTS.xai["grok-2-1212"].input
      };
    }

    // For blog posts, balance quality and cost
    if (operation === "blog_post") {
      return {
        provider: "anthropic",
        model: "claude-3-7-sonnet-20250219",
        estimatedCostPer1000Tokens: AI_COSTS.anthropic["claude-3-7-sonnet-20250219"].input
      };
    }

    // Default to most cost-effective
    return {
      provider: "xai",
      model: "grok-2-1212",
      estimatedCostPer1000Tokens: AI_COSTS.xai["grok-2-1212"].input
    };
  }
}

export const aiCostManager = new AiCostManager();