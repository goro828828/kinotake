import { state } from '../state';
import { sfx } from '../sound';

export const $ = <T extends HTMLElement = HTMLElement>(id: string): T => {
  const el = document.getElementById(id);
  if (!el) throw new Error(`#${id} not found`);
  return el as T;
};

export const fmt = (n: number): string => n.toLocaleString('ja-JP');

export type ScreenId = 's-select' | 's-events' | 's-game' | 's-harvest' | 's-quiz' | 's-result';

export function showScreen(id: ScreenId, barText: string): void {
  document.querySelectorAll<HTMLElement>('.screen').forEach((s) => s.classList.toggle('on', s.id === id));
  $('barTitle').textContent = barText;
}

export function isOn(id: ScreenId): boolean {
  return $(id).classList.contains('on');
}

let toastTimer = 0;
export function toast(msg: string): void {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => t.classList.remove('on'), 1800);
}

/** Render the kinoko/takenoko points bar. */
export function teamBar(prefix: string, pts = state.teamPoints()): void {
  const sum = pts.kino + pts.take || 1;
  $(`${prefix}K`).textContent = `きのこ ${fmt(pts.kino)} pt`;
  $(`${prefix}T`).textContent = `たけのこ ${fmt(pts.take)} pt`;
  $(`${prefix}BK`).style.width = `${(pts.kino / sum) * 100}%`;
  $(`${prefix}BT`).style.width = `${(pts.take / sum) * 100}%`;
}

export function teamBarHtml(prefix: string, title: string): string {
  return `
    <div class="score-card">
      <div class="ttl">${title}</div>
      <div class="tb-lbl"><span style="color:var(--kino)" id="${prefix}K"></span><span style="color:var(--take)" id="${prefix}T"></span></div>
      <div class="tb"><i id="${prefix}BK" style="background:var(--kino)"></i><i id="${prefix}BT" style="background:var(--take)"></i></div>
    </div>`;
}

export function playsText(): string {
  return `今日のプレイ　残り ${state.remaining()} / ${state.limit()} 回`;
}

/** 3, 2, 1, START! on an overlay element; returns a cancel function. */
export function countdown(el: HTMLElement, onDone: () => void): () => void {
  const timers: number[] = [];
  el.hidden = false;
  el.textContent = '3';
  ['3', '2', '1', 'START!'].forEach((txt, i) => {
    timers.push(window.setTimeout(() => {
      el.textContent = txt;
      txt === 'START!' ? sfx.start() : sfx.count();
    }, i * 650));
  });
  timers.push(window.setTimeout(() => {
    el.hidden = true;
    onDone();
  }, 3 * 650 + 450));
  return () => {
    timers.forEach((t) => clearTimeout(t));
    el.hidden = true;
  };
}
