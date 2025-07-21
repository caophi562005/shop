import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
import z from 'zod';

config({
  path: '.env',
});

if (!fs.existsSync(path.resolve('.env'))) {
  console.error('Not found .ENV file');
  process.exit(1);
}

const configSchema = z.object({
  APP_NAME: z.string(),

  DATABASE_URL: z.string(),

  ACCESS_TOKEN_EXPIRES_IN: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),

  PAYMENT_API_KEY: z.string(),
});

const configServer = configSchema.safeParse(process.env);

if (!configServer.success) {
  console.error('Value in ENV is invalid');
  console.error(configServer.error.issues);
  process.exit(1);
}

const envConfig = configServer.data;

export default envConfig;
