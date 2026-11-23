import { useCallback, useEffect, useRef, useState } from 'react'

export default function useCalendarClock() {
  const anchor = useRef(null)
  const activeRequest = useRef(null)
  const [now, setNow] = useState(null)
  const [error, setError] = useState(false)
  const synchronize = useCallback(async () => {
    activeRequest.current?.abort()
    const controller = new AbortController()
    activeRequest.current = controller
    try {
      const response = await fetch('/api/clock', { cache:'no-store', signal:controller.signal })
      if (!response.ok) throw new Error('Clock unavailable')
      const utc = Date.parse(await response.json())
      if (!Number.isFinite(utc)) throw new Error('Invalid server time')
      if (controller.signal.aborted) return
      anchor.current = { utc, elapsed:performance.now() }
      setNow(utc)
      setError(false)
    } catch (failure) {
      if (failure.name !== 'AbortError') setError(true)
    }
  }, [])

  useEffect(() => {
    synchronize()
    // Monotonic elapsed time avoids trusting changes to the computer's clock.
    const tick = setInterval(() => {
      if (anchor.current) setNow(anchor.current.utc + performance.now() - anchor.current.elapsed)
    }, 1000)
    const sync = setInterval(synchronize, 60_000)
    const onVisible = () => { if (!document.hidden) synchronize() }
    window.addEventListener('focus', synchronize)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(tick)
      clearInterval(sync)
      activeRequest.current?.abort()
      window.removeEventListener('focus', synchronize)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [synchronize])

  return { now, error, synchronize }
}
