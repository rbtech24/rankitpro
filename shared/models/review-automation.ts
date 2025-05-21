import { z } from 'zod';

// Define the schema for automated review follow-up settings
export const reviewFollowUpSettingsSchema = z.object({
  // Initial request settings
  initialDelay: z.number().min(0).default(2), // Days after service completion
  initialMessage: z.string().min(10),
  initialSubject: z.string().min(3),
  
  // First follow-up settings
  enableFirstFollowUp: z.boolean().default(true),
  firstFollowUpDelay: z.number().min(1).default(3), // Days after initial request
  firstFollowUpMessage: z.string().min(10),
  firstFollowUpSubject: z.string().min(3),
  
  // Second follow-up settings
  enableSecondFollowUp: z.boolean().default(true),
  secondFollowUpDelay: z.number().min(1).default(5), // Days after first follow-up
  secondFollowUpMessage: z.string().min(10),
  secondFollowUpSubject: z.string().min(3),
  
  // Final follow-up settings
  enableFinalFollowUp: z.boolean().default(false),
  finalFollowUpDelay: z.number().min(1).default(7), // Days after second follow-up
  finalFollowUpMessage: z.string().min(10).optional(),
  finalFollowUpSubject: z.string().min(3).optional(),
  
  // Channels and time settings
  enableEmailRequests: z.boolean().default(true),
  enableSmsRequests: z.boolean().default(false),
  preferredSendTime: z.string().default('10:00'), // Time of day to send in 24h format
  sendWeekends: z.boolean().default(false),
  
  // Additional options
  includeServiceDetails: z.boolean().default(true),
  includeTechnicianPhoto: z.boolean().default(true),
  includeCompanyLogo: z.boolean().default(true),
  enableIncentives: z.boolean().default(false),
  incentiveDetails: z.string().optional(),
  
  // Targeting and optimization
  targetPositiveExperiencesOnly: z.boolean().default(false),
  targetServiceTypes: z.array(z.string()).default([]),
  targetMinimumInvoiceAmount: z.number().min(0).default(0),
  
  // Smart timing options
  enableSmartTiming: z.boolean().default(false),
  smartTimingPreferences: z.object({
    preferWeekdays: z.boolean().default(true),
    preferredDays: z.array(z.number().min(0).max(6)).default([1, 2, 3, 4, 5]), // 0 = Sunday, 6 = Saturday
    avoidHolidays: z.boolean().default(true),
    avoidLateNight: z.boolean().default(true),
    optimizeByOpenRates: z.boolean().default(true)
  }).default({}),
  
  // Status
  isActive: z.boolean().default(true),
  companyId: z.number(),
});

// Define the schema for review request status tracking
export const reviewRequestStatusSchema = z.object({
  id: z.number(),
  reviewRequestId: z.number(),
  checkInId: z.number().optional(),
  customerId: z.string(),
  customerName: z.string(),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  
  // Request tracking
  initialRequestSent: z.boolean().default(false),
  initialRequestSentAt: z.date().optional(),
  firstFollowUpSent: z.boolean().default(false),
  firstFollowUpSentAt: z.date().optional(),
  secondFollowUpSent: z.boolean().default(false),
  secondFollowUpSentAt: z.date().optional(),
  finalFollowUpSent: z.boolean().default(false),
  finalFollowUpSentAt: z.date().optional(),
  
  // Response tracking
  linkClicked: z.boolean().default(false),
  linkClickedAt: z.date().optional(),
  reviewSubmitted: z.boolean().default(false),
  reviewSubmittedAt: z.date().optional(),
  
  // Status
  status: z.enum(['pending', 'in_progress', 'completed', 'unsubscribed']).default('pending'),
  unsubscribedAt: z.date().optional(),
  completedAt: z.date().optional(),
  technicianId: z.number(),
  createdAt: z.date().default(() => new Date()),
});

// Export types derived from schemas
export type ReviewFollowUpSettings = z.infer<typeof reviewFollowUpSettingsSchema>;
export type ReviewRequestStatus = z.infer<typeof reviewRequestStatusSchema>;

// Default templates for review requests
export const defaultEmailTemplates = {
  initialMessageTemplate: 
  `Dear {{customerName}},

Thank you for choosing {{companyName}} for your recent {{serviceType}} service. We hope that {{technicianName}} provided an excellent experience.

Would you take a moment to share your feedback with a quick review? It only takes 30 seconds and helps us continue to provide great service to you and others in the {{location}} area.

Click here to leave a review: {{reviewLink}}

Thank you for your time!

Best regards,
The {{companyName}} Team`,

  firstFollowUpMessageTemplate:
  `Hi {{customerName}},

We just wanted to follow up about your recent service with {{technicianName}}. Your opinion is valuable to us, and we'd appreciate if you could take a moment to share your experience.

Leave a quick review here: {{reviewLink}}

Thank you!

{{companyName}}`,

  secondFollowUpMessageTemplate:
  `Hello {{customerName}},

We noticed you haven't had a chance to leave us a review yet. We'd still love to hear about your experience with {{technicianName}} during your recent {{serviceType}} service.

Your feedback helps us improve and assists others looking for quality service in the {{location}} area.

Share your thoughts here: {{reviewLink}}

Thanks again for choosing {{companyName}}.`,

  finalFollowUpMessageTemplate:
  `Hi {{customerName}},

This is our final reminder about leaving a review for your recent service. We value your feedback and would appreciate hearing about your experience with us.

If you have a moment, please click here to share your thoughts: {{reviewLink}}

Thank you for being a valued customer.

The {{companyName}} Team`
};

// Subject line templates
export const defaultSubjectTemplates = {
  initialSubject: "How was your service with {{companyName}}?",
  firstFollowUpSubject: "Your feedback matters to {{companyName}}",
  secondFollowUpSubject: "A quick reminder about your {{companyName}} service",
  finalFollowUpSubject: "Last chance to share your {{companyName}} experience"
};

// SMS templates (shorter than email)
export const defaultSmsTemplates = {
  initialSmsTemplate: 
  "{{companyName}}: Thanks for choosing us for your {{serviceType}} service! Please share your experience with a quick review: {{reviewLink}}",
  
  firstFollowUpSmsTemplate:
  "{{companyName}} here! We'd love to hear about your recent service. Please share your feedback: {{reviewLink}}",
  
  secondFollowUpSmsTemplate:
  "{{companyName}}: Your feedback matters! Please take a moment to review your recent service: {{reviewLink}}",
  
  finalFollowUpSmsTemplate:
  "{{companyName}}: Final reminder to share your thoughts on your recent service experience: {{reviewLink}}"
};

// Smart timing optimization mapping
export const timingOptimizationFactors = {
  // Day of week response rates based on industry research (relative scale)
  dayOfWeekFactors: [0.85, 1.05, 1.15, 1.10, 1.05, 0.95, 0.75], // Sun to Sat
  
  // Hour of day response rates (24-hour format, relative scale)
  hourOfDayFactors: [
    0.3, 0.2, 0.1, 0.1, 0.1, 0.2, // 0-5 (midnight to 5am)
    0.4, 0.7, 1.0, 1.2, 1.1, 1.0, // 6-11 (morning)
    0.9, 0.8, 0.8, 0.9, 1.0, 1.1, // 12-17 (afternoon)
    1.2, 1.3, 1.1, 0.9, 0.7, 0.5  // 18-23 (evening)
  ]
};