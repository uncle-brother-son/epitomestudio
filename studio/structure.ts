import type { StructureResolver } from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // Singleton Pages
      S.listItem()
        .title('Home')
        .child(
          S.document()
            .schemaType('home')
            .documentId('home')
        ),
      S.listItem()
        .title('Studio')
        .child(
          S.document()
            .schemaType('studio')
            .documentId('studio')
        ),
      S.listItem()
        .title('Equipment')
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
        .child(
          S.document()
            .schemaType('production')
            .documentId('production')
        ),
      S.listItem()
        .title('Contact')
        .child(
          S.document()
            .schemaType('contact')
            .documentId('contact')
        ),
      S.listItem()
        .title('Legal')
        .child(
          S.documentTypeList('legal')
            .title('Legal')
        ),
      
      S.divider(),
      
      // Global Settings
      S.listItem()
        .title('Global')
        .child(
          S.document()
            .schemaType('global')
            .documentId('global')
        ),
    ])
