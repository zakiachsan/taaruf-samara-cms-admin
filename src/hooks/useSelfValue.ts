import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { type SelfValueRegistration } from '../types'

export interface SelfValueFilters {
  status: string
  search: string
}

export const useSelfValue = (filters: SelfValueFilters, page: number = 1, limit: number = 10) => {
  const [registrations, setRegistrations] = useState<SelfValueRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('self_value_registrations')
        .select(`
          *,
          user:users!user_id (
            id,
            email,
            full_name
          )
        `, { count: 'exact' })

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      // Get total count
      const { count } = await query
      setTotalCount(count || 0)

      // Apply pagination
      const from = (page - 1) * limit
      const to = from + limit - 1

      query = query
        .order('created_at', { ascending: false })
        .range(from, to)

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      setRegistrations(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat pendaftaran')
    } finally {
      setLoading(false)
    }
  }, [filters, page, limit])

  useEffect(() => {
    fetchRegistrations()
  }, [fetchRegistrations])

  const updateStatus = async (
    id: string,
    status: SelfValueRegistration['status'],
    additionalData?: Partial<SelfValueRegistration>
  ) => {
    try {
      const { data, error } = await supabase
        .from('self_value_registrations')
        .update({
          status,
          ...additionalData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setRegistrations(prev => prev.map(r => r.id === id ? { ...r, ...data } : r))
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Gagal memperbarui' }
    }
  }

  const scheduleSession = async (
    id: string,
    scheduledDate: string,
    scheduledTime: string,
    location: string
  ) => {
    return updateStatus(id, 'scheduled', {
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime,
      location,
    })
  }

  const completeSession = async (id: string, certificateUrl?: string, notes?: string) => {
    return updateStatus(id, 'completed', {
      certificate_url: certificateUrl,
      notes,
    })
  }

  const cancelSession = async (id: string, notes?: string) => {
    return updateStatus(id, 'cancelled', { notes })
  }

  const saveTestResults = async (
    userId: string,
    results: {
      quality_score: number
      mental_readiness_score: number
      emotional_baggage_notes: string
      life_needs_notes: string
      partner_category: string
      consultant_notes: string
      certificate_code?: string
    }
  ) => {
    try {
      // First get user_profiles.id from users.id
      // (bedah_value_results.user_id references user_profiles.id, not users.id)
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', userId)
        .single()

      if (profileError || !profile) {
        throw new Error('Profil pengguna tidak ditemukan')
      }

      // Generate certificate code if not provided
      const certCode = results.certificate_code || `BV-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`

      // Use upsert to handle both insert and update cases
      const { error: resultsError } = await supabase
        .from('bedah_value_results')
        .upsert({
          user_id: profile.id,
          quality_score: results.quality_score,
          mental_readiness_score: results.mental_readiness_score,
          emotional_baggage_notes: results.emotional_baggage_notes,
          life_needs_notes: results.life_needs_notes,
          partner_category: results.partner_category,
          consultant_notes: results.consultant_notes,
          certificate_code: certCode,
          completed_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        })

      if (resultsError) throw resultsError

      // Update user_profiles to mark certification
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          has_bedah_value_cert: true,
          bedah_value_cert_code: certCode,
        })
        .eq('user_id', userId)

      if (updateError) {
        console.error('Profile update failed:', updateError)
      }

      return { success: true, certificate_code: certCode }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Gagal menyimpan hasil' }
    }
  }

  const updateTestResults = async (
    userId: string,
    results: {
      quality_score: number
      mental_readiness_score: number
      emotional_baggage_notes: string
      life_needs_notes: string
      partner_category: string
      consultant_notes: string
      certificate_code?: string
    }
  ) => {
    try {
      // First get user_profiles.id from users.id
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', userId)
        .single()

      if (profileError || !profile) {
        throw new Error('User profile not found')
      }

      // Check if results exist using user_profiles.id
      const { data: existingResults, error: fetchError } = await supabase
        .from('bedah_value_results')
        .select('id, certificate_code')
        .eq('user_id', profile.id)
        .maybeSingle()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      if (existingResults) {
        // Update existing results using user_profiles.id
        const updateData: any = {
          quality_score: results.quality_score,
          mental_readiness_score: results.mental_readiness_score,
          emotional_baggage_notes: results.emotional_baggage_notes || '',
          life_needs_notes: results.life_needs_notes || '',
          partner_category: results.partner_category || '',
          consultant_notes: results.consultant_notes || '',
        }

        // Only include certificate_code if it has a value
        if (results.certificate_code && results.certificate_code.trim() !== '') {
          updateData.certificate_code = results.certificate_code
        }

        const { error: updateError } = await supabase
          .from('bedah_value_results')
          .update(updateData)
          .eq('user_id', profile.id)

        if (updateError) throw updateError
      } else {
        // Insert new using user_profiles.id
        const certCode = results.certificate_code || `BV-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
        const { error: insertError } = await supabase
          .from('bedah_value_results')
          .insert({
            user_id: profile.id,
            quality_score: results.quality_score,
            mental_readiness_score: results.mental_readiness_score,
            emotional_baggage_notes: results.emotional_baggage_notes,
            life_needs_notes: results.life_needs_notes,
            partner_category: results.partner_category,
            consultant_notes: results.consultant_notes,
            certificate_code: certCode,
            completed_at: new Date().toISOString(),
          })

        if (insertError) throw insertError
      }

      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Gagal memperbarui hasil' }
    }
  }

  const getTestResults = async (userId: string) => {
    try {
      // First get user_profiles.id from users.id
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', userId)
        .single()

      if (profileError || !profile) {
        throw new Error('User profile not found')
      }

      // Fetch results using user_profiles.id
      const { data, error } = await supabase
        .from('bedah_value_results')
        .select('*')
        .eq('user_id', profile.id)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return { success: true, data }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Gagal memuat hasil' }
    }
  }

  // Stats
  const stats = {
    total: totalCount,
    registered: registrations.filter(r => r.status === 'registered').length,
    scheduled: registrations.filter(r => r.status === 'scheduled').length,
    completed: registrations.filter(r => r.status === 'completed').length,
    cancelled: registrations.filter(r => r.status === 'cancelled').length,
  }

  return {
    registrations,
    loading,
    error,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    stats,
    refetch: fetchRegistrations,
    updateStatus,
    scheduleSession,
    completeSession,
    cancelSession,
    saveTestResults,
    updateTestResults,
    getTestResults,
  }
}