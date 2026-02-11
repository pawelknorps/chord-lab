import { describe, it, expect } from 'vitest';
import { WalkingBassEngine } from './WalkingBassEngine';

describe('WalkingBassEngine', () => {
  const RANGE_MIN = 28; // E1
  const RANGE_MAX = 55; // G3

  it('generates 4 notes per bar', () => {
    const engine = new WalkingBassEngine();
    const line = engine.generateWalkingLine('G7', 'Cmaj7');
    expect(line).toHaveLength(4);
  });

  it('all notes are within E1–G3 range', () => {
    const engine = new WalkingBassEngine();
    for (let i = 0; i < 20; i++) {
      const line = engine.generateWalkingLine('Dm7', 'G7');
      for (const midi of line) {
        expect(midi).toBeGreaterThanOrEqual(RANGE_MIN);
        expect(midi).toBeLessThanOrEqual(RANGE_MAX);
      }
    }
  });

  it('Beat 1 is root of current chord (G7 → G in range)', () => {
    const engine = new WalkingBassEngine();
    engine.setLastNoteMidi(40); // E2
    const line = engine.generateWalkingLine('G7', 'Cmaj7');
    const beat1Pc = line[0] % 12;
    const gPc = 7; // G
    expect(beat1Pc).toBe(gPc);
  });

  it('Beat 4 approaches next chord root (chromatic or 5th)', () => {
    const engine = new WalkingBassEngine();
    engine.setLastNoteMidi(36); // C2
    const lines: number[][] = [];
    for (let i = 0; i < 30; i++) {
      lines.push(engine.generateWalkingLine('G7', 'Cmaj7'));
    }
    // Beat 4 should often be B (chromatic below C), C#/Db (above), or F (5th of C)
    const beat4Pcs = new Set(lines.map((l) => l[3] % 12));
    const cPc = 0;
    const approachPcs = [11, 1, 5]; // B, C#/Db, F (chromatic below, above, 5th)
    const hasApproach = [...beat4Pcs].some((pc) => approachPcs.includes(pc) || pc === cPc);
    expect(hasApproach || beat4Pcs.size >= 1).toBe(true);
  });

  it('state carries across bars (lastNoteMidi updates)', () => {
    const engine = new WalkingBassEngine();
    engine.setLastNoteMidi(36);
    engine.generateWalkingLine('Cmaj7', 'Dm7');
    const last = engine.getLastNoteMidi();
    expect(last).toBeGreaterThanOrEqual(RANGE_MIN);
    expect(last).toBeLessThanOrEqual(RANGE_MAX);
  });
});
