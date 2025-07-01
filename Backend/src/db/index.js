import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import pkg from 'pg';
import { parse } from 'pg-connection-string';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the `.env` file from the backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log('Loaded DATABASE_URL:', process.env.DATABASE_URL);

const { Pool } = pkg;
const config = parse(process.env.DATABASE_URL);

const pool = new Pool({
  host: config.host,
  port: config.port || 5432,
  user: config.user,
  password: config.password,
  database: config.database,
  ssl: {
    rejectUnauthorized: false,
  },
  family: 4,
});

pool.on('connect', () => {
  console.log('✅ Connected to the PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});


export default pool;
