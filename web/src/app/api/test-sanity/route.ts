import { NextResponse } from 'next/server'
import { client } from '@/lib/sanityClient'

export const runtime = 'edge'

export async function GET() {
  try {
    // Try a simple query
    const result = await client.fetch(
      `*[_type == "global" && _id == "global"][0] { _id, siteName }`,
      {},
      { next: { revalidate: 60 } }
    )
    
    return NextResponse.json({
      status: 'success',
      data: result,
      hasData: !!result
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      stack: error.stack,
      name: error.name
    }, { status: 500 })
  }
}
