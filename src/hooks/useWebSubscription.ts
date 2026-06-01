import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useUserAuth } from '../contexts/UserAuthContext'
import type { SubscriptionPackage, SubscriptionAddon, SubscriptionPurchase } from '../types'

export const formatPrice = (amount: number): string => {
  if (amount === 0) return 'Gratis'
  return 'Rp ' + amount.toLocaleString('id-ID')
}

// Helper to delay execution
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

export const useWebSubscription = (userId?: string) => {
  const { loading: authLoading } = useUserAuth()
  const [packages, setPackages] = useState<SubscriptionPackage[]>([])
  const [addons, setAddons] = useState<SubscriptionAddon[]>([])
  const [selectedPackage, setSelectedPackage] = useState<SubscriptionPackage | null>(null)
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set())
  const [currentPurchase, setCurrentPurchase] = useState<SubscriptionPurchase | null>(null)

  const [loadingPackages, setLoadingPackages] = useState(true)
  const [loadingAddons, setLoadingAddons] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  // Fetch packages — wait for auth initialization to avoid lock contention
  useEffect(() => {
    if (authLoading) return

    let cancelled = false
    const fetch = async (retry = true) => {
      try {
        setLoadingPackages(true)
        const { data, error } = await supabase
          .from('subscription_packages')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
        if (cancelled) return
        if (error) throw error
        setPackages(data || [])
      } catch (err: any) {
        if (cancelled) return
        // Retry once if aborted due to lock contention
        if (retry && err?.message?.includes('Lock broken')) {
          await delay(800)
          if (!cancelled) fetch(false)
          return
        }
        console.error('Error fetching packages:', err)
      } finally {
        if (!cancelled) setLoadingPackages(false)
      }
    }
    fetch()
    return () => {
      cancelled = true
    }
  }, [authLoading])

  // Fetch add-ons — wait for auth initialization to avoid lock contention
  useEffect(() => {
    if (authLoading) return

    let cancelled = false
    const fetch = async (retry = true) => {
      try {
        setLoadingAddons(true)
        const { data, error } = await supabase
          .from('subscription_addons')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
        if (cancelled) return
        if (error) throw error
        setAddons(data || [])
      } catch (err: any) {
        if (cancelled) return
        if (retry && err?.message?.includes('Lock broken')) {
          await delay(800)
          if (!cancelled) fetch(false)
          return
        }
        console.error('Error fetching addons:', err)
      } finally {
        if (!cancelled) setLoadingAddons(false)
      }
    }
    fetch()
    return () => {
      cancelled = true
    }
  }, [authLoading])

  // Fetch current active purchase
  useEffect(() => {
    if (!userId || authLoading) return

    let cancelled = false
    const fetch = async (retry = true) => {
      try {
        const { data, error } = await supabase
          .from('subscription_purchases')
          .select('*, package:subscription_packages(*)')
          .eq('user_id', userId)
          .eq('status', 'paid')
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        if (cancelled) return
        if (error) throw error
        setCurrentPurchase(data as SubscriptionPurchase | null)
      } catch (err: any) {
        if (cancelled) return
        if (retry && err?.message?.includes('Lock broken')) {
          await delay(800)
          if (!cancelled) fetch(false)
          return
        }
        console.error('Error fetching purchase:', err)
      }
    }
    fetch()
    return () => {
      cancelled = true
    }
  }, [userId, authLoading])

  const selectPackage = useCallback((pkg: SubscriptionPackage) => setSelectedPackage(pkg), [])

  const toggleAddon = useCallback((addonId: string) => {
    setSelectedAddons(prev => {
      const next = new Set(prev)
      if (next.has(addonId)) next.delete(addonId)
      else next.add(addonId)
      return next
    })
  }, [])

  const isAddonSelected = useCallback((id: string) => selectedAddons.has(id), [selectedAddons])

  const packagePrice = selectedPackage?.price || 0
  const addonsPrice = Array.from(selectedAddons).reduce((sum, id) => {
    const a = addons.find(x => x.id === id)
    return sum + (a?.price || 0)
  }, 0)
  const totalPrice = packagePrice + addonsPrice

  // Purchase and redirect to Midtrans
  const purchase = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!selectedPackage) return { success: false, error: 'Pilih paket terlebih dahulu' }
    if (!userId) return { success: false, error: 'Silakan login terlebih dahulu' }

    try {
      setPurchasing(true)

      const startDate = new Date()
      const expiresAt = new Date(startDate)
      expiresAt.setMonth(expiresAt.getMonth() + selectedPackage.duration_months)

      // Create purchase record
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('subscription_purchases')
        .insert({
          user_id: userId,
          package_id: selectedPackage.id,
          status: 'pending',
          start_date: startDate.toISOString(),
          expires_at: expiresAt.toISOString(),
          package_price: selectedPackage.price,
          addons_total: addonsPrice,
          total_amount: totalPrice,
        })
        .select('id')
        .single()

      if (purchaseError) throw purchaseError

      // Create purchase_addons records
      if (selectedAddons.size > 0) {
        const records = Array.from(selectedAddons).map(id => {
          const addon = addons.find(a => a.id === id)!
          return {
            purchase_id: purchaseData.id,
            addon_id: addon.id,
            addon_name: addon.name,
            addon_price: addon.price,
          }
        })
        await supabase.from('purchase_addons').insert(records)
      }

      // Get session token
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session?.access_token) {
        return { success: false, error: 'Sesi habis. Silakan login kembali.' }
      }

      // Build web-specific return URLs
      const origin = window.location.origin
      const returnUrl = `${origin}/user/subscribe?payment=success`
      const cancelUrl = `${origin}/user/subscribe?payment=cancel`

      // Call edge function
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
        'create-payment',
        {
          body: {
            purchaseId: purchaseData.id,
            returnUrl,
            cancelUrl,
          },
          headers: {
            Authorization: `Bearer ${sessionData.session.access_token}`,
          },
        }
      )

      if (paymentError) {
        return { success: false, error: 'Gagal membuat sesi pembayaran.' }
      }

      if (!paymentData?.url) {
        return { success: false, error: 'Gagal mendapatkan halaman pembayaran.' }
      }

      // Redirect browser to Midtrans
      window.location.href = paymentData.url
      return { success: true }
    } catch (err) {
      console.error('Purchase error:', err)
      return { success: false, error: 'Terjadi kesalahan. Silakan coba lagi.' }
    } finally {
      setPurchasing(false)
    }
  }, [selectedPackage, selectedAddons, userId, addons, addonsPrice, totalPrice])

  // Fetch all purchases (for history)
  const fetchPurchaseHistory = useCallback(async (): Promise<SubscriptionPurchase[]> => {
    if (!userId) return []
    const { data } = await supabase
      .from('subscription_purchases')
      .select('*, package:subscription_packages(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return (data as SubscriptionPurchase[]) || []
  }, [userId])

  return {
    packages,
    addons,
    selectedPackage,
    selectedAddons,
    currentPurchase,
    loadingPackages,
    loadingAddons,
    purchasing,
    selectPackage,
    toggleAddon,
    isAddonSelected,
    purchase,
    fetchPurchaseHistory,
    totalPrice,
    packagePrice,
    addonsPrice,
  }
}
