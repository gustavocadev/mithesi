import { defineConfig } from 'drizzle-kit';
import process from 'node:process';

process.loadEnvFile('./.env.local');

export default defineConfig({
  schema: './src/server/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
