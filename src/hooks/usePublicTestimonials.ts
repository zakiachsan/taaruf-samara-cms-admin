import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { type Testimonial } from '../types'

export const usePublicTestimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    const fetchActiveTestimonials = async () => {
      try {
        if (mountedRef.current) setLoading(true)
        const { data } = await supabase
          .from('testimonials')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true })
          .limit(6)

        if (mountedRef.current) setTestimonials(data || [])
      } catch (err) {
        console.error('Failed to fetch testimonials:', err)
        if (mountedRef.current) setTestimonials([])
      } finally {
        if (mountedRef.current) setLoading(false)
      }
    }

    fetchActiveTestimonials()
  }, [])

  return { testimonials, loading }
}
