import type { Team } from '../state';
import { QUESTIONS, QUIZ, type Question } from '../game/quiz-data';
import { EVENTS, type PlayResult } from '../games';
import { $, countdown, fmt, isOn, playsText, showScreen } from './common';
import { sfx } from '../sound';

export function quizHtml(): string {
  return `
  <section class="screen" id="s-quiz">
    <div class="hud">
      <div class="box"><div class="lb">SCORE</div><div class="vl" id="qScore">0</div></div>
      <div class="box"><div class="lb">問題</div><div class="vl" id="qNum">1/${QUIZ.perPlay}</div></div>
      <div class="box"><div class="lb">のこり</div><div class="vl" id="qTime">${QUIZ.secPerQuestion}</div></div>
    </div>
    <div class="qwrap">
      <div class="qbar"><i id="qBar"></i></div>
      <div class="qcard"><div class="qno" id="qNo">Q1</div><div class="qtext" id="qText"></div></div>
      <div class="choices" id="qChoices"></div>
      <div class="qfb" id="qFb"></div>
      <div class="count" id="qCount" hidden>3</div>
    </div>
    <button class="btn line" id="qHint" type="button"></button>
    <p class="lives" id="qPlays"></p>
  </section>`;
}

interface Asked {
  q: Question;
  choices: string[];
  answer: number;
}

interface Run {
  team: Team;
  list: Asked[];
  i: number;
  correct: number;
  speed: number;
  hints: number;
  startAt: number;
  locked: boolean;
  timer: number;
  next: number;
  finish: (r: PlayResult) => void;
}

let run: Run | null = null;
let cancelCount: (() => void) | null = null;

