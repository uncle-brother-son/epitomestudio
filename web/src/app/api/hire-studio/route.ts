import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'


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
      message,
      subscribeToNewsletter
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

    // Generate unique reference number using KV
    const { env } = getCloudflareContext()
    const counterKey = 'studio-enquiry-counter'
    const currentCount = await env.NEXT_INC_CACHE_KV.get(counterKey)
    const nextCount = (parseInt(currentCount || '0') + 1)
    const referenceNumber = `S${String(nextCount).padStart(4, '0')}`
    await env.NEXT_INC_CACHE_KV.put(counterKey, String(nextCount))

    // Generate .ics calendar file
    const generateICS = () => {
      // Parse start date and time
      const startDate = new Date(hireStartDate)
      const [startHours, startMinutes] = arrivalTime.split(':')
      startDate.setHours(parseInt(startHours), parseInt(startMinutes), 0)
      
      // Calculate end date (start date + days - 1)
      // E.g., 2 days starting April 2nd = April 2nd + April 3rd, ends April 3rd
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + parseInt(days) - 1)
      const [endHours, endMinutes] = leavingTime.split(':')
      endDate.setHours(parseInt(endHours), parseInt(endMinutes), 0)
      
      // Format dates for .ics (YYYYMMDDTHHmmss)
      const formatICSDate = (date: Date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const seconds = String(date.getSeconds()).padStart(2, '0')
        return `${year}${month}${day}T${hours}${minutes}${seconds}`
      }
      
      const dtstart = formatICSDate(startDate)
      const dtend = formatICSDate(endDate)
      const dtstamp = formatICSDate(new Date())
      
      // Build description
      const description = [
        `Contact: ${name}`,
        companyName ? `Company: ${companyName}` : '',
        `Email: ${email}`,
        `Phone: ${fullPhone}`,
        `Business Type: ${formattedBusinessType}`,
        `Booking Type: ${formattedTypeOfBooking}`,
        `Attendees: ${attendees}`,
        `Equipment Hire: ${hireEquipment ? 'Yes' : 'No'}`,
        message ? `\\n${message}` : ''
      ].filter(Boolean).join('\\n')
      
      const summary = `Studio Hire: ${name}${companyName ? ` - ${companyName}` : ''}`
      
      return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//EPITOMESTUDIO//Studio Hire//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:REQUEST',
        'BEGIN:VEVENT',
        `DTSTART:${dtstart}`,
        `DTEND:${dtend}`,
        `DTSTAMP:${dtstamp}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        `ORGANIZER;CN=${name}:mailto:${email}`,
        `UID:studio-hire-${Date.now()}@epitomestudio.co.uk`,
        'STATUS:TENTATIVE',
        'SEQUENCE:0',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n')
    }

    const icsContent = generateICS()

    // Send email to company
    const data = await resend.emails.send({
      from: 'Studio Hire <bookings@epitomestudio.co.uk>',
      to: process.env.STUDIO_HIRE_EMAIL || 'bookings@epitomestudio.co.uk',
      replyTo: email,
      subject: `[ Studio Hire Enquiry - ${referenceNumber} ] ${name}${companyName ? ` — ${companyName}` : ''}`,

      attachments: [
        {
          filename: 'studio-hire.ics',
          content: Buffer.from(icsContent).toString('base64'),
        }
      ],
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
                  
                  <table width="600" cellpadding="0" cellspacing="0" style="padding: 0 0 64px; max-width: 600px; width: 100%; overflow: hidden;" class="email-container">
                    <tr>
                      <td class="header-cell header-space" style="padding: 0; text-align: left;">
                        <img src="https://epitomestudio.ubs-demo.workers.dev/logo.svg" alt="Epitomestudio" style="width: 266px; height: 24px; display: block;" />
                      </td>
                      <td class="header-cell" style="padding: 0; text-align: right; vertical-align: top;">
                        <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase;">[ Studio Hire Enquiry - ${referenceNumber} ]</div>
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
                    ` : ''}
                  </table>

                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    })

    // Send confirmation email to customer
    await resend.emails.send({
      from: 'EPITOMESTUDIO <bookings@epitomestudio.co.uk>',
      to: email,
      subject: `Studio Hire Enquiry - ${referenceNumber}`,

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
                  
                  <!-- Header -->
                  <table width="600" cellpadding="0" cellspacing="0" style="padding: 0 0 40px; max-width: 600px; width: 100%; overflow: hidden;" class="email-container">
                    <tr>
                      <td style="padding: 0; text-align: left;">
                        <img src="https://epitomestudio.ubs-demo.workers.dev/logo.svg" alt="EPITOMESTUDIO" style="width: 266px; height: 24px; display: block;" />
                      </td>
                    </tr>
                  </table>

                  <!-- Greeting -->
                  <table width="600" cellpadding="0" cellspacing="0" style="padding: 0 0 40px; max-width: 600px; width: 100%; overflow: hidden;" class="email-container">
                    <tr>
                      <td style="padding: 0 0 16px;">
                        <div style="font-size: 12px; color: #121214;">Hi ${name.split(' ')[0]},</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0 0 16px;">
                        <div style="font-size: 12px; color: #121214;">Thank you for your studio hire enquiry. We're checking availability and will respond with confirmation and pricing within 24 hours.</div>
                      </td>
                    </tr>
                  </table>

                  <!-- Reference -->
                  <table width="600" cellpadding="0" cellspacing="0" style="padding: 0 0 40px; max-width: 600px; width: 100%; overflow: hidden;" class="email-container">
                    <tr>
                      <td style="padding: 0 0 16px;">
                        <div style="font-size: 12px; color: #121214;">Your enquiry reference: ${referenceNumber}</div>
                      </td>
                    </tr>
                  </table>

                  <!-- Booking Summary Header -->
                  <table width="600" cellpadding="0" cellspacing="0" style="padding: 0 0 16px; max-width: 600px; width: 100%; overflow: hidden;" class="email-container">
                    <tr>
                      <td style="padding: 0;">
                        <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase;">Booking Summary</div>
                      </td>
                    </tr>
                  </table>

                  <!-- Booking Details -->
                  <table width="600" cellpadding="0" cellspacing="0" style="padding: 0 0 40px; max-width: 600px; width: 100%; overflow: hidden;" class="email-container">
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
                      <td style="padding: 0 0 ${message ? '8px' : '0'}; width: 128px; vertical-align: top;">
                        <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase;">Hire Equipment</div>
                      </td>
                      <td style="padding: 0 0 ${message ? '8px' : '0'};">
                        <div style="font-size: 12px; color: #121214;">${hireEquipment ? 'Yes' : 'No'}</div>
                      </td>
                    </tr>
                    ${message ? `
                    <tr>
                      <td colspan="2" style="padding: 16px 0 0;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td class="list-cell list-space" style="padding: 0 0 8px; width: 128px; vertical-align: top;">
                              <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase;">Message</div>
                            </td>
                            <td class="list-cell" style="padding: 0 0 8px;">
                              <div style="font-size: 12px; color: #121214; white-space: pre-wrap; word-break: break-word;">${message}</div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    ` : ''}
                  </table>

                  <!-- Next Steps -->
                  <table width="600" cellpadding="0" cellspacing="0" style="padding: 0 0 16px; max-width: 600px; width: 100%; overflow: hidden;" class="email-container">
                    <tr>
                      <td style="padding: 0;">
                        <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase;">Next Steps</div>
                      </td>
                    </tr>
                  </table>

                  <table width="600" cellpadding="0" cellspacing="0" style="padding: 0 0 40px; max-width: 600px; width: 100%; overflow: hidden;" class="email-container">
                    <tr>
                      <td style="padding: 0 0 8px;">
                        <div style="font-size: 12px; color: #121214;">1. We'll confirm studio availability for your dates</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0 0 8px;">
                        <div style="font-size: 12px; color: #121214;">2. You'll receive pricing and booking terms</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0;">
                        <div style="font-size: 12px; color: #121214;">3. Once you accept, we'll send payment details and full confirmation</div>
                      </td>
                    </tr>
                  </table>

                  <!-- Footer -->
                  <table width="600" cellpadding="0" cellspacing="0" style="padding: 0 0 400px; max-width: 600px; width: 100%; overflow: hidden;" class="email-container">
                    <tr>
                      <td style="padding: 0 0 16px;">
                        <div style="font-size: 12px; color: #121214;">If you need to adjust your booking or have questions, simply reply to this email.</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0;">
                        <div style="font-size: 12px; color: #121214;">Best regards,<br>EPITOMESTUDIO</div>
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

    // Handle newsletter subscription (with delay to avoid rate limit)
    if (subscribeToNewsletter) {
      const topicId = process.env.RESEND_STUDIO_TOPIC_ID
      
      if (!topicId) {
        console.warn('Newsletter signup attempted but RESEND_STUDIO_TOPIC_ID is not set')
      } else {
        // Wait 1 second to avoid hitting Resend's 2 requests/second rate limit
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        try {
          // Add contact to newsletter using Resend API
          const response = await fetch('https://api.resend.com/contacts', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              firstName: name.split(' ')[0],
              lastName: name.split(' ').slice(1).join(' ') || undefined,
              unsubscribed: false,
              topics: [
                {
                  id: topicId,
                  subscription: 'opt_in'
                }
              ]
            }),
          })
          
          const contactResult = await response.json()
          if (response.status === 201) {
            console.log('✓ Contact subscribed to Studio Hire newsletter:', email)
          } else {
            console.error('Newsletter subscription failed:', contactResult)
          }
        } catch (newsletterError: any) {
          // Log but don't fail the request if newsletter signup fails
          console.error('Newsletter subscription error:', newsletterError)
          console.error('Error message:', newsletterError?.message)
          console.error('Error response:', newsletterError?.response?.data)
        }
      }
    }

    return NextResponse.json({ success: true, data, referenceNumber })
  } catch (error) {
    console.error('Email send error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
