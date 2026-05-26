import { useEffect, useState } from 'react'

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

export function useCountUp(target: number, duration = 600, enabled = true) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!enabled) {
      setValue(target)
      return
    }

    let rafId: number
    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutCubic(progress)
      setValue(Math.round(eased * target))

      if (progress < 1) {
        rafId = requestAnimationFrame(tick)
      }
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [target, duration, enabled])

  return value
}
