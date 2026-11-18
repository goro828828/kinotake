import { state, type Team } from '../state';
import { useSvg } from '../assets/sprites';
import { $, playsText, showScreen, teamBar, teamBarHtml } from './common';
import { heroSvg } from './hero';
import { sfx } from '../sound';

export function selectHtml(): string {
  return `
  <section class="screen" id="s-select">
    <div class="hero">${heroSvg()}</div>
    <h2 class="sel-h">どっちの陣営で戦う？</h2>
    <div class="teams">
      <button class="team k" data-team="kino" type="button">${useSvg('km', '0 0 100 120')}<div><div class="h">きのこ陣営</div><div class="o">マンゴーの山｜インドのマンゴー</div><div class="d">どっしり安定の守りタイプ。＋助っ人外国人選手</div></div></button>
      <button class="team t" data-team="take" type="button">${useSvg('tp', '0 0 100 120')}<div><div class="h">たけのこ陣営</div><div class="o">ピスタチオの里｜イタリアのピスタチオ</div><div class="d">スピード自慢の攻めタイプ。＋助っ人外国人選手</div></div></button>
    </div>
    ${teamBarHtml('sel', '現在の陣営の勝ち点')}
    <p class="howto">3つの種目で、陣営に勝ち点を送ろう</p>
    <p class="lives" id="selPlays"></p>
  </section>`;
}

export function initSelect(onPick: (team: Team) => void): void {
  document.querySelectorAll<HTMLButtonElement>('.team').forEach((b) =>
    b.addEventListener('click', () => {
      sfx.unlock();
      state.team = b.dataset.team as Team;
      onPick(state.team);
    }),
  );
}

export function showSelect(): void {
  teamBar('sel');
  $('selPlays').textContent = playsText();
  showScreen('s-select', 'きのたけカップ 地区大会');
}
