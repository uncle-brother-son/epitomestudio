import { getEquipment, getAllEquipmentItems, getAllCategories } from '@/queries/equipment'
import type { Metadata } from 'next'
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

  return (
    <main className="grid_ my-xl gap-y-lg grow">

      <EquipmentFilterAndList categories={categories} items={equipmentItems} />

    </main>
  )
}
