/**
 * SMS template service for generating text message content
 */

interface ReviewRequestSMSParams {
  customerName: string;
  companyName: string;
  technicianName: string;
  jobType: string;
  customMessage?: string;
}

/**
 * Generates a review request SMS template
 * SMS messages need to be concise and clear with a direct call to action
 */
export function getReviewRequestSMSTemplate(params: ReviewRequestSMSParams): string {
  const { customerName, companyName, technicianName, jobType, customMessage } = params;
  
  // Generate a shortened review link (in a real app, this would be a unique trackable link)
  const reviewLink = `https://review.app/${encodeURIComponent(companyName.toLowerCase().replace(/\s+/g, '-'))}`;
  
  // Build the SMS message content - keep it concise for SMS
  let message = `Hi ${customerName}, thanks for choosing ${companyName} for your ${jobType} service. How was your experience with ${technicianName}? `; 
  
  // Add custom message if provided
  if (customMessage) {
    message += `${customMessage} `;
  }
  
  // Add call to action with review link
  message += `Please rate us here: ${reviewLink}`;
  
  return message;
}