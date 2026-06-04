import { speak } from '../../lib/tts';

export const CANVAS_W = 360;
export const CANVAS_H = 380;

const BUBBLE_R = 46;
const BURST_MS = 450;

// ── Public types ──────────────────────────────────────────────────────────────

export interface BubbleItem {
  id: string;
  display: string; // text shown on bubble (single kana or full word kana)
  romaji?: string; // optional hint rendered below display text
}

export interface QuestionConfig {
  items: BubbleItem[]; // correct + distractors (pre-shuffled by generator)
  targetId: string; // which item is correct
  ttsText: string; // what to speak via TTS
  centerContent?: string; // emoji/text shown in React UI for submode C (not in canvas)
}

export interface EngineCallbacks {
  nextQuestion(): QuestionConfig;
  onNewQuestion(q: QuestionConfig): void;
  onCorrect(itemId: string): void;
  onMiss(itemId: string): void;
  onComplete(correct: number, total: number): void;
}

export interface EngineParams {
  fallSpeed: number;
  showRomaji: boolean;
  roundLength: number;
  /** L0 tutorial: colour the correct bubble yellow so learner can focus on sound matching */
  highlightCorrectAnswer?: boolean;
}

// ── Internal types ────────────────────────────────────────────────────────────

type BState = 'falling' | 'burst' | 'gone';

interface Bubble {
  item: BubbleItem;
  isCorrect: boolean;
  x: number;
  y: number;
  vy: number;
  state: BState;
  animT: number;
}

// ── Engine ────────────────────────────────────────────────────────────────────

