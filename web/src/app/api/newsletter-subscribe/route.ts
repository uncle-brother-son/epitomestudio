import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json()

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email address' },
        { status: 400 }
      )
    }

    const NEWS_TOPIC_ID = process.env.RESEND_NEWS_TOPIC_ID

    // Validate environment variables
    if (!NEWS_TOPIC_ID) {
      console.error('Missing required environment variable: RESEND_NEWS_TOPIC_ID')
      return NextResponse.json(
        { message: 'Newsletter configuration error' },
        { status: 500 }
      )
    }

    // Subscribe to News topic
    const topics: Array<{ id: string; subscription: 'opt_in' }> = [
      { id: NEWS_TOPIC_ID, subscription: 'opt_in' }
    ]

    // Build contact data
    const contactData: any = {
      email,
      unsubscribed: false,
      topics,
    }

    // Add name if provided (split into first/last name like hire forms)
    if (name && name.trim()) {
      contactData.first_name = name.split(' ')[0]
      contactData.last_name = name.split(' ').slice(1).join(' ') || undefined
    }

    // Subscribe contact using direct Resend API (same approach as hire forms)
    const response = await fetch('https://api.resend.com/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData),
    })

    const result = await response.json()

    if (response.status === 201) {
      console.log('✓ Contact subscribed to newsletter:', email)
      
      // Trigger automation event
      try {
        await fetch('https://api.resend.com/events/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event: 'newsletter.signup',
            email: email,
            payload: {
              source: 'newsletter_popup',
            },
          }),
        })
        console.log('✓ Automation event triggered:', email)
      } catch (eventError) {
        // Log but don't fail the subscription if event fails
        console.error('Failed to trigger automation event:', eventError)
      }
      
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
