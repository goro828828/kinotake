import type { Team } from '../state';
import { SPEC, GAME, SCORE } from '../game/config';
import { StackGame } from '../game/stack';
import { EVENTS, type PlayResult } from '../games';
import { $, countdown, fmt, isOn, playsText, showScreen } from './common';
import { sfx } from '../sound';

export function gameHtml(): string {
  return `
  <section class="screen" id="s-game">
    <div class="hud">
      <div class="box"><div class="lb">SCORE</div><div class="vl" id="hScore">0</div></div>
      <div class="box"><div class="lb">段数</div><div class="vl" id="hFloor">0</div></div>
      <div class="box"><div class="lb">のこり</div><div class="vl" id="hTime">30</div></div>
    </div>
    <div class="field" id="field">
      <div class="world" id="world"><div class="ground" id="ground"></div></div>
      <div class="mover" id="mover"></div>
      <div class="tip" id="tip">タップで落とす</div>
      <div class="count" id="count" hidden>3</div>
    </div>
    <button class="btn dark taphint" id="dropBtn" type="button">タップして積む</button>
    <p class="lives" id="hPlays"></p>
  </section>`;
}

let game: StackGame | null = null;
let cancelCount: (() => void) | null = null;

function drop(): void {
  game?.drop();
}

export function initGame(): void {
  // One input path per gesture: pointerdown on the field and on the button (not click),
  // so a tap never fires twice. `dropping` in StackGame guards against mashing.
  $('field').addEventListener('pointerdown', (e) => { e.preventDefault(); drop(); });
  $('dropBtn').addEventListener('pointerdown', (e) => { e.preventDefault(); drop(); });
  // keyboard activation of the focused button (Enter); Space is handled below
  $('dropBtn').addEventListener('click', (e) => { if (e.detail === 0) drop(); });
  document.addEventListener('keydown', (e) => {
    if (e.code !== 'Space' || !isOn('s-game')) return;
    e.preventDefault();
    if (!e.repeat) drop();
  });
}

export function startStack(team: Team, finish: (r: PlayResult) => void): void {
  game?.destroy();
  cancelCount?.();
  showScreen('s-game', `種目：${EVENTS.stack.name}`);

  $('hScore').textContent = '0';
  $('hFloor').textContent = '0';
  $('hTime').textContent = String(GAME.durationSec);
  $('hTime').classList.remove('warn');
  $('hPlays').textContent = playsText();

  const g = new StackGame(
    SPEC[team],
    { field: $('field'), world: $('world'), mover: $('mover'), ground: $('ground'), tip: $('tip') },
    {
      onTime(sec) {
        $('hTime').textContent = String(sec);
        $('hTime').classList.toggle('warn', sec <= GAME.warnSec);
      },
      onScore(score, floors) {
        $('hScore').textContent = fmt(score);
        $('hFloor').textContent = String(floors);
      },
      onEnd(r) {
        g.destroy();
        if (game === g) game = null;
        sfx.end();
        finish({
          event: 'stack',
          reason: r.reason === 'timeup' ? 'タイムアップ！' : '落としてしまった！',
          rows: [
            { label: `積んだ段数 <b>${r.floors}</b>段 × ${SCORE.perFloor}`, pts: r.floors * SCORE.perFloor },
            { label: `PERFECT <b>${r.perfects}</b>回 × ${SCORE.perPerfect}`, pts: r.perfects * SCORE.perPerfect },
          ],
        });
      },
    },
  );
  game = g;
  cancelCount = countdown($('count'), () => g.begin());
}
