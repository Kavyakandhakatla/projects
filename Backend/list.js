import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function listDatabases() {
  try {
    const res = await pool.query(`
      SELECT datname FROM pg_database
      WHERE datistemplate = false;
    `);
    console.log('Databases:', res.rows.map(row => row.datname));
  } catch (err) {
    console.error('Error listing databases:', err);
  } finally {
    await pool.end();
  }
}

listDatabases();
