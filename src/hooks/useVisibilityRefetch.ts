import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useVisibilityRefetch(refetch: () => void) {
  useEffect(() => {
    const handleVisibility = async () => {
      if (document.visibilityState !== 'visible') return

      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        refetch()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [refetch])
}