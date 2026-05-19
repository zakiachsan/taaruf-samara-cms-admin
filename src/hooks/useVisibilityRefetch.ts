import { useEffect } from 'react'

export function useVisibilityRefetch(refetch: () => void) {
  useEffect(() => {
    let cancelled = false
    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') return
      setTimeout(() => {
        if (!cancelled) refetch()
      }, 1000)
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [refetch])
}