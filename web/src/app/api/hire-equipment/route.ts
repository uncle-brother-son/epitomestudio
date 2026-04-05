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
      pickUpTime,
      dropOffTime,
      message,
      items,
      subscribeToNewsletter,
      source
    } = await request.json()

    // Basic validation
    if (!name || !email || !businessType || !hireStartDate || !days || !pickUpTime || !dropOffTime) {
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

    // Calculate totals
    const calculateItemTotal = (item: any) => item.price * item.quantity
    const calculateSubtotal = () => items.reduce((sum: number, item: any) => sum + calculateItemTotal(item), 0)
    const calculateTotal = () => calculateSubtotal() * days

    const formattedDate = formatDate(hireStartDate)
    const formattedBusinessType = capitalizeFirst(businessType)

    // Build equipment items HTML
    const equipmentItemsHtml = items.map((item: any) => `
        <tr>
          <td style="padding: 0 0 8px;">
            <div style="font-size: 12px; color: #121214;">${item.name}</div>
          </td>
          <td style="padding: 0 0 8px; width: 60px; text-align: right;">
            <div style="font-size: 12px; color: #121214;">× ${item.quantity}</div>
          </td>
          <td style="padding: 0 0 8px; width: 60px; text-align: right;">
            <div style="font-size: 12px; color: #121214;">£${item.price}</div>
          </td>
        </tr>
    `).join('')

    // Determine email routing based on source
    // If coming from studio hire flow, route to studio email
    const isFromStudioHire = source === 'studio-hire'
    const recipientEmail = isFromStudioHire 
      ? process.env.STUDIO_HIRE_EMAIL 
      : process.env.EQUIPMENT_HIRE_EMAIL
    const fromEmail = isFromStudioHire
      ? 'Studio Hire <bookings@epitomestudio.co.uk>'
      : 'Equipment Hire <rentals@epitomestudio.co.uk>'

    // Send email to company
    const data = await resend.emails.send({
      from: fromEmail,
      to: recipientEmail || 'rentals@epitomestudio.co.uk',
      replyTo: email,
      subject: `[ Equipment Hire Enquiry ] ${name}${companyName ? ` — ${companyName}` : ''}`,
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
                        <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase;">[ Equipment Hire Enquiry ]</div>
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

                    <!-- Equipment Details Section -->
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
                      <td style="padding: 0 0 40px; width: 128px; vertical-align: top;">
                        <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase;">Times</div>
                      </td>
                      <td style="padding: 0 0 40px;">
                        <div style="font-size: 12px; color: #121214;">${pickUpTime} - ${dropOffTime}</div>
                      </td>
                    </tr>

                    ${message ? `
                    <tr>
                      <td colspan="2">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td class="list-cell list-space" style="padding: 0 0 40px; width: 128px; vertical-align: top;">
                              <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase;">Message</div>
                            </td>
                            <td class="list-cell" style="padding: 0 0 40px;">
                              <div style="font-size: 12px; color: #121214; white-space: pre-wrap; word-break: break-word;">${message}</div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    ` : ''}

                    <!-- Equipment Items -->
                    ${items && items.length > 0 ? `
                    <tr>
                      <td colspan="2">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td class="list-cell list-space" style="padding: 0 0 40px; width: 128px; vertical-align: top;">
                              <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase;">Equipment</div>
                            </td>
                            <td class="list-cell" style="padding: 0 0 40px;">
                              <div style="font-size: 10px; color: #121214;"><table>${equipmentItemsHtml}</table></div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding: 0 0 8px; width: 128px; vertical-align: top;">
                        <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase;">Subtotal</div>
                      </td>
                      <td style="padding: 0 0 8px;">
                        <div style="font-size: 12px; color: #121214;">£${calculateSubtotal()}</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0 0 8px; width: 128px; vertical-align: top;">
                        <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase;">Days</div>
                      </td>
                      <td style="padding: 0 0 8px;">
                        <div style="font-size: 12px; color: #121214;">× ${days}</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0 0 400px; width: 128px; vertical-align: top;">
                        <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase;">Total (excl. VAT)</div>
                      </td>
                      <td style="padding: 0 0 400px;">
                        <div style="font-size: 12px; color: #121214;">£${calculateTotal()}</div>
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
      from: isFromStudioHire 
        ? 'EPITOMESTUDIO <bookings@epitomestudio.co.uk>'
        : 'EPITOMESTUDIO <rentals@epitomestudio.co.uk>',
      to: email,
      subject: 'Equipment Hire Enquiry Received',
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
                        <div style="font-size: 12px; color: #121214;">Thank you for your equipment hire enquiry. We're reviewing your request and will send you a detailed quote within 24 hours.</div>
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
                  <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; overflow: hidden;" class="email-container">
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
                      <td style="padding: 0 0 40px; width: 128px; vertical-align: top;">
                        <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase;">Times</div>
                      </td>
                      <td style="padding: 0 0 40px;">
                        <div style="font-size: 12px; color: #121214;">${pickUpTime} - ${dropOffTime}</div>
                      </td>
                    </tr>

                    ${message ? `
                    <tr>
                      <td colspan="2">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td class="list-cell list-space" style="padding: 0 0 40px; width: 128px; vertical-align: top;">
                              <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase;">Message</div>
                            </td>
                            <td class="list-cell" style="padding: 0 0 40px;">
                              <div style="font-size: 12px; color: #121214; white-space: pre-wrap; word-break: break-word;">${message}</div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    ` : ''}

                    <!-- Equipment Items -->
                    ${items && items.length > 0 ? `
                    <tr>
                      <td colspan="2">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td class="list-cell list-space" style="padding: 0 0 40px; width: 128px; vertical-align: top;">
                              <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase;">Equipment</div>
                            </td>
                            <td class="list-cell" style="padding: 0 0 40px;">
                              <div style="font-size: 10px; color: #121214;"><table>${equipmentItemsHtml}</table></div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding: 0 0 8px; width: 128px; vertical-align: top;">
                        <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase;">Estimated Subtotal</div>
                      </td>
                      <td style="padding: 0 0 8px;">
                        <div style="font-size: 12px; color: #121214;">£${calculateSubtotal()}</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0 0 8px; width: 128px; vertical-align: top;">
                        <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase;">Days</div>
                      </td>
                      <td style="padding: 0 0 8px;">
                        <div style="font-size: 12px; color: #121214;">× ${days}</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0 0 40px; width: 128px; vertical-align: top;">
                        <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase;">Estimated Total (excl. VAT)</div>
                      </td>
                      <td style="padding: 0 0 40px;">
                        <div style="font-size: 12px; color: #121214;">£${calculateTotal()}</div>
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
                        <div style="font-size: 12px; color: #121214;">1. We'll confirm equipment availability</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0 0 8px;">
                        <div style="font-size: 12px; color: #121214;">2. You'll receive a formal quote and booking terms</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0;">
                        <div style="font-size: 12px; color: #121214;">3. Once you accept, we'll send payment details and confirmation</div>
                      </td>
                    </tr>
                  </table>

                  <!-- Footer -->
                  <table width="600" cellpadding="0" cellspacing="0" style="padding: 0 0 400px; max-width: 600px; width: 100%; overflow: hidden;" class="email-container">
                    <tr>
                      <td style="padding: 0 0 16px;">
                        <div style="font-size: 12px; color: #121214;">If you need to make changes or have questions, simply reply to this email.</div>
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
      const topicId = process.env.RESEND_EQUIPMENT_TOPIC_ID
      
      if (!topicId) {
        console.warn('Newsletter signup attempted but RESEND_EQUIPMENT_TOPIC_ID is not set')
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
            console.log('✓ Contact subscribed to Equipment Hire newsletter:', email)
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

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Email send error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
