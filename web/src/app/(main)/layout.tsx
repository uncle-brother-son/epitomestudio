import { Footer } from '@/components/Footer'
import { CookieBanner } from '@/components/CookieBanner'
import { getGlobal } from '@/queries/global'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const global = await getGlobal()

  return (
    <>
      {children}
      <Footer global={global} />
      <CookieBanner />
    </>
  )
}
