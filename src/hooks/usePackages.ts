import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface Package {
  id: string
  name: string
  display_name: string
  duration_months: number
  price: number
  description?: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export const usePackages = () => {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPackages = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('subscription_packages')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw error

      setPackages(data || [])
    } catch (err) {
      console.error('[usePackages] Error fetching packages:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch packages')
    } finally {
      setLoading(false)
    }
  }, [])

  const updatePackagePrice = useCallback(async (id: string, price: number): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase
        .from('subscription_packages')
        .update({ price, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      // Update local state
      setPackages(prev => prev.map(pkg =>
        pkg.id === id ? { ...pkg, price } : pkg
      ))

      return { success: true }
    } catch (err) {
      console.error('[usePackages] Error updating price:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update price' }
    }
  }, [])

  const updatePackage = useCallback(async (
    id: string,
    updates: Partial<Pick<Package, 'display_name' | 'description' | 'price' | 'is_active'>>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase
        .from('subscription_packages')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      // Update local state
      setPackages(prev => prev.map(pkg =>
        pkg.id === id ? { ...pkg, ...updates } : pkg
      ))

      return { success: true }
    } catch (err) {
      console.error('[usePackages] Error updating package:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update package' }
    }
  }, [])

  useEffect(() => {
    fetchPackages()
  }, [fetchPackages])

  return {
    packages,
    loading,
    error,
    refetch: fetchPackages,
    updatePackagePrice,
    updatePackage,
  }
}
