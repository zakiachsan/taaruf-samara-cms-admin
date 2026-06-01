import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { User, DashboardStats, Banner } from '../types'

// Hook for fetching dashboard stats
export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    newUsersToday: 0,
    verifiedUsers: 0,
    pendingVerifications: 0,
    activePremiumBasic: 0,
    activePremiumPremium: 0,
    todayMatches: 0,
    totalReferrals: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingWithdrawals: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        
        // Total users
        const { count: totalUsers } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })

        // New users today
        const today = new Date().toISOString().split('T')[0]
        const { count: newUsersToday } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today)

        // Active premium basic users
        const { count: activePremiumBasic } = await supabase
          .from('premium_subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active')
          .eq('plan_type', 'basic')

        // Active premium premium users
        const { count: activePremiumPremium } = await supabase
          .from('premium_subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active')
          .eq('plan_type', 'premium')

        // Verified users
        const { count: verifiedUsers } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('is_verified', true)

        // Pending verifications
        const { count: pendingVerifications } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('is_verified', false)

        // Today's matches
        const { count: todayMatches } = await supabase
          .from('match_requests')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today)

        // Calculate revenue from premium subscriptions
        const { data: subscriptions } = await supabase
          .from('premium_subscriptions')
          .select('amount')

        const totalRevenue = subscriptions?.reduce((sum, s) => sum + (s.amount || 0), 0) || 0

        // Monthly revenue - subscriptions created this month
        const firstDayOfMonth = new Date()
        firstDayOfMonth.setDate(1)
        const { data: monthlySubs } = await supabase
          .from('premium_subscriptions')
          .select('amount')
          .gte('created_at', firstDayOfMonth.toISOString())

        const monthlyRevenue = monthlySubs?.reduce((sum, s) => sum + (s.amount || 0), 0) || 0

        if (mountedRef.current) {
          setStats({
            totalUsers: totalUsers || 0,
            newUsersToday: newUsersToday || 0,
            verifiedUsers: verifiedUsers || 0,
            pendingVerifications: pendingVerifications || 0,
            activePremiumBasic: activePremiumBasic || 0,
            activePremiumPremium: activePremiumPremium || 0,
            todayMatches: todayMatches || 0,
            totalReferrals: 0,
            totalRevenue,
            monthlyRevenue,
            pendingWithdrawals: 0,
          })
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : 'Unknown error')
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false)
        }
      }
    }

    fetchStats()
  }, [])

  return { stats, loading, error }
}

// Hook for fetching users
export const useUsers = (limit: number = 50) => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mountedRef2 = useRef(true)
  useEffect(() => {
    mountedRef2.current = true
    return () => { mountedRef2.current = false }
  }, [])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (mountedRef2.current) setLoading(true)
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit)

        if (error) throw error
        if (mountedRef2.current) setUsers(data || [])
      } catch (err) {
        if (mountedRef2.current) setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        if (mountedRef2.current) setLoading(false)
      }
    }

    fetchUsers()
  }, [limit])

  return { users, loading, error }
}

// Hook for fetching banners
export const useBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mountedRef3 = useRef(true)
  useEffect(() => {
    mountedRef3.current = true
    return () => { mountedRef3.current = false }
  }, [])

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        if (mountedRef3.current) setLoading(true)
        const { data, error } = await supabase
          .from('banners')
          .select('*')
          .order('order', { ascending: true })

        if (error) throw error
        if (mountedRef3.current) setBanners(data || [])
      } catch (err) {
        if (mountedRef3.current) setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        if (mountedRef3.current) setLoading(false)
      }
    }

    fetchBanners()
  }, [])

  return { banners, loading, error }
}
