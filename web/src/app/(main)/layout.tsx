import { Footer } from '@/components/Footer'
import { CookieBanner } from '@/components/CookieBanner'
import { Header } from '@/components/Header'
import { HeaderScrollProvider } from '@/contexts/HeaderScrollContext'
import { getGlobal } from '@/queries/global'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const global = await getGlobal()

  return (
    <>
      <HeaderScrollProvider>
        <Header global={global} />
      </HeaderScrollProvider>
      {children}
      <Footer global={global} />
      <CookieBanner />
    </>
  )
}
