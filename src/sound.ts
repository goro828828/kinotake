import { state } from './state';

type Ctx = AudioContext;
let ctx: Ctx | null = null;

function audio(): Ctx | null {
  if (!state.soundOn()) return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.15, slideTo?: number, delay = 0): void {
  const a = audio();
  if (!a) return;
  const t0 = a.currentTime + delay;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(a.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

export const sfx = {
  /** call from a user gesture so iOS unlocks audio */
  unlock(): void {
    audio();
  },
  count(): void { tone(660, 0.12, 'square', 0.06); },
  start(): void { tone(990, 0.25, 'square', 0.06); },
  land(): void { tone(220, 0.09, 'triangle', 0.2); },
  perfect(): void {
    tone(880, 0.1, 'triangle', 0.12);
    tone(1320, 0.16, 'triangle', 0.12, undefined, 0.08);
  },
  fall(): void { tone(400, 0.5, 'sawtooth', 0.06, 90); },
  end(): void {
    tone(523, 0.12, 'triangle', 0.12);
    tone(659, 0.12, 'triangle', 0.12, undefined, 0.12);
    tone(784, 0.25, 'triangle', 0.12, undefined, 0.24);
  },
};
