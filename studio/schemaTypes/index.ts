import { home } from './home'
import { studio } from './studio'
import { equipment, equipmentItem } from './equipment'
import { production } from './production'
import { contact } from './contact'
import { legal } from './legal'
import { global } from './global'
import { portableText } from './portableText'

export const schemaTypes = [
  // Singleton pages
  home,
  studio,
  equipment,
  production,
  contact,
  global,
  // Multi-page collections
  equipmentItem,
  legal,
  // Portable text
  portableText,
]
