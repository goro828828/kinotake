import { state, type Team } from '../state';
import { PLAY_LIMIT_ENABLED, SCORE } from '../game/config';
import { EVENTS, resultTotal, type EventId, type PlayResult } from '../games';
import { $, fmt, showScreen, teamBar, teamBarHtml, toast } from './common';

export function resultHtml(): string {
  return `
  <section class="screen" id="s-result">
    <div class="res-top">
      <span class="res-team" id="rTeam">きのこ陣営</span>
      <div class="res-ev" id="rEvent"></div>
      <div class="reason" id="rReason">タイムアップ！</div>
      <div class="big">＋<span id="rPts">0</span><small> pt</small></div>
      <div class="sub" style="margin-top:2px">陣営に勝ち点を加算しました</div>
    </div>
    <div class="breakdown" id="rRows"></div>
    ${teamBarHtml('r', '陣営の勝ち点（あなたの分を加算後）')}
    <div class="actions">
      <button class="btn dark" id="again" type="button">もう一度プレイ</button>
      <div class="row2">
        <button class="btn line" id="other" type="button">ほかの種目</button>
        <button class="btn line" id="share" type="button">結果をシェア</button>
      </div>
      <button class="btn line" id="qr" type="button">パッケージのQRで追加プレイ</button>
    </div>
    <p class="note">試作版：勝ち点・陣営の数値はデモ用の仮の値です</p>
  </section>`;
}

let current: { team: Team; event: EventId; total: number } | null = null;
let countRaf = 0;

export function initResult(playAgain: (team: Team, ev: EventId) => void, otherEvent: () => void): void {
  $('again').addEventListener('click', () => {
    if (current && state.remaining() > 0) playAgain(current.team, current.event);
  });
  $('other').addEventListener('click', otherEvent);
  $('qr').addEventListener('click', () => {
    if (!state.useQr()) return;
    refreshButtons();
    toast('追加プレイが1回ふえました！');
  });
  $('share').addEventListener('click', () => void share());
}

function refreshButtons(): void {
  const r = state.remaining();
  const again = $<HTMLButtonElement>('again');
  const qr = $<HTMLButtonElement>('qr');
  // limit switched off: unlimited replays, no QR bonus button
  qr.hidden = !PLAY_LIMIT_ENABLED;
  if (!PLAY_LIMIT_ENABLED) {
    again.disabled = false;
    again.textContent = 'もう一度プレイ';
    return;
  }
  again.disabled = r <= 0;
  again.textContent = r > 0 ? `もう一度プレイ（残り ${r} 回）` : '今日のプレイは終わり（また明日！）';
  const used = state.qrUsed();
  qr.disabled = used;
  qr.textContent = used ? 'QRの追加プレイは使用済み' : 'パッケージのQRで追加プレイ（＋1回）';
}

export function showResult(team: Team, r: PlayResult): void {
  const total = resultTotal(r);
  state.addTeamPoints(team, total);
  current = { team, event: r.event, total };

  const isK = team === 'kino';
  $('rTeam').textContent = isK ? 'きのこ陣営' : 'たけのこ陣営';
  $('rTeam').style.background = isK ? 'var(--kino)' : 'var(--take)';
  $('rEvent').textContent = `種目：${EVENTS[r.event].name}`;
  $('rReason').textContent = r.reason;
  $('rRows').innerHTML = [
    `<div><span>参加点</span><span>＋${SCORE.participation}</span></div>`,
    ...r.rows.map((row) => `<div><span>${row.label}</span><span>＋${fmt(row.pts)}</span></div>`),
    `<div><span>合計</span><span>＋${fmt(total)}</span></div>`,
  ].join('');
  $('rPts').textContent = '0';

  // bar: start from "before" values, then animate to "after"
  const after = state.teamPoints();
  const before = { ...after, [team]: after[team] - total };
  teamBar('r', before);
  showScreen('s-result', '結果');
  requestAnimationFrame(() => requestAnimationFrame(() => teamBar('r', after)));

  // count-up (~0.9s, ease-out)
  cancelAnimationFrame(countRaf);
  const t0 = performance.now();
  const dur = 900;
  const step = (now: number) => {
    const p = Math.min(1, (now - t0) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    $('rPts').textContent = fmt(Math.round(total * eased));
    if (p < 1) countRaf = requestAnimationFrame(step);
  };
  countRaf = requestAnimationFrame(step);

  refreshButtons();
}

async function share(): Promise<void> {
  if (!current) return;
  const name = current.team === 'kino' ? 'きのこ' : 'たけのこ';
  const text = `きのたけカップ「${EVENTS[current.event].name}」で${name}陣営に +${fmt(current.total)} pt 貢献！ #きのたけカップ`;
  const url = location.href.split('#')[0];
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title: 'きのたけカップ', text, url });
      return;
    } catch (e) {
      if ((e as DOMException)?.name === 'AbortError') return; // user cancelled
    }
  }
  try {
    await navigator.clipboard.writeText(`${text} ${url}`);
    toast('シェア文をコピーしました');
  } catch {
    toast(text);
  }
}
