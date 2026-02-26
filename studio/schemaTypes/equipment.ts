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
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      options: {
        filter: 'defined(parent)',
      },
      validation: (Rule) => Rule.required(),
      description: 'Select the most specific category for this item',
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
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'Main heading for the equipment page',
    },
    {
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      rows: 3,
      description: 'SEO description for search engines',
    },
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
})
