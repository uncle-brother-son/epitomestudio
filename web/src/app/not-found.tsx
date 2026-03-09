import Link from 'next/link'
import { Footer } from '@/components/Footer'
import { getGlobal } from '@/queries/global'

export default async function NotFound() {
  const global = await getGlobal()

  return (
    <>
      <main id="main-content" className="grid_ my-xxl grow">
        <div className="col-start-3 col-span-8 lg:col-start-5 lg:col-span-16 text-center flex flex-col gap-4 items-center justify-center">
          <h1 className="text-xl">404 - Page Not Found</h1>
          <p>The page you're looking for doesn't exist or has been moved.</p>
          <Link className="btn" href="/" prefetch={false}>Go Back Home</Link>
        </div>
      </main>
      <Footer global={global} />
    </>
  )
}
