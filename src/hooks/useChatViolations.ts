import { useState, useEffect, useCallback } from 'react'
import { supabaseAdmin } from '../lib/supabase'
import { useVisibilityRefetch } from './useVisibilityRefetch'

export interface ChatViolation {
  id: string
  user_id: string
  user_name?: string
  user_email?: string
  chat_id: string
  message_content: string
  violation_type: 'phone_number' | 'inappropriate_language'
  created_at: string
}

export interface ChatViolationStats {
  totalViolations: number
  phoneNumberFlags: number
  inappropriateFlags: number
  uniqueUsers: number
}

export interface ChatViolationFilters {
  search: string
  violationType: string
}

export const useChatViolations = (
  filters: ChatViolationFilters,
  page: number = 1,
  limit: number = 20
) => {
  const [violations, setViolations] = useState<ChatViolation[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [stats, setStats] = useState<ChatViolationStats>({
    totalViolations: 0,
    phoneNumberFlags: 0,
    inappropriateFlags: 0,
    uniqueUsers: 0,
  })

  const fetchViolations = useCallback(async () => {
    try {
      setLoading(true)

      // Step 1: Fetch violations
      let query = supabaseAdmin
        .from('chat_violations')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (filters.violationType) {
        query = query.eq('violation_type', filters.violationType)
      }

      const { count } = await query
      setTotalCount(count || 0)

      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data: violationsData, error: violationsError } = await query.range(from, to)

      if (violationsError) throw violationsError

      // Step 2: Collect unique user_ids
      const userIds = new Set<string>()
      ;(violationsData || []).forEach((v: any) => {
        userIds.add(v.user_id)
      })

      // Step 3: Batch fetch user_profiles and users
      const userIdsArray = Array.from(userIds)

      const [{ data: profilesData }, { data: usersData }] = await Promise.all([
        supabaseAdmin
          .from('user_profiles')
          .select('user_id, full_name')
          .in('user_id', userIdsArray),
        supabaseAdmin
          .from('users')
          .select('id, email')
          .in('id', userIdsArray),
      ])

      const profileMap = new Map<string, { full_name: string; email: string }>()
      ;(profilesData as any[] || []).forEach((p) => {
        if (p?.user_id) {
          profileMap.set(p.user_id, { full_name: p.full_name, email: '' })
        }
      })
      ;(usersData as any[] || []).forEach((u) => {
        if (u?.id) {
          const existing = profileMap.get(u.id) || { full_name: 'Unknown', email: '' }
          profileMap.set(u.id, { full_name: existing.full_name, email: u.email })
        }
      })

      // Step 4: Transform
      const transformed: ChatViolation[] = (violationsData || []).map((v: any) => {
        const profile = profileMap.get(v.user_id) || { full_name: 'Unknown', email: '' }
        return {
          id: v.id,
          user_id: v.user_id,
          user_name: profile.full_name,
          user_email: profile.email,
          chat_id: v.chat_id,
          message_content: v.message_content,
          violation_type: v.violation_type,
          created_at: v.created_at,
        }
      })

      // Step 5: Apply search filter
      let filtered = transformed
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filtered = transformed.filter(
          (v) =>
            v.user_name?.toLowerCase().includes(searchLower) ||
            v.user_email?.toLowerCase().includes(searchLower) ||
            v.message_content.toLowerCase().includes(searchLower)
        )
      }

      setViolations(filtered)
    } catch (err) {
      console.error('Error fetching chat violations:', err)
    } finally {
      setLoading(false)
    }
  }, [filters, page, limit])

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await supabaseAdmin.from('chat_violations').select('violation_type, user_id')

      if (!data) return

      const phoneFlags = data.filter((v: any) => v.violation_type === 'phone_number').length
      const inappropriateFlags = data.filter(
        (v: any) => v.violation_type === 'inappropriate_language'
      ).length
      const uniqueUsers = new Set(data.map((v: any) => v.user_id)).size

      setStats({
        totalViolations: data.length,
        phoneNumberFlags: phoneFlags,
        inappropriateFlags: inappropriateFlags,
        uniqueUsers: uniqueUsers,
      })
    } catch (err) {
      console.error('Error fetching violation stats:', err)
    }
  }, [])

  useEffect(() => {
    fetchViolations()
    fetchStats()
  }, [fetchViolations, fetchStats])

  useVisibilityRefetch(fetchViolations)

  return {
    violations,
    loading,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    stats,
    refetch: fetchViolations,
  }
}
