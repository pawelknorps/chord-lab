import Soundfont from 'soundfont-player'
import * as Tone from 'tone'

class SFChordPlayer {
  private ac: AudioContext
  private instrument: Soundfont.Player | null = null
  private ready = false

  constructor() {
    // Use Tone's context to ensure sync and single context usage
    // Tone.context.rawContext is the native AudioContext
    this.ac = Tone.getContext().rawContext as AudioContext
  }

  async initialize(instrumentName: Soundfont.InstrumentName = 'acoustic_guitar_nylon') {
    if (this.ac.state !== 'running') {
      try { await this.ac.resume() } catch { }
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
    if (!this.instrument) return

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

    // Return promise that resolves after duration
    return new Promise((r) => setTimeout(r, durationSec * 1000))
  }

  async playProgression(chords: Array<{ notes: string[] }>, tempo = 120) {
    const dur = (60 / tempo) * 1.0
    for (let i = 0; i < chords.length; i++) {
      await this.playChord(chords[i].notes, dur)
    }
  }

  async playFullArrangement(chords: Array<{ notes: string[] }>, bassNotes: string[], scaleNotes: string[], tempo = 120) {
    if (!this.ready) await this.initialize()
    if (!this.instrument) return

    const beat = 60 / tempo

    for (let i = 0; i < chords.length; i++) {
      const start = this.ac.currentTime
      const chordDur = beat * 4

      // Play Chord
      const voices = [
        this.noteName(chords[i].notes[0], 3),
        this.noteName(chords[i].notes[1] ?? chords[i].notes[0], 4),
        this.noteName(chords[i].notes[2] ?? chords[i].notes[0], 4),
        chords[i].notes[3] ? this.noteName(chords[i].notes[3], 4) : undefined,
      ].filter(Boolean) as string[]

      voices.forEach((n) => {
        this.instrument!.play(n, start, { duration: chordDur })
      })

      // Play Bass
      if (bassNotes.length) {
        [0, 1, 2, 3].forEach((step) => {
          const n = `${bassNotes[i % bassNotes.length]}2`
          this.instrument!.play(n, start + step * beat, { duration: beat * 0.95 })
        })
      }

      // Play Noodle (Scale)
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


