import type { StructureResolver } from 'sanity/structure'
import { HomeIcon, CubeIcon, TagsIcon, AsteriskIcon, FeedbackIcon, UlistIcon, CogIcon } from '@sanity/icons'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // Singleton Pages
      S.listItem()
        .title('Home')
        .icon(HomeIcon)
        .child(
          S.document()
            .schemaType('home')
            .documentId('home')
        ),
      S.listItem()
        .title('Studio')
        .icon(CubeIcon)
        .child(
          S.document()
            .schemaType('studio')
            .documentId('studio')
        ),
      S.listItem()
        .title('Equipment')
        .icon(TagsIcon)
        .child(
          S.list()
            .title('Equipment')
            .items([
              S.listItem()
                .title('Equipment Page')
                .child(
                  S.document()
                    .schemaType('equipment')
                    .documentId('equipment')
                ),
              S.listItem()
                .title('Items')
                .child(
                  S.documentTypeList('equipmentItem')
                    .title('Equipment Items')
                ),
            ])
        ),
      S.listItem()
        .title('Production')
        .icon(AsteriskIcon)
        .child(
          S.document()
            .schemaType('production')
            .documentId('production')
        ),
      S.listItem()
        .title('Contact')
        .icon(FeedbackIcon)
        .child(
          S.document()
            .schemaType('contact')
            .documentId('contact')
        ),
      S.listItem()
        .title('Info')
        .icon(UlistIcon)
        .child(
          S.documentTypeList('legal')
            .title('Info')
        ),
      
      S.divider(),
      
      // Global Settings
      S.listItem()
        .title('Settings')
        .icon(CogIcon)
        .child(
          S.document()
            .schemaType('global')
            .documentId('global')
        ),
    ])
