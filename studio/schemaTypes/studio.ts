import { defineType } from 'sanity'

export const studio = defineType({
  name: 'studio',
  title: 'Studio',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'Main heading for the studio page',
    },
    {
      name: 'content',
      title: 'Content',
      type: 'portableText',
      description: 'Main content for the studio page',
    },
    {
      name: 'moreInfoButtonLabel',
      title: 'More Info Button Label',
      type: 'string',
      description: 'Label for button that opens the "more info" overlay',
      placeholder: 'e.g., Learn More',
    },
    {
      name: 'hireStudioButtonLabel',
      title: 'Hire Studio Button Label',
      type: 'string',
      description: 'Label for button that opens the "hire studio" overlay',
      placeholder: 'e.g., Hire Studio',
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
    },
    {
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      rows: 3,
      description: 'SEO meta description (recommended 150-160 characters)',
      validation: (Rule) => Rule.max(160),
    },
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
})
