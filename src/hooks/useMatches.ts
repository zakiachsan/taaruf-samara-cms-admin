import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { MatchRequest } from '../types'

export interface MatchFilters {
  status: string
  search: string
}

export const useMatches = (filters: MatchFilters, page: number = 1, limit: number = 10) => {
  const [matches, setMatches] = useState<MatchRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

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
      setTotalCount(count || 0)

      // Apply pagination
      const from = (page - 1) * limit
      const to = from + limit - 1

      query = query
        .order('created_at', { ascending: false })
        .range(from, to)

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      setMatches(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch matches')
    } finally {
      setLoading(false)
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
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update' }
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
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete' }
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
