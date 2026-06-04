/**
 * Hiragana stroke paths for stroke-order animation.
 *
 * TODO: Replace with verified KanjiVG paths (CC-BY-SA 3.0) before enabling.
 * Current paths are placeholders and do not accurately represent stroke order.
 * Until verified paths are added, the clip-reveal fallback in KanaWriteGame
 * is used for all characters (gives correct shape via system font).
 */

// Each entry: character → ordered array of SVG path `d` strings (one per stroke)
export const HIRAGANA_STROKES: Record<string, string[]> = {
}
