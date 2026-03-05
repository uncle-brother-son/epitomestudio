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
      {children}
      <Footer global={global} />
    </>
  )
}
