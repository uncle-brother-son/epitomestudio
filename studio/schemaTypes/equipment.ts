import { defineType } from 'sanity'

export const equipmentItem = defineType({
  name: 'equipmentItem',
  title: 'Equipment Item',
  type: 'document',
  fields: [
    {
      name: 'brand',
      title: 'Brand',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'category' }] }],
      validation: (Rule) => Rule.required().min(1),
      description: 'Select one or more categories for this item',
    },
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'price',
      title: 'Price (£)',
      type: 'number',
      validation: (Rule) => Rule.required().positive(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'portableText',
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'price',
      media: 'image',
    },
    prepare({ title, subtitle, media }) {
      return {
        title,
        subtitle: subtitle ? `$${subtitle}` : 'No price',
        media,
      }
    },
  },
})

export const equipment = defineType({
  name: 'equipment',
  title: 'Equipment Page',
  type: 'document',
  groups: [
    {
      name: 'page',
      title: 'Page',
      default: true,
    },
    {
      name: 'terms',
      title: 'Terms',
    },
  ],
  fieldsets: [
    {
      name: 'equipmentListDownload',
      title: 'Equipment List Download',
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'Main heading for the equipment page',
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
      name: 'equipmentList',
      title: 'Equipment List',
      type: 'file',
      options: {
        accept: '.pdf',
      },
      description: 'Upload a PDF file for the equipment list',
      group: 'page',
      fieldset: 'equipmentListDownload',
    },
    {
      name: 'equipmentListButtonLabel',
      title: 'Button Label',
      type: 'string',
      description: 'Label for the equipment list download button',
      group: 'page',
      fieldset: 'equipmentListDownload',
    },
    {
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      rows: 3,
      description: 'SEO description for search engines',
      group: 'page',
    },
    {
      name: 'termsHeader',
      title: 'Header',
      type: 'string',
      description: 'Header for the terms section',
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
