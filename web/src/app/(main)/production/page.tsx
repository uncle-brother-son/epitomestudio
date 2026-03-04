import { PortableText } from '@portabletext/react'
import { getProduction } from '@/queries/production'
import VideoPlayer from '@/components/VideoPlayer'
import type { Metadata } from 'next'
import { Icon } from '@/components/Icons'
import { StickyContent } from '@/components/StickyContent'

export async function generateMetadata(): Promise<Metadata> {
  const production = await getProduction()
  
  return {
    title: production?.title || 'Production',
    description: production?.metaDescription || 'Our production services',
  }
}

export default async function ProductionPage() {
  const production = await getProduction()

  return (
    <main className="grid_ my-xl gap-y-lg grow">

      <div className='col-start-1 col-span-12 lg:col-start-1 lg:col-span-6 2xl:col-start-2 2xl:col-span-5 px-2 lg:px-0 flex flex-col lg:justify-between gap-8'>
        {production?.content && (
          <StickyContent className="flex flex-col gap-8 lg:sticky" top={20}>
            <PortableText value={production.content} />
          </StickyContent>
        )}
        {production?.link?.url && production?.link?.label && (
          <div className='lg:sticky lg:bottom-20 lg:mt-auto self-start'> 
            <a href={production.link.url} target="_blank" rel="noopener noreferrer" className="link line">
              <span>{production.link.label}</span>
              <Icon name="icon-arrowAngle" className="icon-arrowAngle fill-black dark:fill-natural h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"><title>External Link</title></Icon>
            </a>
          </div>
        )}
      </div>

      {production?.video?.asset && (
        <div className="col-start-1 col-span-12 lg:col-start-12 lg:col-span-13">
          <VideoPlayer
            src={`https://cdn.sanity.io/files/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${production.video.asset._ref.replace('file-', '').replace('-mp4', '.mp4').replace('-mov', '.mov').replace('-webm', '.webm')}`}
            className="aspect-9/16 lg:aspect-4/5"
          />
        </div>
      )}

    </main>
  )
}
