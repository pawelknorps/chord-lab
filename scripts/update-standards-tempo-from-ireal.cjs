#!/usr/bin/env node
/**
 * Updates src/modules/JazzKiller/utils/standards.json with Tempo (BPM) from an
 * iReal Pro playlist (irealb:// URL). Matches songs by Title (and optionally
 * Composer); only sets Tempo when the iReal song has a positive BPM.
 *
 * Usage:
 *   node scripts/update-standards-tempo-from-ireal.cjs "irealb://..."
 *   node scripts/update-standards-tempo-from-ireal.cjs path/to/playlist.txt
 *
 * If the argument is a file path, the file may contain a single irealb:// URL
 * (or the raw URL string). If it looks like a URL (starts with irealb://),
 * it is used directly.
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
  const isUrl = input.trim().startsWith('irealb://');
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

/** Normalize title for matching (lowercase, collapse spaces). */
function normalizeTitle(s) {
  return (s || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Build map: normalizedTitle -> { bpm, repeats, compStyle } (last wins if duplicates). */
function indexByTitle(songs) {
  const map = new Map();
  for (const s of songs) {
    const title = normalizeTitle(s.title);
    const bpm = s.bpm != null && Number(s.bpm) > 0 ? Number(s.bpm) : null;
    const repeats = s.repeats != null && Number(s.repeats) >= 1 ? Number(s.repeats) : null;
    const compStyle = (s.compStyle || '').trim() || null;
    if (title) map.set(title, { bpm, repeats, compStyle });
  }
  return map;
}

function main() {
  const raw = process.argv[2];
  if (!raw) {
    console.error('Usage: node update-standards-tempo-from-ireal.cjs <irealb://...> or <path-to-file>');
    process.exit(1);
  }

  const url = readInput(raw);
  console.log('Parsing iReal playlist...');
  const playlist = parsePlaylist(url);
  console.log('Playlist name:', playlist.name || '(none)');
  console.log('Songs in playlist:', playlist.songs.length);

  const metaByTitle = indexByTitle(playlist.songs);
  const withBpm = [...metaByTitle.entries()].filter(([, v]) => v.bpm != null);
  console.log('Songs with BPM:', withBpm.length);

  if (!fs.existsSync(STANDARDS_PATH)) {
    console.error('Standards file not found:', STANDARDS_PATH);
    process.exit(1);
  }

  const standards = JSON.parse(fs.readFileSync(STANDARDS_PATH, 'utf8'));
  if (!Array.isArray(standards)) {
    console.error('standards.json is not an array.');
    process.exit(1);
  }

  let updated = 0;
  const updatedTitles = [];

  for (const entry of standards) {
    const title = (entry.Title || '').trim();
    const key = normalizeTitle(title);
    const match = metaByTitle.get(key);
    if (match) {
      if (match.bpm != null) {
        const prev = entry.Tempo;
        entry.Tempo = match.bpm;
        if (prev !== match.bpm) {
          updated++;
          updatedTitles.push(`${title} → ${match.bpm} BPM`);
        }
      }
      if (match.repeats != null) entry.DefaultLoops = match.repeats;
      if (match.compStyle != null) entry.CompStyle = match.compStyle;
    }
  }

  fs.writeFileSync(STANDARDS_PATH, JSON.stringify(standards, null, 2) + '\n', 'utf8');
  console.log('Updated', updated, 'entries with Tempo in', STANDARDS_PATH);
  if (updatedTitles.length) updatedTitles.forEach((t) => console.log('  ', t));
}

main();
