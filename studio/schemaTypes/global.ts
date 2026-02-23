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
  ],
  preview: {
    prepare() {
      return {
        title: 'Global Settings',
      }
    },
  },
})
