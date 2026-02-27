import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'

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
      subject: `[ Contact Enquiry ] ${subject} — ${name}`,
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
              @media only screen and (max-width: 480px) {
                .header-cell { display: block !important; width: 100% !important; text-align: left !important; }
                .header-space { padding-bottom: 16px !important; }
                .list-cell { display: block !important; width: 100% !important; text-align: left !important; }
                .list-space { padding-bottom: 12px !important; }
              }
            </style>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F5F2EB;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F5F2EB;">
              <tr>
                <td align="center" style="padding: 32px 16px;">
                  
                  <table width="600" cellpadding="0" cellspacing="0" style=" padding: 0 0 64px; max-width: 600px; width: 100%; overflow: hidden;" class="email-container">
                    <tr>
                      <td class="header-cell header-space" style="padding: 0; text-align: left;">
                        <img src="https://epitomestudio.pages.dev/logo.svg" alt="Epitomestudio" style="width: 266px; height: 24px; display: block;" />
                      </td>
                      <td class="header-cell" style="padding: 0; text-align: right; vertical-align: top;">
                        <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase;">[ Contact Enquiry ]</div>
                      </td>
                    </tr>
                  </table>
   

                  <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; overflow: hidden;" class="email-container">
                    <tr>
                      <td style="padding: 0 0 8px; width: 128px; vertical-align: top;">
                        <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase; width: 80px;">Name</div>
                      </td>
                      <td style="padding: 0 0 8px;">
                        <div style="font-size: 12px; color: #121214;">${name}</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0 0 8px; width: 128px; vertical-align: top;">
                        <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase; width: 80px;">Email</div>
                      </td>
                      <td style="padding: 0 0 8px;">
                        <div style="font-size: 12px; color: #121214;">${email}</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0 0 40px; width: 128px; vertical-align: top;">
                        <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase; width: 80px;">Phone</div>
                      </td>
                      <td style="padding: 0 0 40px;">
                        <div style="font-size: 12px; color: #121214;">${fullPhone}</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0 0 16px; width: 128px; vertical-align: top;">
                        <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase; width: 80px;">Subject</div>
                      </td>
                      <td style="padding: 0 0 16px;">
                        <div style="font-size: 12px; color: #121214;">${subject}</div>
                      </td>
                    </tr>
                    <tr>
                      <td colspan="2" style="padding: 0 0 400px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td class="list-cell list-space" style="padding: 0; width: 128px; vertical-align: top;">
                              <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase;">Message</div>
                            </td>
                            <td class="list-cell" style="padding: 0;">
                              <div style="font-size: 12px; color: #121214; white-space: pre-wrap; word-break: break-word;">${message}</div>
                            </td>
                          </tr>
                        </table>
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
