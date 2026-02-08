import React, { useEffect, useState } from 'react'
import i18n, { setLanguage } from '../i18n'

export default function LanguageSelector({ value, onChange }: { value: string; onChange: (lang: string) => void }) {
  const [options, setOptions] = useState<string[]>(['en', 'pl'])

  useEffect(() => {
    setOptions(Object.keys((i18n as any).store.data || { en: {}, pl: {} }))
  }, [])

  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="whitespace-nowrap">{(i18n.t('controls.language') as string) || 'Language'}</span>
      <select
        className="border rounded px-2 py-2 bg-white"
        value={value}
        onChange={(e) => { setLanguage(e.target.value); onChange(e.target.value) }}
        id="language-select"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt.toUpperCase()}</option>
        ))}
      </select>
    </label>
  )
}
