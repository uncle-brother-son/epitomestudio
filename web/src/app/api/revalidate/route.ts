import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// Map of Sanity document types to their paths
const TYPE_TO_PATH_MAP: Record<string, string> = {
  home: '/',
  studio: '/studio-hire',
  equipment: '/equipment-hire',
  equipmentItem: '/equipment-hire', // Equipment items affect equipment page
  production: '/production',
  contact: '/contact',
  legal: '/legal', // Will need slug for specific page
  global: '/', // Global changes affect all pages
}

export async function POST(request: NextRequest) {
  try {
    // Verify the request is from Sanity
    const secret = request.headers.get('x-sanity-webhook-secret')
    
    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json(
        { error: 'Invalid secret' },
        { status: 401 }
      )
    }

    // Get the document type from the webhook payload
    const body = await request.json()
    const documentType = body._type

    if (!documentType) {
      return NextResponse.json(
        { error: 'Missing document type' },
        { status: 400 }
      )
    }

    console.log('Revalidating for document type:', documentType)

    // Revalidate the appropriate path(s)
    if (documentType === 'legal' && body.slug?.current) {
      // Revalidate specific legal page
      const legalPath = `/legal/${body.slug.current}`
      revalidatePath(legalPath)
      console.log('Revalidated:', legalPath)
    } else if (documentType === 'global') {
      // Global changes affect all pages - revalidate everything
      revalidatePath('/', 'layout')
      console.log('Revalidated: all pages (layout)')
    } else if (TYPE_TO_PATH_MAP[documentType]) {
      // Revalidate the specific page
      const path = TYPE_TO_PATH_MAP[documentType]
      revalidatePath(path)
      console.log('Revalidated:', path)
    }

    return NextResponse.json(
      { 
        revalidated: true, 
        documentType,
        now: Date.now() 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Revalidation error:', error)
    return NextResponse.json(
      { error: 'Error revalidating' },
      { status: 500 }
    )
  }
}
