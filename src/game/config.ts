import type { Team } from '../state';

export interface PieceSpec {
  /** SVG symbol id */
  sym: 'pkm' | 'ptp';
  /** piece width / height in px */
  w: number;
  h: number;
  /** height gained per floor (with overlap), px */
  step: number;
  /** initial horizontal speed, px/s */
  speed: number;
  /** allowed offset before falling, as a ratio of width */
  tol: number;
}

// CLAUDE.md §4
export const SPEC: Record<Team, PieceSpec> = {
  kino: { sym: 'pkm', w: 80, h: 60, step: 34, speed: 150, tol: 0.62 },
  take: { sym: 'ptp', w: 60, h: 70, step: 42, speed: 130, tol: 0.55 },
};

export const GAME = {
  durationSec: 30,
  warnSec: 10,
  perfectPx: 6,
  speedUp: 1.06,
  maxSpeedRatio: 2.2,
  /** camera keeps the tower top below this ratio of the field height (from the top) */
  cameraLine: 0.55,
  /** side margin of the moving piece, px */
  sideMargin: 6,
  /** top position of the moving piece, px */
  moverTop: 14,
  /** distance from field bottom to the ground surface, px (18 offset + 10 ground) */
  groundSurface: 28,
};

// CLAUDE.md §5
export const SCORE = {
  participation: 50,
  perFloor: 10,
  perPerfect: 20,
};

// CLAUDE.md §6
export const DAILY_PLAYS = 3;
export const QR_BONUS_PER_DAY = 1;

export const DEMO_TEAM_POINTS: Record<Team, number> = { kino: 51240, take: 49880 };

export function totalPoints(floors: number, perfects: number): number {
  return SCORE.participation + floors * SCORE.perFloor + perfects * SCORE.perPerfect;
}
