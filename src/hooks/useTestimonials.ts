import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { type Testimonial } from '../types'

export const useTestimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('testimonials')
        .select('*')
        .order('display_order', { ascending: true })

      if (fetchError) throw fetchError

      setTestimonials(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch testimonials')
    } finally {
      setLoading(false)
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
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create testimonial' }
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
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update testimonial' }
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
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete testimonial' }
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
      return { success: false, error: err instanceof Error ? err.message : 'Failed to reorder' }
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
