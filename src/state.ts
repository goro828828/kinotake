import { DAILY_PLAYS, DEMO_TEAM_POINTS, PLAY_LIMIT_ENABLED, QR_BONUS_PER_DAY } from './game/config';

export type Team = 'kino' | 'take';

const KEY_DAY = 'kinotake.day.v1';
const KEY_CONTRIB = 'kinotake.contrib.v1';
const KEY_SOUND = 'kinotake.sound.v1';

interface DayState {
  date: string;
  plays: number;
  bonus: number;
  qrUsed: boolean;
}

// In-memory fallback when localStorage is unavailable (private mode, blocked storage, etc.)
const memory = new Map<string, string>();

function read<T>(key: string, fallback: T): T {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key);
  } catch {
    raw = memory.get(key) ?? null;
  }
  if (raw == null) raw = memory.get(key) ?? null;
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  const raw = JSON.stringify(value);
  memory.set(key, raw);
  try {
    localStorage.setItem(key, raw);
  } catch {
    /* storage unavailable: keep in memory only */
  }
}

/** Local date as YYYY-MM-DD. */
export function today(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function day(): DayState {
  const s = read<DayState | null>(KEY_DAY, null);
  const t = today();
  if (!s || s.date !== t || typeof s.plays !== 'number') {
    return { date: t, plays: 0, bonus: 0, qrUsed: false };
  }
  return s;
}

export const state = {
  team: null as Team | null,

  limit(): number {
    return DAILY_PLAYS + day().bonus;
  },
  remaining(): number {
    if (!PLAY_LIMIT_ENABLED) return Infinity;
    const d = day();
    return Math.max(0, DAILY_PLAYS + d.bonus - d.plays);
  },
  /** Consume one play. Returns false if none left. */
  consumePlay(): boolean {
    if (!PLAY_LIMIT_ENABLED) return true;
    const d = day();
    if (DAILY_PLAYS + d.bonus - d.plays <= 0) return false;
    d.plays++;
    write(KEY_DAY, d);
    return true;
  },
  qrUsed(): boolean {
    return day().qrUsed;
  },
  /** MVP: pressing the button grants +1 (production: verify the QR code server-side). */
  useQr(): boolean {
    const d = day();
    if (d.qrUsed) return false;
    d.qrUsed = true;
    d.bonus += QR_BONUS_PER_DAY;
    write(KEY_DAY, d);
    return true;
  },

  /** Demo team points + this device's contributions. */
  teamPoints(): Record<Team, number> {
    const c = read<Record<Team, number>>(KEY_CONTRIB, { kino: 0, take: 0 });
    return {
      kino: DEMO_TEAM_POINTS.kino + (Number(c.kino) || 0),
      take: DEMO_TEAM_POINTS.take + (Number(c.take) || 0),
    };
  },
  addTeamPoints(team: Team, pts: number): void {
    const c = read<Record<Team, number>>(KEY_CONTRIB, { kino: 0, take: 0 });
    c[team] = (Number(c[team]) || 0) + pts;
    write(KEY_CONTRIB, c);
  },

  soundOn(): boolean {
    return read<boolean>(KEY_SOUND, true);
  },
  setSound(on: boolean): void {
    write(KEY_SOUND, on);
  },
};
