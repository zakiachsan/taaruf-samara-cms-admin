import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface PremiumSubscription {
  id: string
  user_id: string
  user_name?: string
  user_email?: string
  plan_type: 'basic' | 'premium'
  status: 'active' | 'expired' | 'cancelled'
  start_date: string
  expires_at: string
  amount: number
  created_at: string
}

export interface RevenueStats {
  totalRevenue: number
  basicRevenue: number
  premiumRevenue: number
  activeSubscriptions: number
  expiringThisWeek: number
  expiringThisMonth: number
}

export interface PremiumFilters {
  search: string
  type: string
  status: string
  expiringSoon: string
}

export const usePremium = (filters: PremiumFilters, page: number = 1, limit: number = 10) => {
  const [subscriptions, setSubscriptions] = useState<PremiumSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [stats, setStats] = useState<RevenueStats>({
    totalRevenue: 0,
    basicRevenue: 0,
    premiumRevenue: 0,
    activeSubscriptions: 0,
    expiringThisWeek: 0,
    expiringThisMonth: 0,
  })

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true)

      // Calculate date ranges for expiry filters
      const today = new Date()
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

      let query = supabase
        .from('premium_subscriptions')
        .select(`
          *,
          users:user_id (
            full_name,
            email
          )
        `, { count: 'exact' })

      // Apply filters
      if (filters.type) {
        query = query.eq('plan_type', filters.type)
      }

      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      if (filters.expiringSoon === 'week') {
        query = query
          .lte('expires_at', weekFromNow.toISOString())
          .gte('expires_at', today.toISOString())
      } else if (filters.expiringSoon === 'month') {
        query = query
          .lte('expires_at', monthFromNow.toISOString())
          .gte('expires_at', today.toISOString())
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

      let { data, error } = await query

      // Fallback: if users relationship doesn't exist
      if (error && error.code === 'PGRST200') {
        let fallbackQuery = supabase
          .from('premium_subscriptions')
          .select('*', { count: 'exact' })

        if (filters.type) {
          fallbackQuery = fallbackQuery.eq('plan_type', filters.type)
        }
        if (filters.status) {
          fallbackQuery = fallbackQuery.eq('status', filters.status)
        }
        if (filters.expiringSoon === 'week') {
          fallbackQuery = fallbackQuery
            .lte('expires_at', weekFromNow.toISOString())
            .gte('expires_at', today.toISOString())
        } else if (filters.expiringSoon === 'month') {
          fallbackQuery = fallbackQuery
            .lte('expires_at', monthFromNow.toISOString())
            .gte('expires_at', today.toISOString())
        }

        const { count: fbCount } = await fallbackQuery
        setTotalCount(fbCount || 0)

        const fbResult = await fallbackQuery
          .order('created_at', { ascending: false })
          .range(from, to)

        data = fbResult.data
        error = fbResult.error
      }

      if (error) throw error

      // Transform data
      const transformed: PremiumSubscription[] = (data || []).map((s: any) => ({
        id: s.id,
        user_id: s.user_id,
        user_name: s.users?.full_name || 'Unknown',
        user_email: s.users?.email || '',
        plan_type: s.plan_type,
        status: s.status,
        start_date: s.start_date,
        expires_at: s.expires_at,
        amount: s.amount,
        created_at: s.created_at,
      }))

      // Filter by search (client-side due to join)
      let filtered = transformed
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filtered = transformed.filter(s =>
          s.user_name?.toLowerCase().includes(searchLower) ||
          s.user_email?.toLowerCase().includes(searchLower)
        )
      }

      setSubscriptions(filtered)
    } catch (err) {
      console.error('Error fetching subscriptions:', err)
    } finally {
      setLoading(false)
    }
  }, [filters, page, limit])

  const fetchStats = useCallback(async () => {
    try {
      const today = new Date()
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

      // Get all subscriptions for stats
      const { data: allSubs } = await supabase
        .from('premium_subscriptions')
        .select('plan_type, status, amount, expires_at')

      if (!allSubs) return

      const totalRevenue = allSubs.reduce((sum, s) => sum + (s.amount || 0), 0)
      const basicRevenue = allSubs
        .filter(s => s.plan_type === 'basic')
        .reduce((sum, s) => sum + (s.amount || 0), 0)
      const premiumRevenue = allSubs
        .filter(s => s.plan_type === 'premium')
        .reduce((sum, s) => sum + (s.amount || 0), 0)

      const activeSubscriptions = allSubs.filter(s => s.status === 'active').length

      const expiringThisWeek = allSubs.filter(s => {
        const endDate = new Date(s.expires_at)
        return endDate >= today && endDate <= weekFromNow && s.status === 'active'
      }).length

      const expiringThisMonth = allSubs.filter(s => {
        const endDate = new Date(s.expires_at)
        return endDate >= today && endDate <= monthFromNow && s.status === 'active'
      }).length

      setStats({
        totalRevenue,
        basicRevenue,
        premiumRevenue,
        activeSubscriptions,
        expiringThisWeek,
        expiringThisMonth,
      })
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }, [])

  useEffect(() => {
    fetchSubscriptions()
    fetchStats()
  }, [fetchSubscriptions, fetchStats])

  const extendSubscription = async (subscriptionId: string, newEndDate: string) => {
    try {
      const { error } = await supabase
        .from('premium_subscriptions')
        .update({ expires_at: newEndDate, status: 'active' })
        .eq('id', subscriptionId)

      if (error) throw error

      // Update local state
      setSubscriptions(subs =>
        subs.map(s =>
          s.id === subscriptionId
            ? { ...s, expires_at: newEndDate, status: 'active' }
            : s
        )
      )

      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  const cancelSubscription = async (subscriptionId: string) => {
    try {
      const { error } = await supabase
        .from('premium_subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', subscriptionId)

      if (error) throw error

      // Update local state
      setSubscriptions(subs =>
        subs.map(s =>
          s.id === subscriptionId ? { ...s, status: 'cancelled' } : s
        )
      )

      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  return {
    subscriptions,
    loading,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    stats,
    refetch: fetchSubscriptions,
    extendSubscription,
    cancelSubscription,
  }
}
