import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import { getStudio } from '@/queries/studio'
import { getGlobal } from '@/queries/global'
import { urlFor } from '@/lib/sanityImage'
import { HideOnFooter } from '@/components/HideOnFooter'
import { StudioHireButton } from '@/components/StudioHireButton'
import { StudioInfoButton } from '@/components/StudioInfoButton'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const studio = await getStudio()
  
  return {
    title: studio?.title || 'Studio',
    description: studio?.metaDescription || 'Learn about our studio',
  }
}

export default async function StudioPage() {
  const studio = await getStudio()
  const global = await getGlobal()



  return (
    <main className="grid_ my-xl gap-y-md lg:gap-y-2 grow">


      {studio?.imageGallery && studio.imageGallery.length > 0 && (
        <div className='col-start-1 col-span-12 lg:col-start-1 lg:col-span-17'>
          <div className='relative rounded overflow-hidden aspect-5/4 lg:aspect-auto lg:h-[calc(100vh-13.75rem)]'>
            <Image
              src={urlFor(studio.imageGallery[0]).width(1600).height(1280).url()}
              alt={studio.imageGallery[0].alt || 'Gallery image 1'}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 70vw"
              className="object-cover"
            />
          </div>
        </div>
      )}


      <div className='lg:row-span-2 col-start-1 col-span-12 lg:col-start-19 lg:col-span-5 px-2 lg:px-0 flex flex-col lg:justify-between gap-8'>
        
        <div className="flex flex-col gap-8 lg:sticky lg:top-20">
          {studio?.content && (
            <div className="flex flex-col gap-8 rich">
              <PortableText value={studio.content} />
            </div>
          )}

          {studio?.moreInfoButtonLabel && global && (
            <StudioInfoButton 
              label={studio.moreInfoButtonLabel}
              className="link line self-start"
              studio={studio}
              global={global}
            />
          )}
        </div>

        {studio?.hireStudioButtonLabel && (
          <HideOnFooter>
            <StudioHireButton 
              label={studio.hireStudioButtonLabel}
              className="btn self-start fixed bottom-10 left-1/2 lg:left-0 -translate-x-1/2 lg:translate-x-0 z-10 lg:sticky lg:bottom-20 lg:mt-auto"
            />
          </HideOnFooter>
        )}
      </div>

      {studio?.imageGallery && studio.imageGallery.length > 1 && (
        <div className='col-start-1 col-span-12 lg:col-start-1 lg:col-span-17 flex flex-col gap-2'>
          {studio.imageGallery.slice(1).map((image, index) => (
            <div className='relative aspect-5/4 rounded overflow-hidden' key={index + 1}>
              <Image
                src={urlFor(image).width(1600).height(1280).url()}
                alt={image.alt || `Gallery image ${index + 2}`}
                fill
                sizes="(max-width: 900px) 100vw, 70vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      

    </main>
  )
}
