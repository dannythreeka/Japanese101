import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { kanaData } from '../../data/loaders';
import type { Kana } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { useAdventureChallenge } from '../../hooks/useAdventureChallenge';
import { getOrCreateProgress, saveProgress, saveSession } from '../../db';
import { updateAfterCorrect, updateAfterIncorrect } from '../../lib/srs';
import { calculateXpGain, addXpToPet } from '../../lib/pet';
import { speak } from '../../lib/tts';
import { playSfx } from '../../lib/audio';
import {
  KANA_EMOJI,
  ROUND_SIZE,
  buildWritePool,
  pickRound,
  computeWritingScore,
  scoreToStars,
} from './kanaWriteEngine';
import {
  KANA_STROKE_PATHS,
  KANA_STROKE_COUNT,
  sampleStrokePath,
} from './kanaStrokeData';
import { useT } from '../../hooks/useT';

const ALL_KANA: Kana[] = kanaData();
const CANVAS_SIZE = 280;
const STROKE_WIDTH = 10;
const STROKE_COLOR = '#1a1a1a';
const REF_FONT = `${Math.round(CANVAS_SIZE * 0.72)}px serif`;

type Phase = 'draw' | 'result' | 'done';

interface RoundResult {
  kanaId: string;
  stars: 0 | 1 | 2 | 3;
}

function drawStrokes(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  strokes: { x: number; y: number }[][],
) {
  ctx.strokeStyle = STROKE_COLOR;
  ctx.lineWidth = STROKE_WIDTH;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const stroke of strokes) {
    if (stroke.length === 0) continue;
    ctx.beginPath();
    ctx.moveTo(stroke[0].x, stroke[0].y);
    for (let i = 1; i < stroke.length; i++)
      ctx.lineTo(stroke[i].x, stroke[i].y);
    ctx.stroke();
  }
}

function renderRefChar(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  char: string,
  alpha: string,
) {
  ctx.font = REF_FONT;
  ctx.fillStyle = alpha;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(char, CANVAS_SIZE / 2, CANVAS_SIZE / 2);
}

