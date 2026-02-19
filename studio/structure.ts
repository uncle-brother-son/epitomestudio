import type { StructureResolver } from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Pages')
        .child(
          S.documentTypeList('page')
            .title('Pages')
        ),
      S.listItem()
        .title('Posts')
        .child(
          S.documentTypeList('post')
            .title('Posts')
        ),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => !['page', 'post'].includes(item.getId() || '')
      ),
    ])
