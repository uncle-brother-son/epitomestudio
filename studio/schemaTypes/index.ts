import { home } from './home'
import { studio } from './studio'
import { equipment, equipmentItem } from './equipment'
import { production } from './production'
import { contact } from './contact'
import { legal } from './legal'
import { global } from './global'
import { portableText } from './portableText'
import { category } from './category'
import { card } from './card'

export const schemaTypes = [
  // Singleton pages
  home,
  studio,
  equipment,
  production,
  contact,
  global,
  // Multi-page collections
  category,
  equipmentItem,
  legal,
  // Portable text
  portableText,
  // Objects
  card,
]
