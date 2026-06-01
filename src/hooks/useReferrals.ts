import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase, supabaseAdmin } from '../lib/supabase'

export interface Referral {
  id: string
  referrer_id: string
  referrer_name?: string
  referrer_email?: string
  referred_id: string
  referred_name?: string
  referrer_balance?: number
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
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const fetchReferrals = useCallback(async () => {
    try {
      if (mountedRef.current) {
        setLoading(true)
      }

      // Server-side search: use ilike on code, and join referrer profile for name search
      let query = supabase
        .from('referrals')
        .select(`
          *,
          referrer:referrer_id (
            full_name,
            email,
            referral_balance
          ),
          referred:referred_id (
            full_name
          )
        `, { count: 'exact' })

      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      // Server-side search: filter by code (always works) or referrer name/email
      // Since Supabase doesn't support OR across joined tables easily,
      // we search by code on server and do additional client-side filtering for names
      if (filters.search) {
        query = query.ilike('code', `%${filters.search}%`)
      }

      const { count } = await query
      if (mountedRef.current) {
        setTotalCount(count || 0)
      }

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
        if (mountedRef.current) {
          setTotalCount(fbCount || 0)
        }

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
        referrer_balance: r.referrer?.referral_balance || 0,
        referred_id: r.referred_id,
        referred_name: r.referred?.full_name || 'Unknown',
        code: r.code,
        status: r.status,
        reward_amount: r.reward_amount,
        created_at: r.created_at,
        completed_at: r.completed_at,
      }))

      // Client-side filter for name/email (Supabase can't OR across joined tables)
      let filtered = transformed
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filtered = transformed.filter(r =>
          r.referrer_name?.toLowerCase().includes(searchLower) ||
          r.referrer_email?.toLowerCase().includes(searchLower) ||
          r.referred_name?.toLowerCase().includes(searchLower)
        )
      }

      if (mountedRef.current) {
        setReferrals(filtered)
      }
    } catch (err) {
      console.error('Error fetching referrals:', err)
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [filters, page, limit])

  const fetchWithdrawals = useCallback(async () => {
    try {
      let { data, error } = await supabase
        .from('referral_withdrawals')
        .select(`
          *,
          user:user_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      // Fallback: if user relationship doesn't exist
      if (error && error.code === 'PGRST200') {
        const fbResult = await supabase
          .from('referral_withdrawals')
          .select('*')
          .order('created_at', { ascending: false })
        data = fbResult.data
        error = fbResult.error
      }

      if (error) throw error

      // Lookup user profiles for names if join was missing
      let userMap = new Map<string, { full_name: string; email: string }>()
      if (!data?.[0]?.user) {
        const userIds = [...new Set((data || []).map((w: any) => w.user_id).filter(Boolean))]
        if (userIds.length > 0) {
          const [{ data: profiles }, { data: authUsers }] = await Promise.all([
            supabaseAdmin.from('user_profiles').select('user_id, full_name').in('user_id', userIds),
            supabaseAdmin.from('users').select('id, email').in('id', userIds),
          ])
          profiles?.forEach((p: any) => userMap.set(p.user_id, { full_name: p.full_name, email: '' }))
          authUsers?.forEach((u: any) => {
            const existing = userMap.get(u.id)
            if (existing) existing.email = u.email || ''
          })
        }
      }

      const transformed: Withdrawal[] = (data || []).map((w: any) => ({
        id: w.id,
        user_id: w.user_id,
        user_name: w.user?.full_name || userMap.get(w.user_id)?.full_name || 'Unknown',
        user_email: w.user?.email || userMap.get(w.user_id)?.email || '',
        amount: w.amount,
        status: w.status,
        bank_name: w.bank_name,
        account_number: w.account_number,
        account_name: w.account_name,
        created_at: w.created_at,
        processed_at: w.processed_at,
      }))

      if (mountedRef.current) {
        setWithdrawals(transformed)
      }
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

      if (mountedRef.current) {
        setStats({
          totalReferrers: uniqueReferrers.size,
          totalSuccessful,
          totalCommissionPaid,
          pendingWithdrawals: pendingCount,
          pendingAmount,
        })
      }
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
      return { success: false, error: err instanceof Error ? err.message : 'Terjadi kesalahan' }
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
      return { success: false, error: err instanceof Error ? err.message : 'Terjadi kesalahan' }
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
