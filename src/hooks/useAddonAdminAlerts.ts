import { useState, useEffect, useCallback } from 'react'
import { supabaseAdmin } from '../lib/supabase'
import { useVisibilityRefetch } from './useVisibilityRefetch'

export interface AddonAdminAlert {
  id: string
  purchase_id: string
  user_id: string
  user_whatsapp: string | null
  user_full_name: string | null
  package_name: string | null
  addon_names: string[] | null
  total_amount: number | null
  status: 'pending' | 'contacted' | 'resolved'
  admin_notes: string | null
  created_at: string
  updated_at: string
}

export const useAddonAdminAlerts = () => {
  const [alerts, setAlerts] = useState<AddonAdminAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabaseAdmin
        .from('addon_admin_alerts')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setAlerts(data || [])
    } catch (err) {
      console.error('Error fetching addon admin alerts:', err)
      setError(err instanceof Error ? err.message : 'Gagal mengambil data alert')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  useVisibilityRefetch(fetchAlerts)

  const updateAlertStatus = useCallback(
    async (alertId: string, status: 'pending' | 'contacted' | 'resolved', adminNotes?: string) => {
      try {
        const updates: Record<string, unknown> = { status }
        if (adminNotes !== undefined) {
          updates.admin_notes = adminNotes
        }

        const { error: updateError } = await supabaseAdmin
          .from('addon_admin_alerts')
          .update(updates)
          .eq('id', alertId)

        if (updateError) throw updateError

        // Optimistic update local state
        setAlerts((prev) =>
          prev.map((alert) =>
            alert.id === alertId
              ? { ...alert, status, ...(adminNotes !== undefined ? { admin_notes: adminNotes } : {}) }
              : alert
          )
        )

        return { success: true }
      } catch (err) {
        console.error('Error updating alert:', err)
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Gagal memperbarui alert',
        }
      }
    },
    []
  )

  const updateAdminNotes = useCallback(
    async (alertId: string, adminNotes: string) => {
      try {
        const { error: updateError } = await supabaseAdmin
          .from('addon_admin_alerts')
          .update({ admin_notes: adminNotes })
          .eq('id', alertId)

        if (updateError) throw updateError

        setAlerts((prev) =>
          prev.map((alert) =>
            alert.id === alertId ? { ...alert, admin_notes: adminNotes } : alert
          )
        )

        return { success: true }
      } catch (err) {
        console.error('Error updating notes:', err)
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Gagal menyimpan catatan',
        }
      }
    },
    []
  )

  const stats = {
    total: alerts.length,
    pending: alerts.filter((a) => a.status === 'pending').length,
    contacted: alerts.filter((a) => a.status === 'contacted').length,
    resolved: alerts.filter((a) => a.status === 'resolved').length,
  }

  return {
    alerts,
    loading,
    error,
    stats,
    refetch: fetchAlerts,
    updateAlertStatus,
    updateAdminNotes,
  }
}
