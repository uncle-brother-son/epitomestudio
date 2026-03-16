import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, topic } = await request.json()

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Validate topic
    if (!topic || !['all', 'studio', 'equipment'].includes(topic)) {
      return NextResponse.json(
        { message: 'Invalid newsletter topic' },
        { status: 400 }
      )
    }

    const STUDIO_TOPIC_ID = process.env.RESEND_STUDIO_TOPIC_ID
    const EQUIPMENT_TOPIC_ID = process.env.RESEND_EQUIPMENT_TOPIC_ID

    // Validate environment variables
    if (!STUDIO_TOPIC_ID || !EQUIPMENT_TOPIC_ID) {
      console.error('Missing required environment variables: RESEND_STUDIO_TOPIC_ID or RESEND_EQUIPMENT_TOPIC_ID')
      return NextResponse.json(
        { message: 'Newsletter configuration error' },
        { status: 500 }
      )
    }

    // Build topics array based on selection
    const topics: Array<{ id: string; subscription: 'opt_in' }> = []
    
    if (topic === 'all') {
      // Subscribe to both topics
      topics.push(
        { id: STUDIO_TOPIC_ID, subscription: 'opt_in' },
        { id: EQUIPMENT_TOPIC_ID, subscription: 'opt_in' }
      )
    } else if (topic === 'studio') {
      topics.push({ id: STUDIO_TOPIC_ID, subscription: 'opt_in' })
    } else if (topic === 'equipment') {
      topics.push({ id: EQUIPMENT_TOPIC_ID, subscription: 'opt_in' })
    }

    // Subscribe contact using direct Resend API (same approach as hire forms)
    const response = await fetch('https://api.resend.com/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        unsubscribed: false,
        topics,
      }),
    })

    const result = await response.json()

    if (response.status === 201) {
      console.log('✓ Contact subscribed to newsletter:', email, topic)
      return NextResponse.json(
        { message: 'Successfully subscribed to newsletter' },
        { status: 200 }
      )
    } else {
      console.error('Newsletter subscription failed:', result)
      
      // Check for specific error messages
      if (result.message?.includes('already exists') || result.message?.includes('duplicate')) {
        return NextResponse.json(
          { message: 'You are already subscribed to this newsletter' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { message: result.message || 'Failed to subscribe' },
        { status: response.status }
      )
    }
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    
    return NextResponse.json(
      { message: 'Failed to subscribe. Please try again later.' },
      { status: 500 }
    )
  }
}
