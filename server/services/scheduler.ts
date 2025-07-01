import reviewAutomationService from './review-automation-service';
import { log } from '../vite-safe';

/**
 * Service for handling scheduled tasks in the system.
 * Manages periodic jobs such as review follow-up processing.
 */
class SchedulerService {
  private reviewProcessorInterval: NodeJS.Timeout | null = null;
  
  /**
   * Initialize the scheduler and set up recurring jobs
   */
  initialize() {
    log('Initializing scheduler service...', 'scheduler');
    
    // Schedule the review automation processor to run every hour
    this.reviewProcessorInterval = setInterval(() => {
      this.processReviewFollowUps();
    }, 60 * 60 * 1000); // Every hour
    
    // Run once at startup
    setTimeout(() => {
      this.processReviewFollowUps();
    }, 10 * 1000); // 10 seconds after startup
    
    log('Scheduler service initialized.', 'scheduler');
  }
  
  /**
   * Stop all scheduled jobs
   */
  shutdown() {
    log('Shutting down scheduler service...', 'scheduler');
    
    if (this.reviewProcessorInterval) {
      clearInterval(this.reviewProcessorInterval);
      this.reviewProcessorInterval = null;
    }
    
    log('Scheduler service shut down.', 'scheduler');
  }
  
  /**
   * Process review follow-ups
   */
  private async processReviewFollowUps() {
    try {
      log('Running scheduled review follow-up processor...', 'scheduler');
      await reviewAutomationService.processScheduledReviewRequests();
      log('Review follow-up processing completed.', 'scheduler');
    } catch (error) {
      log(`Error processing review follow-ups: ${error}`, 'scheduler');
    }
  }
}

const schedulerService = new SchedulerService();
export default schedulerService;