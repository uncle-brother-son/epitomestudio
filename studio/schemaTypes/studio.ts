import { defineType } from 'sanity'

export const studio = defineType({
  name: 'studio',
  title: 'Studio',
  type: 'document',
  groups: [
    {
      name: 'page',
      title: 'Page',
      default: true,
    },
    {
      name: 'info',
      title: 'Info',
    },
    {
      name: 'terms',
      title: 'Terms',
    },
  ],
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'Main heading for the studio page',
      group: 'page',
    },
    {
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      validation: (Rule) => Rule.required(),
      description: 'Used to generate the page URL. Click "Generate" to create from the title.',
      group: 'page',
      options: {
        source: 'title',
      },
    },
    {
      name: 'content',
      title: 'Content',
      type: 'portableText',
      description: 'Main content for the studio page',
      group: 'page',
    },
    {
      name: 'moreInfoButtonLabel',
      title: 'More Info Button Label',
      type: 'string',
      description: 'Label for button that opens the "more info" overlay',
      placeholder: 'e.g., Learn More',
      group: 'page',
    },
    {
      name: 'hireStudioButtonLabel',
      title: 'Hire Studio Button Label',
      type: 'string',
      description: 'Label for button that opens the "hire studio" overlay',
      placeholder: 'e.g., Hire Studio',
      group: 'page',
    },
    {
      name: 'imageGallery',
      title: 'Image Gallery',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
            },
            {
              name: 'caption',
              title: 'Caption',
              type: 'string',
            },
          ],
        },
      ],
      group: 'page',
    },
    {
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      rows: 3,
      description: 'SEO meta description (recommended 150-160 characters)',
      validation: (Rule) => Rule.max(160),
      group: 'page',
    },
    // Info Tab
    {
      name: 'infoPack',
      title: 'Info Pack',
      type: 'file',
      description: 'Upload a PDF info pack',
      options: {
        accept: '.pdf',
      },
      group: 'info',
    },
    {
      name: 'features',
      title: 'Features',
      type: 'portableText',
      description: 'Studio features description',
      group: 'info',
    },
    {
      name: 'clients',
      title: 'Clients',
      type: 'portableText',
      description: 'Client information',
      group: 'info',
    },
    {
      name: 'studioInformation',
      title: 'Studio Information',
      type: 'array',
      description: 'Multiple information sections',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'content',
              title: 'Content',
              type: 'portableText',
            },
          ],
          preview: {
            select: {
              title: 'title',
            },
          },
        },
      ],
      group: 'info',
    },
    // Terms Tab
    {
      name: 'termsHeader',
      title: 'Header',
      type: 'string',
      description: 'Header text for the terms section',
      group: 'terms',
    },
    {
      name: 'termsTitle',
      title: 'Title',
      type: 'string',
      description: 'Title for the terms section',
      group: 'terms',
    },
    {
      name: 'termsIntro',
      title: 'Intro',
      type: 'portableText',
      description: 'Introduction text for the terms section',
      group: 'terms',
    },
    {
      name: 'termsAndConditions',
      title: 'Terms & Conditions',
      type: 'array',
      description: 'Terms and conditions sections',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'content',
              title: 'Content',
              type: 'portableText',
            },
          ],
          preview: {
            select: {
              title: 'title',
            },
          },
        },
      ],
      group: 'terms',
    },
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
})
