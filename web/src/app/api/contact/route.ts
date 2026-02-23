import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    const { name, email, countryCode, phone, subject, message } = await request.json()

    // Basic validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Format phone number
    const fullPhone = phone ? `${countryCode} ${phone}` : 'Not provided'

    // Send email
    const data = await resend.emails.send({
      from: 'Contact Form <onboarding@resend.dev>', // Update with your verified domain
      to: process.env.CONTACT_EMAIL || 'your-email@example.com', // Update with your email
      replyTo: email,
      subject: `[${subject}] ${name}`,
      html: `
        <!DOCTYPE html>
        <html style="background-color: #F5F2EB;">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              @media only screen and (max-width: 600px) {
                .email-container { width: 100% !important; }
              }
            </style>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F5F2EB;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F5F2EB;">
              <tr>
                <td align="center" style="padding: 24px 24px;">
                  <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; overflow: hidden;" class="email-container">

                    <tr>
                      <td style="padding: 0 0 24px; text-align: center;">
                        <img src="https://epitomestudio.pages.dev/logo.svg" alt="Epitomestudio" style="width: 100%; max-width: 600px; height: auto; display: block; margin: 0 auto;" />
                      </td>
                    </tr>

                    <tr>
                      <td style="padding: 0 0 8px;">
                        <p style="margin: 8px 0 0; font-size: 10px; font-weight: 500; color: #646360; text-transform: uppercase; width: 80px;">Subject</p>
                        <p style="margin: 4px 0 0; font-size: 12px; color: #121214;">${subject}</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0 0 8px;">
                        <p style="margin: 8px 0 0; font-size: 10px; font-weight: 500; color: #646360; text-transform: uppercase; width: 80px;">Name</p>
                        <p style="margin: 4px 0 0; font-size: 12px; color: #121214;">${name}</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0 0 8px;">
                        <p style="margin: 8px 0 0; font-size: 10px; font-weight: 500; color: #646360; text-transform: uppercase; width: 80px;">Email</p>
                        <p style="margin: 4px 0 0; font-size: 12px; color: #121214;">${email}</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0 0 16px;">
                        <p style="margin: 8px 0 0; font-size: 10px; font-weight: 500; color: #646360; text-transform: uppercase; width: 80px;">Phone</p>
                        <p style="margin: 4px 0 0; font-size: 12px; color: #121214;">${fullPhone}</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0 0 8px;">
                        <p style="margin: 8px 0 0; font-size: 10px; font-weight: 500; color: #646360; text-transform: uppercase; width: 80px;">Message</p>
                        <p style="margin: 4px 0 0; font-size: 12px; color: #121214; word-break: break-word;">${message}</p>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Email send error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
