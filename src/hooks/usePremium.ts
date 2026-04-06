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
  package_name?: string
  addons?: Array<{ addon_name: string; addon_price: number }>
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

      // Fetch from new subscription_purchases table first
      let query = supabase
        .from('subscription_purchases')
        .select(`
          *,
          package:subscription_packages(
            id,
            name,
            display_name,
            duration_months,
            price
          ),
          purchase_addons(
            addon_name,
            addon_price
          ),
          users:user_id (
            full_name,
            email
          )
        `, { count: 'exact' })

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status === 'active' ? 'paid' : filters.status)
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

      // Apply pagination
      const from = (page - 1) * limit
      const to = from + limit - 1

      query = query
        .order('created_at', { ascending: false })
        .range(from, to)

      let { data, error, count } = await query

      if (error) {
        console.error('[usePremium] Error fetching new subscriptions:', error)
        // Fallback to old table if new table query fails
        return fetchOldSubscriptions()
      }

      setTotalCount(count || 0)

      // Transform data to match expected format
      const transformed: PremiumSubscription[] = (data || []).map((s: any) => ({
        id: s.id,
        user_id: s.user_id,
        user_name: s.users?.full_name || 'Unknown',
        user_email: s.users?.email || '',
        plan_type: s.package?.name || 'basic',
        status: s.status === 'paid' ? 'active' : s.status,
        start_date: s.start_date,
        expires_at: s.expires_at,
        amount: s.total_amount,
        package_name: s.package?.display_name || '',
        addons: s.purchase_addons || [],
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
      console.error('[usePremium] Error fetching subscriptions:', err)
      // Try fallback to old table
      fetchOldSubscriptions()
    } finally {
      setLoading(false)
    }
  }, [filters, page, limit])

  const fetchOldSubscriptions = useCallback(async () => {
    try {
      console.log('[usePremium] Falling back to old premium_subscriptions table')

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

      const { count } = await query
      setTotalCount(count || 0)

      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error

      const transformed: PremiumSubscription[] = (data || []).map((s: any) => ({
        id: s.id,
        user_id: s.user_id,
        user_name: s.users?.full_name || 'Unknown',
        user_email: s.users?.email || '',
        plan_type: s.plan_type,
        status: s.status,
        start_date: s.start_date,
        expires_at: s.expires_at,
        amount: s.amount || 0,
        created_at: s.created_at,
      }))

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
      console.error('[usePremium] Error fetching old subscriptions:', err)
    } finally {
      setLoading(false)
    }
  }, [filters, page, limit])

  const fetchStats = useCallback(async () => {
    try {
      const today = new Date()
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

      // Try fetching from new subscription_purchases table
      const { data: newSubs, error } = await supabase
        .from('subscription_purchases')
        .select('total_amount, expires_at, status, package:subscription_packages(name)')

      if (!error && newSubs) {
        const totalRevenue = newSubs.reduce((sum, s) => sum + (s.total_amount || 0), 0)
        const basicRevenue = newSubs
          .filter(s => s.package?.name === 'basic')
          .reduce((sum, s) => sum + (s.total_amount || 0), 0)
        const premiumRevenue = newSubs
          .filter(s => s.package?.name === 'plus')
          .reduce((sum, s) => sum + (s.total_amount || 0), 0)

        const activeSubscriptions = newSubs.filter(s => s.status === 'paid').length

        const expiringThisWeek = newSubs.filter(s => {
          const endDate = new Date(s.expires_at)
          return endDate >= today && endDate <= weekFromNow && s.status === 'paid'
        }).length

        const expiringThisMonth = newSubs.filter(s => {
          const endDate = new Date(s.expires_at)
          return endDate >= today && endDate <= monthFromNow && s.status === 'paid'
        }).length

        setStats({
          totalRevenue,
          basicRevenue,
          premiumRevenue,
          activeSubscriptions,
          expiringThisWeek,
          expiringThisMonth,
        })
        return
      }

      // Fallback to old table
      const { data: oldSubs } = await supabase
        .from('premium_subscriptions')
        .select('plan_type, status, amount, expires_at')

      if (!oldSubs) return

      const totalRevenue = oldSubs.reduce((sum, s) => sum + (s.amount || 0), 0)
      const basicRevenue = oldSubs
        .filter(s => s.plan_type === 'basic')
        .reduce((sum, s) => sum + (s.amount || 0), 0)
      const premiumRevenue = oldSubs
        .filter(s => s.plan_type === 'premium')
        .reduce((sum, s) => sum + (s.amount || 0), 0)

      const activeSubscriptions = oldSubs.filter(s => s.status === 'active').length

      const expiringThisWeek = oldSubs.filter(s => {
        const endDate = new Date(s.expires_at)
        return endDate >= today && endDate <= weekFromNow && s.status === 'active'
      }).length

      const expiringThisMonth = oldSubs.filter(s => {
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
      console.error('[usePremium] Error fetching stats:', err)
    }
  }, [])

  useEffect(() => {
    fetchSubscriptions()
    fetchStats()
  }, [fetchSubscriptions, fetchStats])

  const extendSubscription = async (subscriptionId: string, newEndDate: string) => {
    try {
      // Try updating in new table first
      const { error } = await supabase
        .from('subscription_purchases')
        .update({ expires_at: newEndDate, status: 'paid' })
        .eq('id', subscriptionId)

      if (error) {
        // Try old table
        const { error: oldError } = await supabase
          .from('premium_subscriptions')
          .update({ expires_at: newEndDate, status: 'active' })
          .eq('id', subscriptionId)

        if (oldError) throw oldError
      }

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
      // Try updating in new table first
      const { error } = await supabase
        .from('subscription_purchases')
        .update({ status: 'cancelled' })
        .eq('id', subscriptionId)

      if (error) {
        // Try old table
        const { error: oldError } = await supabase
          .from('premium_subscriptions')
          .update({ status: 'cancelled' })
          .eq('id', subscriptionId)

        if (oldError) throw oldError
      }

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
