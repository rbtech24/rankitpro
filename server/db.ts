import { Pool, neonConfig, neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure Neon for optimal connection handling
neonConfig.webSocketConstructor = ws;
neonConfig.pipelineConnect = false;
neonConfig.useSecureWebSocket = true;

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
    // Create connection pool with optimized settings for Neon
    const pool = new Pool({ 
      connectionString: databaseUrl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      statement_timeout: 30000
    });
    
    const db = drizzle({ client: pool, schema });
    
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
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await queryFn();
    } catch (error) {
      lastError = error as Error;
      
      // Check if it's a connection-related error
      if (error instanceof Error && (
        error.message.includes('Control plane request failed') ||
        error.message.includes('connection') ||
        error.message.includes('timeout')
      )) {
        console.warn(`Database query attempt ${attempt}/${maxRetries} failed:`, error.message);
        
        if (attempt < maxRetries) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, attempt - 1) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      // If it's not a connection error, don't retry
      throw error;
    }
  }
  
  throw lastError!;
}

export { pool, db };
