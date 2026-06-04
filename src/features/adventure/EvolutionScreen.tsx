import { useEffect } from 'react';
import { PET_STAGES } from '../../data/petStages';

interface Props {
  fromStage: number;
  toStage: number;
  onComplete: () => void;
}

export default function EvolutionScreen({
  fromStage,
  toStage,
  onComplete,
}: Props) {
  const prevStage = PET_STAGES[fromStage];
  const nextStage = PET_STAGES[toStage];

  useEffect(() => {
    const timer = setTimeout(onComplete, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-gradient-to-b from-purple-600 to-indigo-900 text-white"
      role="status"
      aria-live="polite"
    >
      {/* Ping ring */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 rounded-full bg-white/10 animate-ping" />
      </div>

      <p className="text-2xl font-bold text-purple-200 tracking-widest">
        しんか！
      </p>

      {/* Egg → new form */}
      <div className="flex items-center gap-6 text-7xl relative z-10">
        <span className="opacity-40 scale-75 inline-block">
          {prevStage?.emoji ?? '🥚'}
        </span>
        <span className="text-4xl animate-bounce">→</span>
        <span className="inline-block animate-bounce drop-shadow-2xl">
          {nextStage?.emoji ?? '🐣'}
        </span>
      </div>

      {/* Stage name */}
      <div className="flex flex-col items-center gap-2 relative z-10">
        <p className="text-4xl font-black tracking-wide drop-shadow-lg animate-pulse">
          {nextStage?.name_jp ?? ''}
        </p>
        {nextStage?.aura && (
          <p
            className="text-5xl"
            style={{ animation: 'spin 2s linear infinite' }}
          >
            {nextStage.aura}
          </p>
        )}
        <p className="text-lg text-purple-200 mt-2 text-center px-6">
          {nextStage?.description_jp ?? ''}
        </p>
      </div>

      <p className="text-sm text-purple-300 mt-2">（じどうでつぎへいきます）</p>
    </div>
  );
}
