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
      vatNumber,
      email, 
      countryCode, 
      phoneNumber,
      address1,
      address2,
      city,
      postcode,
      country,
      subscribeToNewsletter
    } = await request.json()

    // Basic validation
    if (!name || !email || !businessType || !phoneNumber || !address1 || !city || !postcode || !country) {
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

    // Capitalize first letter
    const capitalizeFirst = (str: string) => {
      return str.charAt(0).toUpperCase() + str.slice(1)
    }

    const formattedBusinessType = capitalizeFirst(businessType)

    // Generate unique reference number using KV
    const { env } = getCloudflareContext()
    const counterKey = 'register-counter'
    const currentCount = await env.NEXT_INC_CACHE_KV.get(counterKey)
    const nextCount = (parseInt(currentCount || '0') + 1)
    const referenceNumber = `R${String(nextCount).padStart(4, '0')}`
    await env.NEXT_INC_CACHE_KV.put(counterKey, String(nextCount))

    // Format billing address
    const billingAddress = [
      address1,
      address2,
      city,
      postcode,
      country
    ].filter(Boolean).join(', ')

    // Send email to company
    const data = await resend.emails.send({
      from: 'Account Registration <bookings@epitomestudio.co.uk>',
      to: process.env.STUDIO_HIRE_EMAIL || 'bookings@epitomestudio.co.uk',
      replyTo: email,
      subject: `[ Account Registration - ${referenceNumber} ] ${name}${companyName ? ` — ${companyName}` : ''}`,

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
                        <img src="https://epitomestudio.co.uk/logo.svg" alt="Epitomestudio" style="width: 266px; height: 24px; display: block;" />
                      </td>
                      <td class="header-cell" style="padding: 0; text-align: right; vertical-align: top;">
                        <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase;">[ Account Registration - ${referenceNumber} ]</div>
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
                      <td style="padding: 0 0 ${vatNumber ? '8px' : '40px'}; width: 128px; vertical-align: top;">
                        <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase;">Company Name</div>
                      </td>
                      <td style="padding: 0 0 ${vatNumber ? '8px' : '40px'};">
                        <div style="font-size: 12px; color: #121214;">${companyName}</div>
                      </td>
                    </tr>
                    ` : ''}
                    ${vatNumber ? `
                    <tr>
                      <td style="padding: 0 0 40px; width: 128px; vertical-align: top;">
                        <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase;">VAT Number</div>
                      </td>
                      <td style="padding: 0 0 40px;">
                        <div style="font-size: 12px; color: #121214;">${vatNumber}</div>
                      </td>
                    </tr>
                    ` : ''}

                    <!-- Billing Address Section -->
                    <tr>
                      <td colspan="2" style="padding: 0 0 8px;">
                        <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase;">Billing Address</div>
                      </td>
                    </tr>
                    <tr>
                      <td colspan="2" style="padding: 0 0 400px;">
                        <div style="font-size: 12px; color: #121214; line-height: 1.6;">
                          ${address1}<br/>
                          ${address2 ? `${address2}<br/>` : ''}
                          ${city}<br/>
                          ${postcode}<br/>
                          ${country}
                        </div>
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

    // Send confirmation email to customer
    await resend.emails.send({
      from: 'EPITOMESTUDIO <bookings@epitomestudio.co.uk>',
      to: email,
      subject: `Account Registration - ${referenceNumber}`,

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
                        <img src="https://epitomestudio.co.uk/logo.svg" alt="EPITOMESTUDIO" style="width: 266px; height: 24px; display: block;" />
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
                        <div style="font-size: 12px; color: #121214;">Thank you for registering with EPITOMESTUDIO. We're reviewing your information and will be in touch shortly to complete your account setup.</div>
                      </td>
                    </tr>
                  </table>

                  <!-- Reference -->
                  <table width="600" cellpadding="0" cellspacing="0" style="padding: 0 0 40px; max-width: 600px; width: 100%; overflow: hidden;" class="email-container">
                    <tr>
                      <td style="padding: 0 0 16px;">
                        <div style="font-size: 12px; color: #121214;">Your registration reference: ${referenceNumber}</div>
                      </td>
                    </tr>
                  </table>

                  <!-- Registration Summary Header -->
                  <table width="600" cellpadding="0" cellspacing="0" style="padding: 0 0 16px; max-width: 600px; width: 100%; overflow: hidden;" class="email-container">
                    <tr>
                      <td style="padding: 0;">
                        <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase;">Registration Details</div>
                      </td>
                    </tr>
                  </table>

                  <!-- Registration Details -->
                  <table width="600" cellpadding="0" cellspacing="0" style="padding: 0 0 40px; max-width: 600px; width: 100%; overflow: hidden;" class="email-container">
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
                      <td style="padding: 0 0 ${companyName ? '8px' : '0'}; width: 128px; vertical-align: top;">
                        <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase;">Business Type</div>
                      </td>
                      <td style="padding: 0 0 ${companyName ? '8px' : '0'};">
                        <div style="font-size: 12px; color: #121214;">${formattedBusinessType}</div>
                      </td>
                    </tr>
                    ${companyName ? `
                    <tr>
                      <td style="padding: 0 0 ${vatNumber ? '8px' : '0'}; width: 128px; vertical-align: top;">
                        <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase;">Company Name</div>
                      </td>
                      <td style="padding: 0 0 ${vatNumber ? '8px' : '0'};">
                        <div style="font-size: 12px; color: #121214;">${companyName}</div>
                      </td>
                    </tr>
                    ` : ''}
                    ${vatNumber ? `
                    <tr>
                      <td style="padding: 0 0 0; width: 128px; vertical-align: top;">
                        <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase;">VAT Number</div>
                      </td>
                      <td style="padding: 0 0 0;">
                        <div style="font-size: 12px; color: #121214;">${vatNumber}</div>
                      </td>
                    </tr>
                    ` : ''}
                  </table>

                  <!-- Billing Address -->
                  <table width="600" cellpadding="0" cellspacing="0" style="padding: 0 0 16px; max-width: 600px; width: 100%; overflow: hidden;" class="email-container">
                    <tr>
                      <td style="padding: 0;">
                        <div style="font-size: 10px; font-weight: 500; color: #121214; text-transform: uppercase;">Billing Address</div>
                      </td>
                    </tr>
                  </table>

                  <table width="600" cellpadding="0" cellspacing="0" style="padding: 0 0 40px; max-width: 600px; width: 100%; overflow: hidden;" class="email-container">
                    <tr>
                      <td style="padding: 0;">
                        <div style="font-size: 12px; color: #121214; line-height: 1.6;">
                          ${address1}<br/>
                          ${address2 ? `${address2}<br/>` : ''}
                          ${city}<br/>
                          ${postcode}<br/>
                          ${country}
                        </div>
                      </td>
                    </tr>
                  </table>

                  <!-- Footer -->
                  <table width="600" cellpadding="0" cellspacing="0" style="padding: 0 0 400px; max-width: 600px; width: 100%; overflow: hidden;" class="email-container">
                    <tr>
                      <td style="padding: 0 0 16px;">
                        <div style="font-size: 12px; color: #121214;">If you have any questions about your registration, simply reply to this email.</div>
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
      const topicId = process.env.RESEND_NEWS_TOPIC_ID
      
      if (!topicId) {
        console.warn('Newsletter signup attempted but RESEND_NEWS_TOPIC_ID is not set')
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
              first_name: name.split(' ')[0],
              last_name: name.split(' ').slice(1).join(' ') || undefined,
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
          
          // Check if subscription was successful (201 = created, 200 = already exists and updated)
          if (response.status === 201 || response.status === 200 || response.ok) {
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
                    source: 'register',
                  },
                }),
              })
              console.log('✓ Automation event triggered:', email)
            } catch (eventError) {
              console.error('Failed to trigger automation event:', eventError)
            }
          } else {
            console.error('Newsletter subscription failed:', contactResult)
          }
        } catch (newsletterError) {
          // Log but don't fail the request if newsletter signup fails
          console.error('Newsletter subscription error:', newsletterError)
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
