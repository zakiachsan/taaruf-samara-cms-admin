import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface ReferralSettings {
  id: string
  reward_amount: number
  min_withdrawal: number
  max_withdrawal: number | null
  withdrawal_processing_days: number
  updated_at: string
  updated_by?: string
}

export const useReferralSettings = () => {
  const [settings, setSettings] = useState<ReferralSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('referral_settings')
        .select('*')
        .single()

      if (error) throw error

      setSettings(data)
    } catch (err) {
      console.error('[useReferralSettings] Error fetching settings:', err)
      setError(err instanceof Error ? err.message : 'Gagal memuat pengaturan referral')
    } finally {
      setLoading(false)
    }
  }, [])

  const updateSettings = useCallback(async (
    updates: Partial<ReferralSettings>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Validate inputs
      if (updates.reward_amount !== undefined && updates.reward_amount <= 0) {
        return { success: false, error: 'Jumlah reward harus lebih besar dari 0' }
      }
      if (updates.min_withdrawal !== undefined && updates.min_withdrawal <= 0) {
        return { success: false, error: 'Minimum penarikan harus lebih besar dari 0' }
      }
      if (updates.max_withdrawal !== undefined && updates.min_withdrawal !== undefined) {
        if (updates.max_withdrawal !== null && updates.max_withdrawal < updates.min_withdrawal) {
          return { success: false, error: 'Maksimum penarikan harus lebih besar atau sama dengan minimum penarikan' }
        }
      }
      if (updates.withdrawal_processing_days !== undefined && updates.withdrawal_processing_days < 1) {
        return { success: false, error: 'Hari pemrosesan minimal 1' }
      }

      const { error } = await supabase
        .from('referral_settings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', settings?.id)

      if (error) throw error

      // Update local state
      setSettings(prev => prev ? { ...prev, ...updates } : null)

      return { success: true }
    } catch (err) {
      console.error('[useReferralSettings] Error updating settings:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Gagal memperbarui pengaturan referral' }
    }
  }, [settings?.id])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings,
    updateSettings,
  }
}
