
import { useEffect, useState } from 'react'
import i18n, { setLanguage } from '../../utils/i18n'

export default function LanguageSelector({ value, onChange }: { value: string; onChange: (lang: string) => void }) {
  const [options, setOptions] = useState<string[]>(['en', 'pl'])

  useEffect(() => {
    setOptions(Object.keys((i18n as any).store.data || { en: {}, pl: {} }))
  }, [])

  return (
    <label className="inline-flex items-center gap-2 text-sm z-50">
      <span className="whitespace-nowrap text-white/50">{(i18n.t('controls.language') as string) || 'Language'}</span>
      <select
        className="border border-white/10 rounded-lg px-2 py-1 bg-white/5 text-white backdrop-blur-md hover:bg-white/10 transition cursor-pointer outline-none focus:ring-2 focus:ring-purple-500/50"
        value={value}
        onChange={(e) => { setLanguage(e.target.value); onChange(e.target.value) }}
        id="language-select"
      >
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-slate-900 text-white">{opt.toUpperCase()}</option>
        ))}
      </select>
    </label>
  )
}