function shuffle<T>(a: T[]): T[] {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

function pick(): Asked[] {
  return shuffle(QUESTIONS).slice(0, QUIZ.perPlay).map((q) => {
    const choices = shuffle(q.choices.slice());
    return { q, choices, answer: choices.indexOf(q.choices[0]) };
  });
}

function score(r: Run): number {
  return r.correct * QUIZ.perCorrect + r.speed;
}

function stop(r: Run): void {
  clearInterval(r.timer);
  clearTimeout(r.next);
}

/** wrong choices still shown for the current question */
function wrongLeft(r: Run): number {
  const a = r.list[r.i];
  if (!a) return 0;
  return Array.from($('qChoices').querySelectorAll<HTMLButtonElement>('.choice'))
    .filter((b) => Number(b.dataset.i) !== a.answer && !b.disabled).length;
}

function renderHint(r: Run): void {
  const b = $<HTMLButtonElement>('qHint');
  if (r.team === 'kino') {
    const usable = !r.locked && wrongLeft(r) >= 2;
    b.style.display = '';
    b.disabled = r.hints <= 0 || !usable;
    b.textContent = r.hints <= 0
      ? 'ヒントは使用済み'
      : !r.locked && !usable
        ? `この問題はヒントなし（のこり${r.hints}回）`
        : `ヒント：まちがいを1つ消す（のこり${r.hints}回）`;
  } else {
    b.style.display = '';
    b.disabled = true;
    b.textContent = `たけのこ陣営：速答ボーナス ×${QUIZ.takeSpeedMul}`;
  }
}

function ask(r: Run): void {
  const a = r.list[r.i];
  r.locked = false;
  $('qNum').textContent = `${r.i + 1}/${r.list.length}`;
  $('qNo').textContent = `Q${r.i + 1}`;
  $('qText').textContent = a.q.q;
  $('qFb').textContent = '';
  $('qFb').className = 'qfb';
  $('qChoices').innerHTML = a.choices
    .map((c, i) => `<button class="choice" data-i="${i}" type="button"><span class="ck">${i + 1}</span>${c}</button>`)
    .join('');
  $('qChoices').querySelectorAll<HTMLButtonElement>('.choice').forEach((b) =>
    b.addEventListener('click', () => answer(Number(b.dataset.i))),
  );
  renderHint(r);
  r.startAt = performance.now();
  tick();
  r.timer = window.setInterval(tick, 100);
}

function timeLeft(r: Run): number {
  return Math.max(0, QUIZ.secPerQuestion - (performance.now() - r.startAt) / 1000);
}

function tick(): void {
  const r = run;
  if (!r || r.locked) return;
  const left = timeLeft(r);
  $('qTime').textContent = String(Math.ceil(left));
  $('qTime').classList.toggle('warn', left <= 3);
  $('qBar').style.width = `${(left / QUIZ.secPerQuestion) * 100}%`;
  if (left <= 0) answer(-1);
}

function answer(choice: number): void {
  const r = run;
  if (!r || r.locked) return;
  r.locked = true;
  clearInterval(r.timer);
  const a = r.list[r.i];
  const left = timeLeft(r);
  const ok = choice === a.answer;
  let gained = 0;
  if (ok) {
    const mul = r.team === 'take' ? QUIZ.takeSpeedMul : 1;
    const bonus = Math.round(left * QUIZ.speedPerSec * mul);
    r.correct++;
    r.speed += bonus;
    gained = QUIZ.perCorrect + bonus;
    sfx.perfect();
  } else {
    sfx.fall();
  }
  $('qChoices').querySelectorAll<HTMLButtonElement>('.choice').forEach((b) => {
    const i = Number(b.dataset.i);
    b.disabled = true;
    if (i === a.answer) b.classList.add('right');
    else if (i === choice) b.classList.add('wrong');
  });
  const fb = $('qFb');
  fb.className = `qfb ${ok ? 'ok' : 'ng'}`;
  fb.innerHTML = `<b>${ok ? `せいかい！ +${gained}` : choice < 0 ? '時間切れ…' : 'ざんねん…'}</b><span>${a.q.note}</span>`;
  $('qScore').textContent = fmt(score(r));
  renderHint(r);

  r.next = window.setTimeout(() => {
    r.i++;
    if (r.i < r.list.length) ask(r);
    else end(r);
  }, 2000);
}

function end(r: Run): void {
  stop(r);
  if (run === r) run = null;
  sfx.end();
  const n = r.list.length;
  r.finish({
    event: 'quiz',
    reason: r.correct === n ? '全問正解！' : `${n}問中 ${r.correct}問 正解！`,
    rows: [
      { label: `正解 <b>${r.correct}</b>問 × ${QUIZ.perCorrect}`, pts: r.correct * QUIZ.perCorrect },
      { label: `スピードボーナス${r.team === 'take' ? `（×${QUIZ.takeSpeedMul}）` : ''}`, pts: r.speed },
    ],
  });
}

function useHint(): void {
  const r = run;
  if (!r || r.locked || r.team !== 'kino' || r.hints <= 0 || wrongLeft(r) < 2) return;
  const a = r.list[r.i];
  const btns = Array.from($('qChoices').querySelectorAll<HTMLButtonElement>('.choice'))
    .filter((b) => Number(b.dataset.i) !== a.answer && !b.disabled);
  if (!btns.length) return;
  const b = btns[Math.floor(Math.random() * btns.length)];
  b.disabled = true;
  b.classList.add('gone');
  r.hints--;
  renderHint(r);
}

export function initQuiz(): void {
  $('qHint').addEventListener('click', useHint);
  document.addEventListener('keydown', (e) => {
    if (!isOn('s-quiz') || !run || run.locked) return;
    const idx = ['Digit1', 'Digit2', 'Digit3', 'Numpad1', 'Numpad2', 'Numpad3'].indexOf(e.code);
    if (idx < 0) return;
    const n = idx % 3;
    const b = $('qChoices').querySelector<HTMLButtonElement>(`.choice[data-i="${n}"]`);
    if (b && !b.disabled) answer(n);
  });
}

export function startQuiz(team: Team, finish: (r: PlayResult) => void): void {
  if (run) stop(run);
  cancelCount?.();
  showScreen('s-quiz', `種目：${EVENTS.quiz.name}`);
  const r: Run = {
    team, list: pick(), i: 0, correct: 0, speed: 0,
    hints: team === 'kino' ? QUIZ.kinoHints : 0,
    startAt: 0, locked: true, timer: 0, next: 0, finish,
  };
  run = r;
  $('qScore').textContent = '0';
  $('qNum').textContent = `1/${r.list.length}`;
  $('qTime').textContent = String(QUIZ.secPerQuestion);
  $('qTime').classList.remove('warn');
  $('qBar').style.width = '100%';
  $('qNo').textContent = 'Q1';
  $('qText').textContent = '';
  $('qChoices').innerHTML = '';
  $('qFb').textContent = '';
  $('qPlays').textContent = playsText();
  renderHint(r);
  cancelCount = countdown($('qCount'), () => { if (run === r) ask(r); });
}
