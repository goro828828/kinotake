import type { Team } from '../state';

export interface BasketSpec {
  /** basket width, px */
  w: number;
  /** max basket speed, px/s */
  speed: number;
}

export const BASKET: Record<Team, BasketSpec> = {
  kino: { w: 96, speed: 340 },
  take: { w: 66, speed: 480 },
};

/** relay legs: each runner harvests one ingredient for 10 seconds */
export const LEGS = [
  { sym: 'cacao', name: 'カカオ', place: 'カカオ農園' },
  { sym: 'wheat', name: '小麦', place: '小麦畑' },
  { sym: 'milk', name: 'ミルク', place: '牧場' },
] as const;

export const HARVEST = {
  durationSec: 30,
  legSec: 10,
  itemSize: 38,
  /** seconds between spawns at start / at the end */
  spawnStart: 0.75,
  spawnEnd: 0.42,
  /** fall speed px/s at start, and added per second elapsed */
  fallStart: 170,
  fallAccel: 6,
  badRate: 0.22,
  stunSec: 0.7,
  basketBottom: 14,
  basketH: 46,
  perItem: 10,
  comboEvery: 5,
  perCombo: 20,
};
