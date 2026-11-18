import { GAME, type PieceSpec } from './config';
import { useSvg } from '../assets/sprites';
import { sfx } from '../sound';

export type EndReason = 'timeup' | 'fall';

export interface StackResult {
  reason: EndReason;
  floors: number;
  perfects: number;
}

export interface StackEls {
  field: HTMLElement;
  world: HTMLElement;
  mover: HTMLElement;
  ground: HTMLElement;
  tip: HTMLElement;
}

export interface StackCallbacks {
  onTime(secondsLeft: number): void;
  onScore(score: number, floors: number): void;
  onEnd(result: StackResult): void;
}

interface Placed {
  /** horizontal center, as an offset from the field center (px) — survives width changes */
  off: number;
}

/**
 * The stacking game.
 * Coordinates: x is an offset from the field's horizontal center; heights are measured
 * from the field bottom. This keeps the tower correct when the field is resized.
 */
export class StackGame {
  private W = 0;
  private H = 0;
  private stack: Placed[] = [];
  private perfects = 0;
  private mx: number; // mover center offset
  private dir = 1;
  private speed: number;
  private cam = 0;

  private running = false;
  private dropping = false;
  private over = false;
  private startAt = 0;
  private lastFrame = 0;
  private raf = 0;
  private watchdog = 0;
  private timers: number[] = [];
  private lastShownSec = -1;
  private ro: ResizeObserver | null = null;
  private onWinResize = () => this.resize();

  constructor(private spec: PieceSpec, private els: StackEls, private cb: StackCallbacks) {
    this.speed = spec.speed;
    this.measure();
    this.mx = this.minX();
    this.reset();
    if (typeof ResizeObserver !== 'undefined') {
      this.ro = new ResizeObserver(() => this.resize());
      this.ro.observe(els.field);
    } else {
      window.addEventListener('resize', this.onWinResize);
    }
  }

  // ---------- setup ----------
  private reset(): void {
    const { world, mover, ground, tip } = this.els;
    const s = this.spec;
    world.querySelectorAll('.pc,.pop').forEach((e) => e.remove());
    world.style.transition = 'none';
    world.style.transform = 'translateY(0)';
    void world.offsetHeight;
    world.style.transition = '';
    ground.style.width = `${s.w + 30}px`;
    ground.style.marginLeft = `${-(s.w + 30) / 2}px`;
    mover.innerHTML = '';
    mover.appendChild(this.pieceEl());
    mover.style.width = `${s.w}px`;
    mover.style.height = `${s.h}px`;
    mover.style.transition = 'none';
    tip.style.display = 'block';
    this.renderMover();
  }

  private pieceEl(): HTMLDivElement {
    const s = this.spec;
    const d = document.createElement('div');
    d.className = 'pc';
    d.style.width = `${s.w}px`;
    d.style.height = `${s.h}px`;
    d.innerHTML = useSvg(s.sym, `0 0 ${s.w} ${s.h}`);
    return d;
  }

  private measure(): void {
    this.W = this.els.field.clientWidth;
    this.H = this.els.field.clientHeight;
  }

  private half(): number { return this.spec.w / 2; }
  private maxX(): number { return Math.max(0, this.W / 2 - this.half() - GAME.sideMargin); }
  private minX(): number { return -this.maxX(); }

  /** Height (from field bottom) where the next piece's bottom lands. */
  private landBottom(n = this.stack.length): number {
    return GAME.groundSurface + n * this.spec.step;
  }
  private topOff(): number {
    return this.stack.length ? this.stack[this.stack.length - 1].off : 0;
  }

  private renderMover(): void {
    const x = this.W / 2 + this.mx - this.half();
    this.els.mover.style.transform = `translate(${x}px, ${GAME.moverTop}px)`;
  }

  private placeInWorld(el: HTMLElement, off: number, bottom: number): void {
    el.style.left = `calc(50% + ${off - this.half()}px)`;
    el.style.bottom = `${bottom}px`;
  }

  private updateCamera(): void {
    // keep the next landing spot below `cameraLine` of the field height
    const need = this.landBottom() - (1 - GAME.cameraLine) * this.H;
    const cam = Math.max(this.cam, need, 0);
    if (cam !== this.cam) {
      this.cam = cam;
      this.els.world.style.transform = `translateY(${this.cam}px)`;
    }
  }

  // ---------- lifecycle ----------
  begin(): void {
    if (this.over || this.running) return;
    this.measure();
    this.running = true;
    this.startAt = performance.now();
    this.lastFrame = this.startAt;
    this.raf = requestAnimationFrame(this.loop);
    // rAF pauses in background tabs; the watchdog keeps the clock honest.
    this.watchdog = window.setInterval(() => this.tickTime(performance.now()), 250);
  }

  destroy(): void {
    this.running = false;
    this.over = true;
    cancelAnimationFrame(this.raf);
    clearInterval(this.watchdog);
    this.timers.forEach((t) => clearTimeout(t));
    this.timers = [];
    this.ro?.disconnect();
    window.removeEventListener('resize', this.onWinResize);
  }

  private later(fn: () => void, ms: number): void {
    this.timers.push(window.setTimeout(fn, ms));
  }

