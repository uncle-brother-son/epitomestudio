import { defineType } from 'sanity'

export const contact = defineType({
  name: 'contact',
  title: 'Contact',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'Main heading for the contact page',
    },
    {
      name: 'intro',
      title: 'Intro',
      type: 'portableText',
      description: 'Introduction text for the contact page',
    },
    {
      name: 'mapLinkLabel',
      title: 'Map Link Label',
      type: 'string',
      description: 'Label for the map link button (URL comes from Global Settings)',
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
