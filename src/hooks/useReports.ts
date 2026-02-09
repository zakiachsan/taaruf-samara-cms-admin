import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface Report {
  id: string
  reporter_id: string
  reporter_name?: string
  reporter_email?: string
  reported_id: string
  reported_name?: string
  reported_email?: string
  reason: string
  description?: string
  status: 'open' | 'investigating' | 'resolved' | 'dismissed'
  handler_id?: string
  handler_name?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface ReportStats {
  totalReports: number
  openReports: number
  investigatingReports: number
  resolvedReports: number
  dismissedReports: number
}

export interface ReportFilters {
  search: string
  status: string
  reason: string
}

const REASONS = [
  'Inappropriate content',
  'Fake profile',
  'Harassment',
  'Spam',
  'Scam/Fraud',
  'Other',
]

export const useReports = (filters: ReportFilters, page: number = 1, limit: number = 10) => {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [stats, setStats] = useState<ReportStats>({
    totalReports: 0,
    openReports: 0,
    investigatingReports: 0,
    resolvedReports: 0,
    dismissedReports: 0,
  })

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true)

      let query = supabase
        .from('reports')
        .select(`
          *,
          reporter:reporter_id (
            full_name,
            email
          ),
          reported:reported_id (
            full_name,
            email
          ),
          handler:handler_id (
            full_name
          )
        `, { count: 'exact' })

      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      if (filters.reason) {
        query = query.eq('reason', filters.reason)
      }

      const { count } = await query
      setTotalCount(count || 0)

      const from = (page - 1) * limit
      const to = from + limit - 1

      query = query
        .order('created_at', { ascending: false })
        .range(from, to)

      const { data, error } = await query

      if (error) throw error

      const transformed: Report[] = (data || []).map((r: any) => ({
        id: r.id,
        reporter_id: r.reporter_id,
        reporter_name: r.reporter?.full_name || 'Unknown',
        reporter_email: r.reporter?.email || '',
        reported_id: r.reported_id,
        reported_name: r.reported?.full_name || 'Unknown',
        reported_email: r.reported?.email || '',
        reason: r.reason,
        description: r.description,
        status: r.status,
        handler_id: r.handler_id,
        handler_name: r.handler?.full_name,
        notes: r.notes,
        created_at: r.created_at,
        updated_at: r.updated_at,
      }))

      let filtered = transformed
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filtered = transformed.filter(r =>
          r.reporter_name?.toLowerCase().includes(searchLower) ||
          r.reported_name?.toLowerCase().includes(searchLower) ||
          r.reason.toLowerCase().includes(searchLower)
        )
      }

      setReports(filtered)
    } catch (err) {
      console.error('Error fetching reports:', err)
    } finally {
      setLoading(false)
    }
  }, [filters, page, limit])

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('reports')
        .select('status')

      if (!data) return

      setStats({
        totalReports: data.length,
        openReports: data.filter(r => r.status === 'open').length,
        investigatingReports: data.filter(r => r.status === 'investigating').length,
        resolvedReports: data.filter(r => r.status === 'resolved').length,
        dismissedReports: data.filter(r => r.status === 'dismissed').length,
      })
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }, [])

  useEffect(() => {
    fetchReports()
    fetchStats()
  }, [fetchReports, fetchStats])

  const updateStatus = async (reportId: string, newStatus: string, notes?: string) => {
    try {
      // Get current user as handler
      const { data: { user } } = await supabase.auth.getUser()

      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      }

      if (user) {
        updateData.handler_id = user.id
      }

      if (notes) {
        updateData.notes = notes
      }

      const { error } = await supabase
        .from('reports')
        .update(updateData)
        .eq('id', reportId)

      if (error) throw error

      // Update local state
      setReports(reports.map(r =>
        r.id === reportId
          ? { ...r, status: newStatus as any, notes: notes || r.notes, handler_id: user?.id }
          : r
      ))

      fetchStats()
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  const blockUser = async (userId: string) => {
    try {
      // Add to blocked_users table
      const { error } = await supabase
        .from('blocked_users')
        .insert({
          blocker_id: 'system', // or current admin id
          blocked_id: userId,
          reason: 'Reported by multiple users',
        })

      if (error) throw error

      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  return {
    reports,
    loading,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    stats,
    reasons: REASONS,
    refetch: fetchReports,
    updateStatus,
    blockUser,
  }
}
