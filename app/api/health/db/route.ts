import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Try to connect to the database using a MongoDB-appropriate query
    await prisma.$runCommandRaw({
      aggregate: 'User',
      pipeline: [{ $limit: 1 }],
      cursor: {}
    });
    
    return NextResponse.json({
      status: 'ok',
      database: 'MongoDB',
      timestamp: new Date().toISOString(),
      message: 'Database connection successful'
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    return NextResponse.json({
      status: 'error',
      database: 'MongoDB',
      timestamp: new Date().toISOString(),
      message: 'Database connection failed'
    }, { status: 500 });
  }
} 