import { useEffect, useRef, useState } from 'react'

interface StarCountProps {
  count: number
}

export default function StarCount({ count }: StarCountProps) {
  const [animClass, setAnimClass] = useState('animate-star-pop')
  const prevCount = useRef(count)

  useEffect(() => {
    setAnimClass('animate-star-pop')
    const t = setTimeout(() => setAnimClass(''), 600)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (count !== prevCount.current) {
      prevCount.current = count
      setAnimClass('animate-star-pop')
      const t = setTimeout(() => setAnimClass(''), 600)
      return () => clearTimeout(t)
    }
  }, [count])

  return (
    <div className={`flex items-center gap-2 ${animClass}`} aria-label={`ほし ${count}こ`}>
      <span className="text-4xl">⭐</span>
      <span className="text-4xl font-bold text-yellow-500">{count}</span>
    </div>
  )
}
