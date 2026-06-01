import { useState } from 'react'
import { supabaseAdmin } from '../../lib/supabase'
import { usePendampingan, type MentoringSession, type PendampinganUser } from '../../hooks/usePendampingan'
import { useAddonAdminAlerts } from '../../hooks/useAddonAdminAlerts'
import {
  RefreshCw,
  X,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  User as UserIcon,
  Mail,
  TrendingUp,
  Bell,
  Phone,
  Package,
  Puzzle,
  Save,
  FileText,
} from 'lucide-react'

const SESSION_LABELS: Record<number, string> = {
  1: 'Sesi 1',
  2: 'Sesi 2',
  3: 'Sesi 3',
}

const STATUS_BADGES: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Menunggu', color: 'bg-gray-100 text-gray-700', icon: Clock },
  scheduled: { label: 'Terjadwal', color: 'bg-blue-100 text-blue-700', icon: Calendar },
  completed: { label: 'Selesai', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  cancelled: { label: 'Dibatalkan', color: 'bg-red-100 text-red-700', icon: XCircle },
}

const ALERT_STATUS_BADGES: Record<string, { label: string; color: string; borderColor: string }> = {
  pending: { label: 'Menunggu', color: 'bg-amber-50 text-amber-700 border-amber-200', borderColor: 'border-amber-200' },
  contacted: { label: 'Dihubungi', color: 'bg-blue-50 text-blue-700 border-blue-200', borderColor: 'border-blue-200' },
  resolved: { label: 'Selesai', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', borderColor: 'border-emerald-200' },
}

function formatRupiah(amount: number | null) {
  if (!amount) return '-'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Baru saja'
  if (diffMins < 60) return `${diffMins} menit lalu`
  if (diffHours < 24) return `${diffHours} jam lalu`
  if (diffDays < 7) return `${diffDays} hari lalu`
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function cleanWhatsApp(num: string | null): string | null {
  if (!num) return null
  const cleaned = num.replace(/\D/g, '').replace(/^0/, '62')
  return cleaned || null
}

export default function PendampinganManagement() {
  const {
    users,
    loading,
    error,
    refetch,
    fetchSessions,
    getSessionProgress,
    scheduleSession,
    completeSession,
    cancelSession,
    updateSession,
  } = usePendampingan()

  const {
    alerts,
    loading: alertsLoading,
    error: alertsError,
    stats: alertStats,
    updateAlertStatus,
    updateAdminNotes,
  } = useAddonAdminAlerts()

  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<PendampinganUser | null>(null)
  const [userSessions, setUserSessions] = useState<MentoringSession[]>([])
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Alert filter - always show all since cards are removed
  const alertFilter = 'all'

  // Notes editing state
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({})
  const [savingNotes, setSavingNotes] = useState<string | null>(null)

  // Session form state
  const [sessionForms, setSessionForms] = useState<Record<string, {
    scheduled_at: string
    scheduled_time: string
    mentor_name: string
    notes: string
    taaruf_progress: string
    recommendations: string
  }>>({})

  // Edit completed session state
  const [editingCompletedSession, setEditingCompletedSession] = useState<string | null>(null)

  // Quick activity input modal
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [activityUser, setActivityUser] = useState<PendampinganUser | null>(null)
  const [activitySessions, setActivitySessions] = useState<MentoringSession[]>([])
  const [activityForms, setActivityForms] = useState<Record<string, {
    taaruf_progress: string
    recommendations: string
    notes: string
    mentor_name: string
  }>>({})
  const [activityLoading, setActivityLoading] = useState(false)

  const filteredAlerts = alertFilter === 'all'
    ? alerts
    : alerts.filter((a) => a.status === alertFilter)

  const openDetailModal = async (user: PendampinganUser) => {
    setSelectedUser(user)
    let sessions = await fetchSessions(user.user_id)

    // Auto-create 3 default sessions if none exist
    if (sessions.length === 0) {
      for (let i = 1; i <= 3; i++) {
        await supabaseAdmin.from('mentoring_sessions').insert({
          user_id: user.user_id,
          purchase_id: user.purchase_id,
          session_number: i,
          status: 'pending',
        })
      }
      sessions = await fetchSessions(user.user_id)
    }

    const forms: Record<string, any> = {}
    sessions.forEach(session => {
      const scheduledDateTime = session.scheduled_at ? new Date(session.scheduled_at) : null
      // Parse notes to extract structured fields if available
      const notesParts = parseSessionNotes(session.notes || '')
      forms[session.id] = {
        scheduled_at: scheduledDateTime ? scheduledDateTime.toISOString().split('T')[0] : '',
        scheduled_time: scheduledDateTime ? scheduledDateTime.toTimeString().slice(0, 5) : '',
        mentor_name: session.mentor_name || '',
        notes: notesParts.notes,
        taaruf_progress: notesParts.taaruf_progress,
        recommendations: notesParts.recommendations,
      }
    })
    setSessionForms(forms)
    setUserSessions(sessions)

    setShowDetailModal(true)
  }

  const handleScheduleSession = async (sessionId: string) => {
    const form = sessionForms[sessionId]
    if (!form?.scheduled_at || !form?.scheduled_time) {
      alert('Silakan isi tanggal dan jam untuk menjadwalkan sesi')
      return
    }

    const scheduledAt = new Date(`${form.scheduled_at}T${form.scheduled_time}:00`).toISOString()
    setActionLoading(sessionId)
    const result = await scheduleSession(sessionId, scheduledAt)

    // Save taaruf notes if provided
    if (result.success && (form.taaruf_progress?.trim() || form.recommendations?.trim() || form.notes?.trim())) {
      const structuredNotes = buildSessionNotes(form)
      await updateSession(sessionId, { notes: structuredNotes })
    }

    setActionLoading(null)

    if (result.success) {
      if (selectedUser) {
        const updatedSessions = await fetchSessions(selectedUser.user_id)
        setUserSessions(updatedSessions)
      }
    } else {
      alert(result.error)
    }
  }

  const handleCompleteSession = async (sessionId: string) => {
    const form = sessionForms[sessionId]
    if (!form?.mentor_name) {
      alert('Silakan isi nama pendamping')
      return
    }

    // Build structured notes
    const structuredNotes = buildSessionNotes(form)
    setActionLoading(sessionId)
    const result = await completeSession(sessionId, form.mentor_name, structuredNotes)
    setActionLoading(null)

    if (result.success) {
      if (selectedUser) {
        const updatedSessions = await fetchSessions(selectedUser.user_id)
        setUserSessions(updatedSessions)
        setEditingCompletedSession(null)
      }
    } else {
      alert(result.error)
    }
  }

  const handleUpdateCompletedSession = async (sessionId: string) => {
    const form = sessionForms[sessionId]
    if (!form?.mentor_name) {
      alert('Silakan isi nama pendamping')
      return
    }

    const structuredNotes = buildSessionNotes(form)
    setActionLoading(sessionId)
    const result = await updateSession(sessionId, {
      mentor_name: form.mentor_name,
      notes: structuredNotes,
    })
    setActionLoading(null)

    if (result.success) {
      if (selectedUser) {
        const updatedSessions = await fetchSessions(selectedUser.user_id)
        setUserSessions(updatedSessions)
        setEditingCompletedSession(null)
      }
    } else {
      alert(result.error)
    }
  }

  const handleCancelSession = async (sessionId: string) => {
    if (!confirm('Batalkan sesi ini?')) return

    setActionLoading(sessionId)
    const result = await cancelSession(sessionId)
    setActionLoading(null)

    if (result.success) {
      if (selectedUser) {
        const updatedSessions = await fetchSessions(selectedUser.user_id)
        setUserSessions(updatedSessions)
      }
    } else {
      alert(result.error)
    }
  }

  const updateSessionForm = (sessionId: string, field: string, value: string) => {
    setSessionForms(prev => ({
      ...prev,
      [sessionId]: {
        ...prev[sessionId],
        [field]: value,
      },
    }))
  }

  const handleStatusChange = async (alertId: string, newStatus: 'pending' | 'contacted' | 'resolved') => {
    const result = await updateAlertStatus(alertId, newStatus)
    if (!result.success) {
      alert(result.error)
    }
  }

  const handleSaveNotes = async (alertId: string) => {
    const notes = editingNotes[alertId]
    if (notes === undefined) return

    setSavingNotes(alertId)
    const result = await updateAdminNotes(alertId, notes)
    setSavingNotes(null)

    if (!result.success) {
      alert(result.error)
    } else {
      setEditingNotes((prev) => {
        const next = { ...prev }
        delete next[alertId]
        return next
      })
    }
  }

  const openActivityModal = async (user: PendampinganUser) => {
    setActivityUser(user)
    let sessions = await fetchSessions(user.user_id)

    // Auto-create 3 default sessions if none exist
    if (sessions.length === 0) {
      // Find the actual purchase_id from subscription_purchases
      let purchaseId = user.purchase_id
      if (!purchaseId) {
        const { data: purchaseData } = await supabaseAdmin
          .from('subscription_purchases')
          .select('id')
          .eq('user_id', user.user_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        purchaseId = purchaseData?.id || ''
      }

      for (let i = 1; i <= 3; i++) {
        const { error } = await supabaseAdmin.from('mentoring_sessions').insert({
          user_id: user.user_id,
          purchase_id: purchaseId || user.user_id, // fallback to user_id if no purchase found
          session_number: i,
          status: 'pending',
        })
        if (error) {
          console.error('Failed to create session:', error)
        }
      }
      sessions = await fetchSessions(user.user_id)
    }

    const forms: Record<string, any> = {}
    sessions.forEach(session => {
      const notesParts = parseSessionNotes(session.notes || '')
      forms[session.id] = {
        taaruf_progress: notesParts.taaruf_progress,
        recommendations: notesParts.recommendations,
        notes: notesParts.notes,
        mentor_name: session.mentor_name || '',
      }
    })
    setActivityForms(forms)
    setActivitySessions(sessions)
    setShowActivityModal(true)
  }

  const handleSaveActivities = async () => {
    setActivityLoading(true)
    let successCount = 0

    for (const session of activitySessions) {
      const form = activityForms[session.id]
      if (!form) continue

      const structuredNotes = buildSessionNotes(form)
      const updates: Partial<MentoringSession> = { notes: structuredNotes }
      if (form.mentor_name?.trim()) {
        updates.mentor_name = form.mentor_name.trim()
      }

      const result = await updateSession(session.id, updates)
      if (result.success) successCount++
    }

    setActivityLoading(false)
    if (successCount > 0) {
      alert(`Berhasil menyimpan ${successCount} catatan sesi`)
      setShowActivityModal(false)
      refetch()
    } else {
      alert('Gagal menyimpan catatan')
    }
  }

  const formatExpiryDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatScheduledDateTime = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Parse structured notes from a single notes string
  const parseSessionNotes = (notes: string) => {
    const result = { notes: '', taaruf_progress: '', recommendations: '' }
    if (!notes) return result

    const progressMatch = notes.match(/\[PROGRESS\]([\s\S]*?)(?=\[RECOMMENDATIONS\]|\[NOTES\]|$)/i)
    const recMatch = notes.match(/\[RECOMMENDATIONS\]([\s\S]*?)(?=\[NOTES\]|$)/i)
    const notesMatch = notes.match(/\[NOTES\]([\s\S]*?)$/i)

    if (progressMatch || recMatch || notesMatch) {
      result.taaruf_progress = (progressMatch?.[1] || '').trim()
      result.recommendations = (recMatch?.[1] || '').trim()
      result.notes = (notesMatch?.[1] || '').trim()
    } else {
      // Legacy format: just plain text in notes
      result.notes = notes
    }
    return result
  }

  // Build structured notes string from form fields
  const buildSessionNotes = (form: { notes: string; taaruf_progress: string; recommendations: string }) => {
    const parts: string[] = []
    if (form.taaruf_progress?.trim()) parts.push(`[PROGRESS]\n${form.taaruf_progress.trim()}`)
    if (form.recommendations?.trim()) parts.push(`[RECOMMENDATIONS]\n${form.recommendations.trim()}`)
    if (form.notes?.trim()) parts.push(`[NOTES]\n${form.notes.trim()}`)
    return parts.join('\n\n')
  }

  // Calculate stats
  const totalSessions = users.length * 3
  const allSessions = users.flatMap(u => u.sessions || [])
  const completedSessions = allSessions.filter(s => s.status === 'completed').length
  const scheduledSessions = allSessions.filter(s => s.status === 'scheduled').length

  return (
    <div className="space-y-8">
      {/* ============================================ */}
      {/* SECTION: Notifikasi Add-on Baru (Admin Alerts) */}
      {/* ============================================ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Notifikasi Add-on Baru</h2>
              <p className="text-sm text-gray-500">
                {alertStats.pending} menunggu • {alertStats.contacted} dihubungi • {alertStats.resolved} selesai
              </p>
            </div>
          </div>

        </div>



        {/* Alert Error */}
        {alertsError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {alertsError}
          </div>
        )}

        {/* Alerts Table */}
        {alertsLoading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Memuat notifikasi...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-500 text-sm">Belum ada notifikasi</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pengguna</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">WhatsApp</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paket & Add-on</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catatan</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAlerts.map((alert) => {
                    const statusBadge = ALERT_STATUS_BADGES[alert.status]
                    const waNumber = cleanWhatsApp(alert.user_whatsapp)
                    const isEditingNotes = editingNotes.hasOwnProperty(alert.id)

                    return (
                      <tr key={alert.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">
                            {alert.user_full_name || 'Tanpa Nama'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {waNumber ? (
                            <a
                              href={`https://wa.me/${waNumber}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 hover:underline"
                            >
                              <Phone size={14} />
                              <span>{alert.user_whatsapp}</span>
                            </a>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-gray-700">
                              <Package size={14} className="text-gray-400" />
                              <span className="font-medium">{alert.package_name || '-'}</span>
                            </div>
                            {alert.addon_names && alert.addon_names.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {alert.addon_names.map((name, i) => (
                                  <span
                                    key={i}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                                  >
                                    <Puzzle size={10} />
                                    {name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {formatRupiah(alert.total_amount)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadge.color}`}
                          >
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {formatRelativeTime(alert.created_at)}
                        </td>
                        <td className="px-4 py-3 min-w-[180px]">
                          {isEditingNotes ? (
                            <div className="flex items-start gap-2">
                              <textarea
                                rows={2}
                                value={editingNotes[alert.id]}
                                onChange={(e) =>
                                  setEditingNotes((prev) => ({
                                    ...prev,
                                    [alert.id]: e.target.value,
                                  }))
                                }
                                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                                placeholder="Catatan admin..."
                              />
                              <button
                                onClick={() => handleSaveNotes(alert.id)}
                                disabled={savingNotes === alert.id}
                                className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                              >
                                <Save size={12} />
                              </button>
                            </div>
                          ) : (
                            <div
                              onClick={() =>
                                setEditingNotes((prev) => ({
                                  ...prev,
                                  [alert.id]: alert.admin_notes || '',
                                }))
                              }
                              className="cursor-pointer text-gray-500 hover:text-gray-700 text-xs min-h-[2rem] rounded-lg hover:bg-gray-100 px-2 py-1 transition-colors"
                              title="Klik untuk edit catatan"
                            >
                              {alert.admin_notes ? (
                                <span className="line-clamp-2">{alert.admin_notes}</span>
                              ) : (
                                <span className="text-gray-300 italic">Tambah catatan...</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end">
                            <select
                              value={alert.status}
                              onChange={(e) =>
                                handleStatusChange(
                                  alert.id,
                                  e.target.value as 'pending' | 'contacted' | 'resolved'
                                )
                              }
                              className="text-xs px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white cursor-pointer"
                            >
                              <option value="pending">Menunggu</option>
                              <option value="contacted">Dihubungi</option>
                              <option value="resolved">Selesai</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* SECTION: Premium Pendampingan (Existing)       */}
      {/* ============================================ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Premium Pendampingan</h2>
            <p className="text-sm text-gray-500">
              {users.length} user • {completedSessions}/{totalSessions} sesi selesai • {scheduledSessions} terjadwal
            </p>
          </div>
          <button
            onClick={refetch}
            className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw size={16} />
            Segarkan
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Users List */}
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Memuat...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <UserIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Belum ada user Premium Pendampingan</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pengguna</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Berlaku Sampai</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-48">Progres</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-32">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => {
                    const progress = user.sessions ? getSessionProgress(user.sessions) : { completed: 0, scheduled: 0, total: 0, percentage: 0 }
                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{user.user_full_name}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Mail size={14} />
                            <span className="text-sm">{user.user_email}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatExpiryDate(user.expires_at)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full transition-all"
                                  style={{ width: `${progress.percentage}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-600">{progress.total}/3</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {progress.completed} selesai, {progress.scheduled} terjadwal
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openActivityModal(user)}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                              <FileText size={16} />
                              Catat Aktivitas
                            </button>
                            <button
                              onClick={() => openDetailModal(user)}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg"
                            >
                              <TrendingUp size={16} />
                              Detail
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Session Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Detail Pendampingan</h3>
                <p className="text-sm text-gray-600">{selectedUser.user_full_name}</p>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{selectedUser.user_email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Berlaku Sampai</p>
                    <p className="font-medium text-gray-900">{formatExpiryDate(selectedUser.expires_at)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Paket</p>
                    <p className="font-medium text-gray-900">{selectedUser.addon_name}</p>
                  </div>
                </div>
              </div>

              {/* Sessions */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Sesi Pendampingan</h4>
                <div className="space-y-4">
                  {userSessions.map((session) => {
                    const statusBadge = STATUS_BADGES[session.status]
                    const StatusIcon = statusBadge?.icon
                    const form = sessionForms[session.id] || { scheduled_at: '', scheduled_time: '', mentor_name: '', notes: '' }

                    return (
                      <div key={session.id} className="border border-gray-200 rounded-xl overflow-hidden">
                        {/* Session Header */}
                        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <StatusIcon size={18} className={statusBadge?.color.split(' ')[1]} />
                            <span className="font-semibold text-gray-900">{SESSION_LABELS[session.session_number]}</span>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge?.color}`}>
                            {statusBadge?.label}
                          </span>
                        </div>

                        {/* Session Content */}
                        <div className="p-4 space-y-4">
                          {session.status === 'pending' && (
                            <>
                              {/* Schedule Form */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                                  <input
                                    type="date"
                                    value={form.scheduled_at}
                                    onChange={(e) => updateSessionForm(session.id, 'scheduled_at', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam</label>
                                  <input
                                    type="time"
                                    value={form.scheduled_time}
                                    onChange={(e) => updateSessionForm(session.id, 'scheduled_time', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hasil / Progress Taaruf</label>
                                <textarea
                                  rows={3}
                                  value={form.taaruf_progress}
                                  onChange={(e) => updateSessionForm(session.id, 'taaruf_progress', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-none"
                                  placeholder="Deskripsikan hasil atau progress proses taaruf pada sesi ini..."
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rekomendasi / Tindak Lanjut</label>
                                <textarea
                                  rows={2}
                                  value={form.recommendations}
                                  onChange={(e) => updateSessionForm(session.id, 'recommendations', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-none"
                                  placeholder="Rekomendasi untuk sesi berikutnya atau tindak lanjut..."
                                />
                              </div>
                              <button
                                onClick={() => handleScheduleSession(session.id)}
                                disabled={actionLoading === session.id}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                              >
                                <Calendar size={16} />
                                {actionLoading === session.id ? 'Jadwalkan...' : 'Jadwalkan Sesi'}
                              </button>
                            </>
                          )}

                          {session.status === 'scheduled' && (
                            <>
                              <div className="text-sm text-gray-600">
                                <p className="font-medium">Jadwal: {formatScheduledDateTime(session.scheduled_at)}</p>
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pendamping *</label>
                                  <input
                                    type="text"
                                    value={form.mentor_name}
                                    onChange={(e) => updateSessionForm(session.id, 'mentor_name', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                                    placeholder="Nama pendamping/admin"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Hasil / Progress Taaruf</label>
                                  <textarea
                                    rows={3}
                                    value={form.taaruf_progress}
                                    onChange={(e) => updateSessionForm(session.id, 'taaruf_progress', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-none"
                                    placeholder="Deskripsikan hasil atau progress proses taaruf pada sesi ini..."
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Rekomendasi / Tindak Lanjut</label>
                                  <textarea
                                    rows={2}
                                    value={form.recommendations}
                                    onChange={(e) => updateSessionForm(session.id, 'recommendations', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-none"
                                    placeholder="Rekomendasi untuk sesi berikutnya atau tindak lanjut..."
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Sesi</label>
                                  <textarea
                                    rows={2}
                                    value={form.notes}
                                    onChange={(e) => updateSessionForm(session.id, 'notes', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-none"
                                    placeholder="Catatan tambahan..."
                                  />
                                </div>
                                <button
                                  onClick={() => handleCompleteSession(session.id)}
                                  disabled={actionLoading === session.id}
                                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 text-sm"
                                >
                                  <CheckCircle2 size={16} />
                                  {actionLoading === session.id ? 'Selesaikan...' : 'Tandai Selesai'}
                                </button>
                              </div>
                            </>
                          )}

                          {session.status === 'completed' && (
                              <>
                                {editingCompletedSession === session.id ? (
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-emerald-600 mb-2">
                                      <CheckCircle2 size={14} />
                                      <span className="font-medium">Edit Hasil Sesi</span>
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pendamping *</label>
                                      <input
                                        type="text"
                                        value={form.mentor_name}
                                        onChange={(e) => updateSessionForm(session.id, 'mentor_name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                                        placeholder="Nama pendamping/admin"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Hasil / Progress Taaruf</label>
                                      <textarea
                                        rows={3}
                                        value={form.taaruf_progress}
                                        onChange={(e) => updateSessionForm(session.id, 'taaruf_progress', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-none"
                                        placeholder="Deskripsikan hasil atau progress proses taaruf..."
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Rekomendasi / Tindak Lanjut</label>
                                      <textarea
                                        rows={2}
                                        value={form.recommendations}
                                        onChange={(e) => updateSessionForm(session.id, 'recommendations', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-none"
                                        placeholder="Rekomendasi untuk sesi berikutnya..."
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Tambahan</label>
                                      <textarea
                                        rows={2}
                                        value={form.notes}
                                        onChange={(e) => updateSessionForm(session.id, 'notes', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-none"
                                        placeholder="Catatan tambahan..."
                                      />
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => setEditingCompletedSession(null)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                                      >
                                        Batal
                                      </button>
                                      <button
                                        onClick={() => handleUpdateCompletedSession(session.id)}
                                        disabled={actionLoading === session.id}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 text-sm"
                                      >
                                        <Save size={14} />
                                        {actionLoading === session.id ? 'Menyimpan...' : 'Simpan Perubahan'}
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Clock size={14} />
                                        <span>Selesai: {new Date(session.completed_at!).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                      </div>
                                      <button
                                        onClick={() => {
                                          setEditingCompletedSession(session.id)
                                        }}
                                        className="text-xs text-emerald-600 hover:text-emerald-700 hover:underline"
                                      >
                                        Edit Hasil
                                      </button>
                                    </div>
                                    {session.mentor_name && (
                                      <div className="text-sm text-gray-600">
                                        <span className="text-gray-500">Pendamping:</span> {session.mentor_name}
                                      </div>
                                    )}
                                    {form.taaruf_progress && (
                                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                                        <p className="text-xs font-medium text-blue-700 mb-1">Hasil / Progress Taaruf</p>
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{form.taaruf_progress}</p>
                                      </div>
                                    )}
                                    {form.recommendations && (
                                      <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                                        <p className="text-xs font-medium text-amber-700 mb-1">Rekomendasi</p>
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{form.recommendations}</p>
                                      </div>
                                    )}
                                    {form.notes && (
                                      <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                                        <p className="text-xs font-medium text-gray-500 mb-1">Catatan</p>
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{form.notes}</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </>
                            )}

                          {session.status === 'cancelled' && (
                            <p className="text-sm text-red-600">Sesi ini telah dibatalkan</p>
                          )}

                          {/* Cancel button for pending/scheduled */}
                          {(session.status === 'pending' || session.status === 'scheduled') && (
                            <button
                              onClick={() => handleCancelSession(session.id)}
                              disabled={actionLoading === session.id}
                              className="text-sm text-red-600 hover:text-red-700"
                            >
                              Batalkan Sesi
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Input Modal */}
      {showActivityModal && activityUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Catat Aktivitas Pendampingan</h3>
                <p className="text-sm text-gray-600">{activityUser.user_full_name}</p>
              </div>
              <button onClick={() => setShowActivityModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {activitySessions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">Gagal memuat sesi. Coba lagi nanti.</p>
                </div>
              ) : (
                activitySessions.map((session) => {
                  const form = activityForms[session.id] || { taaruf_progress: '', recommendations: '', notes: '', mentor_name: '' }
                  const isCompleted = session.status === 'completed'
                  const isScheduled = session.status === 'scheduled'

                  return (
                    <div key={session.id} className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                        <span className="font-semibold text-gray-900">{SESSION_LABELS[session.session_number]}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${STATUS_BADGES[session.status]?.color || ''}`}>
                          {STATUS_BADGES[session.status]?.label || session.status}
                        </span>
                      </div>

                      <div className="p-4 space-y-3">
                        {isCompleted ? (
                          <div className="space-y-2">
                            {session.mentor_name && (
                              <p className="text-sm text-gray-600"><span className="text-gray-500">Pendamping:</span> {session.mentor_name}</p>
                            )}
                            {form.taaruf_progress && (
                              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                                <p className="text-xs font-medium text-blue-700 mb-1">Progress Taaruf</p>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{form.taaruf_progress}</p>
                              </div>
                            )}
                            {form.recommendations && (
                              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                                <p className="text-xs font-medium text-amber-700 mb-1">Rekomendasi</p>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{form.recommendations}</p>
                              </div>
                            )}
                            {form.notes && (
                              <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                                <p className="text-xs font-medium text-gray-500 mb-1">Catatan</p>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{form.notes}</p>
                              </div>
                            )}
                            {!form.taaruf_progress && !form.recommendations && !form.notes && (
                              <p className="text-sm text-gray-400 italic">Belum ada catatan</p>
                            )}
                          </div>
                        ) : (
                          <>
                            {(isScheduled || session.status === 'pending') && (
                              <>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pendamping</label>
                                  <input
                                    type="text"
                                    value={form.mentor_name}
                                    onChange={(e) => setActivityForms(prev => ({
                                      ...prev,
                                      [session.id]: { ...prev[session.id], mentor_name: e.target.value },
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                                    placeholder="Nama pendamping/admin"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Hasil / Progress Taaruf</label>
                                  <textarea
                                    rows={3}
                                    value={form.taaruf_progress}
                                    onChange={(e) => setActivityForms(prev => ({
                                      ...prev,
                                      [session.id]: { ...prev[session.id], taaruf_progress: e.target.value },
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-none"
                                    placeholder="Deskripsikan hasil atau progress proses taaruf..."
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Rekomendasi / Tindak Lanjut</label>
                                  <textarea
                                    rows={2}
                                    value={form.recommendations}
                                    onChange={(e) => setActivityForms(prev => ({
                                      ...prev,
                                      [session.id]: { ...prev[session.id], recommendations: e.target.value },
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-none"
                                    placeholder="Rekomendasi untuk sesi berikutnya..."
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Tambahan</label>
                                  <textarea
                                    rows={2}
                                    value={form.notes}
                                    onChange={(e) => setActivityForms(prev => ({
                                      ...prev,
                                      [session.id]: { ...prev[session.id], notes: e.target.value },
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-none"
                                    placeholder="Catatan tambahan..."
                                  />
                                </div>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )
                })
              )}

              {activitySessions.length > 0 && (
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowActivityModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSaveActivities}
                    disabled={activityLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 text-sm"
                  >
                    <Save size={16} />
                    {activityLoading ? 'Menyimpan...' : 'Simpan Semua'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
