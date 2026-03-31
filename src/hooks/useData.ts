import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { User, DashboardStats, Banner, Referral } from '../types'

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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit)

        if (error) throw error
        setUsers(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
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

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('banners')
          .select('*')
          .order('order', { ascending: true })

        if (error) throw error
        setBanners(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchBanners()
  }, [])

  return { banners, loading, error }
}

// Hook for fetching referrals
export const useReferrals = () => {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('referrals')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setReferrals(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchReferrals()
  }, [])

  return { referrals, loading, error }
}