export default function KanaWriteGame() {
  const navigate = useNavigate();
  const { ageMode, kanaDifficulty } = useAppStore();
  const adventure = useAdventureChallenge();
  const t = useT();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<{ x: number; y: number }[][]>([]);
  const currentStroke = useRef<{ x: number; y: number }[]>([]);
  const isDrawing = useRef(false);
  const sessionStart = useRef(Date.now());

  const [round, setRound] = useState<Kana[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('draw');
  const [currentStars, setCurrentStars] = useState<0 | 1 | 2 | 3>(0);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [xpGained, setXpGained] = useState(0);
  const [hasStrokes, setHasStrokes] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const animFrameRef = useRef<number | null>(null);
  const [capturedRefUrl, setCapturedRefUrl] = useState<string | null>(null);
  const [capturedUserUrl, setCapturedUserUrl] = useState<string | null>(null);

  // Build round — use adventure kanaPool override when launched from a level
  useEffect(() => {
    const pending = adventure.pending;
    if (pending?.gameMode === 'write_canvas') {
      const poolChars = pending.configOverrides.kanaPool;
      const roundLen = pending.configOverrides.roundLength;
      if (Array.isArray(poolChars)) {
        const filtered = ALL_KANA.filter((k) =>
          (poolChars as string[]).includes(k.hiragana),
        );
        const len = typeof roundLen === 'number' ? roundLen : ROUND_SIZE;
        setRound(pickRound(filtered.length > 0 ? filtered : ALL_KANA, len));
        return;
      }
    }
    const pool = buildWritePool(ALL_KANA, ageMode, kanaDifficulty);
    setRound(pickRound(pool, ROUND_SIZE));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentKana = round[currentIdx] ?? null;

  // Redraw the main canvas (ghost + committed strokes).
  // NOTE: `phase` is intentionally excluded from deps — including it caused the
  // reset effect below to fire on phase change, wiping the canvas after handleCheck.
  const redrawMain = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    if (ageMode === 'young' && currentKana) {
      ctx.save();
      renderRefChar(ctx, currentKana.hiragana, 'rgba(180,180,180,0.30)');
      ctx.restore();
    }

    ctx.save();
    drawStrokes(ctx, strokes.current);
    ctx.restore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ageMode, currentKana]);

  // Reset canvas ONLY when the current kana character changes (currentIdx).
  // redrawMain is intentionally omitted from deps to prevent this effect from
  // firing on phase changes, which would wipe the canvas in result phase.
  useEffect(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setIsAnimating(false);
    setHasStrokes(false);
    setCapturedRefUrl(null);
    setCapturedUserUrl(null);
    strokes.current = [];
    currentStroke.current = [];
    isDrawing.current = false;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    }
    redrawMain();
    return () => {
      if (animFrameRef.current !== null)
        cancelAnimationFrame(animFrameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx]);

  // Speak kana on new character
  useEffect(() => {
    if (currentKana && phase === 'draw') speak(currentKana.hiragana);
  }, [currentKana, phase]);

  // ── Pointer events ──────────────────────────────────────────────────────────

  function getPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (CANVAS_SIZE / rect.width),
      y: (e.clientY - rect.top) * (CANVAS_SIZE / rect.height),
    };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (phase !== 'draw') return;
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
      setIsAnimating(false);
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    isDrawing.current = true;
    currentStroke.current = [getPos(e)];
    redrawMain();
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing.current || phase !== 'draw') return;
    const pos = getPos(e);
    currentStroke.current.push(pos);
    // Incremental draw for the live stroke segment
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      const pts = currentStroke.current;
      if (pts.length >= 2) {
        ctx.save();
        ctx.strokeStyle = STROKE_COLOR;
        ctx.lineWidth = STROKE_WIDTH;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  function handlePointerUp() {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    if (currentStroke.current.length > 0) {
      strokes.current.push([...currentStroke.current]);
      currentStroke.current = [];
      setHasStrokes(true);
    }
  }

  function handleClear() {
    strokes.current = [];
    currentStroke.current = [];
    setHasStrokes(false);
    redrawMain();
  }

  function runDemo() {
    if (!currentKana || phase !== 'draw') return;
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    strokes.current = [];
    currentStroke.current = [];
    setHasStrokes(false);
    setIsAnimating(true);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const char = currentKana.hiragana;

    // ── Stroke-by-stroke animation (when path data is available) ─────────────
    const strokePaths = KANA_STROKE_PATHS[char];
    if (strokePaths) {
      const sampledStrokes = strokePaths.strokes.map((cmds) =>
        sampleStrokePath(cmds, 32),
      );
      const STROKE_MS = 700;
      const PAUSE_MS = 180;
      const CYCLE_MS = STROKE_MS + PAUSE_MS;
      const startTime = performance.now();

      const strokeFrame = (now: number) => {
        const elapsed = now - startTime;
        const strokeIdx = Math.floor(elapsed / CYCLE_MS);

        if (strokeIdx >= sampledStrokes.length) {
          animFrameRef.current = null;
          setIsAnimating(false);
          redrawMain();
          return;
        }

        const strokeElapsed = elapsed - strokeIdx * CYCLE_MS;
        const t = Math.min(strokeElapsed / STROKE_MS, 1);

        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        ctx.save();
        renderRefChar(ctx, char, 'rgba(200,200,200,0.18)');
        ctx.restore();

        ctx.strokeStyle = '#4f46e5';
        ctx.lineWidth = 9;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Completed strokes
        for (let i = 0; i < strokeIdx; i++) {
          const pts = sampledStrokes[i];
          if (!pts || pts.length < 2) continue;
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let j = 1; j < pts.length; j++) ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }

        // Current stroke in progress
        const currentPts = sampledStrokes[strokeIdx];
        if (currentPts && currentPts.length >= 2) {
          const showCount = Math.max(2, Math.floor(t * currentPts.length));
          ctx.beginPath();
          ctx.moveTo(currentPts[0].x, currentPts[0].y);
          for (let j = 1; j < showCount; j++)
            ctx.lineTo(currentPts[j].x, currentPts[j].y);
          ctx.stroke();

          if (showCount < currentPts.length) {
            const tip = currentPts[showCount - 1];
            ctx.beginPath();
            ctx.arc(tip.x, tip.y, 13, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(79,70,229,0.22)';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(tip.x, tip.y, 6, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(79,70,229,0.85)';
            ctx.fill();
          }
        }

        animFrameRef.current = requestAnimationFrame(strokeFrame);
      };

      animFrameRef.current = requestAnimationFrame(strokeFrame);
      return;
    }

    // ── Fallback: stroke-count-segmented top-to-bottom reveal ────────────────
    // Divides the reveal into strokeCount segments with brief pauses between,
    // which is better than a continuous sweep even without exact path data.
    const strokeCount = KANA_STROKE_COUNT[char] ?? 2;
    const SEGMENT_MS = 600;
    const PAUSE_FRAC = 0.18;
    const TOTAL_MS = strokeCount * SEGMENT_MS;
    const startTime = performance.now();

    const off = new OffscreenCanvas(CANVAS_SIZE, CANVAS_SIZE);
    const offCtx = off.getContext('2d')!;
    renderRefChar(offCtx, char, '#4f46e5');
    const pixData = offCtx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE).data;

    const frame = (now: number) => {
      const raw = Math.min((now - startTime) / TOTAL_MS, 1);

      const segRaw = raw * strokeCount;
      const segIdx = Math.min(Math.floor(segRaw), strokeCount - 1);
      const segT = segRaw - segIdx;
      const t =
        segIdx / strokeCount +
        (Math.max(0, segT - PAUSE_FRAC) / (1 - PAUSE_FRAC)) * (1 / strokeCount);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      ctx.save();
      renderRefChar(ctx, char, 'rgba(200,200,200,0.18)');
      ctx.restore();

      const revealY = eased * CANVAS_SIZE;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, CANVAS_SIZE, revealY);
      ctx.clip();
      ctx.drawImage(off, 0, 0);
      ctx.restore();

      if (raw < 1) {
        const scanY = Math.min(Math.floor(revealY), CANVAS_SIZE - 1);
        let sumX = 0,
          count = 0;
        for (let x = 0; x < CANVAS_SIZE; x++) {
          if (pixData[(scanY * CANVAS_SIZE + x) * 4 + 3] > 50) {
            sumX += x;
            count++;
          }
        }
        const brushX = count > 0 ? sumX / count : CANVAS_SIZE / 2;
        const brushY = Math.min(revealY, CANVAS_SIZE - 12);
        ctx.beginPath();
        ctx.arc(brushX, brushY, 14, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(99,102,241,0.20)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(brushX, brushY, 7, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(99,102,241,0.80)';
        ctx.fill();
      }

      if (raw < 1) {
        animFrameRef.current = requestAnimationFrame(frame);
      } else {
        animFrameRef.current = null;
        setIsAnimating(false);
        redrawMain();
      }
    };

    animFrameRef.current = requestAnimationFrame(frame);
  }

  // ── Check answer ────────────────────────────────────────────────────────────

  async function handleCheck() {
    if (!currentKana) return;

    // Score against offscreen canvases (no ghost contamination)
    const offUser = new OffscreenCanvas(CANVAS_SIZE, CANVAS_SIZE);
    const ctxU = offUser.getContext('2d')!;
    drawStrokes(ctxU, strokes.current);
    const userImageData = ctxU.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const offRef = new OffscreenCanvas(CANVAS_SIZE, CANVAS_SIZE);
    const ctxR = offRef.getContext('2d')!;
    ctxR.save();
    renderRefChar(ctxR, currentKana.hiragana, '#000');
    ctxR.restore();
    const refImageData = ctxR.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const score = computeWritingScore(userImageData, refImageData, 18);
    const stars = scoreToStars(score);
    setCurrentStars(stars);

    // ── Capture reference and user drawing for side-by-side comparison ────────
    const refCapture = document.createElement('canvas');
    refCapture.width = CANVAS_SIZE;
    refCapture.height = CANVAS_SIZE;
    const refCtxCapture = refCapture.getContext('2d')!;
    refCtxCapture.fillStyle = '#fff';
    refCtxCapture.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    renderRefChar(refCtxCapture, currentKana.hiragana, '#4f46e5');
    setCapturedRefUrl(refCapture.toDataURL('image/png'));

    const userCapture = document.createElement('canvas');
    userCapture.width = CANVAS_SIZE;
    userCapture.height = CANVAS_SIZE;
    const userCtxCapture = userCapture.getContext('2d')!;
    userCtxCapture.fillStyle = '#fff';
    userCtxCapture.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    drawStrokes(userCtxCapture, strokes.current);
    setCapturedUserUrl(userCapture.toDataURL('image/png'));

    // Draw orange reference overlay on main canvas
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && currentKana) {
      ctx.save();
      renderRefChar(ctx, currentKana.hiragana, 'rgba(255,120,30,0.55)');
      ctx.restore();
    }

    // SRS update
    const isCorrect = stars >= 2;
    const record = await getOrCreateProgress(currentKana.id, 'kana');
    await saveProgress(
      isCorrect ? updateAfterCorrect(record) : updateAfterIncorrect(record),
    );

    playSfx(isCorrect ? 'correct' : 'tap');

    setResults((prev) => [...prev, { kanaId: currentKana.id, stars }]);
    setPhase('result');
  }

  // ── Advance to next kana or finish ──────────────────────────────────────────

  async function handleNext() {
    setCapturedRefUrl(null);
    setCapturedUserUrl(null);
    if (currentIdx + 1 >= round.length) {
      await finishRound();
    } else {
      setCurrentIdx((i) => i + 1);
      setPhase('draw');
    }
  }

  async function finishRound() {
    const correct = results.filter((r) => r.stars >= 2).length;
    const total = results.length;
    const xp = calculateXpGain(correct, total);
    setXpGained(xp);

    await saveSession({
      id: `kw-${Date.now()}`,
      date: Date.now(),
      durationMs: Date.now() - sessionStart.current,
      feature: 'kana_write',
      correct,
      total,
    });

    if (xp > 0)
      await addXpToPet(
        xp,
        results.filter((r) => r.stars >= 2).map((r) => r.kanaId),
      );
    if (xp > 0) playSfx('levelup');

    setPhase('done');
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (phase === 'done') {
    const totalStars = results.reduce((sum, r) => sum + r.stars, 0);
    const maxStars = results.length * 3;
    const correct = results.filter((r) => r.stars >= 2).length;
    const accuracy = results.length > 0 ? correct / results.length : 0;
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-200 to-emerald-100 flex flex-col items-center justify-center px-4 gap-6">
        <p className="text-5xl">✏️</p>
        <p className="text-3xl font-bold text-emerald-700">
          {t('doneKanaWrite')}
        </p>
        <div className="text-6xl font-bold text-yellow-500">
          {'⭐'.repeat(Math.round((totalStars / Math.max(maxStars, 1)) * 3))}
        </div>
        <p className="text-xl text-gray-600">
          {correct} / {results.length} {t('correct')}
        </p>
        {xpGained > 0 && (
          <p className="text-lg text-emerald-600 font-semibold">
            +{xpGained} XP ✨
          </p>
        )}
        <div className="flex flex-col gap-2 w-full max-w-xs">
          {results.map((r, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-white/70 rounded-xl px-4 py-2"
            >
              <span className="text-2xl">{KANA_EMOJI[r.kanaId] ?? '？'}</span>
              <span className="text-xl font-bold text-gray-700">
                {round[i]?.hiragana ?? ''}
              </span>
              <span className="text-xl">
                {'⭐'.repeat(r.stars)}
                {'☆'.repeat(3 - r.stars)}
              </span>
            </div>
          ))}
        </div>
        {adventure.isActive ? (
          <button
            type="button"
            onClick={() => adventure.submitResult(accuracy, xpGained)}
            className="mt-2 px-8 py-3 rounded-2xl bg-indigo-500 text-white text-xl font-bold shadow hover:bg-indigo-600 transition-colors"
          >
            {t('adventureReturn')}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/play')}
            className="mt-2 px-8 py-3 rounded-2xl bg-emerald-500 text-white text-xl font-bold shadow hover:bg-emerald-600 transition-colors"
          >
            {t('kanaWriteReturn')}
          </button>
        )}
      </div>
    );
  }

  if (!currentKana) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-200 to-emerald-100">
        <p className="text-2xl text-gray-400">{t('loading')}</p>
      </div>
    );
  }

  const emoji = KANA_EMOJI[currentKana.id] ?? '？';
  const isLast = currentIdx + 1 >= round.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 to-emerald-100 flex flex-col items-center px-4 pt-6 pb-8 gap-4">
      {/* Header */}
      <div className="w-full max-w-sm flex justify-between items-center">
        <button
          type="button"
          onClick={() =>
            adventure.isActive ? adventure.cancelChallenge() : navigate('/play')
          }
          className="text-2xl text-gray-500 hover:text-gray-700"
        >
          ←
        </button>
        <span className="text-lg font-bold text-gray-600">
          {currentIdx + 1} / {round.length}
        </span>
        <div className="w-8" />
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-sm h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-400 rounded-full transition-all duration-500"
          style={{
            width: `${((currentIdx + (phase === 'result' ? 1 : 0)) / round.length) * 100}%`,
          }}
        />
      </div>

      {/* Prompt */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-6xl">{emoji}</span>
        <button
          type="button"
          aria-label={t('listenAgainAria')}
          onClick={() => speak(currentKana.hiragana)}
          className="flex items-center gap-2 bg-white/70 rounded-2xl px-4 py-2 shadow hover:bg-white transition-colors"
        >
          <span className="text-2xl">🔊</span>
          <span className="text-2xl font-bold text-sky-700">
            {currentKana.romaji}
          </span>
        </button>
      </div>

      {/* Stars (result phase) */}
      {phase === 'result' && (
        <div className="text-4xl">
          {'⭐'.repeat(currentStars)}
          {'☆'.repeat(3 - currentStars)}
        </div>
      )}

      {/* Canvas */}
      {/* Canvas — hidden in result phase; replaced by side-by-side comparison */}
      <div className={phase === 'result' ? 'hidden' : 'relative'}>
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="rounded-2xl bg-white shadow-xl border-4 border-white touch-none"
          style={{
            width: CANVAS_SIZE,
            height: CANVAS_SIZE,
            cursor: phase === 'draw' ? 'crosshair' : 'default',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
      </div>

      {/* Side-by-side comparison (result phase) — A2 fix */}
      {phase === 'result' && capturedRefUrl && capturedUserUrl && (
        <div className="flex gap-4 justify-center">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-bold text-indigo-600">
              ✏️ おてほん
            </span>
            <img
              src={capturedRefUrl}
              alt="reference"
              className="w-32 h-32 rounded-2xl bg-white shadow-md border-2 border-indigo-200 object-contain"
            />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-bold text-orange-500">
              🟠 きみのじ
            </span>
            <img
              src={capturedUserUrl}
              alt="your writing"
              className="w-32 h-32 rounded-2xl bg-white shadow-md border-2 border-orange-200 object-contain"
            />
          </div>
        </div>
      )}

      {/* Action buttons */}
      {phase === 'draw' ? (
        <div className="flex gap-3 w-full max-w-sm">
          <button
            type="button"
            onClick={runDemo}
            disabled={isAnimating}
            className="flex-1 py-3 rounded-2xl bg-indigo-100 text-indigo-700 text-lg font-bold shadow hover:bg-indigo-200 disabled:opacity-40 transition-colors"
          >
            {t('kanaWriteDemo')}
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={isAnimating}
            className="flex-1 py-3 rounded-2xl bg-gray-200 text-gray-700 text-lg font-bold shadow hover:bg-gray-300 disabled:opacity-40 transition-colors"
          >
            {t('kanaWriteClear')}
          </button>
          <button
            type="button"
            onClick={() => {
              void handleCheck();
            }}
            disabled={!hasStrokes}
            className="flex-[2] py-3 rounded-2xl bg-emerald-500 text-white text-xl font-bold shadow hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {t('kanaWriteCheck')}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            void handleNext();
          }}
          className="w-full max-w-sm py-4 rounded-2xl bg-sky-500 text-white text-xl font-bold shadow hover:bg-sky-600 transition-colors"
        >
          {isLast ? t('kanaWriteFinish') : t('kanaWriteNext')}
        </button>
      )}

      {/* Hint for young mode */}
      {ageMode === 'young' && phase === 'draw' && (
        <p className="text-sm text-gray-400">{t('kanaWriteHint')}</p>
      )}
    </div>
  );
}
