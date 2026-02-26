import { defineType } from 'sanity'

export const card = defineType({
  name: 'card',
  title: 'Card',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'video',
      title: 'Video',
      type: 'file',
      description: 'If video is added, it will be used instead of the image',
      options: {
        accept: 'video/*',
      },
    },
    {
      name: 'linkType',
      title: 'Link Type',
      type: 'string',
      options: {
        list: [
          { title: 'Home', value: 'home' },
          { title: 'Studio', value: 'studio' },
          { title: 'Equipment', value: 'equipment' },
          { title: 'Production', value: 'production' },
          { title: 'Contact', value: 'contact' },
          { title: 'Legal Page', value: 'legal' },
        ],
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'legalPage',
      title: 'Legal Page',
      type: 'reference',
      to: [{ type: 'legal' }],
      hidden: ({ parent }) => parent?.linkType !== 'legal',
      validation: (Rule) =>
        Rule.custom((legalPage, context) => {
          const parent = context.parent as { linkType?: string }
          if (parent?.linkType === 'legal' && !legalPage) {
            return 'Please select a legal page'
          }
          return true
        }),
    },
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
      linkType: 'linkType',
    },
    prepare({ title, media, linkType }) {
      return {
        title: title || 'Untitled Card',
        subtitle: linkType ? `Links to: ${linkType}` : 'No link',
        media,
      }
    },
  },
})
