import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { type Testimonial } from '../types'

export const useTestimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const fetchTestimonials = useCallback(async () => {
    try {
      if (mountedRef.current) {
        setLoading(true)
      }
      if (mountedRef.current) {
        setError(null)
      }

      const { data, error: fetchError } = await supabase
        .from('testimonials')
        .select('*')
        .order('display_order', { ascending: true })

      if (fetchError) throw fetchError

      if (mountedRef.current) {
        setTestimonials(data || [])
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Gagal memuat testimoni')
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    fetchTestimonials()
  }, [fetchTestimonials])
  const createTestimonial = async (testimonial: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .insert(testimonial)
        .select()
        .single()

      if (error) throw error

      setTestimonials(prev => [...prev, data].sort((a, b) => a.display_order - b.display_order))
      return { success: true, data }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Gagal membuat testimoni' }
    }
  }

  const updateTestimonial = async (id: string, updates: Partial<Testimonial>) => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setTestimonials(prev =>
        prev.map(t => t.id === id ? data : t).sort((a, b) => a.display_order - b.display_order)
      )
      return { success: true, data }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Gagal memperbarui testimoni' }
    }
  }

  const deleteTestimonial = async (id: string) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id)

      if (error) throw error

      setTestimonials(prev => prev.filter(t => t.id !== id))
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Gagal menghapus testimoni' }
    }
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    return updateTestimonial(id, { is_active: isActive })
  }

  const toggleFeatured = async (id: string, isFeatured: boolean) => {
    return updateTestimonial(id, { is_featured: isFeatured })
  }

  const toggleVerified = async (id: string, isVerified: boolean) => {
    return updateTestimonial(id, { is_verified: isVerified })
  }

  const reorderTestimonials = async (orderedIds: string[]) => {
    try {
      const updates = orderedIds.map((id, index) => ({
        id,
        display_order: index,
        updated_at: new Date().toISOString(),
      }))

      for (const update of updates) {
        const { error } = await supabase
          .from('testimonials')
          .update({ display_order: update.display_order, updated_at: update.updated_at })
          .eq('id', update.id)

        if (error) throw error
      }

      await fetchTestimonials()
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Gagal mengurutkan ulang' }
    }
  }

  return {
    testimonials,
    loading,
    error,
    refetch: fetchTestimonials,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
    toggleActive,
    toggleFeatured,
    toggleVerified,
    reorderTestimonials,
  }
}
