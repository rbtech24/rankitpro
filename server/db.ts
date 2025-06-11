import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

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
    const pool = new Pool({ connectionString: databaseUrl });
    const db = drizzle({ client: pool, schema });
    
    console.log("✅ Database connection initialized");
    return { pool, db };
  } catch (error) {
    console.error("❌ Database connection failed:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}

const { pool, db } = createDatabaseConnection();

export { pool, db };
