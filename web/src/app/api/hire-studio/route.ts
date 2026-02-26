import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    const { 
      name, 
      businessType, 
      companyName, 
      email, 
      countryCode, 
      phoneNumber,
      hireStartDate,
      days,
      arrivalTime,
      leavingTime,
      typeOfBooking,
      attendees,
      hireEquipment,
      message
    } = await request.json()

    // Basic validation
    if (!name || !email || !businessType || !hireStartDate || !days || !arrivalTime || !leavingTime || !typeOfBooking || !attendees) {
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
    const fullPhone = `${countryCode} ${phoneNumber}`

    // Format date (YYYY-MM-DD to "DD Month YYYY")
    const formatDate = (dateString: string) => {
      const date = new Date(dateString)
      const day = String(date.getDate()).padStart(2, '0')
      const month = date.toLocaleString('en-GB', { month: 'long' })
      const year = date.getFullYear()
      return `${day} ${month} ${year}`
    }

    // Capitalize first letter
    const capitalizeFirst = (str: string) => {
      return str.charAt(0).toUpperCase() + str.slice(1)
    }

    // Format type of booking
    const formatTypeOfBooking = (type: string) => {
      const typeMap: Record<string, string> = {
        'photo': 'Photo Shoot',
        'video': 'Video Shoot',
        'hybrid': 'Photo & Video Shoot',
        'event': 'Event',
        'other': 'Other'
      }
      return typeMap[type] || type
    }

    const formattedDate = formatDate(hireStartDate)
    const formattedBusinessType = capitalizeFirst(businessType)
    const formattedTypeOfBooking = formatTypeOfBooking(typeOfBooking)

    // Send email
    const data = await resend.emails.send({
      from: 'Studio Hire <onboarding@resend.dev>', // Update with your verified domain
      to: process.env.CONTACT_EMAIL || 'your-email@example.com', // Update with your email
      replyTo: email,
      subject: `[ Studio Hire Enquiry ] ${name}${companyName ? ` — ${companyName}` : ''}`,
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
              }
            </style>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F5F2EB;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F5F2EB;">
              <tr>
                <td align="center" style="padding: 32px 16px;">
                  
                  <table width="600" cellpadding="0" cellspacing="0" style="padding: 0 0 64px; max-width: 600px; width: 100%; overflow: hidden;" class="email-container">
                    <tr>
                      <td class="header-cell header-space" style="padding: 0; text-align: left;">
                        <img src="https://epitomestudio.pages.dev/logo.svg" alt="Epitomestudio" style="width: 266px; height: 24px; display: block;" />
                      </td>
                      <td class="header-cell" style="padding: 0; text-align: right; vertical-align: top;">
                        <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase;">[ Studio Hire Enquiry ]</div>
                      </td>
                    </tr>
                  </table>

                  <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; overflow: hidden;" class="email-container">
                    
                    <tr>
                      <td style="padding: 0 0 8px; width: 128px; vertical-align: top;">
                        <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase;">Name</div>
                      </td>
                      <td style="padding: 0 0 8px;">
                        <div style="font-size: 12px; color: #121214;">${name}</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0 0 8px; width: 128px; vertical-align: top;">
                        <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase;">Email</div>
                      </td>
                      <td style="padding: 0 0 8px;">
                        <div style="font-size: 12px; color: #121214;">${email}</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0 0 8px; width: 128px; vertical-align: top;">
                        <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase;">Phone</div>
                      </td>
                      <td style="padding: 0 0 8px;">
                        <div style="font-size: 12px; color: #121214;">${fullPhone}</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0 0 ${companyName ? '8px' : '40px'}; width: 128px; vertical-align: top;">
                        <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase;">Business Type</div>
                      </td>
                      <td style="padding: 0 0 ${companyName ? '8px' : '40px'};">
                        <div style="font-size: 12px; color: #121214;">${formattedBusinessType}</div>
                      </td>
                    </tr>
                    ${companyName ? `
                    <tr>
                      <td style="padding: 0 0 40px; width: 128px; vertical-align: top;">
                        <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase;">Company Name</div>
                      </td>
                      <td style="padding: 0 0 40px;">
                        <div style="font-size: 12px; color: #121214;">${companyName}</div>
                      </td>
                    </tr>
                    ` : ''}

                    <!-- Studio Enquiry Section -->
                    <tr>
                      <td style="padding: 0 0 8px; width: 128px; vertical-align: top;">
                        <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase;">Start Date</div>
                      </td>
                      <td style="padding: 0 0 8px;">
                        <div style="font-size: 12px; color: #121214;">${formattedDate}</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0 0 8px; width: 128px; vertical-align: top;">
                        <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase;">Days</div>
                      </td>
                      <td style="padding: 0 0 8px;">
                        <div style="font-size: 12px; color: #121214;">${days}</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0 0 8px; width: 128px; vertical-align: top;">
                        <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase;">Times</div>
                      </td>
                      <td style="padding: 0 0 8px;">
                        <div style="font-size: 12px; color: #121214;">${arrivalTime} - ${leavingTime}</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0 0 8px; width: 128px; vertical-align: top;">
                        <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase;">Booking Type</div>
                      </td>
                      <td style="padding: 0 0 8px;">
                        <div style="font-size: 12px; color: #121214;">${formattedTypeOfBooking}</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0 0 8px; width: 128px; vertical-align: top;">
                        <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase;">Attendees</div>
                      </td>
                      <td style="padding: 0 0 8px;">
                        <div style="font-size: 12px; color: #121214;">${attendees}</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0 0 ${message ? '40px' : '400px'}; width: 128px; vertical-align: top;">
                        <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase;">Hire Equipment</div>
                      </td>
                      <td style="padding: 0 0 ${message ? '40px' : '400px'};">
                        <div style="font-size: 12px; color: #121214;">${hireEquipment ? 'Yes' : 'No'}</div>
                      </td>
                    </tr>
                    ${message ? `
                    <tr>
                      <td style="padding: 0 0 400px; width: 128px; vertical-align: top;">
                        <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase;">Message</div>
                      </td>
                      <td style="padding: 0 0 400px;">
                        <div style="font-size: 12px; color: #121214; white-space: pre-wrap; word-break: break-word;">${message}</div>
                      </td>
                    </tr>
                    ` : ''}
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
