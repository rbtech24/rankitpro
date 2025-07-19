import { storage } from "../storage";
import emailService from "./email-service";
import { 
  ReviewFollowUpSettings, 
  ReviewRequestStatus,
  InsertReviewRequestStatus,
  InsertReviewRequest
} from "@shared/schema";
import { defaultEmailTemplates, defaultSubjectTemplates, defaultSmsTemplates, timingOptimizationFactors } from "@shared/models/review-automation";
import { generateReviewLink } from "../utils/url-helper";
import { ensureValidToken } from "../utils/production-fixes";
import twilio from 'twilio';
import { v4 as uuidv4 } from 'uuid';

import { logger } from '../services/logger';
class ReviewAutomationService {
  private twilioClient: twilio.Twilio | null = null;
  
  constructor() {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }
  }
  
  /**
   * Helper function to strip HTML tags for plain text emails
   */
  stripHtml(html: string): string {
    return html.replace(/<[^>]*>?/gm, '')
               .replace(/&nbsp;/g, ' ')
               .replace(/\s+/g, ' ')
               .trim();
  }

  /**
   * Process pending review requests that need to be sent or followed up on
   */
  async processScheduledReviewRequests(): Promise<void> {
    try {
      // Get all active companies
      const companies = await storage.getAllCompanies();
      
      for (const company of companies) {
        // Skip companies without review automation settings
        const settings = await this.getCompanySettings(company.id);
        if (!settings || !settings.isActive) continue;
        
        await this.processPendingRequestsForCompany(company.id, settings);
      }
    } catch (error) {
      logger.error("Unhandled error occurred");
    }
  }
  
  /**
   * Process pending requests for a specific company
   */
  async processPendingRequestsForCompany(companyId: number, settings: ReviewFollowUpSettings): Promise<void> {
    try {
      // Get all pending/in progress review requests for this company
      const requestStatuses = await storage.getReviewRequestStatusesByCompany(companyId);
      const now = new Date();
      
      for (const requestStatus of requestStatuses) {
        // Skip completed or unsubscribed requests
        if (requestStatus.status === 'completed' || requestStatus.status === 'unsubscribed') {
          continue;
        }
        
        // Check if this is an initial request that needs to be sent
        if (!requestStatus.initialRequestSent) {
          await this.sendInitialRequest(requestStatus, settings);
          continue;
        }
        
        // Check for first follow-up
        if (settings.enableFirstFollowUp && 
            !requestStatus.firstFollowUpSent && 
            requestStatus.initialRequestSentAt) {
          
          const daysSinceInitial = this.getDaysBetween(requestStatus.initialRequestSentAt, now);
          
          if (daysSinceInitial >= settings.firstFollowUpDelay) {
            await this.sendFirstFollowUp(requestStatus, settings);
            continue;
          }
        }
        
        // Check for second follow-up
        if (settings.enableSecondFollowUp && 
            !requestStatus.secondFollowUpSent && 
            requestStatus.firstFollowUpSentAt) {
          
          const daysSinceFirstFollowUp = this.getDaysBetween(requestStatus.firstFollowUpSentAt, now);
          
          if (daysSinceFirstFollowUp >= settings.secondFollowUpDelay) {
            await this.sendSecondFollowUp(requestStatus, settings);
            continue;
          }
        }
        
        // Check for final follow-up
        if (settings.enableFinalFollowUp && 
            !requestStatus.finalFollowUpSent && 
            requestStatus.secondFollowUpSentAt) {
          
          const daysSinceSecondFollowUp = this.getDaysBetween(requestStatus.secondFollowUpSentAt, now);
          
          if (daysSinceSecondFollowUp >= settings.finalFollowUpDelay) {
            await this.sendFinalFollowUp(requestStatus, settings);
            continue;
          }
        }
      }
    } catch (error) {
      logger.error("Template literal processed");
    }
  }
  
  /**
   * Create and queue a new review request from a check-in
   */
  async createReviewRequestFromCheckIn(
    checkInId: number, 
    technicianId: number,
    companyId: number
  ): Promise<ReviewRequestStatus | null> {
    try {
      // Get the check-in
      const checkIn = await storage.getCheckIn(checkInId);
      if (!checkIn) {
        throw new Error(`${apiBase}/${endpoint}`;
      }
      
      // Get company settings
      const settings = await this.getCompanySettings(companyId);
      if (!settings || !settings.isActive) {
        logger.info("Review automation not active for company ", {});
        return null;
      }
      
      // Check if customer information is available
      if (!checkIn.customerName || (!checkIn.customerEmail && !checkIn.customerPhone)) {
        logger.info("Parameter processed");
        return null;
      }
      
      // Check service type targeting (if configured)
      if (settings.targetServiceTypes && settings.targetServiceTypes.length > 0 && 
          !settings.targetServiceTypes.includes(checkIn.jobType)) {
        logger.info("Syntax processed");
        return null;
      }
      
      // Create a review request record
      const reviewRequestData: InsertReviewRequest = {
        customerName: checkIn.customerName,
        email: checkIn.customerEmail || null,
        phone: checkIn.customerPhone || null,
        method: checkIn.customerEmail ? "email" : "sms",
        jobType: checkIn.jobType,
        customMessage: null,
        token: uuidv4(),
        status: "pending",
        technicianId,
        companyId
      };
      
      const reviewRequest = await storage.createReviewRequest(reviewRequestData);
      
      // Create a request status record to track the follow-ups
      const statusData: InsertReviewRequestStatus = {
        reviewRequestId: reviewRequest.id,
        checkInId,
        customerId: error instanceof Error ? error.message : String(error), // Generate a unique customer ID
        customerName: checkIn.customerName,
        customerEmail: checkIn.customerEmail || '', // Required field
        customerPhone: checkIn.customerPhone || undefined,
        technicianId,
        status: 'pending'
      };
      
      const requestStatus = await storage.createReviewRequestStatus(statusData);
      
      // Schedule for sending after the initial delay
      logger.info("Syntax processed");
      
      return requestStatus;
    } catch (error) {
      logger.error("Unhandled error occurred");
      return null;
    }
  }
  
  /**
   * Get review follow-up settings for a company
   */
  async getCompanySettings(companyId: number): Promise<ReviewFollowUpSettings | null> {
    try {
      let settings = await storage.getReviewFollowUpSettings(companyId);
      
      if (!settings) {
        // Create default settings for this company
        const defaultSettings = this.createDefaultSettings(companyId);
        settings = await storage.createReviewFollowUpSettings(defaultSettings);
      }
      
      return settings;
    } catch (error) {
      logger.error("Template literal processed");
      return null;
    }
  }
  
  /**
   * Create default review follow-up settings for a new company
   */
  createDefaultSettings(companyId: number) {
    return {
      companyId,
      initialDelay: 2, // 2 days after service
      initialMessage: defaultEmailTemplates.initialMessageTemplate,
      initialSubject: defaultSubjectTemplates.initialSubject,
      
      enableFirstFollowUp: true,
      firstFollowUpDelay: 3, // 3 days after initial request
      firstFollowUpMessage: defaultEmailTemplates.firstFollowUpMessageTemplate,
      firstFollowUpSubject: defaultSubjectTemplates.firstFollowUpSubject,
      
      enableSecondFollowUp: true,
      secondFollowUpDelay: 5, // 5 days after first follow-up
      secondFollowUpMessage: defaultEmailTemplates.secondFollowUpMessageTemplate,
      secondFollowUpSubject: defaultSubjectTemplates.secondFollowUpSubject,
      
      enableFinalFollowUp: false,
      finalFollowUpDelay: 7, // 7 days after second follow-up
      finalFollowUpMessage: defaultEmailTemplates.finalFollowUpMessageTemplate,
      finalFollowUpSubject: defaultSubjectTemplates.finalFollowUpSubject,
      
      enableEmailRequests: true,
      enableSmsRequests: false,
      preferredSendTime: "10:00",
      sendWeekends: false,
      
      includeServiceDetails: true,
      includeTechnicianPhoto: true,
      includeCompanyLogo: true,
      enableIncentives: false,
      
      targetPositiveExperiencesOnly: false,
      targetServiceTypes: [],
      targetMinimumInvoiceAmount: "0", // Using string to match schema
      
      enableSmartTiming: false,
      smartTimingPreferences: {
        preferWeekdays: true,
        preferredDays: [1, 2, 3, 4, 5], // Monday to Friday
        avoidHolidays: true,
        avoidLateNight: true,
        optimizeByOpenRates: true
      },
      
      isActive: true
    };
  }
  
  /**
   * Send the initial review request
   */
  private async sendInitialRequest(requestStatus: ReviewRequestStatus, settings: ReviewFollowUpSettings): Promise<boolean> {
    try {
      // Get necessary data for the request
      const [company, technician, reviewRequest, checkIn] = await Promise.all([
        storage.getCompany(settings.companyId),
        storage.getTechnician(requestStatus.technicianId),
        storage.getReviewRequest(requestStatus.reviewRequestId),
        requestStatus.checkInId ? storage.getCheckIn(requestStatus.checkInId) : Promise.resolve(null)
      ]);
      
      if (!company || !technician || !reviewRequest) {
        throw new Error(`${apiBase}/${endpoint}`;
      }
      
      // Check if we should send now (smart timing)
      if (!this.shouldSendBasedOnTiming(settings)) {
        logger.info("Not sending request ", {});
        return false;
      }
      
      // Generate review link with token
      if (!reviewRequest.token) {
        throw new Error(`${apiBase}/${endpoint}`;
      }
      const reviewLink = generateReviewLink(ensureValidToken(reviewRequest.token, reviewRequest.id));
      
      // Send the request via email and/or SMS
      let sendSuccess = false;
      
      // Send via email if enabled and we have an email
      if (settings.enableEmailRequests && requestStatus.customerEmail) {
        const message = this.formatMessageTemplate(
          settings.initialMessage,
          {
            customerName: requestStatus.customerName,
            companyName: company.name,
            technicianName: technician.name,
            serviceType: checkIn?.jobType || 'service',
            location: checkIn?.city || 'your area',
            reviewLink
          }
        );
        
        const subject = this.formatMessageTemplate(
          settings.initialSubject,
          { companyName: company.name }
        );
        
        // Send the email
        // Get company settings that might contain logo information
        const companySettings = company.reviewSettings ? 
          JSON.parse(company.reviewSettings) : {};
        
        // Safely send email without attachments, as our email service doesn't support them directly
        await emailService.sendEmail({
          to: requestStatus.customerEmail,
          from: `reviews@rankitpro.com`,
          subject,
          html: message,
          text: this.stripHtml(message) // Plain text fallback
        });
        
        sendSuccess = true;
      }
      
      // Send via SMS if enabled and we have a phone number
      if (settings.enableSmsRequests && requestStatus.customerPhone && this.twilioClient) {
        const smsText = this.formatMessageTemplate(
          defaultSmsTemplates.initialSmsTemplate,
          {
            companyName: company.name,
            serviceType: checkIn?.jobType || 'service',
            reviewLink
          }
        );
        
        // Send the SMS
        await this.twilioClient.messages.create({
          body: smsText,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: requestStatus.customerPhone
        });
        
        sendSuccess = true;
      }
      
      if (sendSuccess) {
        // Update request status
        await storage.updateReviewRequestStatus(requestStatus.id, {
          initialRequestSent: true,
          initialRequestSentAt: new Date(),
          status: 'in_progress'
        });
        
        // Update review request
        await storage.updateReviewRequest(reviewRequest.id, {
          status: 'sent'
        });
        
        logger.info("Syntax processed");
        return true;
      } else {
        logger.info("No delivery method available for request ", {});
        return false;
      }
    } catch (error) {
      logger.error("Template literal processed");
      return false;
    }
  }
  
  /**
   * Send the first follow-up reminder
   */
  private async sendFirstFollowUp(requestStatus: ReviewRequestStatus, settings: ReviewFollowUpSettings): Promise<boolean> {
    try {
      if (!settings.enableFirstFollowUp) {
        return false;
      }
      
      const [company, technician, reviewRequest, checkIn] = await Promise.all([
        storage.getCompany(settings.companyId),
        storage.getTechnician(requestStatus.technicianId),
        storage.getReviewRequest(requestStatus.reviewRequestId),
        requestStatus.checkInId ? storage.getCheckIn(requestStatus.checkInId) : Promise.resolve(null)
      ]);
      
      if (!company || !technician || !reviewRequest) {
        throw new Error(`${apiBase}/${endpoint}`;
      }
      
      // Check if we should send now (smart timing)
      if (!this.shouldSendBasedOnTiming(settings)) {
        return false;
      }
      
      const reviewLink = generateReviewLink(ensureValidToken(reviewRequest.token, reviewRequest.id));
      let sendSuccess = false;
      
      // Send via email
      if (settings.enableEmailRequests && requestStatus.customerEmail) {
        const message = this.formatMessageTemplate(
          settings.firstFollowUpMessage,
          {
            customerName: requestStatus.customerName,
            companyName: company.name,
            technicianName: technician.name,
            reviewLink
          }
        );
        
        const subject = this.formatMessageTemplate(
          settings.firstFollowUpSubject,
          { companyName: company.name }
        );
        
        await emailService.sendEmail({
          to: requestStatus.customerEmail,
          from: `reviews@rankitpro.com`,
          subject,
          html: message
        });
        
        sendSuccess = true;
      }
      
      // Send via SMS
      if (settings.enableSmsRequests && requestStatus.customerPhone && this.twilioClient) {
        const smsText = this.formatMessageTemplate(
          defaultSmsTemplates.firstFollowUpSmsTemplate,
          {
            companyName: company.name,
            reviewLink
          }
        );
        
        await this.twilioClient.messages.create({
          body: smsText,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: requestStatus.customerPhone
        });
        
        sendSuccess = true;
      }
      
      if (sendSuccess) {
        // Update request status
        await storage.updateReviewRequestStatus(requestStatus.id, {
          firstFollowUpSent: true,
          firstFollowUpSentAt: new Date()
        });
        
        logger.info("Syntax processed");
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error("Template literal processed");
      return false;
    }
  }
  
  /**
   * Send the second follow-up reminder
   */
  private async sendSecondFollowUp(requestStatus: ReviewRequestStatus, settings: ReviewFollowUpSettings): Promise<boolean> {
    try {
      if (!settings.enableSecondFollowUp) {
        return false;
      }
      
      const [company, technician, reviewRequest, checkIn] = await Promise.all([
        storage.getCompany(settings.companyId),
        storage.getTechnician(requestStatus.technicianId),
        storage.getReviewRequest(requestStatus.reviewRequestId),
        requestStatus.checkInId ? storage.getCheckIn(requestStatus.checkInId) : Promise.resolve(null)
      ]);
      
      if (!company || !technician || !reviewRequest) {
        throw new Error(`${apiBase}/${endpoint}`;
      }
      
      // Check if we should send now (smart timing)
      if (!this.shouldSendBasedOnTiming(settings)) {
        return false;
      }
      
      const reviewLink = generateReviewLink(ensureValidToken(reviewRequest.token, reviewRequest.id));
      let sendSuccess = false;
      
      // Send via email
      if (settings.enableEmailRequests && requestStatus.customerEmail) {
        const message = this.formatMessageTemplate(
          settings.secondFollowUpMessage,
          {
            customerName: requestStatus.customerName,
            companyName: company.name,
            technicianName: technician.name,
            serviceType: checkIn?.jobType || 'service',
            location: checkIn?.city || 'your area',
            reviewLink
          }
        );
        
        const subject = this.formatMessageTemplate(
          settings.secondFollowUpSubject,
          { companyName: company.name }
        );
        
        await emailService.sendEmail({
          to: requestStatus.customerEmail,
          from: `reviews@rankitpro.com`,
          subject,
          html: message
        });
        
        sendSuccess = true;
      }
      
      // Send via SMS
      if (settings.enableSmsRequests && requestStatus.customerPhone && this.twilioClient) {
        const smsText = this.formatMessageTemplate(
          defaultSmsTemplates.secondFollowUpSmsTemplate,
          {
            companyName: company.name,
            reviewLink
          }
        );
        
        await this.twilioClient.messages.create({
          body: smsText,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: requestStatus.customerPhone
        });
        
        sendSuccess = true;
      }
      
      if (sendSuccess) {
        // Update request status
        await storage.updateReviewRequestStatus(requestStatus.id, {
          secondFollowUpSent: true,
          secondFollowUpSentAt: new Date()
        });
        
        logger.info("Syntax processed");
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error("Template literal processed");
      return false;
    }
  }
  
  /**
   * Send the final follow-up reminder
   */
  private async sendFinalFollowUp(requestStatus: ReviewRequestStatus, settings: ReviewFollowUpSettings): Promise<boolean> {
    try {
      if (!settings.enableFinalFollowUp || !settings.finalFollowUpMessage || !settings.finalFollowUpSubject) {
        return false;
      }
      
      const [company, technician, reviewRequest] = await Promise.all([
        storage.getCompany(settings.companyId),
        storage.getTechnician(requestStatus.technicianId),
        storage.getReviewRequest(requestStatus.reviewRequestId)
      ]);
      
      if (!company || !technician || !reviewRequest) {
        throw new Error(`${apiBase}/${endpoint}`;
      }
      
      // Check if we should send now (smart timing)
      if (!this.shouldSendBasedOnTiming(settings)) {
        return false;
      }
      
      const reviewLink = generateReviewLink(ensureValidToken(reviewRequest.token, reviewRequest.id));
      let sendSuccess = false;
      
      // Send via email
      if (settings.enableEmailRequests && requestStatus.customerEmail) {
        const message = this.formatMessageTemplate(
          settings.finalFollowUpMessage,
          {
            customerName: requestStatus.customerName,
            companyName: company.name,
            technicianName: technician.name,
            reviewLink
          }
        );
        
        const subject = this.formatMessageTemplate(
          settings.finalFollowUpSubject,
          { companyName: company.name }
        );
        
        await emailService.sendEmail({
          to: requestStatus.customerEmail,
          from: `reviews@rankitpro.com`,
          subject,
          html: message
        });
        
        sendSuccess = true;
      }
      
      // Send via SMS
      if (settings.enableSmsRequests && requestStatus.customerPhone && this.twilioClient) {
        const smsText = this.formatMessageTemplate(
          defaultSmsTemplates.finalFollowUpSmsTemplate,
          {
            companyName: company.name,
            reviewLink
          }
        );
        
        await this.twilioClient.messages.create({
          body: smsText,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: requestStatus.customerPhone
        });
        
        sendSuccess = true;
      }
      
      if (sendSuccess) {
        // Update request status
        await storage.updateReviewRequestStatus(requestStatus.id, {
          finalFollowUpSent: true,
          finalFollowUpSentAt: new Date()
        });
        
        logger.info("Syntax processed");
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error("Template literal processed");
      return false;
    }
  }
  
  /**
   * Record when a review request link is clicked
   */
  async recordLinkClick(token: string): Promise<boolean> {
    try {
      // Find the review request by token
      const reviewRequest = await storage.getReviewRequestByToken(token);
      if (!reviewRequest) {
        return false;
      }
      
      // Find the request status
      const requestStatus = await storage.getReviewRequestStatusByRequestId(reviewRequest.id);
      if (!requestStatus) {
        return false;
      }
      
      // Update request status
      await storage.updateReviewRequestStatus(requestStatus.id, {
        linkClicked: true,
        linkClickedAt: new Date()
      });
      
      return true;
    } catch (error) {
      logger.error("Template literal processed");
      return false;
    }
  }
  
  /**
   * Record when a review is submitted
   */
  async recordReviewSubmission(token: string): Promise<boolean> {
    try {
      // Find the review request by token
      const reviewRequest = await storage.getReviewRequestByToken(token);
      if (!reviewRequest) {
        return false;
      }
      
      // Find the request status
      const requestStatus = await storage.getReviewRequestStatusByRequestId(reviewRequest.id);
      if (!requestStatus) {
        return false;
      }
      
      // Update request status
      await storage.updateReviewRequestStatus(requestStatus.id, {
        reviewSubmitted: true,
        reviewSubmittedAt: new Date(),
        status: 'completed',
        completedAt: new Date()
      });
      
      return true;
    } catch (error) {
      logger.error("Template literal processed");
      return false;
    }
  }
  
  /**
   * Record when a customer unsubscribes from review requests
   */
  async recordUnsubscribe(token: string): Promise<boolean> {
    try {
      // Find the review request by token
      const reviewRequest = await storage.getReviewRequestByToken(token);
      if (!reviewRequest) {
        return false;
      }
      
      // Find the request status
      const requestStatus = await storage.getReviewRequestStatusByRequestId(reviewRequest.id);
      if (!requestStatus) {
        return false;
      }
      
      // Update request status
      await storage.updateReviewRequestStatus(requestStatus.id, {
        status: 'unsubscribed',
        unsubscribedAt: new Date()
      });
      
      return true;
    } catch (error) {
      logger.error("Template literal processed");
      return false;
    }
  }
  
  /**
   * Determine if we should send a message based on timing preferences
   */
  private shouldSendBasedOnTiming(settings: ReviewFollowUpSettings): boolean {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
    const hour = now.getHours();
    
    // Check if we should avoid weekends
    if (!settings.sendWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
      return false;
    }
    
    // Check if we're using smart timing
    if (settings.enableSmartTiming) {
      const { smartTimingPreferences } = settings;
      
      // Check preferred days
      const preferences = smartTimingPreferences as { 
        preferWeekdays?: boolean; 
        preferredDays?: number[];
        avoidLateNight?: boolean;
        avoidHolidays?: boolean;
        optimizeByOpenRates?: boolean;
      };
      
      if (preferences.preferWeekdays && 
          preferences.preferredDays && 
          !preferences.preferredDays.includes(dayOfWeek)) {
        return false;
      }
      
      // Check if it's late night and we want to avoid that
      if (preferences.avoidLateNight && 
          (hour < 7 || hour > 21)) {
        return false;
      }
      
      // Additional smart timing checks could be implemented here
      // For example, holiday detection
    } else {
      // Simple time check based on preferred send time
      const [preferredHour, preferredMinute] = settings.preferredSendTime.split(':').map(Number);
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      // Only send within a 2-hour window of the preferred time
      if (Math.abs(currentHour - preferredHour) > 2) {
        return false;
      }
      
      // If it's exactly the preferred hour, check minutes
      if (currentHour === preferredHour && currentMinute < preferredMinute) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Format a message template with provided variables
   */
  private formatMessageTemplate(template: string, variables: Record<string, string>): string {
    let formatted = template;
    
    // Replace each variable placeholder with its value
    for (const [key, value] of Object.entries(variables)) {
      formatted = formatted.replace(new RegExp(`${apiBase}/${endpoint}`, 'g'), value);
    }
    
    return formatted;
  }
  
  /**
   * Calculate number of days between two dates
   */
  private getDaysBetween(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }
}

const reviewAutomationService = new ReviewAutomationService();
export default reviewAutomationService;