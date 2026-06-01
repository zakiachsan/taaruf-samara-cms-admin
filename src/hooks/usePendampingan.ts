import { useState, useEffect, useCallback, useRef } from 'react'
import { supabaseAdmin } from '../lib/supabase'

export interface MentoringSession {
  id: string
  user_id: string
  purchase_id: string
  session_number: number
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled'
  scheduled_at?: string
  completed_at?: string
  mentor_name?: string
  notes?: string
  created_at: string
  updated_at?: string
}

export interface PendampinganUser {
  id: string
  purchase_id: string
  user_id: string
  user_full_name: string
  user_email: string
  expires_at: string
  addon_name: string
  addon_price: number
  sessions?: MentoringSession[]
}

export const usePendampingan = () => {
  const [users, setUsers] = useState<PendampinganUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const fetchUsers = useCallback(async () => {
    try {
      if (mountedRef.current) {
        setLoading(true)
      }
      if (mountedRef.current) {
        setError(null)
      }

      const { data: purchaseAddonsData, error: addonsError } = await supabaseAdmin
        .from('purchase_addons')
        .select('*, subscription_purchases(user_id, expires_at)')
        .ilike('addon_name', '%Pendampingan%')
        .order('created_at', { ascending: false })

      if (addonsError) throw addonsError

      const userIds = purchaseAddonsData
        ?.map((item: any) => item.subscription_purchases?.user_id)
        .filter(Boolean) || []

      if (userIds.length === 0) {
        if (mountedRef.current) {
          setUsers([])
        }
        if (mountedRef.current) {
          setLoading(false)
        }
        return
      }

      const { data: profilesData, error: profilesError } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .in('user_id', userIds)

      if (profilesError) throw profilesError

      const profilesMap = new Map(profilesData?.map((p: any) => [p.user_id, p]) || [])

      const formattedUsers: PendampinganUser[] = (purchaseAddonsData || []).map((item: any) => {
        const purchase = item.subscription_purchases || {}
        const profile = profilesMap.get(purchase.user_id) || {}

        return {
          id: item.id,
          purchase_id: purchase.id || '',
          user_id: purchase.user_id || '',
          user_full_name: profile.full_name || '',
          user_email: profile.email || '',
          expires_at: purchase.expires_at || '',
          addon_name: item.addon_name || '',
          addon_price: item.addon_price || 0,
        }
      })

      if (mountedRef.current) {
        setUsers(formattedUsers)
      }
    } catch (err) {
      console.error('Error fetching pendampingan users:', err)
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Gagal memuat pengguna pendampingan')
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])
  const fetchSessions = useCallback(async (userId: string): Promise<MentoringSession[]> => {
    try {
      const { data, error } = await supabaseAdmin
        .from('mentoring_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('session_number', { ascending: true })

      if (error) throw error

      return data || []
    } catch (err) {
      console.error('Failed to fetch sessions:', err)
      return []
    }
  }, [])

  const updateSession = useCallback(async (sessionId: string, updates: Partial<MentoringSession>) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('mentoring_sessions')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId)
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Gagal memperbarui sesi' }
    }
  }, [])

  const getSessionProgress = useCallback((sessions: MentoringSession[]) => {
    const completed = sessions.filter(s => s.status === 'completed').length
    const scheduled = sessions.filter(s => s.status === 'scheduled').length
    const total = completed + scheduled

    return {
      completed,
      scheduled,
      total,
      percentage: Math.round((total / 3) * 100),
    }
  }, [])

  const scheduleSession = useCallback(async (sessionId: string, scheduledAt: string) => {
    return updateSession(sessionId, {
      status: 'scheduled',
      scheduled_at: scheduledAt,
    })
  }, [updateSession])

  const completeSession = useCallback(async (sessionId: string, mentorName: string, notes?: string) => {
    return updateSession(sessionId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      mentor_name: mentorName,
      notes,
    })
  }, [updateSession])

  const cancelSession = useCallback(async (sessionId: string) => {
    return updateSession(sessionId, {
      status: 'cancelled',
    })
  }, [updateSession])

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    fetchSessions,
    updateSession,
    getSessionProgress,
    scheduleSession,
    completeSession,
    cancelSession,
  }
}