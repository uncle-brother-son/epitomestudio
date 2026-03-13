import { defineType } from 'sanity'

export const home = defineType({
  name: 'home',
  title: 'Home',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Page Title (H1)',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'Main heading for the homepage (H1 for SEO)',
    },
    {
      name: 'cards',
      title: 'Cards',
      type: 'array',
      of: [{ type: 'card' }],
      description: 'Add cards with images/videos linking to other pages',
    },
    {
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(160).warning('Should be under 160 characters for optimal SEO'),
      description: 'Description for search engines',
    },
  ],
  preview: {
    select: {
      title: 'metaDescription',
    },
    prepare({ title }) {
      return {
        title: 'Home Page',
        subtitle: title || 'No meta description',
      }
    },
  },
})
