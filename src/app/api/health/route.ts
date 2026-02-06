import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    deployment: process.env.VERCEL_URL || 'localhost',
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
  });
}