export class KanaCatchEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private params: EngineParams;
  private cb: EngineCallbacks;
  private bubbles: Bubble[] = [];
  private questionNum = 0;
  private correctCount = 0;
  private raf = 0;
  private lastTs = 0;
  private waiting = false;
  private pending: ReturnType<typeof setTimeout> | null = null;

  constructor(
    canvas: HTMLCanvasElement,
    params: EngineParams,
    cb: EngineCallbacks,
  ) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');
    this.ctx = ctx;
    this.params = params;
    this.cb = cb;
    canvas.addEventListener('pointerdown', this.onPointer);
  }

  start(): void {
    this.spawnQuestion();
    this.lastTs = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  destroy(): void {
    cancelAnimationFrame(this.raf);
    if (this.pending) clearTimeout(this.pending);
    this.canvas.removeEventListener('pointerdown', this.onPointer);
  }

  private spawnQuestion(): void {
    this.waiting = false;
    const q = this.cb.nextQuestion();
    this.cb.onNewQuestion(q);
    const sectionW = CANVAS_W / q.items.length;
    this.bubbles = q.items.map((item, i) => {
      const cx =
        sectionW * i + sectionW / 2 + (Math.random() - 0.5) * sectionW * 0.25;
      return {
        item,
        isCorrect: item.id === q.targetId,
        x: Math.max(BUBBLE_R + 4, Math.min(CANVAS_W - BUBBLE_R - 4, cx)),
        y: -BUBBLE_R - i * 18,
        vy: this.params.fallSpeed + (Math.random() - 0.5) * 30,
        state: 'falling',
        animT: 0,
      };
    });
    this.pending = setTimeout(() => speak(q.ttsText), 350);
  }

  private readonly loop = (ts: number): void => {
    const dt = Math.min((ts - this.lastTs) / 1000, 0.1);
    this.lastTs = ts;
    this.update(dt);
    this.draw();
    this.raf = requestAnimationFrame(this.loop);
  };

  private update(dt: number): void {
    if (this.waiting) return;
    for (const b of this.bubbles) {
      if (b.state === 'falling') {
        b.y += b.vy * dt;
        if (b.y > CANVAS_H + BUBBLE_R) {
          // B4.2: bounce back up instead of disappearing
          b.y = CANVAS_H - BUBBLE_R;
          b.vy = -(Math.abs(b.vy) * 0.72 + 15);
          // slight random drift on each bounce
          b.x = Math.max(
            BUBBLE_R + 4,
            Math.min(CANVAS_W - BUBBLE_R - 4, b.x + (Math.random() - 0.5) * 40),
          );
        }
      } else if (b.state === 'burst') {
        b.animT += dt * 1000;
        if (b.animT >= BURST_MS) b.state = 'gone';
      }
    }
  }

  private onQuestionEnd(caught: boolean, itemId: string): void {
    this.waiting = true;
    this.questionNum++;
    if (caught) {
      this.correctCount++;
      this.cb.onCorrect(itemId);
    } else {
      this.cb.onMiss(itemId);
    }
    // B4.2: round ends when correctCount reaches target, not total questions asked
    const done = this.correctCount >= this.params.roundLength;
    const delay = caught ? BURST_MS + 60 : 350;
    if (done) {
      cancelAnimationFrame(this.raf);
      this.pending = setTimeout(
        () => this.cb.onComplete(this.correctCount, this.params.roundLength),
        delay,
      );
    } else {
      this.pending = setTimeout(() => this.spawnQuestion(), delay);
    }
  }

  private draw(): void {
    this.ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    for (const b of this.bubbles) {
      if (b.state !== 'gone') this.drawBubble(b);
    }
  }

  private drawBubble(b: Bubble): void {
    const { ctx } = this;
    const t = b.animT / BURST_MS;
    ctx.save();
    ctx.translate(b.x, b.y);
    if (b.state === 'burst') {
      ctx.globalAlpha = Math.max(0, 1 - t * 1.5);
      ctx.scale(1 + t * 2.5, 1 + t * 2.5);
    }
    const grad = ctx.createRadialGradient(
      -BUBBLE_R * 0.3,
      -BUBBLE_R * 0.3,
      4,
      0,
      0,
      BUBBLE_R,
    );
    // B4.3: only highlight correct answer yellow in tutorial/highlightCorrectAnswer mode
    const highlight = this.params.highlightCorrectAnswer && b.isCorrect;
    if (highlight) {
      grad.addColorStop(0, '#fef9c3');
      grad.addColorStop(1, '#fbbf24');
    } else {
      grad.addColorStop(0, '#dbeafe');
      grad.addColorStop(1, '#60a5fa');
    }
    ctx.beginPath();
    ctx.arc(0, 0, BUBBLE_R, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // display text — auto-scale for longer words
    const len = b.item.display.length;
    const fontSize =
      len <= 2
        ? Math.round(BUBBLE_R * 0.85)
        : Math.round(BUBBLE_R * (1.5 / len));
    ctx.fillStyle = '#1e3a5f';
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      b.item.display,
      0,
      b.item.romaji && this.params.showRomaji ? -6 : -2,
    );

    if (b.item.romaji && this.params.showRomaji && b.state === 'falling') {
      ctx.fillStyle = 'rgba(30,58,95,0.55)';
      ctx.font = `${Math.round(BUBBLE_R * 0.28)}px sans-serif`;
      ctx.fillText(b.item.romaji, 0, Math.round(BUBBLE_R * 0.5));
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  private readonly onPointer = (e: PointerEvent): void => {
    if (this.waiting) return;
    const rect = this.canvas.getBoundingClientRect();
    const px = (e.clientX - rect.left) * (CANVAS_W / rect.width);
    const py = (e.clientY - rect.top) * (CANVAS_H / rect.height);
    for (const b of this.bubbles) {
      if (b.state !== 'falling') continue;
      const dx = b.x - px,
        dy = b.y - py;
      if (Math.sqrt(dx * dx + dy * dy) <= BUBBLE_R + 10) {
        if (b.isCorrect) {
          b.state = 'burst';
          b.animT = 0;
          this.onQuestionEnd(true, b.item.id);
        } else {
          // B4.2: wrong tap → SRS miss + spawn next question (no penalty counter for child)
          b.state = 'burst';
          b.animT = 0;
          this.onQuestionEnd(false, b.item.id);
        }
        break;
      }
    }
  };
}
