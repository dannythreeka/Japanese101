interface StarCountProps { count: number }
export default function StarCount({ count }: StarCountProps) {
  return <div key={count} className="flex items-center gap-2 animate-star-pop" aria-label={`ほし ${count}こ`}><span className="text-4xl">⭐</span><span className="text-4xl font-bold text-yellow-500">{count}</span></div>
}
