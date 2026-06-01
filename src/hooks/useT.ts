import { useAppStore } from '../store/useAppStore'
import { T, type TKey } from '../lib/i18n'

export function useT() {
  const uiLang = useAppStore(s => s.uiLang)
  return (key: TKey): string => T[key][uiLang]
}
