import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

function createDatabaseConnection() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error("\n❌ DATABASE CONFIGURATION ERROR");
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("DATABASE_URL environment variable is not configured.");
    console.error("");
    console.error("DEPLOYMENT PLATFORM INSTRUCTIONS:");
    console.error("");
    console.error("🔸 Render.com:");
    console.error("  1. Create a PostgreSQL database in your Render dashboard");
    console.error("  2. Copy the 'External Database URL'");
    console.error("  3. Add DATABASE_URL to your web service environment variables");
    console.error("");
    console.error("🔸 Heroku:");
    console.error("  heroku config:set DATABASE_URL=postgresql://...");
    console.error("");
    console.error("🔸 Railway:");
    console.error("  railway variables set DATABASE_URL=postgresql://...");
    console.error("");
    console.error("🔸 Other platforms:");
    console.error("  Set DATABASE_URL to your PostgreSQL connection string");
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    throw new Error("DATABASE_URL must be configured in your deployment platform's environment variables");
  }

  try {
    // Always use SSL for production deployments to ensure reliable connections
    // This works consistently for both Render external URLs and other cloud providers
    const isProduction = process.env.NODE_ENV === 'production';
    const isCloudDatabase = databaseUrl.includes('.render.com') || 
                           databaseUrl.includes('.amazonaws.com') || 
                           databaseUrl.includes('.digitalocean.com') ||
                           databaseUrl.includes('.internal');
    
    const useSSL = isProduction || isCloudDatabase;
    
    console.log(`Database connection mode: ${isProduction ? 'production' : 'development'}, SSL: ${useSSL}`);
    
    // Create connection pool with reliable settings
    const pool = new Pool({ 
      connectionString: databaseUrl,
      ssl: useSSL ? { rejectUnauthorized: false } : false,
      max: 5, // Reasonable pool size
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000, // Longer timeout for cloud connections
      application_name: 'rankitpro_saas'
    });
    
    const db = drizzle(pool, { schema });
    
    console.log("✅ Database connection initialized");
    return { pool, db };
  } catch (error) {
    console.error("❌ Database connection failed:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}

// Create database connection with error handling
let pool: Pool;
let db: ReturnType<typeof drizzle>;

try {
  const connection = createDatabaseConnection();
  pool = connection.pool;
  db = connection.db;
} catch (error) {
  console.error("Critical database initialization error:", error);
  throw error;
}

// Create a query function with retry logic for critical operations
export async function queryWithRetry<T>(
  queryFn: () => Promise<T>, 
  maxRetries: number = 5
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await queryFn();
    } catch (error: any) {
      lastError = error as Error;
      
      // Check if it's a connection-related error or timeout
      const isConnectionError = error instanceof Error && (
        error.message.includes('Control plane request failed') ||
        error.message.includes('connection') ||
        error.message.includes('timeout') ||
        error.message.includes('Connect Timeout') ||
        error.message.includes('fetch failed') ||
        (error as any).code === 'UND_ERR_CONNECT_TIMEOUT'
      );
      
      if (isConnectionError) {
        console.warn(`Database query attempt ${attempt}/${maxRetries} failed:`, error.message);
        
        if (attempt < maxRetries) {
          // Longer backoff for connection errors: 2s, 5s, 10s, 20s, 30s
          const delay = Math.min(2000 * Math.pow(2, attempt - 1), 30000);
          console.log(`Retrying in ${delay/1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        } else {
          throw new Error(`Database connection failed after ${maxRetries} attempts. Connection timeout errors detected.`);
        }
      }
      
      // If it's not a connection error, don't retry
      throw error;
    }
  }
  
  throw lastError!;
}

export { pool, db };
