#!/usr/bin/env node
/**
 * Adds standards that exist in an iReal Pro playlist but are missing from
 * src/modules/JazzKiller/utils/standards.json. Also updates Tempo (BPM) for
 * existing entries. Converts iReal song format to our JSON schema (Title,
 * Composer, Key, Rhythm, TimeSignature, Tempo, Sections).
 *
 * Usage:
 *   node scripts/merge-standards-from-ireal.cjs path/to/playlist.txt
 *   node scripts/merge-standards-from-ireal.cjs "irealb://..."
 *
 * Options:
 *   --dry-run    Print what would be added/updated without writing.
 */

const fs = require('fs');
const path = require('path');

const STANDARDS_PATH = path.join(
  __dirname,
  '..',
  'src',
  'modules',
  'JazzKiller',
  'utils',
  'standards.json'
);

function loadIRealReader() {
  try {
    return require('ireal-reader');
  } catch (e) {
    console.error('ireal-reader not found. Run: npm install');
    process.exit(1);
  }
}

function readInput(input) {
  const isUrl = (input || '').trim().startsWith('irealb://');
  if (isUrl) return input.trim();

  const filePath = path.isAbsolute(input) ? input : path.join(process.cwd(), input);
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
  }
  const content = fs.readFileSync(filePath, 'utf8').trim();
  const urlMatch = content.match(/irealb:\/\/[^\s"]+/);
  if (urlMatch) return urlMatch[0];
  if (content.startsWith('irealb://')) return content;
  console.error('No irealb:// URL found in file.');
  process.exit(1);
}

function parsePlaylist(url) {
  const iRealReader = loadIRealReader();
  const playlist = iRealReader(url);
  if (!playlist || !playlist.songs || !Array.isArray(playlist.songs)) {
    console.error('Invalid playlist: no songs array.');
    process.exit(1);
  }
  return playlist;
}

function normalizeTitle(s) {
  return (s || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Convert iReal song to our standard entry shape.
 * music.measures is array of arrays of chord strings (or null for N.C).
 */
function irealSongToStandard(song) {
  let chordsStr = '';
  if (song.music && Array.isArray(song.music.measures) && song.music.measures.length > 0) {
    chordsStr = song.music.measures
      .map((m) => (Array.isArray(m) ? m : [])
        .map((c) => (c == null || c === '') ? '' : String(c))
        .join(','))
      .join('|');
  }
  const ts = song.music && song.music.timeSignature != null
    ? String(song.music.timeSignature)
    : '4';
  const timeSignature = ts.includes('/') ? ts : `${ts}/4`;

  const entry = {
    Title: (song.title || '').trim() || 'Untitled',
    Composer: (song.composer || '').trim() || 'Unknown',
    Rhythm: (song.style || '').trim() || 'Swing',
    TimeSignature: timeSignature,
    Sections: [{ MainSegment: { Chords: chordsStr || '' } }],
  };
  if (song.key) entry.Key = String(song.key).trim();
  if (song.bpm != null && Number(song.bpm) > 0) entry.Tempo = Number(song.bpm);
  if (song.repeats != null && Number(song.repeats) >= 1) entry.DefaultLoops = Number(song.repeats);
  if (song.compStyle && String(song.compStyle).trim()) entry.CompStyle = String(song.compStyle).trim();
  return entry;
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const raw = args.find((a) => a !== '--dry-run');

  if (!raw) {
    console.error('Usage: node merge-standards-from-ireal.cjs <irealb://...> or <path-to-file> [--dry-run]');
    process.exit(1);
  }

  const url = readInput(raw);
  console.log('Parsing iReal playlist...');
  const playlist = parsePlaylist(url);
  console.log('Playlist name:', playlist.name || '(none)');
  console.log('Songs in playlist:', playlist.songs.length);

  if (!fs.existsSync(STANDARDS_PATH)) {
    console.error('Standards file not found:', STANDARDS_PATH);
    process.exit(1);
  }

  const standards = JSON.parse(fs.readFileSync(STANDARDS_PATH, 'utf8'));
  if (!Array.isArray(standards)) {
    console.error('standards.json is not an array.');
    process.exit(1);
  }

  const existingTitles = new Set(standards.map((e) => normalizeTitle((e.Title || '').trim())));

  let tempoUpdated = 0;
  let added = 0;
  let repeatsUpdated = 0;
  const addedTitles = [];
  const updatedTempoTitles = [];

  for (const song of playlist.songs) {
    const title = (song.title || '').trim();
    if (!title) continue;

    const key = normalizeTitle(title);
    let entry = standards.find((e) => normalizeTitle((e.Title || '').trim()) === key);

    if (entry) {
      const bpm = song.bpm != null && Number(song.bpm) > 0 ? Number(song.bpm) : null;
      if (bpm != null && entry.Tempo !== bpm) {
        entry.Tempo = bpm;
        tempoUpdated++;
        updatedTempoTitles.push(`${title} → ${bpm} BPM`);
      }
      const reps = song.repeats != null ? Number(song.repeats) : 0;
      if (reps >= 1 && entry.DefaultLoops !== reps) {
        entry.DefaultLoops = reps;
        repeatsUpdated++;
      }
      if (song.compStyle != null && String(song.compStyle).trim()) entry.CompStyle = String(song.compStyle).trim();
      continue;
    }

    try {
      const newEntry = irealSongToStandard(song);
      if (!newEntry.Sections[0].MainSegment.Chords) {
        console.warn('  Skip (no chords):', title);
        continue;
      }
      standards.push(newEntry);
      added++;
      addedTitles.push(title);
    } catch (err) {
      console.warn('  Skip (parse error):', title, err.message);
    }
  }

  console.log('Tempo updated for existing:', tempoUpdated);
  console.log('Repeats updated for existing:', repeatsUpdated);
  console.log('New standards added:', added);

  if (updatedTempoTitles.length) {
    console.log('Tempo updates:');
    updatedTempoTitles.slice(0, 20).forEach((t) => console.log('  ', t));
    if (updatedTempoTitles.length > 20) console.log('  ... and', updatedTempoTitles.length - 20, 'more');
  }
  if (addedTitles.length) {
    console.log('Added:');
    addedTitles.slice(0, 30).forEach((t) => console.log('  ', t));
    if (addedTitles.length > 30) console.log('  ... and', addedTitles.length - 30, 'more');
  }

  if (!dryRun && (added > 0 || tempoUpdated > 0 || repeatsUpdated > 0)) {
    fs.writeFileSync(STANDARDS_PATH, JSON.stringify(standards, null, 2) + '\n', 'utf8');
    console.log('Wrote', STANDARDS_PATH);
  } else if (dryRun) {
    console.log('[DRY RUN] No file written.');
  }
}

main();
