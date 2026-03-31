import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface Referral {
  id: string
  referrer_id: string
  referrer_name?: string
  referrer_email?: string
  referred_id: string
  referred_name?: string
  code: string
  status: 'pending' | 'successful' | 'failed'
  reward_amount: number
  created_at: string
  completed_at?: string
}

export interface Withdrawal {
  id: string
  user_id: string
  user_name?: string
  user_email?: string
  amount: number
  status: 'pending' | 'approved' | 'rejected'
  bank_name?: string
  account_number?: string
  account_name?: string
  created_at: string
  processed_at?: string
}

export interface ReferralStats {
  totalReferrers: number
  totalSuccessful: number
  totalCommissionPaid: number
  pendingWithdrawals: number
  pendingAmount: number
}

export interface ReferralFilters {
  search: string
  status: string
}

export const useReferrals = (filters: ReferralFilters, page: number = 1, limit: number = 10) => {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrers: 0,
    totalSuccessful: 0,
    totalCommissionPaid: 0,
    pendingWithdrawals: 0,
    pendingAmount: 0,
  })

  const fetchReferrals = useCallback(async () => {
    try {
      setLoading(true)

      let query = supabase
        .from('referrals')
        .select(`
          *,
          referrer:referrer_id (
            full_name,
            email
          ),
          referred:referred_id (
            full_name
          )
        `, { count: 'exact' })

      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      const { count } = await query
      setTotalCount(count || 0)

      const from = (page - 1) * limit
      const to = from + limit - 1

      query = query
        .order('created_at', { ascending: false })
        .range(from, to)

      let { data, error } = await query

      // Fallback: if users relationship doesn't exist
      if (error && error.code === 'PGRST200') {
        let fallbackQuery = supabase
          .from('referrals')
          .select('*', { count: 'exact' })

        if (filters.status) {
          fallbackQuery = fallbackQuery.eq('status', filters.status)
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

      const transformed: Referral[] = (data || []).map((r: any) => ({
        id: r.id,
        referrer_id: r.referrer_id,
        referrer_name: r.referrer?.full_name || 'Unknown',
        referrer_email: r.referrer?.email || '',
        referred_id: r.referred_id,
        referred_name: r.referred?.full_name || 'Unknown',
        code: r.code,
        status: r.status,
        reward_amount: r.reward_amount,
        created_at: r.created_at,
        completed_at: r.completed_at,
      }))

      let filtered = transformed
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filtered = transformed.filter(r =>
          r.referrer_name?.toLowerCase().includes(searchLower) ||
          r.referrer_email?.toLowerCase().includes(searchLower) ||
          r.code.toLowerCase().includes(searchLower)
        )
      }

      setReferrals(filtered)
    } catch (err) {
      console.error('Error fetching referrals:', err)
    } finally {
      setLoading(false)
    }
  }, [filters, page, limit])

  const fetchWithdrawals = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('referral_withdrawals')
        .select(`
          *,
          user:user_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const transformed: Withdrawal[] = (data || []).map((w: any) => ({
        id: w.id,
        user_id: w.user_id,
        user_name: w.user?.full_name || 'Unknown',
        user_email: w.user?.email || '',
        amount: w.amount,
        status: w.status,
        bank_name: w.bank_name,
        account_number: w.account_number,
        account_name: w.account_name,
        created_at: w.created_at,
        processed_at: w.processed_at,
      }))

      setWithdrawals(transformed)
    } catch (err) {
      console.error('Error fetching withdrawals:', err)
    }
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      // Get unique referrers count
      const { data: referrerData } = await supabase
        .from('referrals')
        .select('referrer_id')

      const uniqueReferrers = new Set(referrerData?.map(r => r.referrer_id) || [])

      // Get successful referrals
      const { data: successfulData } = await supabase
        .from('referrals')
        .select('reward_amount')
        .eq('status', 'successful')

      const totalSuccessful = successfulData?.length || 0
      const totalCommissionPaid = successfulData?.reduce((sum, r) => sum + (r.reward_amount || 0), 0) || 0

      // Get pending withdrawals
      const { data: pendingWithdrawals } = await supabase
        .from('referral_withdrawals')
        .select('amount')
        .eq('status', 'pending')

      const pendingCount = pendingWithdrawals?.length || 0
      const pendingAmount = pendingWithdrawals?.reduce((sum, w) => sum + (w.amount || 0), 0) || 0

      setStats({
        totalReferrers: uniqueReferrers.size,
        totalSuccessful,
        totalCommissionPaid,
        pendingWithdrawals: pendingCount,
        pendingAmount,
      })
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }, [])

  useEffect(() => {
    fetchReferrals()
    fetchWithdrawals()
    fetchStats()
  }, [fetchReferrals, fetchWithdrawals, fetchStats])

  const approveWithdrawal = async (withdrawalId: string) => {
    try {
      const { error } = await supabase
        .from('referral_withdrawals')
        .update({
          status: 'approved',
          processed_at: new Date().toISOString(),
        })
        .eq('id', withdrawalId)

      if (error) throw error

      setWithdrawals(withdrawals.map(w =>
        w.id === withdrawalId
          ? { ...w, status: 'approved', processed_at: new Date().toISOString() }
          : w
      ))

      fetchStats()
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  const rejectWithdrawal = async (withdrawalId: string) => {
    try {
      const { error } = await supabase
        .from('referral_withdrawals')
        .update({
          status: 'rejected',
          processed_at: new Date().toISOString(),
        })
        .eq('id', withdrawalId)

      if (error) throw error

      setWithdrawals(withdrawals.map(w =>
        w.id === withdrawalId
          ? { ...w, status: 'rejected', processed_at: new Date().toISOString() }
          : w
      ))

      fetchStats()
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  return {
    referrals,
    withdrawals,
    loading,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    stats,
    refetch: fetchReferrals,
    approveWithdrawal,
    rejectWithdrawal,
  }
}
