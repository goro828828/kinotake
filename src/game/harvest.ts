import { HARVEST, LEGS, type BasketSpec } from './harvest-config';
import { useSvg } from '../assets/sprites';
import { sfx } from '../sound';

export interface HarvestStats {
  caught: number;
  combos: number;
}

export interface HarvestEls {
  field: HTMLElement;
  layer: HTMLElement;
  basket: HTMLElement;
}

export interface HarvestCallbacks {
  onTime(secondsLeft: number): void;
  onScore(score: number, caught: number, combo: number): void;
  onLeg(index: number): void;
  onEnd(stats: HarvestStats): void;
}

interface Item {
  el: HTMLDivElement;
  x: number; // center, px
  y: number; // top, px
  vy: number;
  bad: boolean;
}

/** Catch game: move the basket, catch ingredients, avoid bugs. */
export class HarvestGame {
  private W = 0;
  private H = 0;
  private bx = 0;
  private target: number | null = null;
  private keyDir = 0;
  private items: Item[] = [];
  private caught = 0;
  private combo = 0;
  private combos = 0;
  private leg = -1;
  private stunUntil = 0;
  private nextSpawn = 0;

  private running = false;
  private over = false;
  private startAt = 0;
  private lastFrame = 0;
  private raf = 0;
  private watchdog = 0;
  private lastShownSec = -1;
  private ro: ResizeObserver | null = null;

  constructor(private spec: BasketSpec, private els: HarvestEls, private cb: HarvestCallbacks) {
    els.layer.querySelectorAll('.item,.pop').forEach((e) => e.remove());
    els.basket.style.width = `${spec.w}px`;
    els.basket.style.height = `${HARVEST.basketH}px`;
    els.basket.classList.remove('stun');
    this.measure();
    this.bx = this.W / 2;
    this.renderBasket();
    if (typeof ResizeObserver !== 'undefined') {
      this.ro = new ResizeObserver(() => this.resize());
      this.ro.observe(els.field);
    }
  }

  private measure(): void {
    this.W = this.els.field.clientWidth;
    this.H = this.els.field.clientHeight;
  }

  private resize(): void {
    const w = this.els.field.clientWidth, h = this.els.field.clientHeight;
    if (!w || !h) return;
    this.W = w;
    this.H = h;
    this.bx = this.clampX(this.bx);
    this.renderBasket();
  }

  private clampX(x: number): number {
    const half = this.spec.w / 2 + 4;
    return Math.max(half, Math.min(this.W - half, x));
  }

  private basketTop(): number {
    return this.H - HARVEST.basketBottom - HARVEST.basketH;
  }

  private renderBasket(): void {
    this.els.basket.style.transform = `translate(${this.bx - this.spec.w / 2}px, ${this.basketTop()}px)`;
  }

  // ---------- input ----------
  /** pointer x relative to the field */
  pointTo(x: number): void {
    this.target = x;
    this.keyDir = 0;
  }
  /** -1 / 0 / +1 from keys or buttons */
  setDir(dir: number): void {
    this.keyDir = dir;
    if (dir !== 0) this.target = null;
  }

  // ---------- lifecycle ----------
  begin(): void {
    if (this.running || this.over) return;
    this.measure();
    this.running = true;
    this.startAt = performance.now();
    this.lastFrame = this.startAt;
    this.nextSpawn = 0.2;
    this.raf = requestAnimationFrame(this.loop);
    this.watchdog = window.setInterval(() => this.tickTime(performance.now()), 250);
  }

  destroy(): void {
    this.running = false;
    this.over = true;
    cancelAnimationFrame(this.raf);
    clearInterval(this.watchdog);
    this.ro?.disconnect();
  }

  private elapsed(now: number): number {
    return (now - this.startAt) / 1000;
  }

  private tickTime(now: number): boolean {
    if (!this.running) return false;
    const t = this.elapsed(now);
    const left = HARVEST.durationSec - t;
    const shown = Math.max(0, Math.ceil(left));
    if (shown !== this.lastShownSec) {
      this.lastShownSec = shown;
      this.cb.onTime(shown);
    }
    const leg = Math.min(LEGS.length - 1, Math.floor(t / HARVEST.legSec));
    if (leg !== this.leg) {
      this.leg = leg;
      this.cb.onLeg(leg);
      if (leg > 0) this.pop('バトンタッチ！', this.W / 2, this.H * 0.4, true);
    }
    if (left <= 0) {
      this.end();
      return false;
    }
    return true;
  }

