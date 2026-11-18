import './styles.css';
import { injectSprites } from './assets/sprites';
import { state, type Team } from './state';
import type { EventId, PlayResult } from './games';
import { $, toast } from './ui/common';
import { selectHtml, initSelect, showSelect } from './ui/select';
import { eventsHtml, initEvents, showEvents } from './ui/events';
import { gameHtml, initGame, startStack } from './ui/game';
import { harvestHtml, initHarvest, startHarvest } from './ui/harvest';
import { quizHtml, initQuiz, startQuiz } from './ui/quiz';
import { resultHtml, initResult, showResult } from './ui/result';

injectSprites();

$('app').innerHTML = `
  <div class="bar"><span id="barTitle">きのたけカップ 地区大会</span><button class="snd" id="snd" type="button" aria-label="効果音"></button></div>
  ${selectHtml()}
  ${eventsHtml()}
  ${gameHtml()}
  ${harvestHtml()}
  ${quizHtml()}
  ${resultHtml()}
  <div class="toast" id="toast" role="status" aria-live="polite"></div>
`;

// sound toggle
function renderSound(): void {
  const on = state.soundOn();
  const b = $('snd');
  b.textContent = on ? '🔊' : '🔇';
  b.setAttribute('aria-pressed', String(on));
  b.title = on ? '効果音：オン' : '効果音：オフ';
}
$('snd').addEventListener('click', () => {
  state.setSound(!state.soundOn());
  renderSound();
});
renderSound();

const STARTERS: Record<EventId, (team: Team, finish: (r: PlayResult) => void) => void> = {
  stack: startStack,
  harvest: startHarvest,
  quiz: startQuiz,
};

/** Consumes one of today's plays (shared by all events) and starts the event. */
function play(team: Team, ev: EventId): void {
  if (!state.consumePlay()) {
    toast('今日のプレイは終わり（また明日！）');
    return;
  }
  STARTERS[ev](team, (r) => showResult(team, r));
}

initSelect(() => showEvents());
initEvents(play, showSelect);
initGame();
initHarvest();
initQuiz();
initResult(play, showEvents);

// Prevent double-tap / pinch zoom on iOS Safari (touch-action handles most browsers).
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
  const now = Date.now();
  if (now - lastTouchEnd <= 350) e.preventDefault();
  lastTouchEnd = now;
}, { passive: false });
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('dblclick', (e) => e.preventDefault());

showSelect();
