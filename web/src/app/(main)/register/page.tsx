import { getStudio } from '@/queries/studio'
import { getGlobal } from '@/queries/global'
import { RegisterForm } from '@/components/RegisterForm'

export default async function RegisterPage() {
  const studio = await getStudio()
  const global = await getGlobal()

  return <RegisterForm studio={studio} global={global} />
}
