import { NextResponse } from 'next/server';
import pkg from 'pg';
const { Pool } = pkg;

export async function GET() {
  // Initialize connection pool using environment variables
  const pool = new Pool({
    host: process.env.POSTGRES_HOST || 'postgres',
    user: process.env.POSTGRES_USER || 'casafusion_user',
    password: process.env.POSTGRES_PASSWORD || 'your_password',
    database: process.env.POSTGRES_DB || 'casafusion_db',
    port: 5432
  });

  try {
    // Test connection with a simple query
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT NOW()');
      const currentTime = result.rows[0].now;
      
      return NextResponse.json({
        status: 'ok',
        database: 'Connection has been established successfully.',
        timestamp: currentTime
      }, { status: 200 });
    } finally {
      client.release();
      await pool.end();
    }
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      database: 'Unable to connect to the database:',
      error: error.message
    }, { status: 500 });
  }
} 