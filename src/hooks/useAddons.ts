import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

export interface Addon {
  id: string
  name: string
  description?: string
  price: number
  icon?: string
  features?: string[]
  is_active: boolean
  is_popular?: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface CreateAddonData {
  name: string
  description?: string
  price: number
  icon?: string
  features?: string[]
  is_popular?: boolean
  is_active?: boolean
  sort_order?: number
}

export const useAddons = () => {
  const [addons, setAddons] = useState<Addon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const fetchAddons = useCallback(async () => {
    try {
      if (mountedRef.current) {
        setLoading(true)
      }
      if (mountedRef.current) {
        setError(null)
      }

      const { data, error } = await supabase
        .from('subscription_addons')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw error

      if (mountedRef.current) {
        setAddons(data || [])
      }
    } catch (err) {
      console.error('[useAddons] Error fetching add-ons:', err)
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Gagal memuat add-on')
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [])

  const createAddon = useCallback(async (
    data: CreateAddonData
  ): Promise<{ success: boolean; error?: string; addon?: Addon }> => {
    try {
      // Get the highest sort_order
      const { data: existingAddons } = await supabase
        .from('subscription_addons')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1)

      const nextSortOrder = (existingAddons?.[0]?.sort_order ?? 0) + 1

      const { data: newAddon, error } = await supabase
        .from('subscription_addons')
        .insert({
          ...data,
          sort_order: data.sort_order ?? nextSortOrder,
          is_active: data.is_active ?? true,
        })
        .select()
        .single()

      if (error) throw error

      // Update local state
      setAddons(prev => [...prev, newAddon])

      return { success: true, addon: newAddon }
    } catch (err) {
      console.error('[useAddons] Error creating add-on:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Gagal membuat add-on' }
    }
  }, [])

  const updateAddon = useCallback(async (
    id: string,
    data: Partial<Addon>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase
        .from('subscription_addons')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      // Update local state
      setAddons(prev => prev.map(addon =>
        addon.id === id ? { ...addon, ...data } : addon
      ))

      return { success: true }
    } catch (err) {
      console.error('[useAddons] Error updating add-on:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Gagal memperbarui add-on' }
    }
  }, [])

  const deleteAddon = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase
        .from('subscription_addons')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Update local state
      setAddons(prev => prev.filter(addon => addon.id !== id))

      return { success: true }
    } catch (err) {
      console.error('[useAddons] Error deleting add-on:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Gagal menghapus add-on' }
    }
  }, [])

  const toggleAddonActive = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const addon = addons.find(a => a.id === id)
      if (!addon) return { success: false, error: 'Add-on tidak ditemukan' }

      const { error } = await supabase
        .from('subscription_addons')
        .update({ is_active: !addon.is_active, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      // Update local state
      setAddons(prev => prev.map(addon =>
        addon.id === id ? { ...addon, is_active: !addon.is_active } : addon
      ))

      return { success: true }
    } catch (err) {
      console.error('[useAddons] Error toggling add-on:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Gagal mengubah status add-on' }
    }
  }, [addons])

  const reorderAddons = useCallback(async (reorderedIds: string[]): Promise<{ success: boolean; error?: string }> => {
    try {
      // Update sort_order for each add-on
      const updates = reorderedIds.map((id, index) =>
        supabase
          .from('subscription_addons')
          .update({ sort_order: index, updated_at: new Date().toISOString() })
          .eq('id', id)
      )

      await Promise.all(updates)

      // Refetch to get correct order
      await fetchAddons()

      return { success: true }
    } catch (err) {
      console.error('[useAddons] Error reordering add-ons:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Gagal mengurutkan ulang add-on' }
    }
  }, [fetchAddons])

  useEffect(() => {
    fetchAddons()
  }, [fetchAddons])
  return {
    addons,
    loading,
    error,
    refetch: fetchAddons,
    createAddon,
    updateAddon,
    deleteAddon,
    toggleAddonActive,
    reorderAddons,
  }
}