  private timeLeft(now: number): number {
    return GAME.durationSec - (now - this.startAt) / 1000;
  }

  /** returns false when the game ended */
  private tickTime(now: number): boolean {
    if (!this.running) return false;
    const left = this.timeLeft(now);
    const shown = Math.max(0, Math.ceil(left));
    if (shown !== this.lastShownSec) {
      this.lastShownSec = shown;
      this.cb.onTime(shown);
    }
    if (left <= 0) {
      this.end('timeup');
      return false;
    }
    return true;
  }

  private loop = (now: number): void => {
    if (!this.running) return;
    const dt = Math.min(0.05, (now - this.lastFrame) / 1000);
    this.lastFrame = now;
    if (!this.tickTime(now)) return;
    if (!this.dropping) {
      this.mx += this.dir * this.speed * dt;
      if (this.mx > this.maxX()) { this.mx = this.maxX(); this.dir = -1; }
      if (this.mx < this.minX()) { this.mx = this.minX(); this.dir = 1; }
      this.renderMover();
    }
    this.raf = requestAnimationFrame(this.loop);
  };

  private end(reason: EndReason): void {
    if (this.over) return;
    this.running = false;
    this.over = true;
    cancelAnimationFrame(this.raf);
    clearInterval(this.watchdog);
    this.cb.onEnd({ reason, floors: this.stack.length, perfects: this.perfects });
  }

  // ---------- input ----------
  drop(): void {
    if (!this.running || this.dropping || this.over) return;
    this.dropping = true;
    this.els.tip.style.display = 'none';

    const s = this.spec;
    const half = this.half();
    const off = this.mx;
    const n = this.stack.length;
    const bottom = this.landBottom(n);
    const dx = off - this.topOff();

    // fall animation of the mover (screen coordinates)
    const landTop = this.H - bottom - s.h + this.cam;
    const fallDist = landTop - GAME.moverTop;
    const dur = Math.max(140, Math.min(380, fallDist * 0.9));
    const { mover, world } = this.els;
    mover.style.transition = `transform ${dur}ms cubic-bezier(.5,0,1,1)`;
    mover.style.transform = `translate(${this.W / 2 + off - half}px, ${landTop}px)`;

    this.later(() => {
      if (this.over) return; // time ran out while falling
      mover.style.transition = 'none';

      // fell off the tower (the first piece never falls)
      if (n > 0 && Math.abs(dx) > s.w * s.tol) {
        this.running = false;
        cancelAnimationFrame(this.raf);
        clearInterval(this.watchdog);
        const p = this.pieceEl();
        this.placeInWorld(p, off, bottom);
        p.style.transition = 'transform .7s cubic-bezier(.4,0,1,1), opacity .7s';
        world.appendChild(p);
        mover.style.transform = 'translate(-999px,0)';
        sfx.fall();
        requestAnimationFrame(() => requestAnimationFrame(() => {
          const r = dx > 0 ? 1 : -1;
          p.style.transform = `translate(${60 * r}px, 260px) rotate(${80 * r}deg)`;
          p.style.opacity = '0';
        }));
        this.later(() => this.end('fall'), 900);
        return;
      }

      let px = off;
      let perfect = false;
      if (n === 0) {
        perfect = Math.abs(off) <= GAME.perfectPx;
      } else if (Math.abs(dx) <= GAME.perfectPx) {
        px = this.topOff();
        perfect = true;
      }

      const p = this.pieceEl();
      this.placeInWorld(p, px, bottom);
      world.appendChild(p);
      this.stack.push({ off: px });
      if (perfect) this.perfects++;
      this.popText(perfect ? 'PERFECT! +30' : '+10', px, bottom + s.h + 6, perfect);
      perfect ? sfx.perfect() : sfx.land();
      this.cb.onScore(this.score(), this.stack.length);

      this.speed = Math.min(s.speed * GAME.maxSpeedRatio, this.speed * GAME.speedUp);
      this.updateCamera();
      // restart from the edge in the current direction of travel
      this.mx = this.dir > 0 ? this.minX() : this.maxX();
      this.renderMover();
      this.dropping = false;
    }, dur);
  }

  score(): number {
    return this.stack.length * 10 + this.perfects * 20;
  }

  private popText(txt: string, off: number, bottom: number, gold: boolean): void {
    const d = document.createElement('div');
    d.className = gold ? 'pop' : 'pop small';
    d.textContent = txt;
    d.style.left = `calc(50% + ${off}px)`;
    d.style.bottom = `${bottom}px`;
    this.els.world.appendChild(d);
    this.later(() => d.remove(), 900);
  }

  // ---------- resize (CLAUDE.md §10) ----------
  resize(): void {
    const w = this.els.field.clientWidth, h = this.els.field.clientHeight;
    if (w === 0 || h === 0) return; // hidden
    if (w === this.W && h === this.H) return;
    this.W = w;
    this.H = h;
    this.mx = Math.max(this.minX(), Math.min(this.maxX(), this.mx));
    if (!this.dropping) this.renderMover();
    // recompute camera from scratch for the new height
    const need = this.landBottom() - (1 - GAME.cameraLine) * this.H;
    this.cam = Math.max(0, need);
    this.els.world.style.transform = `translateY(${this.cam}px)`;
  }
}
