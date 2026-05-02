import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface BlockedUser {
  id: string
  user_id: string
  full_name?: string
  email?: string
  whatsapp?: string
  phone?: string
  is_blocked: boolean
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
        .from('user_profiles')
        .select('*', { count: 'exact' })
        .eq('is_blocked', true)
        .order('created_at', { ascending: false })

      // Apply search filter (server-side on full_name if possible)
      if (filters.search) {
        query = query.ilike('full_name', `%${filters.search}%`)
      }

      const { count } = await query
      setTotalCount(count || 0)

      const from = (page - 1) * limit
      const to = from + limit - 1

      query = query.range(from, to)

      const { data, error } = await query

      if (error) throw error

      const transformed: BlockedUser[] = (data || []).map((p: any) => ({
        id: p.user_id,
        user_id: p.user_id,
        full_name: p.full_name || 'Unknown',
        email: p.email || '',
        whatsapp: p.whatsapp || '',
        phone: p.phone || '',
        is_blocked: p.is_blocked,
        created_at: p.created_at,
      }))

      // Client-side search filter for email/whatsapp/phone
      let filtered = transformed
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filtered = transformed.filter(b =>
          b.full_name?.toLowerCase().includes(searchLower) ||
          b.email?.toLowerCase().includes(searchLower) ||
          b.whatsapp?.toLowerCase().includes(searchLower) ||
          b.phone?.toLowerCase().includes(searchLower)
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

  const unblockById = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_blocked: false })
        .eq('user_id', userId)

      if (error) throw error

      // Also update legacy users table if exists
      await supabase
        .from('users')
        .update({ is_blocked: false })
        .eq('id', userId)

      // Update local state
      setBlockedUsers(users => users.filter(b => b.user_id !== userId))
      setTotalCount(prev => Math.max(0, prev - 1))

      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Terjadi kesalahan' }
    }
  }

  return {
    blockedUsers,
    loading,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    refetch: fetchBlockedUsers,
    unblockById,
  }
}
