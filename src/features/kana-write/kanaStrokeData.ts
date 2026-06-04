/**
 * Hiragana stroke path data for animated stroke-order demo.
 *
 * Paths are in 280×280 canvas space.
 * Vowel paths (あいうえお) are hand-authored approximations of correct stroke order.
 * Other characters use stroke-count segmented animation.
 *
 * TODO: Replace with exact KanjiVG data (CC-BY-SA 3.0, https://kanjivg.tagaini.net/)
 *       for all 46 hiragana for production-quality stroke-order teaching.
 */

export type PathCmd =
  | { t: 'M'; x: number; y: number }
  | { t: 'L'; x: number; y: number }
  | {
      t: 'C';
      cx1: number;
      cy1: number;
      cx2: number;
      cy2: number;
      x: number;
      y: number;
    }
  | { t: 'Q'; cx: number; cy: number; x: number; y: number };

/** One stroke = ordered list of path commands. First command must be 'M'. */
export type KanaStrokePath = PathCmd[];

/** Stroke order data for one kana character (280×280 canvas). */
export interface KanaStrokeData {
  /** Hiragana character this data covers. */
  char: string;
  /** Ordered strokes (first stroke drawn first). */
  strokes: KanaStrokePath[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Vowel stroke paths (あいうえお)
// Coordinates are approximate — stroke order and direction are correct.
// ─────────────────────────────────────────────────────────────────────────────

const AH: KanaStrokeData = {
  char: 'あ',
  strokes: [
    // Stroke 1: short horizontal bar at top
    [
      { t: 'M', x: 62, y: 76 },
      { t: 'C', cx1: 92, cy1: 66, cx2: 162, cy2: 64, x: 220, y: 72 },
    ],
    // Stroke 2: long curve going down-left from under the bar
    [
      { t: 'M', x: 128, y: 72 },
      { t: 'L', x: 128, y: 154 },
      { t: 'C', cx1: 122, cy1: 180, cx2: 96, cy2: 212, x: 54, y: 232 },
    ],
    // Stroke 3: encircling loop at bottom-right
    [
      { t: 'M', x: 128, y: 152 },
      { t: 'C', cx1: 112, cy1: 182, cx2: 95, cy2: 220, x: 80, y: 238 },
      { t: 'C', cx1: 58, cy1: 262, cx2: 64, cy2: 275, x: 106, y: 271 },
      { t: 'C', cx1: 150, cy1: 267, cx2: 210, cy2: 228, x: 222, y: 183 },
      { t: 'C', cx1: 234, cy1: 138, cx2: 216, cy2: 120, x: 193, y: 132 },
    ],
  ],
};

const II: KanaStrokeData = {
  char: 'い',
  strokes: [
    // Stroke 1: left stroke — curves down and to the left
    [
      { t: 'M', x: 90, y: 52 },
      { t: 'C', cx1: 82, cy1: 92, cx2: 74, cy2: 150, x: 60, y: 194 },
      { t: 'C', cx1: 48, cy1: 228, cx2: 38, cy2: 250, x: 28, y: 262 },
    ],
    // Stroke 2: right stroke — curves down with slight inward hook at base
    [
      { t: 'M', x: 172, y: 52 },
      { t: 'C', cx1: 170, cy1: 92, cx2: 172, cy2: 142, x: 178, y: 182 },
      { t: 'C', cx1: 186, cy1: 214, cx2: 202, cy2: 234, x: 218, y: 245 },
    ],
  ],
};

const UU: KanaStrokeData = {
  char: 'う',
  strokes: [
    // Stroke 1: short curved top tick
    [
      { t: 'M', x: 110, y: 50 },
      { t: 'C', cx1: 124, cy1: 38, cx2: 150, cy2: 36, x: 170, y: 44 },
    ],
    // Stroke 2: main U-body starting from right, curving under and exiting left
    [
      { t: 'M', x: 184, y: 74 },
      { t: 'C', cx1: 200, cy1: 80, cx2: 214, cy2: 102, x: 214, y: 126 },
      { t: 'C', cx1: 214, cy1: 160, cx2: 196, cy2: 192, x: 166, y: 214 },
      { t: 'C', cx1: 136, cy1: 234, cx2: 102, cy2: 240, x: 78, y: 232 },
      { t: 'C', cx1: 54, cy1: 222, cx2: 52, cy2: 198, x: 68, y: 182 },
    ],
  ],
};

const EH: KanaStrokeData = {
  char: 'え',
  strokes: [
    // Stroke 1: horizontal bar at top
    [
      { t: 'M', x: 45, y: 74 },
      { t: 'C', cx1: 88, cy1: 64, cx2: 172, cy2: 62, x: 220, y: 70 },
    ],
    // Stroke 2: long down-left curve from center
    [
      { t: 'M', x: 128, y: 70 },
      { t: 'C', cx1: 124, cy1: 110, cx2: 110, cy2: 152, x: 95, y: 186 },
      { t: 'C', cx1: 80, cy1: 220, cx2: 60, cy2: 240, x: 42, y: 254 },
    ],
    // Stroke 3: right sweep going right then curving down-left
    [
      { t: 'M', x: 78, y: 142 },
      { t: 'C', cx1: 122, cy1: 136, cx2: 180, cy2: 150, x: 216, y: 174 },
      { t: 'C', cx1: 244, cy1: 190, cx2: 250, cy2: 212, x: 240, y: 232 },
      { t: 'C', cx1: 228, cy1: 252, cx2: 192, cy2: 266, x: 152, y: 272 },
    ],
  ],
};

const OH: KanaStrokeData = {
  char: 'お',
  strokes: [
    // Stroke 1: horizontal bar at top
    [
      { t: 'M', x: 52, y: 68 },
      { t: 'C', cx1: 90, cy1: 59, cx2: 162, cy2: 58, x: 216, y: 65 },
    ],
    // Stroke 2: vertical center line going straight down
    [
      { t: 'M', x: 130, y: 65 },
      { t: 'L', x: 130, y: 240 },
    ],
    // Stroke 3: outer circular loop at right
    [
      { t: 'M', x: 80, y: 124 },
      { t: 'C', cx1: 126, cy1: 118, cx2: 194, cy2: 128, x: 224, y: 152 },
      { t: 'C', cx1: 250, cy1: 174, cx2: 250, cy2: 202, x: 232, y: 222 },
      { t: 'C', cx1: 212, cy1: 244, cx2: 168, cy2: 258, x: 126, y: 262 },
      { t: 'C', cx1: 84, cy1: 266, cx2: 56, cy2: 252, x: 52, y: 230 },
      { t: 'C', cx1: 46, cy1: 204, cx2: 65, cy2: 186, x: 95, y: 182 },
    ],
  ],
};

/**
 * Stroke path data for kana with full path definitions.
 * Key is the hiragana character.
 */
export const KANA_STROKE_PATHS: Record<string, KanaStrokeData> = {
  あ: AH,
  い: II,
  う: UU,
  え: EH,
  お: OH,
};

/**
 * Approximate stroke counts for all basic hiragana.
 * Used to segment the fallback animation into stroke-pause cycles.
 * Source: standard hiragana stroke order charts.
 */
export const KANA_STROKE_COUNT: Record<string, number> = {
  あ: 3,
  い: 2,
  う: 2,
  え: 3,
  お: 3,
  か: 3,
  き: 4,
  く: 1,
  け: 3,
  こ: 2,
  さ: 3,
  し: 1,
  す: 2,
  せ: 3,
  そ: 2,
  た: 4,
  ち: 2,
  つ: 1,
  て: 1,
  と: 2,
  な: 4,
  に: 3,
  ぬ: 2,
  ね: 4,
  の: 1,
  は: 3,
  ひ: 2,
  ふ: 4,
  へ: 1,
  ほ: 4,
  ま: 3,
  み: 2,
  む: 3,
  め: 2,
  も: 3,
  や: 3,
  ゆ: 2,
  よ: 3,
  ら: 2,
  り: 2,
  る: 1,
  れ: 4,
  ろ: 1,
  わ: 4,
  を: 3,
  ん: 1,
  // Dakuten / handakuten variants
  が: 4,
  ぎ: 5,
  ぐ: 2,
  げ: 4,
  ご: 3,
  ざ: 4,
  じ: 2,
  ず: 3,
  ぜ: 4,
  ぞ: 3,
  だ: 5,
  ぢ: 3,
  づ: 2,
  で: 2,
  ど: 3,
  ば: 4,
  び: 3,
  ぶ: 5,
  べ: 2,
  ぼ: 5,
  ぱ: 4,
  ぴ: 3,
  ぷ: 5,
  ぺ: 2,
  ぽ: 5,
};

// ─────────────────────────────────────────────────────────────────────────────
// Path sampling helpers
// ─────────────────────────────────────────────────────────────────────────────

function cubicBezier(
  p0: number,
  p1: number,
  p2: number,
  p3: number,
  t: number,
): number {
  const mt = 1 - t;
  return (
    mt * mt * mt * p0 +
    3 * mt * mt * t * p1 +
    3 * mt * t * t * p2 +
    t * t * t * p3
  );
}

function quadBezier(p0: number, p1: number, p2: number, t: number): number {
  const mt = 1 - t;
  return mt * mt * p0 + 2 * mt * t * p1 + t * t * p2;
}

/**
 * Sample N evenly-spaced points along a stroke path.
 * Returns a polyline of {x, y} points for progressive animation.
 */
export function sampleStrokePath(
  cmds: KanaStrokePath,
  n = 30,
): Array<{ x: number; y: number }> {
  const points: Array<{ x: number; y: number }> = [];
  let cx = 0;
  let cy = 0;

  for (const cmd of cmds) {
    if (cmd.t === 'M') {
      cx = cmd.x;
      cy = cmd.y;
      points.push({ x: cx, y: cy });
    } else if (cmd.t === 'L') {
      const steps = Math.max(3, Math.ceil(n / cmds.length));
      for (let i = 1; i <= steps; i++) {
        const tp = i / steps;
        points.push({ x: cx + (cmd.x - cx) * tp, y: cy + (cmd.y - cy) * tp });
      }
      cx = cmd.x;
      cy = cmd.y;
    } else if (cmd.t === 'C') {
      const steps = Math.max(6, Math.ceil(n / cmds.length));
      for (let i = 1; i <= steps; i++) {
        const tp = i / steps;
        points.push({
          x: cubicBezier(cx, cmd.cx1, cmd.cx2, cmd.x, tp),
          y: cubicBezier(cy, cmd.cy1, cmd.cy2, cmd.y, tp),
        });
      }
      cx = cmd.x;
      cy = cmd.y;
    } else if (cmd.t === 'Q') {
      const steps = Math.max(4, Math.ceil(n / cmds.length));
      for (let i = 1; i <= steps; i++) {
        const tp = i / steps;
        points.push({
          x: quadBezier(cx, cmd.cx, cmd.x, tp),
          y: quadBezier(cy, cmd.cy, cmd.y, tp),
        });
      }
      cx = cmd.x;
      cy = cmd.y;
    }
  }

  return points;
}
