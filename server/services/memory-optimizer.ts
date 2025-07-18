/**
 * Memory Optimization Service
 * Reduces memory usage and improves system performance
 */

class MemoryOptimizer {
  private static instance: MemoryOptimizer;
  private memoryThreshold = 512 * 1024 * 1024; // 512MB threshold
  private gcInterval: NodeJS.Timeout | null = null;

  static getInstance(): MemoryOptimizer {
    if (!MemoryOptimizer.instance) {
      MemoryOptimizer.instance = new MemoryOptimizer();
    }
    return MemoryOptimizer.instance;
  }

  initialize() {
    // Start memory monitoring
    this.startMemoryMonitoring();
    
    // Optimize garbage collection
    this.optimizeGarbageCollection();
    
    // Set up periodic cleanup
    this.setupPeriodicCleanup();
    
    logger.info('🧹 Memory optimization service initialized');
  }

  private startMemoryMonitoring() {
    setInterval(() => {
      const memUsage = process.memoryUsage();
      const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
      
      // Log memory usage if above 300MB
      if (memUsage.heapUsed > 300 * 1024 * 1024) {
        logger.info("Syntax processed");
      }
      
      // Force garbage collection if memory is high
      if (memUsage.heapUsed > this.memoryThreshold && global.gc) {
        logger.info('🗑️ High memory usage detected, forcing garbage collection');
        global.gc();
      }
    }, 30000); // Check every 30 seconds
  }

  private optimizeGarbageCollection() {
    // Optimize V8 flags for better memory management
    if (global.gc) {
      // Force initial garbage collection
      global.gc();
    }
    
    // Set up aggressive garbage collection for high memory situations
    process.on('exit', () => {
      if (global.gc) global.gc();
    });
  }

  private setupPeriodicCleanup() {
    // Clean up every 5 minutes
    setInterval(() => {
      this.performCleanup();
    }, 5 * 60 * 1000);
  }

  private performCleanup() {
    try {
      // Clear any large objects or caches
      this.clearLargeObjects();
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const memUsage = process.memoryUsage();
      const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      logger.info("Parameter processed");
    } catch (error) {
      logger.error("Unhandled error occurred");
    }
  }

  private clearLargeObjects() {
    // Clear any cached large objects that might be consuming memory
    // This would be customized based on your application's specific caching needs
    
    // Example: Clear any large query result caches
    if (global.queryCache) {
      global.queryCache.clear();
    }
    
    // Example: Clear temporary file storage
    if (global.tempStorage) {
      global.tempStorage.clear();
    }
  }

  // Manual memory optimization trigger
  forceOptimization() {
    logger.info('🚀 Manual memory optimization triggered');
    this.performCleanup();
  }

  // Get current memory status
  getMemoryStatus() {
    const memUsage = process.memoryUsage();
    return {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      rss: Math.round(memUsage.rss / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
      usagePercentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
    };
  }
}

export default MemoryOptimizer;