  private end(): void {
    if (this.over) return;
    this.destroy();
    this.cb.onEnd({ caught: this.caught, combos: this.combos });
  }

  private score(): number {
    return this.caught * HARVEST.perItem + this.combos * HARVEST.perCombo;
  }

  private loop = (now: number): void => {
    if (!this.running) return;
    const dt = Math.min(0.05, (now - this.lastFrame) / 1000);
    this.lastFrame = now;
    if (!this.tickTime(now)) return;
    const t = this.elapsed(now);

    // basket
    if (now >= this.stunUntil) {
      this.els.basket.classList.remove('stun');
      const maxStep = this.spec.speed * dt;
      if (this.keyDir !== 0) {
        this.bx += this.keyDir * maxStep;
      } else if (this.target != null) {
        const d = this.target - this.bx;
        this.bx += Math.max(-maxStep, Math.min(maxStep, d));
      }
      this.bx = this.clampX(this.bx);
      this.renderBasket();
    }

    // spawn
    this.nextSpawn -= dt;
    if (this.nextSpawn <= 0) {
      const p = Math.min(1, t / HARVEST.durationSec);
      this.nextSpawn = HARVEST.spawnStart + (HARVEST.spawnEnd - HARVEST.spawnStart) * p;
      this.spawn(t);
    }

    // items
    const size = HARVEST.itemSize;
    const top = this.basketTop();
    const half = this.spec.w / 2;
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];
      it.y += it.vy * dt;
      const bottom = it.y + size;
      if (bottom >= top + 6 && it.y < top + 18 && Math.abs(it.x - this.bx) < half + size * 0.25) {
        this.catchItem(it, now);
        it.el.remove();
        this.items.splice(i, 1);
        continue;
      }
      if (it.y > this.H) {
        it.el.remove();
        this.items.splice(i, 1);
        if (!it.bad) this.combo = 0; // missed an ingredient
        continue;
      }
      it.el.style.transform = `translate(${it.x - size / 2}px, ${it.y}px)`;
    }

    this.raf = requestAnimationFrame(this.loop);
  };

  private spawn(t: number): void {
    const size = HARVEST.itemSize;
    const bad = Math.random() < HARVEST.badRate;
    const sym = bad ? 'bug' : LEGS[Math.max(0, this.leg)].sym;
    const el = document.createElement('div');
    el.className = bad ? 'item bad' : 'item';
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.innerHTML = useSvg(sym, '0 0 40 40');
    const margin = size / 2 + 4;
    const x = margin + Math.random() * Math.max(0, this.W - margin * 2);
    const vy = (HARVEST.fallStart + HARVEST.fallAccel * t) * (0.85 + Math.random() * 0.3);
    const it: Item = { el, x, y: -size, vy, bad };
    el.style.transform = `translate(${x - size / 2}px, ${-size}px)`;
    this.els.layer.appendChild(el);
    this.items.push(it);
  }

  private catchItem(it: Item, now: number): void {
    const y = this.basketTop() - 10;
    if (it.bad) {
      this.combo = 0;
      this.stunUntil = now + HARVEST.stunSec * 1000;
      this.els.basket.classList.add('stun');
      this.pop('いたっ！', this.bx, y, false, true);
      sfx.fall();
    } else {
      this.caught++;
      this.combo++;
      if (this.combo % HARVEST.comboEvery === 0) {
        this.combos++;
        this.pop(`${this.combo} COMBO! +${HARVEST.perItem + HARVEST.perCombo}`, this.bx, y, true);
        sfx.perfect();
      } else {
        this.pop(`+${HARVEST.perItem}`, this.bx, y, false);
        sfx.land();
      }
    }
    this.cb.onScore(this.score(), this.caught, this.combo);
  }

  private pop(txt: string, x: number, y: number, gold: boolean, bad = false): void {
    const d = document.createElement('div');
    d.className = `pop${gold ? '' : ' small'}${bad ? ' bad' : ''}`;
    d.textContent = txt;
    d.style.left = `${x}px`;
    d.style.top = `${y - 24}px`;
    this.els.layer.appendChild(d);
    window.setTimeout(() => d.remove(), 900);
  }
}
