import { Pool, neonConfig, neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleNode } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Client } = pkg;
import ws from "ws";
import * as schema from "@shared/schema";

// Configure Neon for optimal connection handling with better error handling
neonConfig.webSocketConstructor = ws;
neonConfig.pipelineConnect = false;
neonConfig.useSecureWebSocket = true;
neonConfig.fetchConnectionCache = true;
neonConfig.fetchTimeout = 15000; // Reduced timeout to fail faster
neonConfig.fetchRetries = 2;

async function createDatabaseConnection() {
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

  // Try Neon serverless first (preferred for production)
  console.log("🔄 Attempting Neon serverless connection...");
  try {
    const pool = new Pool({ 
      connectionString: databaseUrl,
      max: 5, // Conservative pool size
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 8000, // Shorter timeout to fail fast
      statement_timeout: 20000,
      application_name: 'rankitpro_saas'
    });
    
    // Quick connection test
    const testClient = await pool.connect();
    await testClient.query('SELECT 1');
    testClient.release();
    
    const db = drizzle({ client: pool, schema });
    console.log("✅ Neon serverless connection established");
    return { pool, db, connectionType: 'neon-serverless' };
    
  } catch (neonError) {
    console.warn("⚠️ Neon serverless connection failed, trying fallback:", 
      neonError instanceof Error ? neonError.message : String(neonError));
    
    // Fallback to standard PostgreSQL client
    console.log("🔄 Attempting standard PostgreSQL connection...");
    try {
      const client = new Client({
        connectionString: databaseUrl,
        connectionTimeoutMillis: 10000,
        query_timeout: 20000,
        statement_timeout: 20000,
        application_name: 'rankitpro_saas_fallback'
      });
      
      await client.connect();
      await client.query('SELECT 1');
      
      const db = drizzleNode(client, { schema });
      console.log("✅ Standard PostgreSQL connection established");
      return { pool: client, db, connectionType: 'standard-pg' };
      
    } catch (pgError) {
      console.error("❌ All database connection attempts failed");
      console.error("Neon error:", neonError instanceof Error ? neonError.message : String(neonError));
      console.error("PostgreSQL error:", pgError instanceof Error ? pgError.message : String(pgError));
      throw new Error("Failed to establish database connection with both Neon and standard PostgreSQL");
    }
  }
}

// Create database connection with error handling - use async initialization
let pool: Pool | Client;
let db: ReturnType<typeof drizzle> | ReturnType<typeof drizzleNode>;
let connectionType: string;

const initializeDatabase = async () => {
  try {
    const connection = await createDatabaseConnection();
    pool = connection.pool;
    db = connection.db;
    connectionType = connection.connectionType;
    return { pool, db, connectionType };
  } catch (error) {
    console.error("Critical database initialization error:", error);
    throw error;
  }
};

// Initialize connection immediately but handle it properly
const dbPromise = initializeDatabase();

// Export a promise-based db getter for initial startup
export const getDatabase = () => dbPromise;

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

// Export the initialized values after promise resolves
dbPromise.then(({ pool: p, db: d, connectionType: ct }) => {
  pool = p;
  db = d;
  connectionType = ct;
}).catch(() => {
  // Error already logged in initializeDatabase
});

export { pool, db, connectionType };
