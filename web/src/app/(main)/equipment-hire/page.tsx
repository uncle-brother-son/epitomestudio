import { getEquipment, getAllEquipmentItems, getAllCategories } from '@/queries/equipment'
import { getGlobal } from '@/queries/global'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const revalidate = 0
import { EquipmentFilterAndList } from '@/components/EquipmentFilterAndList'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getEquipment()
  
  return {
    title: page?.title || 'Equipment',
    description: page?.metaDescription || 'Browse our professional equipment',
  }
}

export default async function EquipmentPage() {
  const page = await getEquipment()
  const equipmentItems = await getAllEquipmentItems()
  const categories = await getAllCategories()
  const global = await getGlobal()

  return (
    <main id="main-content" className="grid_ px-4 my-xl gap-y-lg grow">

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
