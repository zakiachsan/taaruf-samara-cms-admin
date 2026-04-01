import { useState } from 'react'
import { useSelfValue, type SelfValueFilters } from '../../hooks/useSelfValue'
import { type SelfValueRegistration } from '../../types'
import {
  Search,
  Calendar,
  CheckCircle,
  XCircle,
  FileText,
  User,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Award,
  X,
} from 'lucide-react'

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'registered', label: 'Registered' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function SelfValueManagement() {
  const [filters, setFilters] = useState<SelfValueFilters>({
    status: '',
    search: '',
  })
  const [page, setPage] = useState(1)
  const [selectedRegistration, setSelectedRegistration] = useState<SelfValueRegistration | null>(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Schedule form
  const [scheduleData, setScheduleData] = useState({
    date: '',
    time: '',
    location: '',
  })

  // Complete form
  const [completeData, setCompleteData] = useState({
    certificateUrl: '',
    notes: '',
    quality_score: 0,
    mental_readiness_score: 0,
    emotional_baggage_notes: '',
    life_needs_notes: '',
    partner_category: '',
    consultant_notes: '',
    certificate_code: '',
  })

  const {
    registrations,
    loading,
    totalPages,
    stats,
    refetch,
    scheduleSession,
    completeSession,
    cancelSession,
    saveTestResults,
    updateTestResults,
    getTestResults,
  } = useSelfValue(filters, page)

  const handleSchedule = async () => {
    if (!selectedRegistration || !scheduleData.date || !scheduleData.time || !scheduleData.location) {
      alert('Lengkapi semua field')
      return
    }

    setActionLoading('schedule')
    const result = await scheduleSession(
      selectedRegistration.id,
      scheduleData.date,
      scheduleData.time,
      scheduleData.location
    )
    setActionLoading(null)

    if (result.success) {
      setShowScheduleModal(false)
      setSelectedRegistration(null)
      setScheduleData({ date: '', time: '', location: '' })
    } else {
      alert(result.error)
    }
  }

  const handleComplete = async () => {
    if (!selectedRegistration) return

    setActionLoading('complete')

    // First save test results
    const resultsResult = await saveTestResults(selectedRegistration.user_id, {
      quality_score: completeData.quality_score,
      mental_readiness_score: completeData.mental_readiness_score,
      emotional_baggage_notes: completeData.emotional_baggage_notes,
      life_needs_notes: completeData.life_needs_notes,
      partner_category: completeData.partner_category,
      consultant_notes: completeData.consultant_notes,
      certificate_code: completeData.certificate_code || undefined,
    })

    if (!resultsResult.success) {
      setActionLoading(null)
      alert(resultsResult.error)
      return
    }

    // Then complete the session
    const result = await completeSession(
      selectedRegistration.id,
      completeData.certificateUrl || undefined,
      completeData.notes || undefined
    )
    setActionLoading(null)

    if (result.success) {
      setShowCompleteModal(false)
      setSelectedRegistration(null)
      setCompleteData({
        certificateUrl: '',
        notes: '',
        quality_score: 0,
        mental_readiness_score: 0,
        emotional_baggage_notes: '',
        life_needs_notes: '',
        partner_category: '',
        consultant_notes: '',
        certificate_code: '',
      })
    } else {
      alert(result.error)
    }
  }

  const handleCancel = async (registration: SelfValueRegistration) => {
    if (!confirm('Batalkan registrasi ini?')) return

    setActionLoading(registration.id)
    await cancelSession(registration.id)
    setActionLoading(null)
  }

  const handleEdit = async (registration: SelfValueRegistration) => {
    setSelectedRegistration(registration)
    setActionLoading('edit-load')

    // Fetch existing test results
    const { success, data } = await getTestResults(registration.user_id)

    if (success && data) {
      setCompleteData({
        certificateUrl: data.certificate_url || '',
        notes: registration.notes || '',
        quality_score: data.quality_score || 0,
        mental_readiness_score: data.mental_readiness_score || 0,
        emotional_baggage_notes: data.emotional_baggage_notes || '',
        life_needs_notes: data.life_needs_notes || '',
        partner_category: data.partner_category || '',
        consultant_notes: data.consultant_notes || '',
        certificate_code: data.certificate_code || '',
      })
    } else {
      // Reset to empty if no existing results
      setCompleteData({
        certificateUrl: '',
        notes: '',
        quality_score: 0,
        mental_readiness_score: 0,
        emotional_baggage_notes: '',
        life_needs_notes: '',
        partner_category: '',
        consultant_notes: '',
        certificate_code: '',
      })
    }

    setActionLoading(null)
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedRegistration) return

    setActionLoading('edit')

    const result = await updateTestResults(selectedRegistration.user_id, {
      quality_score: completeData.quality_score,
      mental_readiness_score: completeData.mental_readiness_score,
      emotional_baggage_notes: completeData.emotional_baggage_notes,
      life_needs_notes: completeData.life_needs_notes,
      partner_category: completeData.partner_category,
      consultant_notes: completeData.consultant_notes,
      certificate_code: completeData.certificate_code || undefined,
    })

    setActionLoading(null)

    if (result.success) {
      setShowEditModal(false)
      setSelectedRegistration(null)
      refetch()
    } else {
      alert(result.error)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      registered: 'bg-blue-100 text-blue-700',
      scheduled: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-emerald-100 text-emerald-700',
      cancelled: 'bg-red-100 text-red-700',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.registered}</p>
              <p className="text-sm text-gray-500">Registered</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Calendar size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.scheduled}</p>
              <p className="text-sm text-gray-500">Scheduled</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.cancelled}</p>
              <p className="text-sm text-gray-500">Cancelled</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button
          onClick={refetch}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : registrations.length === 0 ? (
          <div className="p-12 text-center">
            <Award className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Belum ada registrasi Self-Value</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Schedule</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {registrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <User size={20} className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{(reg as any).user?.full_name || '-'}</p>
                        <p className="text-sm text-gray-500">{(reg as any).user?.email || '-'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(reg.status)}</td>
                  <td className="px-4 py-3">
                    {reg.scheduled_date ? (
                      <div className="text-sm">
                        <p className="font-medium">{formatDate(reg.scheduled_date)}</p>
                        <p className="text-gray-500">{reg.scheduled_time || '-'}</p>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{reg.location || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(reg.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {reg.status === 'registered' && (
                        <button
                          onClick={() => {
                            setSelectedRegistration(reg)
                            setShowScheduleModal(true)
                          }}
                          className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
                        >
                          Schedule
                        </button>
                      )}
                      {reg.status === 'scheduled' && (
                        <button
                          onClick={() => {
                            setSelectedRegistration(reg)
                            setShowCompleteModal(true)
                          }}
                          className="px-3 py-1 text-sm bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200"
                        >
                          Input Hasil Test
                        </button>
                      )}
                      {reg.status === 'completed' && (
                        <button
                          onClick={() => handleEdit(reg)}
                          className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                        >
                          Edit Hasil
                        </button>
                      )}
                      {(reg.status === 'registered' || reg.status === 'scheduled') && (
                        <button
                          onClick={() => handleCancel(reg)}
                          disabled={actionLoading === reg.id}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && selectedRegistration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Jadwalkan Sesi</h3>
              <button onClick={() => setShowScheduleModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                <input
                  type="date"
                  value={scheduleData.date}
                  onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Waktu</label>
                <input
                  type="time"
                  value={scheduleData.time}
                  onChange={(e) => setScheduleData({ ...scheduleData, time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                <input
                  type="text"
                  value={scheduleData.location}
                  onChange={(e) => setScheduleData({ ...scheduleData, location: e.target.value })}
                  placeholder="Alamat lokasi sesi"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleSchedule}
                  disabled={actionLoading === 'schedule'}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                  <Calendar size={18} />
                  {actionLoading === 'schedule' ? 'Saving...' : 'Jadwalkan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complete Modal */}
      {showCompleteModal && selectedRegistration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Input Hasil Test</h3>
              <button onClick={() => setShowCompleteModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quality Score (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={completeData.quality_score || ''}
                    onChange={(e) => setCompleteData({ ...completeData, quality_score: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mental Readiness (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={completeData.mental_readiness_score || ''}
                    onChange={(e) => setCompleteData({ ...completeData, mental_readiness_score: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emotional Baggage Notes</label>
                <textarea
                  value={completeData.emotional_baggage_notes}
                  onChange={(e) => setCompleteData({ ...completeData, emotional_baggage_notes: e.target.value })}
                  placeholder="Catatan tentang beban emosional..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Life Needs Notes</label>
                <textarea
                  value={completeData.life_needs_notes}
                  onChange={(e) => setCompleteData({ ...completeData, life_needs_notes: e.target.value })}
                  placeholder="Catatan tentang kebutuhan hidup..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Partner Category</label>
                <input
                  type="text"
                  value={completeData.partner_category}
                  onChange={(e) => setCompleteData({ ...completeData, partner_category: e.target.value })}
                  placeholder="Kategori partner yang cocok..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Consultant Notes</label>
                <textarea
                  value={completeData.consultant_notes}
                  onChange={(e) => setCompleteData({ ...completeData, consultant_notes: e.target.value })}
                  placeholder="Catatan konsultan..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kode Sertifikat (auto-generated if empty)</label>
                <input
                  type="text"
                  value={completeData.certificate_code}
                  onChange={(e) => setCompleteData({ ...completeData, certificate_code: e.target.value })}
                  placeholder="BV-2026-XXXXX"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Sertifikat</label>
                <input
                  type="url"
                  value={completeData.certificateUrl}
                  onChange={(e) => setCompleteData({ ...completeData, certificateUrl: e.target.value })}
                  placeholder="https://... (opsional)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                <textarea
                  value={completeData.notes}
                  onChange={(e) => setCompleteData({ ...completeData, notes: e.target.value })}
                  placeholder="Catatan tambahan (opsional)"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCompleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleComplete}
                  disabled={actionLoading === 'complete'}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                  <CheckCircle size={18} />
                  {actionLoading === 'complete' ? 'Saving...' : 'Simpan & Selesaikan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal - For completed registrations */}
      {showEditModal && selectedRegistration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Edit Hasil Test</h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quality Score (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={completeData.quality_score || ''}
                    onChange={(e) => setCompleteData({ ...completeData, quality_score: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mental Readiness (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={completeData.mental_readiness_score || ''}
                    onChange={(e) => setCompleteData({ ...completeData, mental_readiness_score: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emotional Baggage Notes</label>
                <textarea
                  value={completeData.emotional_baggage_notes}
                  onChange={(e) => setCompleteData({ ...completeData, emotional_baggage_notes: e.target.value })}
                  placeholder="Catatan tentang beban emosional..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Life Needs Notes</label>
                <textarea
                  value={completeData.life_needs_notes}
                  onChange={(e) => setCompleteData({ ...completeData, life_needs_notes: e.target.value })}
                  placeholder="Catatan tentang kebutuhan hidup..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Partner Category</label>
                <input
                  type="text"
                  value={completeData.partner_category}
                  onChange={(e) => setCompleteData({ ...completeData, partner_category: e.target.value })}
                  placeholder="Kategori partner yang cocok..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Consultant Notes</label>
                <textarea
                  value={completeData.consultant_notes}
                  onChange={(e) => setCompleteData({ ...completeData, consultant_notes: e.target.value })}
                  placeholder="Catatan konsultan..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kode Sertifikat</label>
                <input
                  type="text"
                  value={completeData.certificate_code}
                  onChange={(e) => setCompleteData({ ...completeData, certificate_code: e.target.value })}
                  placeholder="BV-2026-XXXXX"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Sertifikat</label>
                <input
                  type="url"
                  value={completeData.certificateUrl}
                  onChange={(e) => setCompleteData({ ...completeData, certificateUrl: e.target.value })}
                  placeholder="https://... (opsional)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={actionLoading === 'edit'}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  <CheckCircle size={18} />
                  {actionLoading === 'edit' ? 'Saving...' : 'Simpan Perubahan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
