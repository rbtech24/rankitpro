import twilio from 'twilio';
import { getReviewRequestSMSTemplate } from './sms-templates';

/**
 * SMS service for sending review requests via text messages
 */
class SMSService {
  private initialized: boolean = false;
  private twilioClient: twilio.Twilio | null = null;
  private twilioPhoneNumber: string | null = null;
  
  /**
   * Initialize the SMS service with Twilio
   */
  initialize(): boolean {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    
    if (accountSid && authToken && this.twilioPhoneNumber) {
      try {
        this.twilioClient = twilio(accountSid, authToken);
        this.initialized = true;
        console.log('[info] SMS service initialized successfully');
        return true;
      } catch (error) {
        console.error('Failed to initialize Twilio:', error);
        this.initialized = false;
        return false;
      }
    }
    console.warn('SMS service not initialized: Twilio credentials not set');
    return false;
  }

  /**
   * Checks if SMS functionality is available
   */
  isAvailable(): boolean {
    return this.initialized && 
           !!this.twilioClient && 
           !!this.twilioPhoneNumber && 
           !!process.env.TWILIO_ACCOUNT_SID && 
           !!process.env.TWILIO_AUTH_TOKEN;
  }

  /**
   * Sends a review request SMS to a customer
   */
  async sendReviewRequest(params: {
    to: string;
    customerName: string;
    companyName: string;
    technicianName: string;
    jobType: string;
    customMessage?: string;
  }): Promise<boolean> {
    if (!this.isAvailable()) {
      console.warn('SMS service unavailable: Twilio credentials not set or service not initialized');
      return false;
    }

    try {
      const { to, customerName, companyName, technicianName, jobType, customMessage } = params;
      
      // Generate SMS content
      const messageBody = getReviewRequestSMSTemplate({
        customerName,
        companyName,
        technicianName,
        jobType,
        customMessage
      });

      // Ensure phone number is in E.164 format
      const formattedPhoneNumber = this.formatPhoneNumber(to);
      
      // Send SMS using Twilio
      const message = await this.twilioClient!.messages.create({
        body: messageBody,
        from: this.twilioPhoneNumber!,
        to: formattedPhoneNumber
      });
      
      console.log(`Review request SMS sent to ${to}, SID: ${message.sid}`);
      return true;
    } catch (error) {
      console.error('Error sending review request SMS:', error);
      return false;
    }
  }

  /**
   * Format phone number to E.164 format for Twilio
   * This is a simple implementation - in production, you'd want more robust validation
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove any non-numeric characters
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    
    // Check if the number already has a country code
    if (digitsOnly.startsWith('1') && digitsOnly.length === 11) {
      return `+${digitsOnly}`;
    } 
    
    // Otherwise assume it's a US number without country code
    return `+1${digitsOnly}`;
  }
}

// Create a singleton instance
const smsService = new SMSService();
export default smsService;