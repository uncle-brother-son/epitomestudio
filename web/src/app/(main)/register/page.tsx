import { getEquipment } from '@/queries/equipment'
import { getGlobal } from '@/queries/global'
import { RegisterForm } from '@/components/RegisterForm'

export default async function RegisterPage() {
  const equipment = await getEquipment()
  const global = await getGlobal()

  return <RegisterForm equipment={equipment} global={global} />
}
