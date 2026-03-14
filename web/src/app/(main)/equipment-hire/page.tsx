import { getEquipment, getAllEquipmentItems, getAllCategories } from '@/queries/equipment'
import { getGlobal } from '@/queries/global'
import type { Metadata } from 'next'
import { EquipmentFilterAndList } from '@/components/EquipmentFilterAndList'

export const revalidate = false // On-demand revalidation only

export async function generateMetadata(): Promise<Metadata> {
  const page = await getEquipment()
  const baseUrl = 'https://www.epitomestudio.co.uk'
  const canonicalPath = page?.slug?.current || 'equipment-hire'
  
  return {
    title: page?.title || 'Equipment',
    description: page?.metaDescription || 'Browse our professional equipment',
    alternates: {
      canonical: `${baseUrl}/${canonicalPath}`,
    },
  }
}

export default async function EquipmentPage() {
  const page = await getEquipment()
  const equipmentItems = await getAllEquipmentItems()
  const categories = await getAllCategories()
  const global = await getGlobal()

  return (
    <main id="main-content" className="grid_ px-4 my-xl gap-y-lg grow">
      {page?.title && <h1 className="sr-only">{page.title}</h1>}

      <EquipmentFilterAndList 
        categories={categories} 
        items={equipmentItems} 
        equipmentListUrl={page?.equipmentList?.asset?.url}
        equipmentListButtonLabel={page?.equipmentListButtonLabel}
        equipment={page}
        global={global}
      />

    </main>
  )
}
