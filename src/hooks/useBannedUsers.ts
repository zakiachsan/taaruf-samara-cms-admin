import { useState, useEffect, useCallback } from 'react'
import { supabaseAdmin } from '../lib/supabase'
import { useVisibilityRefetch } from './useVisibilityRefetch'

export interface BannedUser {
  id: string
  user_id: string
  full_name: string
  email: string
  violation_count: number
  created_at: string
  updated_at: string
}

export interface BannedUserFilters {
  search: string
}

export const useBannedUsers = (
  filters: BannedUserFilters,
  page: number = 1,
  limit: number = 20
) => {
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  const fetchBannedUsers = useCallback(async () => {
    try {
      setLoading(true)

      // Step 1: Fetch banned user profiles
      let query = supabaseAdmin
        .from('user_profiles')
        .select('*', { count: 'exact' })
        .eq('is_blocked', true)
        .order('updated_at', { ascending: false })

      const { count } = await query
      setTotalCount(count || 0)

      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data: profilesData, error: profilesError } = await query.range(from, to)

      if (profilesError) throw profilesError

      // Step 2: Collect user_ids
      const userIds = (profilesData || []).map((p: any) => p.user_id)

      // Step 3: Fetch violation counts per user
      const violationCounts = new Map<string, number>()
      if (userIds.length > 0) {
        const { data: violationsData } = await supabaseAdmin
          .from('chat_violations')
          .select('user_id')
          .in('user_id', userIds)

        if (violationsData) {
          violationsData.forEach((v: any) => {
            violationCounts.set(v.user_id, (violationCounts.get(v.user_id) || 0) + 1)
          })
        }
      }

      // Step 4: Try to get emails from users table
      const emailMap = new Map<string, string>()
      if (userIds.length > 0) {
        try {
          const { data: usersData } = await supabaseAdmin
            .from('users')
            .select('id, email')
            .in('id', userIds)

          if (usersData) {
            usersData.forEach((u: any) => {
              emailMap.set(u.id, u.email)
            })
          }
        } catch (e) {
          // users table might not exist, continue
        }
      }

      // Step 5: Transform
      let transformed: BannedUser[] = (profilesData || []).map((p: any) => ({
        id: p.user_id,
        user_id: p.user_id,
        full_name: p.full_name || 'Unknown',
        email: emailMap.get(p.user_id) || p.email || '',
        violation_count: violationCounts.get(p.user_id) || 0,
        created_at: p.created_at,
        updated_at: p.updated_at,
      }))

      // Step 6: Apply search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        transformed = transformed.filter(
          (u) =>
            u.full_name.toLowerCase().includes(searchLower) ||
            u.email.toLowerCase().includes(searchLower)
        )
      }

      setBannedUsers(transformed)
    } catch (err) {
      console.error('Error fetching banned users:', err)
    } finally {
      setLoading(false)
    }
  }, [filters, page, limit])

  useEffect(() => {
    fetchBannedUsers()
  }, [fetchBannedUsers])

  useVisibilityRefetch(fetchBannedUsers)

  const unbanUser = async (userId: string) => {
    try {
      const { error } = await supabaseAdmin
        .from('user_profiles')
        .update({ is_blocked: false, updated_at: new Date().toISOString() })
        .eq('user_id', userId)

      if (error) throw error

      // Update local state
      setBannedUsers((users) => users.filter((u) => u.user_id !== userId))
      setTotalCount((prev) => Math.max(0, prev - 1))

      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Terjadi kesalahan' }
    }
  }

  return {
    bannedUsers,
    loading,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    refetch: fetchBannedUsers,
    unbanUser,
  }
}
