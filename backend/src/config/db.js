const { Pool } = require('pg');

// If running in development and DATABASE_URL points to an external server (like Supabase),
// override it to connect to the local PostgreSQL database defined in .env
const isDev = process.env.NODE_ENV === 'development';
const hasExternalUrl = process.env.DATABASE_URL && 
  !process.env.DATABASE_URL.includes('localhost') && 
  !process.env.DATABASE_URL.includes('127.0.0.1');

const poolConfig = (process.env.DATABASE_URL && !(isDev && hasExternalUrl))
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: (process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1'))
        ? false
        : {
            rejectUnauthorized: false,
          },
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || 'vuhailam123',
      password: process.env.DB_PASSWORD || 'vuhailam123',
      database: process.env.DB_NAME || 'appdb',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('📦 New client connected to PostgreSQL pool');
  }
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err.message);
  process.exit(1);
});

/**
 * Test the database connection on startup
 */
const connectDB = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log(`✅ PostgreSQL connected at ${result.rows[0].now}`);
  } catch (err) {
    console.error('❌ Failed to connect to PostgreSQL:', err.message);
    process.exit(1);
  }
};

module.exports = { pool, connectDB };
