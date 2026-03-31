import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface DashboardStats {
  totalUsers: number
  newUsersToday: number
  activePremiumUsers: number
  pendingVerifications: number
  todayMatches: number
  totalRevenue: number
  monthlyRevenue: number
}

export interface RegistrationData {
  date: string
  count: number
}

export interface RecentActivity {
  id: string
  type: 'register' | 'premium' | 'report' | 'match'
  description: string
  timestamp: string
  userName?: string
}

// Hook for dashboard stats
export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    newUsersToday: 0,
    activePremiumUsers: 0,
    pendingVerifications: 0,
    todayMatches: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
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

      // Active premium users
      const { count: activePremiumUsers } = await supabase
        .from('premium_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

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

      // Calculate revenue
      const { data: subscriptions } = await supabase
        .from('premium_subscriptions')
        .select('amount')

      const totalRevenue = subscriptions?.reduce((sum, s) => sum + (s.amount || 0), 0) || 0

      // Monthly revenue
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
        activePremiumUsers: activePremiumUsers || 0,
        pendingVerifications: pendingVerifications || 0,
        todayMatches: todayMatches || 0,
        totalRevenue,
        monthlyRevenue,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const refetch = () => {
    fetchStats()
  }

  return { stats, loading, error, refetch }
}

// Hook for registration chart data (last 7 days)
export const useRegistrationChart = () => {
  const [data, setData] = useState<RegistrationData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Get last 7 days
        const dates = []
        for (let i = 6; i >= 0; i--) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          dates.push(d.toISOString().split('T')[0])
        }

        const chartData: RegistrationData[] = []
        
        for (const date of dates) {
          const { count } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', date)
            .lt('created_at', date + 'T23:59:59')
          
          chartData.push({
            date: new Date(date).toLocaleDateString('id-ID', { weekday: 'short' }),
            count: count || 0,
          })
        }

        setData(chartData)
      } catch (err) {
        console.error('Error fetching chart data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading }
}

// Hook for recent activities
export const useRecentActivities = (limit: number = 10) => {
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true)
        
        // Fetch recent users
        const { data: recentUsers } = await supabase
          .from('users')
          .select('id, full_name, created_at')
          .order('created_at', { ascending: false })
          .limit(limit)

        // Fetch recent premium subscriptions
        const { data: recentPremium } = await supabase
          .from('premium_subscriptions')
          .select('id, user_id, type, created_at')
          .order('created_at', { ascending: false })
          .limit(limit)

        // Fetch recent reports
        const { data: recentReports } = await supabase
          .from('reports')
          .select('id, reason, created_at')
          .order('created_at', { ascending: false })
          .limit(limit)

        // Combine and sort
        const allActivities: RecentActivity[] = []

        recentUsers?.forEach(u => {
          allActivities.push({
            id: `user-${u.id}`,
            type: 'register',
            description: 'User baru terdaftar',
            timestamp: u.created_at,
            userName: u.full_name,
          })
        })

        recentPremium?.forEach(p => {
          allActivities.push({
            id: `premium-${p.id}`,
            type: 'premium',
            description: `Berlangganan ${p.type}`,
            timestamp: p.created_at,
          })
        })

        recentReports?.forEach(r => {
          allActivities.push({
            id: `report-${r.id}`,
            type: 'report',
            description: `Laporan: ${r.reason}`,
            timestamp: r.created_at,
          })
        })

        // Sort by timestamp and limit
        allActivities.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )

        setActivities(allActivities.slice(0, limit))
      } catch (err) {
        console.error('Error fetching activities:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [limit])

  return { activities, loading }
}
