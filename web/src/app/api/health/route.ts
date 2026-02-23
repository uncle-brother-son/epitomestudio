import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET() {
  try {
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      env: {
        hasSanityProjectId: !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
        hasSanityDataset: !!process.env.NEXT_PUBLIC_SANITY_DATASET,
        hasSanityApiVersion: !!process.env.NEXT_PUBLIC_SANITY_API_VERSION,
        sanityProjectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
        sanityDataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
