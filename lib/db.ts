// DEV ONLY: Simple Prisma client initialization
// This will be replaced with a proper database connection pool later
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

let prismaInstance: PrismaClient | null = null;

function getPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  if (!prismaInstance) {
    // Parse connection string to handle SSL properly
    let connectionString = process.env.DATABASE_URL;
    
    // For Supabase connections, ensure SSL is configured properly
    // Remove any existing sslmode from connection string to avoid conflicts
    if (connectionString.includes('supabase')) {
      // Remove existing sslmode parameters
      connectionString = connectionString.replace(/[?&]sslmode=[^&]*/g, '');
      
      // Add sslmode=no-verify to connection string for Supabase
      // This handles certificate chain issues in serverless environments
      const separator = connectionString.includes('?') ? '&' : '?';
      connectionString = `${connectionString}${separator}sslmode=no-verify`;
    }
    
    // Configure Pool with SSL settings
    const poolConfig: any = {
      connectionString,
    };
    
    // For Supabase, also set SSL in Pool config as backup
    if (connectionString.includes('supabase')) {
      poolConfig.ssl = {
        rejectUnauthorized: false, // Allow certificate chain issues
      };
    }
    
    const pool = new Pool(poolConfig);
    const adapter = new PrismaPg(pool);
    prismaInstance = new PrismaClient({ adapter });
  }

  return prismaInstance;
}

// Lazy initialization: only create Prisma client when actually accessed
// This prevents errors during Next.js build analysis when DATABASE_URL might not be available
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const value = client[prop as keyof PrismaClient];
    // Handle methods and properties
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

