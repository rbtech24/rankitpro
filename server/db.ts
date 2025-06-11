import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set");
  console.error("Please configure your database connection in your deployment platform");
  console.error("For Render: Add DATABASE_URL to your environment variables");
  console.error("For other platforms: Ensure DATABASE_URL points to your PostgreSQL database");
  
  throw new Error(
    "DATABASE_URL must be set. Please configure your database connection in your deployment platform's environment variables.",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
