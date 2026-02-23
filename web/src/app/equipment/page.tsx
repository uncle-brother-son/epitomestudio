import Image from 'next/image'
import { getEquipment, getAllEquipmentItems } from '@/queries/equipment'
import { urlFor } from '@/lib/sanityImage'
import type { Metadata } from 'next'

export const runtime = 'edge'

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

  return (
    <main className="grid_ my-xl gap-y-lg grow">
      <div className='col-start-1 col-span-12 lg:col-start-1 lg:col-span-24'>

        {!equipmentItems || equipmentItems.length === 0 ? (
          <p className="text-gray-600">No equipment available. Add equipment items in Sanity Studio.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {equipmentItems.map((item) => (
              <div key={item._id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                {item.image && (
                  <div className="relative w-full h-64">
                    <Image
                      src={urlFor(item.image).width(600).height(400).url()}
                      alt={item.image.alt || item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-2">{item.title}</h2>
                  {item.description && (
                    <p className="text-gray-600 line-clamp-3">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}
