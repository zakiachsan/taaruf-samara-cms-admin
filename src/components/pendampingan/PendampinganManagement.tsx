import { useState } from 'react'
import { usePendampingan, type MentoringSession, type PendampinganUser } from '../../hooks/usePendampingan'
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
  Save,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

const SESSION_LABELS: Record<number, string> = {
  1: 'Sesi 1',
  2: 'Sesi 2',
  3: 'Sesi 3',
}

const STATUS_BADGES: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-700', icon: Clock },
  scheduled: { label: 'Terjadwal', color: 'bg-blue-100 text-blue-700', icon: Calendar },
  completed: { label: 'Selesai', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  cancelled: { label: 'Dibatalkan', color: 'bg-red-100 text-red-700', icon: XCircle },
}

export default function PendampinganManagement() {
  const { users, loading, error, refetch, fetchSessions, updateSession, getSessionProgress, scheduleSession, completeSession, cancelSession } = usePendampingan()
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<PendampinganUser | null>(null)
  const [userSessions, setUserSessions] = useState<MentoringSession[]>([])
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Session form state
  const [sessionForms, setSessionForms] = useState<Record<string, {
    scheduled_at: string
    scheduled_time: string
    mentor_name: string
    notes: string
  }>>({})

  const openDetailModal = async (user: PendampinganUser) => {
    setSelectedUser(user)
    const sessions = await fetchSessions(user.user_id)
    setUserSessions(sessions)

    // Initialize form data for each session
    const forms: Record<string, any> = {}
    sessions.forEach(session => {
      const scheduledDateTime = session.scheduled_at ? new Date(session.scheduled_at) : null
      forms[session.id] = {
        scheduled_at: scheduledDateTime ? scheduledDateTime.toISOString().split('T')[0] : '',
        scheduled_time: scheduledDateTime ? scheduledDateTime.toTimeString().slice(0, 5) : '',
        mentor_name: session.mentor_name || '',
        notes: session.notes || '',
      }
    })
    setSessionForms(forms)

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
    setActionLoading(null)

    if (result.success) {
      // Refresh sessions
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

    setActionLoading(sessionId)
    const result = await completeSession(sessionId, form.mentor_name, form.notes)
    setActionLoading(null)

    if (result.success) {
      // Refresh sessions
      if (selectedUser) {
        const updatedSessions = await fetchSessions(selectedUser.user_id)
        setUserSessions(updatedSessions)
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
      // Refresh sessions
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

  // Calculate stats
  const totalSessions = users.length * 3
  const allSessions = users.flatMap(u => u.sessions || [])
  const completedSessions = allSessions.filter(s => s.status === 'completed').length
  const scheduledSessions = allSessions.filter(s => s.status === 'scheduled').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Premium Pendampingan</h1>
          <p className="text-gray-600">
            {users.length} user • {completedSessions}/{totalSessions} sesi selesai • {scheduledSessions} terjadwal
          </p>
        </div>
        <button
          onClick={refetch}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw size={18} />
          Refresh
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
          <p className="text-gray-500">Loading...</p>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Berlaku Sampai</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-48">Progress</th>
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
                        <div className="flex items-center justify-end">
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
                            <span className="font-semibold text-gray-900">{SESSION_LABELS[session.number]}</span>
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
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Sesi</label>
                                  <textarea
                                    rows={2}
                                    value={form.notes}
                                    onChange={(e) => updateSessionForm(session.id, 'notes', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-none"
                                    placeholder="Catatan hasil sesi..."
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
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Clock size={14} />
                                <span>Selesai: {new Date(session.completed_at!).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              {session.mentor_name && (
                                <div className="text-gray-600">
                                  <span className="text-gray-500">Pendamping:</span> {session.mentor_name}
                                </div>
                              )}
                              {session.notes && (
                                <div className="text-gray-600">
                                  <span className="text-gray-500">Catatan:</span> {session.notes}
                                </div>
                              )}
                            </div>
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
    </div>
  )
}
