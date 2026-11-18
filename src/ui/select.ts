import { state, type Team } from '../state';
import { useSvg } from '../assets/sprites';
import { $, playsText, showScreen, teamBar, teamBarHtml } from './common';
import { sfx } from '../sound';

export function selectHtml(): string {
  return `
  <section class="screen" id="s-select">
    <h2>どっちの陣営で<br>戦う？</h2>
    <p class="sub">大会ごとに所属を宣言しよう</p>
    <div class="teams">
      <button class="team k" data-team="kino" type="button">${useSvg('kino', '0 0 100 120')}<div><div class="h">きのこ陣営</div><div class="d">どっしり安定の守りタイプ。<br>＋助っ人外国人選手</div></div></button>
      <button class="team t" data-team="take" type="button">${useSvg('take', '0 0 100 120')}<div><div class="h">たけのこ陣営</div><div class="d">スピード自慢の攻めタイプ。<br>＋助っ人外国人選手</div></div></button>
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
