import { defineType } from 'sanity'

export const global = defineType({
  name: 'global',
  title: 'Global Settings',
  type: 'document',
  fields: [
    {
      name: 'siteName',
      title: 'Site Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'companyName',
      title: 'Company Name',
      type: 'string',
      description: 'Full company name',
    },
    {
      name: 'headerNavigation',
      title: 'Header Navigation',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [
            { type: 'home' },
            { type: 'studio' },
            { type: 'equipment' },
            { type: 'production' },
            { type: 'contact' },
          ],
        },
      ],
      description: 'Select pages to appear in header navigation. Order matters!',
    },
    {
      name: 'openingTimes',
      title: 'Opening Times',
      type: 'portableText',
      description: 'Opening hours information',
    },
    {
      name: 'location',
      title: 'Location',
      type: 'portableText',
      description: 'Studio location and address',
    },
    {
      name: 'addressUrl',
      title: 'Address URL',
      type: 'url',
      description: 'Link to address (e.g., Google Maps link)',
    },
    {
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.email(),
    },
    {
      name: 'phone',
      title: 'Phone',
      type: 'string',
      description: 'Phone number',
    },
    {
      name: 'companyInfo',
      title: 'Company Info',
      type: 'portableText',
      description: 'Company information',
    },
    {
      name: 'instagram',
      title: 'Instagram',
      type: 'string',
      description: 'Instagram handle or URL',
    },
    {
      name: 'ogImage',
      title: 'OG Image',
      type: 'image',
      description: 'Default Open Graph image for social sharing',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        },
      ],
    },
    // Newsletter Banner Settings
    {
      name: 'newsletterBanner',
      title: 'Newsletter Banner',
      type: 'object',
      description: 'Settings for the newsletter signup banner',
      options: {
        collapsible: true,
        collapsed: false,
      },
      fields: [
        {
          name: 'enabled',
          title: 'Enable Banner',
          type: 'boolean',
          description: 'Turn the newsletter banner on/off',
          initialValue: true,
        },
        {
          name: 'pageCountTrigger',
          title: 'Page Count Trigger',
          type: 'number',
          description: 'Show banner after this many pages viewed in a session',
          initialValue: 2,
          validation: (Rule) => Rule.required().min(1).max(10),
        },
        {
          name: 'heading',
          title: 'Heading',
          type: 'string',
          description: 'Main heading text',
          initialValue: 'Stay Updated',
        },
        {
          name: 'emailPlaceholder',
          title: 'Email Placeholder',
          type: 'string',
          description: 'Placeholder text for email input',
          initialValue: 'Enter your email',
        },
        {
          name: 'ctaText',
          title: 'CTA Button Text',
          type: 'string',
          description: 'Submit button text',
          initialValue: 'Subscribe',
        },
        {
          name: 'privacyText',
          title: 'Privacy Policy Text',
          type: 'text',
          description: 'Text displayed below the form. Type "Privacy Policy" anywhere in your text and it will automatically become a clickable link.',
          rows: 2,
          initialValue: 'By signing up, you confirm you have read and agree with our Privacy Policy.',
        },
        {
          name: 'successMessage',
          title: 'Success Message',
          type: 'string',
          description: 'Message shown after successful subscription',
          initialValue: 'Thank you for subscribing!',
        },
      ],
    },
  ],
  preview: {
    prepare() {
      return {
        title: 'Global Settings',
      }
    },
  },
})
