#!/usr/bin/env node
/**
 * Parse JJazzLab drums44DB.mid and output drum patterns as JSON.
 * Markers: _RIDE_1, _BRUSHES_1, ... #fill, #alt, _END. Notes on track 0.
 * GM drum map: 36=Kick, 38=Snare, 42=Closed HH, 46=Open HH, 51=Ride, 53=Ride Bell.
 * Usage: node scripts/import-jjazzlab-drums.mjs [path-to-drums44DB.mid]
 */

import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import pkg from "@tonejs/midi";
const { Midi } = pkg;

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const defaultPath = join(
  root,
  "legacy_projects/JJazzLab-master/plugins/JJSwing/src/main/resources/org/jjazz/jjswing/drums/db/drums44DB.mid"
);

const GM_TO_INSTRUMENT = {
  36: "Kick",
  38: "Snare",
  42: "HatPedal",
  46: "HatOpen",
  51: "Ride",
  53: "Ride",
  // common GM extras
  39: "Snare",
  41: "Snare",
  43: "Kick",
  44: "HatPedal",
  45: "Snare",
  47: "Snare",
  48: "Snare",
  49: "Snare",
  50: "Kick",
  52: "Ride",
  54: "Snare",
  55: "Snare",
  56: "Snare",
  57: "Snare",
  59: "Ride",
};

function main() {
  const midiPath = process.argv[2] || defaultPath;
  let buffer;
  try {
    buffer = readFileSync(midiPath);
  } catch (e) {
    console.error("Failed to read", midiPath, e.message);
    process.exit(1);
  }

  const midi = new Midi(buffer);
  const ppq = midi.header.ppq;
  const meta = (midi.header.meta || []).filter((m) => m.type === "marker");
  if (meta.length === 0) {
    console.error("No marker meta events found. Meta events:", midi.header.meta?.length ?? 0);
    process.exit(1);
  }

  // Sort by ticks; expect first to be _STYLE, last _END
  meta.sort((a, b) => a.ticks - b.ticks);
  const firstText = meta[0].text || "";
  const lastText = (meta[meta.length - 1].text || "").toUpperCase();
  if (!firstText.startsWith("_") || lastText !== "_END") {
    console.warn("Unexpected markers: first=", firstText, "last=", lastText);
  }

  const track = midi.tracks[0];
  if (!track || !track.notes || track.notes.length === 0) {
    console.error("No notes on first track");
    process.exit(1);
  }

  const patterns = [];
  let currentStyleId = null;
  let currentStyleName = null;
  let startTick = 0;
  let patternType = "std";

  for (let i = 0; i < meta.length; i++) {
    const m = meta[i];
    const text = (m.text || "").trim();
    const ticks = m.ticks;
    const upper = text.toUpperCase();

    if (text.startsWith("_") && upper !== "_END") {
      // New style section: emit previous segment if any
      if (currentStyleId != null && i > 0) {
        const endTick = ticks;
        const events = collectNoteEvents(track.notes, ppq, startTick, endTick);
        if (events.length > 0) {
          patterns.push({
            styleId: currentStyleId,
            name: currentStyleName || currentStyleId,
            events,
            timeSignature: [4, 4],
            type: patternType,
          });
        }
      }
      currentStyleId = text.slice(1).toUpperCase().replace(/-/g, "_");
      currentStyleName = text.slice(1).replace(/_/g, " ");
      startTick = ticks;
      patternType = "std";
    } else if (upper === "#FILL") {
      if (currentStyleId != null) {
        const endTick = ticks;
        const events = collectNoteEvents(track.notes, ppq, startTick, endTick);
        if (events.length > 0) {
          patterns.push({
            styleId: currentStyleId,
            name: (currentStyleName || currentStyleId) + " (fill)",
            events,
            timeSignature: [4, 4],
            type: "fill",
          });
        }
      }
      startTick = ticks;
      patternType = "fill";
    } else if (upper === "#ALT") {
      if (currentStyleId != null) {
        const endTick = ticks;
        const events = collectNoteEvents(track.notes, ppq, startTick, endTick);
        if (events.length > 0) {
          patterns.push({
            styleId: currentStyleId,
            name: (currentStyleName || currentStyleId) + " (alt)",
            events,
            timeSignature: [4, 4],
            type: "std",
          });
        }
      }
      startTick = ticks;
    } else if (upper === "_END") {
      if (currentStyleId != null) {
        const endTick = ticks;
        const events = collectNoteEvents(track.notes, ppq, startTick, endTick);
        if (events.length > 0) {
          patterns.push({
            styleId: currentStyleId,
            name: currentStyleName || currentStyleId,
            events,
            timeSignature: [4, 4],
            type: patternType,
          });
        }
      }
      break;
    }
  }

  const outPath = join(root, "src/data/jjazzlab-drum-patterns.json");
  writeFileSync(outPath, JSON.stringify(patterns, null, 2), "utf8");
  console.log("Wrote", patterns.length, "patterns to", outPath);
}

function collectNoteEvents(notes, ppq, startTick, endTick) {
  const events = [];
  for (const n of notes) {
    const tick = n.ticks ?? 0;
    if (tick < startTick || tick >= endTick) continue;
    const inst = GM_TO_INSTRUMENT[n.midi];
    if (!inst) continue;
    const timeBeats = (tick - startTick) / ppq;
    const raw = typeof n.velocity === "number" ? n.velocity : 100;
    const velocity = raw <= 1 ? raw : Math.min(1, raw / 127);
    events.push({ timeBeats, instrument: inst, velocity });
  }
  events.sort((a, b) => a.timeBeats - b.timeBeats);
  return events;
}

main();
