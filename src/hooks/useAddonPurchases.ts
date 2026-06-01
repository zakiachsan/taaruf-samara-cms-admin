import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase, supabaseAdmin } from '../lib/supabase'

export interface AddonPurchase {
  id: string
  addon_name: string
  addon_price: number
  purchase_id: string
  user_id: string
  user_name?: string
  user_email?: string
  package_name?: string
  subscription_status?: string
  created_at: string
  expires_at?: string
}

export interface AddonPurchaseFilters {
  search: string
  addonName: string
}

export const useAddonPurchases = (filters: AddonPurchaseFilters, page: number = 1, limit: number = 10) => {
  const [purchases, setPurchases] = useState<AddonPurchase[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const fetchPurchases = useCallback(async () => {
    try {
      if (mountedRef.current) {
        setLoading(true)
      }

      const from = (page - 1) * limit
      const to = from + limit - 1

      let rawData: any[] = []
      let total = 0

      const { data, error, count } = await supabase
        .from('purchase_addons')
        .select(`
          *,
          purchase:subscription_purchases!inner(
            id,
            user_id,
            status,
            created_at,
            expires_at,
            package:subscription_packages(name, display_name)
          )
        `, { count: 'exact' })
        .eq('purchase.status', 'paid')
        .order('id', { ascending: false })
        .range(from, to)

      if (error) {
        // Fallback: if filtering embedded resource fails, fetch all and filter client-side
        console.warn('Embedded filter failed, falling back to client-side filter:', error)
        const fallback = await supabase
          .from('purchase_addons')
          .select(`
            *,
            purchase:subscription_purchases(
              id,
              user_id,
              status,
              created_at,
              expires_at,
              package:subscription_packages(name, display_name)
            )
          `, { count: 'exact' })
          .order('id', { ascending: false })
          .range(from, to)

        if (fallback.error) throw fallback.error

        total = fallback.count || 0
        rawData = (fallback.data || []).filter((p: any) => p.purchase?.status === 'paid')
      } else {
        total = count || 0
        rawData = data || []
      }

      if (mountedRef.current) {
        setTotalCount(total)
      }

      // Get unique user_ids
      const userIds = [...new Set(rawData.map((p: any) => p.purchase?.user_id).filter(Boolean))]

      // Fetch user profiles
      let userMap = new Map<string, { full_name: string; email: string }>()
      if (userIds.length > 0) {
        try {
          const { data: profiles } = await supabaseAdmin
            .from('user_profiles')
            .select('user_id, full_name')
            .in('user_id', userIds)

          if (profiles) {
            profiles.forEach((u: any) => {
              userMap.set(u.user_id, { full_name: u.full_name, email: '' })
            })
          }
        } catch (e) {
          console.log('Could not fetch from user_profiles:', e)
        }

        try {
          const { data: authUsers } = await supabaseAdmin
            .from('users')
            .select('id, email, full_name')
            .in('id', userIds)

          if (authUsers) {
            authUsers.forEach((u: any) => {
              const existing = userMap.get(u.id)
              if (existing) {
                existing.email = u.email
              } else {
                userMap.set(u.id, { full_name: u.full_name, email: u.email })
              }
            })
          }
        } catch (e) {
          console.log('Could not fetch from users table:', e)
        }
      }

      const transformed: AddonPurchase[] = rawData.map((p: any) => {
        const user = userMap.get(p.purchase?.user_id)
        const pkg = p.purchase?.package
        const packageName = Array.isArray(pkg)
          ? (pkg[0]?.display_name || pkg[0]?.name)
          : (pkg?.display_name || pkg?.name)

        return {
          id: p.id,
          addon_name: p.addon_name,
          addon_price: p.addon_price || 0,
          purchase_id: p.purchase_id,
          user_id: p.purchase?.user_id,
          user_name: user?.full_name || 'Unknown',
          user_email: user?.email || '',
          package_name: packageName || '',
          subscription_status: p.purchase?.status || '',
          created_at: p.created_at || p.purchase?.created_at,
          expires_at: p.purchase?.expires_at,
        }
      })

      // Apply filters client-side
      let filtered = transformed
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filtered = filtered.filter(p =>
          p.user_name?.toLowerCase().includes(searchLower) ||
          p.user_email?.toLowerCase().includes(searchLower)
        )
      }
      if (filters.addonName) {
        filtered = filtered.filter(p =>
          p.addon_name?.toLowerCase().includes(filters.addonName.toLowerCase())
        )
      }

      if (mountedRef.current) {
        setPurchases(filtered)
      }
    } catch (err) {
      console.error('Error fetching addon purchases:', err)
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [filters, page, limit])

  useEffect(() => {
    fetchPurchases()
  }, [fetchPurchases])
  return {
    purchases,
    loading,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    refetch: fetchPurchases,
  }
}
