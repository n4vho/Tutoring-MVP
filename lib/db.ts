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
    const connectionString = process.env.DATABASE_URL;
    
    // Configure Pool with SSL settings for Supabase
    const pool = new Pool({
      connectionString,
      ssl: connectionString.includes('supabase') ? {
        rejectUnauthorized: false // Supabase uses valid certificates, but we need to allow them
      } : undefined,
    });
    
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

