import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { SelfValueRegistration } from '../types'

export interface SelfValueFilters {
  status: string
  search: string
}

export const useSelfValue = (filters: SelfValueFilters, page: number = 1, limit: number = 10) => {
  const [registrations, setRegistrations] = useState<SelfValueRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('self_value_registrations')
        .select(`
          *,
          user:users!user_id (
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

      setRegistrations(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch registrations')
    } finally {
      setLoading(false)
    }
  }, [filters, page, limit])

  useEffect(() => {
    fetchRegistrations()
  }, [fetchRegistrations])

  const updateStatus = async (
    id: string, 
    status: SelfValueRegistration['status'],
    additionalData?: Partial<SelfValueRegistration>
  ) => {
    try {
      const { data, error } = await supabase
        .from('self_value_registrations')
        .update({
          status,
          ...additionalData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setRegistrations(prev => prev.map(r => r.id === id ? { ...r, ...data } : r))
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update' }
    }
  }

  const scheduleSession = async (
    id: string,
    scheduledDate: string,
    scheduledTime: string,
    location: string
  ) => {
    return updateStatus(id, 'scheduled', {
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime,
      location,
    })
  }

  const completeSession = async (id: string, certificateUrl?: string, notes?: string) => {
    return updateStatus(id, 'completed', {
      certificate_url: certificateUrl,
      notes,
    })
  }

  const cancelSession = async (id: string, notes?: string) => {
    return updateStatus(id, 'cancelled', { notes })
  }

  // Stats
  const stats = {
    total: totalCount,
    registered: registrations.filter(r => r.status === 'registered').length,
    scheduled: registrations.filter(r => r.status === 'scheduled').length,
    completed: registrations.filter(r => r.status === 'completed').length,
    cancelled: registrations.filter(r => r.status === 'cancelled').length,
  }

  return {
    registrations,
    loading,
    error,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    stats,
    refetch: fetchRegistrations,
    updateStatus,
    scheduleSession,
    completeSession,
    cancelSession,
  }
}
