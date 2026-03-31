import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface BlockedUser {
  id: string
  blocker_id: string
  blocker_name?: string
  blocker_email?: string
  blocked_id: string
  blocked_name?: string
  blocked_email?: string
  reason?: string
  created_at: string
}

export interface BlockedFilters {
  search: string
}

export const useBlockedUsers = (filters: BlockedFilters, page: number = 1, limit: number = 20) => {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  const fetchBlockedUsers = useCallback(async () => {
    try {
      setLoading(true)

      let query = supabase
        .from('blocked_users')
        .select(`
          *,
          blocker:blocker_id (
            full_name,
            email
          ),
          blocked:blocked_id (
            full_name,
            email
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })

      const { count } = await query
      setTotalCount(count || 0)

      const from = (page - 1) * limit
      const to = from + limit - 1

      query = query.range(from, to)

      let { data, error } = await query

      // Fallback: if users relationship doesn't exist
      if (error && error.code === 'PGRST200') {
        let fallbackQuery = supabase
          .from('blocked_users')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })

        const { count: fbCount } = await fallbackQuery
        setTotalCount(fbCount || 0)

        const fbResult = await fallbackQuery.range(from, to)

        data = fbResult.data
        error = fbResult.error
      }

      if (error) throw error

      const transformed: BlockedUser[] = (data || []).map((b: any) => ({
        id: b.id,
        blocker_id: b.blocker_id,
        blocker_name: b.blocker?.full_name || 'Unknown',
        blocker_email: b.blocker?.email || '',
        blocked_id: b.blocked_id,
        blocked_name: b.blocked?.full_name || 'Unknown',
        blocked_email: b.blocked?.email || '',
        reason: b.reason,
        created_at: b.created_at,
      }))

      // Client-side search filter
      let filtered = transformed
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filtered = transformed.filter(b =>
          b.blocker_name?.toLowerCase().includes(searchLower) ||
          b.blocker_email?.toLowerCase().includes(searchLower) ||
          b.blocked_name?.toLowerCase().includes(searchLower) ||
          b.blocked_email?.toLowerCase().includes(searchLower)
        )
      }

      setBlockedUsers(filtered)
    } catch (err) {
      console.error('Error fetching blocked users:', err)
    } finally {
      setLoading(false)
    }
  }, [filters, page, limit])

  useEffect(() => {
    fetchBlockedUsers()
  }, [fetchBlockedUsers])

  const unblockUser = async (blockedId: string, blockerId: string) => {
    try {
      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('blocked_id', blockedId)
        .eq('blocker_id', blockerId)

      if (error) throw error

      // Update local state
      setBlockedUsers(users =>
        users.filter(b => !(b.blocked_id === blockedId && b.blocker_id === blockerId))
      )

      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  const unblockById = async (blockId: string) => {
    try {
      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('id', blockId)

      if (error) throw error

      // Update local state
      setBlockedUsers(users => users.filter(b => b.id !== blockId))

      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  return {
    blockedUsers,
    loading,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    refetch: fetchBlockedUsers,
    unblockUser,
    unblockById,
  }
}