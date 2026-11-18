import { SCORE } from './game/config';

export type EventId = 'stack' | 'harvest' | 'quiz';

export interface ResultRow {
  /** label HTML (may contain <b>) */
  label: string;
  pts: number;
}

export interface PlayResult {
  event: EventId;
  /** headline under the team badge, e.g. タイムアップ！ */
  reason: string;
  /** bonus rows (participation points are added on top) */
  rows: ResultRow[];
}

export interface EventDef {
  id: EventId;
  name: string;
  /** one-line rule shown on the event card */
  desc: string;
  /** what differs between the camps */
  teamNote: string;
  icon: { sym: string; viewBox: string };
}

export const EVENTS: Record<EventId, EventDef> = {
  stack: {
    id: 'stack',
    name: 'きのたけ積み上げ',
    desc: '30秒で、落とさず高く積もう',
    teamNote: 'きのこは広くて安定、たけのこは細くて難しい',
    icon: { sym: 'pkm', viewBox: '0 0 80 60' },
  },
  harvest: {
    id: 'harvest',
    name: '産地の収穫リレー',
    desc: 'カゴで原料をキャッチ。虫はよけよう',
    teamNote: 'きのこはカゴが広い、たけのこは動きが速い',
    icon: { sym: 'cacao', viewBox: '0 0 40 40' },
  },
  quiz: {
    id: 'quiz',
    name: '産地クイズ',
    desc: 'お菓子に使われている原料の産地をあてよう',
    teamNote: 'きのこはヒント1回、たけのこは速答×1.5',
    icon: { sym: 'globe', viewBox: '0 0 40 40' },
  },
};

export const EVENT_ORDER: EventId[] = ['stack', 'harvest', 'quiz'];

export function resultTotal(r: PlayResult): number {
  return SCORE.participation + r.rows.reduce((s, row) => s + row.pts, 0);
}
