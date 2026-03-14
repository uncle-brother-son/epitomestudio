import { defineType } from 'sanity'

export const card = defineType({
  name: 'card',
  title: 'Card',
  type: 'object',
  fieldsets: [
    {
      name: 'media',
      title: 'Media',
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'mediaType',
      title: 'Media Type',
      type: 'string',
      options: {
        list: [
          { title: 'Image', value: 'image' },
          { title: 'Video', value: 'video' },
        ],
        layout: 'radio',
      },
      initialValue: 'image',
      validation: (Rule) => Rule.required(),
      fieldset: 'media',
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      hidden: ({ parent }) => parent?.mediaType !== 'image',
      validation: (Rule) =>
        Rule.custom((image, context) => {
          const parent = context.parent as { mediaType?: string }
          if (parent?.mediaType === 'image' && !image) {
            return 'Please upload an image'
          }
          return true
        }),
      fieldset: 'media',
    },
    {
      name: 'video',
      title: 'Video',
      type: 'file',
      options: {
        accept: 'video/*',
      },
      hidden: ({ parent }) => parent?.mediaType !== 'video',
      validation: (Rule) =>
        Rule.custom((video, context) => {
          const parent = context.parent as { mediaType?: string }
          if (parent?.mediaType === 'video' && !video) {
            return 'Please upload a video'
          }
          return true
        }),
      fieldset: 'media',
    },
    {
      name: 'videoPoster',
      title: 'Video Poster Image',
      type: 'image',
      description: 'Thumbnail shown before video loads (recommended)',
      options: {
        hotspot: true,
      },
      hidden: ({ parent }) => parent?.mediaType !== 'video',
      fieldset: 'media',
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
    {
      name: 'darkMode',
      title: 'Dark Mode',
      type: 'boolean',
      description: 'Enable dark mode when navigating to this page',
      initialValue: false,
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
