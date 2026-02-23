import { defineType } from 'sanity'

export const home = defineType({
  name: 'home',
  title: 'Home',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'Main heading for the home page',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
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
})
