import Soundfont from 'soundfont-player'

type Instrument = any

class SFChordPlayer {
  private ac: AudioContext
  private instrument: Instrument | null = null
  private ready = false

  constructor() {
    // @ts-ignore
    const Ctx = window.AudioContext || (window as any).webkitAudioContext
    this.ac = new Ctx()
  }

  async initialize(instrumentName = 'acoustic_guitar_nylon') {
    if (this.ac.state !== 'running') {
      try { await this.ac.resume() } catch {}
    }
    if (!this.instrument) {
      this.instrument = await Soundfont.instrument(this.ac, instrumentName, { gain: 0.9 })
    }
    this.ready = true
  }

  isRunning() {
    return this.ac.state === 'running'
  }

  private noteName(note: string, octave = 4) {
    return `${note}${octave}`
  }

  async playChord(notes: string[], durationSec = 1.0) {
    if (!this.ready) await this.initialize()
    const when = this.ac.currentTime
    const voices = [
      this.noteName(notes[0], 3),
      this.noteName(notes[1] ?? notes[0], 4),
      this.noteName(notes[2] ?? notes[0], 4),
      notes[3] ? this.noteName(notes[3], 4) : undefined,
    ].filter(Boolean) as string[]
    voices.forEach((n) => {
      this.instrument!.play(n, when, { duration: durationSec })
    })
    await new Promise((r) => setTimeout(r, durationSec * 1000))
  }

  async playProgression(chords: Array<{ notes: string[] }>, tempo = 120) {
    const dur = (60 / tempo) * 1.0
    for (let i = 0; i < chords.length; i++) {
      await this.playChord(chords[i].notes, dur)
    }
  }

  async playFullArrangement(chords: Array<{ notes: string[] }>, bassNotes: string[], scaleNotes: string[], tempo = 120) {
    if (!this.ready) await this.initialize()
    const beat = 60 / tempo
    for (let i = 0; i < chords.length; i++) {
      const start = this.ac.currentTime
      const chordDur = beat * 4
      this.playChord(chords[i].notes, chordDur)

      if (bassNotes.length) {
        [0, 1, 2, 3].forEach((step) => {
          const n = `${bassNotes[i % bassNotes.length]}2`
          this.instrument!.play(n, start + step * beat, { duration: beat * 0.95 })
        })
      }

      if (scaleNotes.length) {
        const steps = [0, 0.5, 1.5, 2.5]
        steps.forEach((step) => {
          const idx = Math.floor(Math.random() * scaleNotes.length)
          const oct = Math.random() > 0.5 ? 5 : 4
          const n = `${scaleNotes[idx]}${oct}`
          this.instrument!.play(n, start + step * beat, { duration: beat * 0.4, gain: 0.6 })
        })
      }

      await new Promise((r) => setTimeout(r, chordDur * 1000))
    }
  }
}

export const sfChordPlayer = new SFChordPlayer()

export async function ensureAudio() {
  try { await sfChordPlayer.initialize() } catch {}
}

export function isAudioRunning() {
  return sfChordPlayer.isRunning()
}

export function setupAutoUnlock() {
  const handler = async () => {
    try { await sfChordPlayer.initialize() } catch {}
    cleanup()
  }
  const cleanup = () => {
    window.removeEventListener('pointerdown', handler)
    window.removeEventListener('touchstart', handler)
    window.removeEventListener('mousedown', handler)
    window.removeEventListener('keydown', handler)
  }
  window.addEventListener('pointerdown', handler, { once: true, passive: true })
  window.addEventListener('touchstart', handler, { once: true, passive: true })
  window.addEventListener('mousedown', handler, { once: true })
  window.addEventListener('keydown', handler, { once: true })
}

