import { state, type Team } from '../state';
import { useSvg } from '../assets/sprites';
import { EVENTS, EVENT_ORDER, type EventId } from '../games';
import { $, playsText, showScreen, toast } from './common';
import { sfx } from '../sound';

export function eventsHtml(): string {
  const cards = EVENT_ORDER.map((id) => {
    const e = EVENTS[id];
    return `<button class="event" data-event="${id}" type="button">
      <span class="ev-ic">${useSvg(e.icon.sym, e.icon.viewBox)}</span>
      <span class="ev-tx"><span class="ev-h">${e.name}</span><span class="ev-d">${e.desc}</span><span class="ev-n">${e.teamNote}</span></span>
    </button>`;
  }).join('');
  return `
  <section class="screen" id="s-events">
    <div class="res-top"><span class="res-team" id="evTeam"></span></div>
    <h2 style="margin-top:8px">種目をえらぼう</h2>
    <p class="sub">どの種目でも、勝ち点は陣営への1票になる</p>
    <div class="events">${cards}</div>
    <div class="actions">
      <p class="lives" id="evPlays"></p>
      <button class="btn line" id="evBack" type="button">陣営をえらびなおす</button>
    </div>
  </section>`;
}

export function initEvents(onPick: (team: Team, ev: EventId) => void, onBack: () => void): void {
  document.querySelectorAll<HTMLButtonElement>('.event').forEach((b) =>
    b.addEventListener('click', () => {
      sfx.unlock();
      if (!state.team) return onBack();
      if (state.remaining() <= 0) {
        toast('今日のプレイは終わり（また明日！）');
        return;
      }
      onPick(state.team, b.dataset.event as EventId);
    }),
  );
  $('evBack').addEventListener('click', onBack);
}

export function showEvents(): void {
  const isK = state.team === 'kino';
  const badge = $('evTeam');
  badge.textContent = isK ? 'きのこ陣営' : 'たけのこ陣営';
  badge.style.background = isK ? 'var(--kino)' : 'var(--take)';
  const left = state.remaining();
  $('evPlays').textContent = left > 0 ? playsText() : '今日のプレイは終わり（また明日！）';
  document.querySelectorAll<HTMLButtonElement>('.event').forEach((b) => b.classList.toggle('off', left <= 0));
  showScreen('s-events', '種目をえらぶ');
}
