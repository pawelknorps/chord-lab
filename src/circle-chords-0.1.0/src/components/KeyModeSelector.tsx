import React from 'react'
import { useTranslation } from 'react-i18next'

export default function KeyModeSelector({ notes, keyValue, modeValue, onChange, modes: modesProp }: { notes: string[]; keyValue: string; modeValue: string; onChange: (k: string, m: string) => void; modes?: string[] }) {
  const { t } = useTranslation()
  const modeValues = (modesProp && modesProp.length > 0) ? modesProp : ['major', 'minor']
  const modes = modeValues.map((mv) => ({ value: mv, label: (t(`modes.${mv}`) as string) || mv }))

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
      <label className="inline-flex items-center gap-2">
        <span className="w-16 sm:w-auto">{t('controls.key') || 'Key'}</span>
        <select className="flex-1 border rounded px-2 py-2 bg-white" value={keyValue} onChange={(e) => onChange(e.target.value, modeValue)} id="key-select">
          {notes.map(n => (
            <option key={n} value={n}>{t(`notes.${n}`) || n}</option>
          ))}
        </select>
      </label>

      <label className="inline-flex items-center gap-2">
        <span className="w-16 sm:w-auto">{t('controls.mode') || 'Mode'}</span>
        <select className="flex-1 border rounded px-2 py-2 bg-white" value={modeValue} onChange={(e) => onChange(keyValue, e.target.value)} id="mode-select">
          {modes.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </label>
    </div>
  )
}
