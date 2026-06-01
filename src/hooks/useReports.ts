import { useState, useEffect, useCallback, useRef } from 'react'
import { supabaseAdmin } from '../lib/supabase'

export interface Report {
  id: string
  reporter_id: string
  reporter_name?: string
  reporter_email?: string
  reported_id: string
  reported_name?: string
  reported_email?: string
  reported_is_blocked?: boolean
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
  'Profil palsu',
  'Info tidak sesuai',
  'Perilaku tidak sopan',
  'Scam/Penipuan',
  'Lainnya',
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
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const fetchReports = useCallback(async () => {
    try {
      if (mountedRef.current) {
        setLoading(true)
      }

      // Step 1: Fetch reports first
      let reportsQuery = supabaseAdmin
        .from('reports')
        .select('*', { count: 'exact' })

      // Apply filters
      if (filters.status) {
        reportsQuery = reportsQuery.eq('status', filters.status)
      }

      if (filters.reason) {
        reportsQuery = reportsQuery.eq('reason', filters.reason)
      }

      // Get count first
      const { count } = await reportsQuery
      if (mountedRef.current) {
        setTotalCount(count || 0)
      }

      // Apply pagination
      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data: reportsData, error: reportsError } = await reportsQuery
        .order('created_at', { ascending: false })
        .range(from, to)

      if (reportsError) throw reportsError

      // Step 2: Collect all unique user_ids
      const userIds = new Set<string>()
      ;(reportsData || []).forEach(r => {
        userIds.add(r.reporter_id)
        userIds.add(r.reported_id)
      })

      // Step 3: Fetch user_profiles for these user_ids
      // Fetch profiles one by one to avoid filter issues
      const profilePromises = Array.from(userIds).map(async userId => {
        const result = await supabaseAdmin
          .from('user_profiles')
          .select('user_id, full_name, is_blocked')
          .eq('user_id', userId)
          .single()

        return result
      })

      const profileResults = await Promise.all(profilePromises)
      const profiles = profileResults.map(r => r.data).filter(Boolean)

      // Step 4: Create a map for quick lookup
      const profileMap = new Map<string, { full_name: string; is_blocked: boolean }>()
      ;(profiles || []).forEach((p: any) => {
        if (p?.user_id) {
          profileMap.set(p.user_id, { full_name: p.full_name, is_blocked: p.is_blocked || false })
        }
      })

      // Step 5: Transform reports with profile data
      const transformed: Report[] = (reportsData || []).map((r: any) => {
        const reporter = profileMap.get(r.reporter_id) || { full_name: 'Unknown', is_blocked: false }
        const reported = profileMap.get(r.reported_id) || { full_name: 'Unknown', is_blocked: false }

        return {
          id: r.id,
          reporter_id: r.reporter_id,
          reporter_name: reporter.full_name,
          reporter_email: '',
          reported_id: r.reported_id,
          reported_name: reported.full_name,
          reported_email: '',
          reported_is_blocked: reported.is_blocked,
          reason: r.reason,
          description: r.description,
          status: r.status,
          handler_id: r.handler_id,
          handler_name: undefined, // Could be added later if needed
          notes: r.notes,
          created_at: r.created_at,
          updated_at: r.updated_at,
        }
      })

      // Step 6: Apply search filter (if any)
      let filtered = transformed
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filtered = transformed.filter(r =>
          r.reporter_name?.toLowerCase().includes(searchLower) ||
          r.reported_name?.toLowerCase().includes(searchLower) ||
          r.reason.toLowerCase().includes(searchLower)
        )
      }

      if (mountedRef.current) {
        setReports(filtered)
      }
    } catch (err) {
      console.error('Error fetching reports:', err)
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [filters, page, limit])

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await supabaseAdmin
        .from('reports')
        .select('status')

      if (!data) return

      if (mountedRef.current) {
        setStats({
          totalReports: data.length,
          openReports: data.filter(r => r.status === 'open').length,
          investigatingReports: data.filter(r => r.status === 'investigating').length,
          resolvedReports: data.filter(r => r.status === 'resolved').length,
          dismissedReports: data.filter(r => r.status === 'dismissed').length,
        })
      }
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
      const { data: { user } } = await supabaseAdmin.auth.getUser()

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

      const { error } = await supabaseAdmin
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
      return { success: false, error: err instanceof Error ? err.message : 'Terjadi kesalahan' }
    }
  }

  const blockUser = async (userId: string) => {
    try {
      // Platform ban: update user_profiles.is_blocked
      // Note: we skip blocked_users insert because CMS admin uses hardcoded auth
      // and blocker_id must be a valid UUID from auth.users (FK constraint)
      const { error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .update({ is_blocked: true, updated_at: new Date().toISOString() })
        .eq('user_id', userId)

      if (profileError) throw profileError

      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Terjadi kesalahan' }
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
