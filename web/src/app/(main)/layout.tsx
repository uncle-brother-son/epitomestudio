import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { getGlobal } from '@/queries/global'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const global = await getGlobal()

  return (
    <>
      <Header global={global} />
      {children}
      <Footer global={global} />
    </>
  )
}
