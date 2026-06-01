import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { type MatchRequest } from '../types'

export interface MatchFilters {
  status: string
  search: string
}

export const useMatches = (filters: MatchFilters, page: number = 1, limit: number = 10) => {
  const [matches, setMatches] = useState<MatchRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const fetchMatches = useCallback(async () => {
    try {
      if (mountedRef.current) {
        setLoading(true)
      }
      if (mountedRef.current) {
        setError(null)
      }

      let query = supabase
        .from('match_requests')
        .select(`
          *,
          requester:users!requester_id (
            id,
            email,
            full_name
          ),
          recipient:users!recipient_id (
            id,
            email,
            full_name
          )
        `, { count: 'exact' })

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      // Get total count
      const { count } = await query
      if (mountedRef.current) {
        setTotalCount(count || 0)
      }

      // Apply pagination
      const from = (page - 1) * limit
      const to = from + limit - 1

      query = query
        .order('created_at', { ascending: false })
        .range(from, to)

      let { data, error: fetchError } = await query

      // Fallback: if users relationship doesn't exist
      if (fetchError && fetchError.code === 'PGRST200') {
        let fallbackQuery = supabase
          .from('match_requests')
          .select('*', { count: 'exact' })

        if (filters.status) {
          fallbackQuery = fallbackQuery.eq('status', filters.status)
        }

        const { count: fbCount } = await fallbackQuery
        if (mountedRef.current) {
          setTotalCount(fbCount || 0)
        }

        const fbResult = await fallbackQuery
          .order('created_at', { ascending: false })
          .range(from, to)

        data = fbResult.data
        fetchError = fbResult.error
      }

      if (fetchError) throw fetchError

      if (mountedRef.current) {
        setMatches(data || [])
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Gagal memuat permintaan pertandingan')
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [filters, page, limit])

  useEffect(() => {
    fetchMatches()
  }, [fetchMatches])
  const updateStatus = async (id: string, status: MatchRequest['status']) => {
    try {
      const { error } = await supabase
        .from('match_requests')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error

      setMatches(prev => prev.map(m => m.id === id ? { ...m, status } : m))
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Gagal memperbarui' }
    }
  }

  const deleteMatch = async (id: string) => {
    try {
      const { error } = await supabase
        .from('match_requests')
        .delete()
        .eq('id', id)

      if (error) throw error

      setMatches(prev => prev.filter(m => m.id !== id))
      setTotalCount(prev => prev - 1)
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Gagal menghapus' }
    }
  }

  // Stats
  const stats = {
    total: totalCount,
    pending: matches.filter(m => m.status === 'pending').length,
    accepted: matches.filter(m => m.status === 'accepted').length,
    rejected: matches.filter(m => m.status === 'rejected').length,
    completed: matches.filter(m => m.status === 'completed').length,
  }

  return {
    matches,
    loading,
    error,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    stats,
    refetch: fetchMatches,
    updateStatus,
    deleteMatch,
  }
}
