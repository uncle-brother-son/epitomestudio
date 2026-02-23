import { defineType } from 'sanity'

export const legal = defineType({
  name: 'legal',
  title: 'Legal',
  type: 'document',
  fields: [
    {
      name: 'header',
      title: 'Header',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'header',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'content',
      title: 'Content',
      type: 'portableText',
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
      title: 'header',
      subtitle: 'metaDescription',
    },
  },
})
