import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { type Testimonial } from '../types'

export const usePublicTestimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActiveTestimonials = async () => {
      try {
        setLoading(true)
        const { data } = await supabase
          .from('testimonials')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true })
          .limit(6)

        setTestimonials(data || [])
      } catch (err) {
        console.error('Failed to fetch testimonials:', err)
        setTestimonials([])
      } finally {
        setLoading(false)
      }
    }

    fetchActiveTestimonials()
  }, [])

  return { testimonials, loading }
}
