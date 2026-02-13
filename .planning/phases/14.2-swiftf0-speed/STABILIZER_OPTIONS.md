# Mic Pitch Post-Processing: When to Use Bypass vs Light vs Full

The SwiftF0 path (and MPM path) can use post-processing to reduce UI flicker and octave jumps: **confidence gate**, **running median**, **hysteresis**, and **stability timer**. You can optimize or disable some of this.

## Options (SwiftF0 path only)

| Option | Effect | CPU | Use when |
|--------|--------|-----|----------|
| **Full** (default) | Confidence gate + median (7) + hysteresis (profile) + stability timer | Highest | Noisy input, vibrato, or octave jumps; default for jazz instruments. |
| **Light** | Confidence gate only (no median, no hysteresis) | Lower | SwiftF0 output is already stable; you want less latency and less CPU. |
| **Off** (`useStabilizer: false`) | Raw SwiftF0 pitch every frame | Lowest | A/B testing or when the neural output is stable enough and you want minimal latency. |

## How to set

- **PitchStoreOptions** (when initializing the pitch store, e.g. `useHighPerformancePitch` / ITM):
  - `useStabilizer: false` → bypass all post-processing (raw pitch).
  - `stabilizerMode: 'light'` → use CrepeStabilizer in light mode (confidence gate only).
  - Omit both (or `useStabilizer: true`, `stabilizerMode: 'full'`) → full median + hysteresis.

Example (raw pitch for testing):

```ts
initialize(stream, instrumentId, { useSwiftF0: true, useStabilizer: false });
```

Example (light mode: confidence gate only):

```ts
initialize(stream, instrumentId, { useSwiftF0: true, stabilizerMode: 'light' });
```

## MPM path

The **MPM path** (when SwiftF0 is off) still uses its own inline stabilizer in `MpmWorker.ts` (median 7, hysteresis 35 cents, stability 3). That is unchanged; only the SwiftF0 worker has bypass and light mode.

## Recommendation

- Start with **full** (default). If you see smooth pitch and low CPU is important, try **light**.
- Use **off** only for A/B comparison or if you’ve confirmed SwiftF0 is stable enough without post-processing.
