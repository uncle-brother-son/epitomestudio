import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { getGlobal } from '@/queries/global'
import { HeaderScrollProvider } from '@/contexts/HeaderScrollContext'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const global = await getGlobal()

  return (
    <HeaderScrollProvider>
      <Header global={global} />
      {children}
      <Footer global={global} />
    </HeaderScrollProvider>
  )
}
