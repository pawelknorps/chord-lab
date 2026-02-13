/**
 * Phase 5: Director Engine – current Director-chosen instrument for context injection.
 */
import { signal } from '@preact/signals-react';
import type { DirectorInstrumentId } from '../director/directorTypes';

export const directorInstrumentSignal = signal<DirectorInstrumentId>('piano');

export function setDirectorInstrument(id: DirectorInstrumentId): void {
  directorInstrumentSignal.value = id;
}

export function getDirectorInstrument(): DirectorInstrumentId {
  return directorInstrumentSignal.value;
}
