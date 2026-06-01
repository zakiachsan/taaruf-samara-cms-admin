import { useState, useEffect, useCallback, useRef } from 'react'
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
  is_popular?: boolean
  features?: string[]
  created_at: string
  updated_at: string
}

export const usePackages = () => {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const fetchPackages = useCallback(async () => {
    try {
      if (mountedRef.current) {
        setLoading(true)
      }
      if (mountedRef.current) {
        setError(null)
      }

      const { data, error } = await supabase
        .from('subscription_packages')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw error

      if (mountedRef.current) {
        setPackages(data || [])
      }
    } catch (err) {
      console.error('[usePackages] Error fetching packages:', err)
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Gagal memuat paket')
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
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
      return { success: false, error: err instanceof Error ? err.message : 'Gagal memperbarui harga' }
    }
  }, [])

  const updatePackage = useCallback(async (
    id: string,
    updates: Partial<Pick<Package, 'display_name' | 'description' | 'price' | 'is_active' | 'is_popular' | 'features'>>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Always use fresh state - refetch if needed, but for now just do the update
      const { error } = await supabase
        .from('subscription_packages')
        .update({ 
          ...updates, 
          updated_at: new Date().toISOString(),
          // Ensure features is never undefined
          features: updates.features === undefined ? undefined : updates.features
        })
        .eq('id', id)

      if (error) {
        console.error('[usePackages] updatePackage error:', error)
        throw error
      }

      // Refetch to get fresh state instead of optimistic update
      await fetchPackages()

      return { success: true }
    } catch (err) {
      console.error('[usePackages] Error updating package:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Gagal memperbarui paket' }
    }
  }, [supabase, fetchPackages])

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

// =====================================================
// Helper Functions
// =====================================================

/**
 * Format price for display
 * @param amount - Price in IDR
 * @returns Formatted price string (e.g., "Rp 50.000" or "Gratis")
 */
export const formatPrice = (amount: number): string => {
  if (amount === 0) return 'Rp 0'
  return 'Rp ' + amount.toLocaleString('id-ID')
}

/**
 * Format period based on duration
 * @param durationMonths - Duration in months
 * @returns Formatted period string (e.g., "3 Bulan" or "Selamanya")
 */
export const formatPeriod = (durationMonths: number): string => {
  if (durationMonths === 0) return 'Selamanya'
  if (durationMonths === 1) return '1 Bulan'
  return `${durationMonths} Bulan`
}

/**
 * Format package for landing page display
 * @param pkg - Package object from database
 * @returns Formatted package object for landing page
 */
export const formatPackageForDisplay = (pkg: Package) => {
  return {
    id: pkg.id,
    name: pkg.display_name,
    price: formatPrice(pkg.price),
    period: formatPeriod(pkg.duration_months),
    description: pkg.description || '',
    features: pkg.features || [],
    highlighted: pkg.is_popular || false,
    badge: pkg.is_popular ? 'Paling Populer' : undefined,
    cta: pkg.price === 0 ? 'Mulai Gratis' : pkg.is_popular ? 'Pilih Paket Ini' : 'Pilih Paket',
  }
}

/**
 * Convert features array to newline-separated string for editing
 * @param features - Array of feature strings
 * @returns Newline-separated string
 */
export const featuresToString = (features?: string[]): string => {
  if (!features || features.length === 0) return ''
  return features.join('\n')
}

/**
 * Convert newline-separated string to features array
 * @param text - Newline-separated string
 * @returns Array of feature strings
 */
export const stringToFeatures = (text: string): string[] => {
  if (!text || text.trim() === '') return []
  return text
    .split('\n')
    .map(f => f.trim())
    .filter(f => f.length > 0)
}
