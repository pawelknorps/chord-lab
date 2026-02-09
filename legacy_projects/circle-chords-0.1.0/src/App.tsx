import React, { useEffect, useState } from 'react'
import LanguageSelector from './components/LanguageSelector'
import KeyModeSelector from './components/KeyModeSelector'
import ProgressionCard from './components/ProgressionCard'
import InteractiveCircle from './components/InteractiveCircle'
import ChordExplorer from './pages/ChordExplorer'
import type { AppConfig, GeneratedProgression } from './lib/types'
import { loadAllConfig } from './lib/config'
import { initTheory, generateProgressions as gen, getScale } from './lib/theory'
import './i18n'
import { useTranslation } from 'react-i18next'
import { setupAutoUnlock } from './lib/audio-sf'

const DEFAULT_NOTES = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
]

export default function App() {
  const [ready, setReady] = useState(false)
  const [page, setPage] = useState<'progressions' | 'chords'>('progressions')
  const [keySig, setKeySig] = useState<string>('C')
  const [mode, setMode] = useState<string>('major')
  const [progressions, setProgressions] = useState<GeneratedProgression[]>([])
  const [notesList, setNotesList] = useState<string[]>(DEFAULT_NOTES)
  // language state not required; i18n hook drives translations
  const [circleData, setCircleData] = useState<{ majorKeys: string[]; minorKeys: string[] }>({ majorKeys: [], minorKeys: [] })
  const [modes, setModes] = useState<string[]>(['major', 'minor'])
  const [guitarChords, setGuitarChords] = useState<AppConfig['guitarChords']>({})
  const [showDiagrams, setShowDiagrams] = useState<boolean>(() => {
    try { const v = localStorage.getItem('ui.showDiagrams'); return v ? v === '1' || v === 'true' : true } catch { return true }
  })
  const [showCircle, setShowCircle] = useState<boolean>(() => {
    try { const v = localStorage.getItem('ui.showCircle'); return v ? v === '1' || v === 'true' : true } catch { return true }
  })
  const [showFretboards, setShowFretboards] = useState<boolean>(() => {
    try { const v = localStorage.getItem('ui.showFretboards'); return v ? v === '1' || v === 'true' : true } catch { return true }
  })

  // Initialize config + theory
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        // i18n may already start loading itself; wait a tick if present
        // Language comes from i18next init
        const config: AppConfig = await loadAllConfig()
        initTheory(config)
        setCircleData({ majorKeys: config.majorKeys || [], minorKeys: config.minorKeys || [] })
        setGuitarChords(config.guitarChords || {})
        if (Array.isArray(config.notes) && config.notes.length === 12) setNotesList(config.notes)
        if (config.scales) setModes(Object.keys(config.scales))

        if (!cancelled) setReady(true)
      } catch (e) {
        console.error('Initialization error:', e)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // Recompute progressions when key/mode changes
  useEffect(() => {
    if (!ready) return
    try {
      const list = gen(keySig, mode)
      setProgressions(list)
    } catch (e) {
      console.error('Failed to generate progressions:', e)
    }
  }, [ready, keySig, mode])

  // Attach one-time auto-unlock listeners for mobile browsers
  useEffect(() => {
    setupAutoUnlock()
  }, [])

  // Persist UI toggles
  useEffect(() => {
    try { localStorage.setItem('ui.showDiagrams', showDiagrams ? '1' : '0') } catch {}
  }, [showDiagrams])
  useEffect(() => {
    try { localStorage.setItem('ui.showCircle', showCircle ? '1' : '0') } catch {}
  }, [showCircle])
  useEffect(() => {
    try { localStorage.setItem('ui.showFretboards', showFretboards ? '1' : '0') } catch {}
  }, [showFretboards])

  const onTonalityChange = (key: string, m: string) => {
    setKeySig(key)
    setMode(m)
  }

  const { t, i18n } = useTranslation()

  return (
    <div className="max-w-[1100px] mx-auto p-3 sm:p-4">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 bg-gradient-to-r from-indigo-500/10 via-fuchsia-500/10 to-cyan-500/10 rounded-xl p-3">
        <h1 className="m-0 text-lg sm:text-xl font-semibold text-indigo-700 drop-shadow-sm">{t('app.title') || 'Guitar Progression Generator'}</h1>
        <div className="flex items-center gap-2">
          <nav className="inline-flex rounded-lg border">
            <button type="button"
              className={`px-3 py-1.5 text-sm ${page === 'progressions' ? 'bg-white text-indigo-700' : 'bg-white/60 text-gray-700'}`}
              onClick={() => setPage('progressions')}
            >
              {t('ui.tabs.progressions') || 'Progressions'}
            </button>
            <button type="button"
              className={`px-3 py-1.5 text-sm ${page === 'chords' ? 'bg-white text-indigo-700' : 'bg-white/60 text-gray-700'}`}
              onClick={() => setPage('chords')}
            >
              {t('ui.tabs.chords') || 'Chords'}
            </button>
          </nav>
          <LanguageSelector value={i18n.language} onChange={() => { /* i18n handles language change */ }} />
        </div>
      </header>

      <section className="mt-4">
        <KeyModeSelector
          notes={notesList}
          keyValue={keySig}
          modeValue={mode}
          onChange={(k, m) => { setKeySig(k); setMode(m) }}
          modes={modes}
        />
      </section>

      {/* Global display toggles */}
      <section className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
        <label className="inline-flex items-center justify-between gap-3 p-2 rounded-lg bg-white/70 border">
          <div className="flex flex-col">
            <span className="text-sm font-medium">{t('ui.chordDiagrams') || 'Chord diagrams'}</span>
            <span className="text-xs text-gray-500">{showDiagrams ? (t('ui.hideChordDiagrams') || 'Hide chord diagrams') : (t('ui.showChordDiagrams') || 'Show chord diagrams')}</span>
          </div>
          <button
            type="button"
            aria-pressed={showDiagrams}
            onClick={() => setShowDiagrams(v => !v)}
            className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${showDiagrams ? 'bg-indigo-600' : 'bg-gray-300'}`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${showDiagrams ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </label>

        <label className="inline-flex items-center justify-between gap-3 p-2 rounded-lg bg-white/70 border">
          <div className="flex flex-col">
            <span className="text-sm font-medium">{t('ui.circle') || 'Circle'}</span>
            <span className="text-xs text-gray-500">{showCircle ? (t('ui.hideCircle') || 'Hide circle') : (t('ui.showCircle') || 'Show circle')}</span>
          </div>
          <button
            type="button"
            aria-pressed={showCircle}
            onClick={() => setShowCircle(v => !v)}
            className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${showCircle ? 'bg-indigo-600' : 'bg-gray-300'}`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${showCircle ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </label>

        <label className="inline-flex items-center justify-between gap-3 p-2 rounded-lg bg-white/70 border">
          <div className="flex flex-col">
            <span className="text-sm font-medium">{t('ui.fretboards') || 'Fretboards'}</span>
            <span className="text-xs text-gray-500">{showFretboards ? (t('ui.hideFretboards') || 'Hide fretboards') : (t('ui.showFretboards') || 'Show fretboards')}</span>
          </div>
          <button
            type="button"
            aria-pressed={showFretboards}
            onClick={() => setShowFretboards(v => !v)}
            className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${showFretboards ? 'bg-indigo-600' : 'bg-gray-300'}`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${showFretboards ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </label>
      </section>

      {page === 'progressions' && (
        <section className="mt-4">
          {ready && (
            <InteractiveCircle keyValue={keySig} modeValue={mode} onTonalityChange={onTonalityChange}
              majorKeys={circleData.majorKeys} minorKeys={circleData.minorKeys} />
          )}
        </section>
      )}

      {!ready && (
        <p className="text-gray-500">{t('app.loading') || 'Loading...'}</p>
      )}

      {page === 'progressions' && ready && (
        progressions.map((p, idx) => (
          <ProgressionCard
            key={idx}
            progression={p}
            keySig={keySig}
            mode={mode}
            majorKeys={circleData.majorKeys}
            minorKeys={circleData.minorKeys}
            notesList={notesList}
            getScale={(k, m) => getScale(k, m)}
            guitarChords={guitarChords}
            showDiagrams={showDiagrams}
            showCircle={showCircle}
            showFretboards={showFretboards}
          />
        ))
      )}

      {page === 'chords' && ready && (
        <ChordExplorer
          majorKeys={circleData.majorKeys}
          minorKeys={circleData.minorKeys}
          guitarChords={guitarChords}
        />
      )}
    </div>
  )}
