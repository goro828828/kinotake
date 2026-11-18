import type { Team } from '../state';
import { BASKET, HARVEST, LEGS } from '../game/harvest-config';
import { HarvestGame } from '../game/harvest';
import { EVENTS, type PlayResult } from '../games';
import { useSvg } from '../assets/sprites';
import { $, countdown, fmt, isOn, playsText, showScreen } from './common';
import { sfx } from '../sound';

export function harvestHtml(): string {
  return `
  <section class="screen" id="s-harvest">
    <div class="hud">
      <div class="box"><div class="lb">SCORE</div><div class="vl" id="vScore">0</div></div>
      <div class="box"><div class="lb">収穫</div><div class="vl" id="vCaught">0</div></div>
      <div class="box"><div class="lb">のこり</div><div class="vl" id="vTime">30</div></div>
    </div>
    <div class="legs" id="vLegs">${LEGS.map((l, i) => `<span class="leg" data-i="${i}">${useSvg(l.sym, '0 0 40 40')}<span>${i + 1}走 ${l.place}</span></span>`).join('')}</div>
    <div class="field" id="vField">
      <div class="layer" id="vLayer"></div>
      <div class="basket" id="vBasket">${useSvg('basket', '0 0 100 50')}</div>
      <div class="tip" id="vTip">ドラッグか ◀ ▶ でカゴを動かそう<br><small>虫に当たると少し動けなくなる</small></div>
      <div class="count" id="vCount" hidden>3</div>
    </div>
    <div class="pad">
      <button class="btn dark" id="vLeft" type="button" aria-label="左へ">◀</button>
      <button class="btn dark" id="vRight" type="button" aria-label="右へ">▶</button>
    </div>
    <p class="lives" id="vPlays"></p>
  </section>`;
}

let game: HarvestGame | null = null;
let cancelCount: (() => void) | null = null;
const held = { left: false, right: false };

function applyDir(): void {
  game?.setDir((held.right ? 1 : 0) - (held.left ? 1 : 0));
}

function holdButton(id: string, side: 'left' | 'right'): void {
  const b = $(id);
  const on = (e: Event) => { e.preventDefault(); held[side] = true; applyDir(); $('vTip').style.display = 'none'; };
  const off = () => { if (!held[side]) return; held[side] = false; applyDir(); };
  b.addEventListener('pointerdown', on);
  ['pointerup', 'pointercancel', 'pointerleave'].forEach((t) => b.addEventListener(t, off));
  b.addEventListener('contextmenu', (e) => e.preventDefault());
}

export function initHarvest(): void {
  const field = $('vField');
  const point = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' && e.buttons === 0 && e.type === 'pointermove') return;
    const r = field.getBoundingClientRect();
    game?.pointTo(e.clientX - r.left);
    $('vTip').style.display = 'none';
  };
  field.addEventListener('pointerdown', (e) => { e.preventDefault(); point(e); });
  field.addEventListener('pointermove', point);
  holdButton('vLeft', 'left');
  holdButton('vRight', 'right');

  const keys = (e: KeyboardEvent, down: boolean) => {
    if (!isOn('s-harvest')) return;
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') held.left = down;
    else if (e.code === 'ArrowRight' || e.code === 'KeyD') held.right = down;
    else return;
    e.preventDefault();
    if (down) $('vTip').style.display = 'none';
    applyDir();
  };
  document.addEventListener('keydown', (e) => keys(e, true));
  document.addEventListener('keyup', (e) => keys(e, false));
}

function setLeg(i: number): void {
  document.querySelectorAll<HTMLElement>('#vLegs .leg').forEach((el) => {
    const n = Number(el.dataset.i);
    el.classList.toggle('on', n === i);
    el.classList.toggle('done', n < i);
  });
}

export function startHarvest(team: Team, finish: (r: PlayResult) => void): void {
  game?.destroy();
  cancelCount?.();
  held.left = held.right = false;
  showScreen('s-harvest', `種目：${EVENTS.harvest.name}`);

  $('vScore').textContent = '0';
  $('vCaught').textContent = '0';
  $('vTime').textContent = String(HARVEST.durationSec);
  $('vTime').classList.remove('warn');
  $('vPlays').textContent = playsText();
  $('vTip').style.display = 'block';
  setLeg(0);

  const g = new HarvestGame(
    BASKET[team],
    { field: $('vField'), layer: $('vLayer'), basket: $('vBasket') },
    {
      onTime(sec) {
        $('vTime').textContent = String(sec);
        $('vTime').classList.toggle('warn', sec <= 10);
      },
      onScore(score, caught) {
        $('vScore').textContent = fmt(score);
        $('vCaught').textContent = String(caught);
      },
      onLeg: setLeg,
      onEnd(s) {
        if (game === g) game = null;
        setLeg(LEGS.length);
        sfx.end();
        finish({
          event: 'harvest',
          reason: 'ゴール！タイムアップ',
          rows: [
            { label: `収穫した原料 <b>${s.caught}</b>個 × ${HARVEST.perItem}`, pts: s.caught * HARVEST.perItem },
            { label: `${HARVEST.comboEvery}連続コンボ <b>${s.combos}</b>回 × ${HARVEST.perCombo}`, pts: s.combos * HARVEST.perCombo },
          ],
        });
      },
    },
  );
  game = g;
  cancelCount = countdown($('vCount'), () => g.begin());
}
