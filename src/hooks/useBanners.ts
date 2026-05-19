import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { type Banner } from '../types'
import { useVisibilityRefetch } from './useVisibilityRefetch'

export const useBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('banners')
        .select('*')
        .order('display_order', { ascending: true })

      if (fetchError) throw fetchError

      setBanners(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat banner')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBanners()
  }, [fetchBanners])

  useVisibilityRefetch(fetchBanners)

  const createBanner = async (banner: Omit<Banner, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .insert({
          ...banner,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      setBanners(prev => [...prev, data].sort((a, b) => a.display_order - b.display_order))
      return { success: true, data }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Gagal membuat banner' }
    }
  }

  const updateBanner = async (id: string, updates: Partial<Banner>) => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setBanners(prev => 
        prev.map(b => b.id === id ? data : b).sort((a, b) => a.display_order - b.display_order)
      )
      return { success: true, data }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Gagal memperbarui banner' }
    }
  }

  const deleteBanner = async (id: string) => {
    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id)

      if (error) throw error

      setBanners(prev => prev.filter(b => b.id !== id))
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Gagal menghapus banner' }
    }
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    return updateBanner(id, { is_active: isActive })
  }

  const reorderBanners = async (orderedIds: string[]) => {
    try {
      const updates = orderedIds.map((id, index) => ({
        id,
        display_order: index,
        updated_at: new Date().toISOString(),
      }))

      for (const update of updates) {
        const { error } = await supabase
          .from('banners')
          .update({ display_order: update.display_order, updated_at: update.updated_at })
          .eq('id', update.id)

        if (error) throw error
      }

      await fetchBanners()
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Gagal mengurutkan ulang' }
    }
  }

  return {
    banners,
    loading,
    error,
    refetch: fetchBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    toggleActive,
    reorderBanners,
  }
}