import { useEffect, useState } from 'react'
import { useT } from '../../hooks/useT'

interface Props {
  char: string
  onClose: () => void
}

function getHiraganaCodepoints(char: string): number[] {
  const cps: number[] = []
  for (const ch of char) {
    const cp = ch.codePointAt(0)!
    if (cp >= 12353 && cp <= 12447) cps.push(cp)
  }
  return cps
}

function processSvg(raw: string): string {
  return raw
    .replace(/<!\[CDATA\[/g, '')
    .replace(/\]\]>/g, '')
    .replace(/fill:#ccc/g, 'fill:#c7d2fe')
    .replace(/stroke:#000/g, 'stroke:#4338ca')
    .replace('<svg ', '<svg style="width:100%;height:100%;display:block;" ')
}

export default function StrokeOrderDemo({ char, onClose }: Props) {
  const t = useT()
  const codepoints = getHiraganaCodepoints(char)
  const [svgs, setSvgs] = useState<(string | null)[]>([])
  const [loading, setLoading] = useState(true)
  const [replayKey, setReplayKey] = useState(0)

  useEffect(() => {
    setLoading(true)
    setSvgs([])
    void Promise.all(
      codepoints.map((cp) =>
        fetch(`/stroke-svgs/${cp}.svg`)
          .then((r) => (r.ok ? r.text() : null))
          .then((text) => (text ? processSvg(text) : null))
          .catch(() => null),
      ),
    ).then((results) => {
      setSvgs(results)
      setLoading(false)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [char])

  const loaded = svgs.filter(Boolean)
  const boxSize = loaded.length > 1 ? 110 : 160

  return (
    <div
      className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/40 pb-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-5 flex flex-col items-center gap-4 mx-4 w-full max-w-xs">
        {/* Header */}
        <div className="flex items-center justify-between w-full">
          <span className="text-base font-bold text-indigo-700">{t('kanaWriteDemo')}</span>
          <button
            type="button"
            aria-label={t('kanaWriteDemoClose')}
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-lg font-bold transition-colors"
          >
            ×
          </button>
        </div>

        {/* Character label */}
        <div className="text-4xl font-bold text-indigo-800 font-serif">{char}</div>

        {/* Animation area */}
        {loading ? (
          <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-500 animate-spin" />
        ) : loaded.length === 0 ? (
          /* Fallback: no SVG available */
          <div
            className="flex items-center justify-center rounded-2xl bg-indigo-50 border-2 border-indigo-100"
            style={{ width: 160, height: 160 }}
          >
            <span style={{ fontSize: 100, fontFamily: 'serif', color: '#4338ca', lineHeight: 1 }}>
              {char}
            </span>
          </div>
        ) : (
          <div key={replayKey} className="flex gap-3 items-center justify-center">
            {svgs.map((svg, i) =>
              svg ? (
                <div
                  key={i}
                  className="rounded-xl overflow-hidden bg-indigo-50 border-2 border-indigo-100 flex-shrink-0"
                  style={{ width: boxSize, height: boxSize }}
                  // AnimCJK SVG (LGPL): inline injection triggers CSS animation
                  dangerouslySetInnerHTML={{ __html: svg }}
                />
              ) : null,
            )}
          </div>
        )}

        {/* Replay button */}
        {!loading && loaded.length > 0 && (
          <button
            type="button"
            onClick={() => setReplayKey((k) => k + 1)}
            className="px-5 py-2 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-bold transition-colors active:scale-95"
          >
            🔄 {t('kanaWriteDemoReplay')}
          </button>
        )}

        {/* Attribution (LGPL requires notice) */}
        <p className="text-xs text-gray-400">
          AnimCJK © FM-SH ·{' '}
          <a
            href="https://github.com/parsimonhi/animCJK"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            LGPL v3
          </a>
        </p>
      </div>
    </div>
  )
}
