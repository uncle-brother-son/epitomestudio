import { defineType } from 'sanity'

export const production = defineType({
  name: 'production',
  title: 'Production',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'Main heading for the production page',
    },
    {
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      validation: (Rule) => Rule.required(),
      description: 'Used to generate the page URL. Click "Generate" to create from the title.',
      options: {
        source: 'title',
      },
    },
    {
      name: 'content',
      title: 'Content',
      type: 'portableText',
      description: 'Main content for the production page',
    },
    {
      name: 'link',
      title: 'Link',
      type: 'object',
      fields: [
        {
          name: 'label',
          title: 'Label',
          type: 'string',
        },
        {
          name: 'url',
          title: 'URL',
          type: 'url',
        },
      ],
    },
    {
      name: 'video',
      title: 'Video',
      type: 'file',
      options: {
        accept: 'video/*',
      },
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
