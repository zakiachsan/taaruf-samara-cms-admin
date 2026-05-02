import { useState, useEffect, useCallback } from 'react'
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

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Fetching pendampingan users...')
      console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)

      // Step 1: Get all Premium Pendampingan purchase_addons
      const { data: purchaseAddonsData, error: addonsError } = await supabaseAdmin
        .from('purchase_addons')
        .select('*, subscription_purchases(user_id, expires_at)')
        .eq('addon_name', 'Premium Pendampingan')
        .order('created_at', { ascending: false })

      console.log('Purchase addons response:', { purchaseAddonsData, error: addonsError })

      if (addonsError) throw addonsError

      // Step 2: Get user profiles for the user_ids
      const userIds = purchaseAddonsData?.map((item: any) => item.subscription_purchases?.user_id).filter(Boolean) || []
      console.log('User IDs to fetch:', userIds)

      if (userIds.length === 0) {
        setUsers([])
        return
      }

      // Step 3: Get user profiles
      const { data: profilesData, error: profilesError } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .in('user_id', userIds)

      console.log('Profiles response:', { profilesData, error: profilesError })

      if (profilesError) throw profilesError

      // Step 4: Get auth users for emails
      const { data: authUsersData, error: authError } = await supabaseAdmin
        .from('auth.users')
        .select('id, email')
        .in('id', userIds)

      console.log('Auth users response:', { authUsersData, error: authError })

      if (authError) throw authError

      // Step 5: Map to PendampinganUser format
      const profilesMap = new Map(profilesData?.map((p: any) => [p.user_id, p]) || [])
      const authUsersMap = new Map(authUsersData?.map((u: any) => [u.id, u.email]) || [])

      const formattedUsers: PendampinganUser[] = (purchaseAddonsData || []).map((item: any) => {
        const purchase = item.subscription_purchases || {}
        const profile = profilesMap.get(purchase.user_id) || {}
        const authUser = authUsersMap.get(purchase.user_id) || {}

        return {
          id: item.id,
          purchase_id: purchase.id || '',
          user_id: purchase.user_id || '',
          user_full_name: profile.full_name || '',
          user_email: authUser.email || '',
          expires_at: purchase.expires_at || '',
          addon_name: item.addon_name || '',
          addon_price: item.addon_price || 0,
        }
      })

      console.log('Formatted users:', formattedUsers)

      setUsers(formattedUsers)
    } catch (err) {
      console.error('Error fetching pendampingan users:', err)
      setError(err instanceof Error ? err.message : 'Gagal memuat pengguna pendampingan')
    } finally {
      setLoading(false)
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
