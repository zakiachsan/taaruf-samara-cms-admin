import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
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
  Plus,
  UserPlus,
  Eye,
  Download,
} from 'lucide-react'

const STATUS_OPTIONS = [
  { value: '', label: 'Semua Status' },
  { value: 'registered', label: 'Terdaftar' },
  { value: 'scheduled', label: 'Dijadwalkan' },
  { value: 'completed', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
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
  const [showManualModal, setShowManualModal] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Certificate modal state
  const [showCertificateModal, setShowCertificateModal] = useState(false)
  const [certificateData, setCertificateData] = useState<any>(null)
  const [certificateUser, setCertificateUser] = useState<SelfValueRegistration | null>(null)
  const [loadingCertificate, setLoadingCertificate] = useState(false)

  // Manual creation form
  const [manualUserSearch, setManualUserSearch] = useState('')
  const [manualUsers, setManualUsers] = useState<Array<{ id: string; full_name: string; email: string }>>([])
  const [manualUserLoading, setManualUserLoading] = useState(false)
  const [selectedManualUser, setSelectedManualUser] = useState<{ id: string; full_name: string; email: string } | null>(null)

  // Debounced search for manual user selection
  useEffect(() => {
    const trimmed = manualUserSearch.trim()
    if (!trimmed) {
      setManualUsers([])
      return
    }
    const timer = setTimeout(() => {
      searchManualUsers(trimmed)
    }, 400)
    return () => clearTimeout(timer)
  }, [manualUserSearch])

  const [manualFormData, setManualFormData] = useState({
    quality_score: 0,
    mental_readiness_score: 0,
    emotional_baggage_notes: '',
    life_needs_notes: '',
    partner_category: '',
    consultant_notes: '',
    certificate_code: '',
  })

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

  const searchManualUsers = async (query?: string) => {
    const searchTerm = query || manualUserSearch
    if (!searchTerm.trim()) return
    setManualUserLoading(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email')
        .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .limit(10)

      if (error) {
        console.error('Error searching users:', error)
        setManualUsers([])
      } else if (data) {
        setManualUsers(data.map((u: any) => ({ id: u.id, full_name: u.full_name, email: u.email })))
      }
    } catch (e) {
      console.error('Error searching users:', e)
    }
    setManualUserLoading(false)
  }

  const handleManualCreate = async () => {
    if (!selectedManualUser) {
      alert('Pilih pengguna terlebih dahulu')
      return
    }

    setActionLoading('manual')
    const result = await saveTestResults(selectedManualUser.id, {
      quality_score: manualFormData.quality_score,
      mental_readiness_score: manualFormData.mental_readiness_score,
      emotional_baggage_notes: manualFormData.emotional_baggage_notes,
      life_needs_notes: manualFormData.life_needs_notes,
      partner_category: manualFormData.partner_category,
      consultant_notes: manualFormData.consultant_notes,
      certificate_code: manualFormData.certificate_code || undefined,
    })

    if (result.success) {
      // Ensure a self_value_registrations record exists for this user
      const { data: existing } = await supabase
        .from('self_value_registrations')
        .select('id')
        .eq('user_id', selectedManualUser.id)
        .maybeSingle()

      if (existing) {
        await supabase
          .from('self_value_registrations')
          .update({ status: 'completed', updated_at: new Date().toISOString() })
          .eq('id', existing.id)
      } else {
        await supabase
          .from('self_value_registrations')
          .insert({
            user_id: selectedManualUser.id,
            status: 'completed',
          })
      }

      setShowManualModal(false)
      setSelectedManualUser(null)
      setManualUserSearch('')
      setManualUsers([])
      setManualFormData({
        quality_score: 0,
        mental_readiness_score: 0,
        emotional_baggage_notes: '',
        life_needs_notes: '',
        partner_category: '',
        consultant_notes: '',
        certificate_code: '',
      })
      await refetch()
      alert('Hasil Bedah Value berhasil dibuat')
    } else {
      alert(result.error)
    }

    setActionLoading(null)
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

  const handleViewCertificate = async (reg: SelfValueRegistration) => {
    setCertificateUser(reg)
    setLoadingCertificate(true)
    setShowCertificateModal(true)

    const { success, data } = await getTestResults(reg.user_id)
    if (success && data) {
      setCertificateData(data)
    } else {
      setCertificateData(null)
    }
    setLoadingCertificate(false)
  }

  const handlePrintCertificate = () => {
    window.print()
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
    const labels: Record<string, string> = {
      registered: 'Terdaftar',
      scheduled: 'Dijadwalkan',
      completed: 'Selesai',
      cancelled: 'Dibatalkan',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
        {labels[status] || status.charAt(0).toUpperCase() + status.slice(1)}
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
              <p className="text-sm text-gray-500">Terdaftar</p>
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
              <p className="text-sm text-gray-500">Dijadwalkan</p>
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
              <p className="text-sm text-gray-500">Selesai</p>
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
              <p className="text-sm text-gray-500">Dibatalkan</p>
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
          Segarkan
        </button>
        <button
          onClick={() => setShowManualModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          <Plus size={18} />
          Tambah Hasil Manual
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Memuat...</p>
          </div>
        ) : registrations.length === 0 ? (
          <div className="p-12 text-center">
            <Award className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Belum ada registrasi Self-Value</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode Sertifikat</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Terdaftar</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
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
                      {(reg as any).certificate_code ? (
                        <span className="inline-flex items-center px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-mono font-medium">
                          {(reg as any).certificate_code}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
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
                            Jadwalkan
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
                          <>
                            <button
                              onClick={() => handleViewCertificate(reg)}
                              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-1"
                            >
                              <Eye size={14} />
                              Sertifikat
                            </button>
                            <button
                              onClick={() => handleEdit(reg)}
                              className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                            >
                              Edit
                            </button>
                          </>
                        )}
                        {(reg.status === 'registered' || reg.status === 'scheduled') && (
                          <button
                            onClick={() => handleCancel(reg)}
                            disabled={actionLoading === reg.id}
                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50"
                          >
                            Batal
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50"
            >
              <ChevronLeft size={16} /> Sebelumnya
            </button>
            <span className="text-sm text-gray-600">Halaman {page} dari {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50"
            >
              Berikutnya <ChevronRight size={16} />
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
                  {actionLoading === 'schedule' ? 'Menyimpan...' : 'Jadwalkan'}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skor Kualitas (0-100)</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kesiapan Mental (0-100)</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Beban Emosional</label>
                <textarea
                  value={completeData.emotional_baggage_notes}
                  onChange={(e) => setCompleteData({ ...completeData, emotional_baggage_notes: e.target.value })}
                  placeholder="Catatan tentang beban emosional..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Kebutuhan Hidup</label>
                <textarea
                  value={completeData.life_needs_notes}
                  onChange={(e) => setCompleteData({ ...completeData, life_needs_notes: e.target.value })}
                  placeholder="Catatan tentang kebutuhan hidup..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Partner</label>
                <input
                  type="text"
                  value={completeData.partner_category}
                  onChange={(e) => setCompleteData({ ...completeData, partner_category: e.target.value })}
                  placeholder="Kategori partner yang cocok..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Konsultan</label>
                <textarea
                  value={completeData.consultant_notes}
                  onChange={(e) => setCompleteData({ ...completeData, consultant_notes: e.target.value })}
                  placeholder="Catatan konsultan..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kode Sertifikat (dibuat otomatis jika kosong)</label>
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
                  {actionLoading === 'complete' ? 'Menyimpan...' : 'Simpan & Selesaikan'}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skor Kualitas (0-100)</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kesiapan Mental (0-100)</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Beban Emosional</label>
                <textarea
                  value={completeData.emotional_baggage_notes}
                  onChange={(e) => setCompleteData({ ...completeData, emotional_baggage_notes: e.target.value })}
                  placeholder="Catatan tentang beban emosional..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Kebutuhan Hidup</label>
                <textarea
                  value={completeData.life_needs_notes}
                  onChange={(e) => setCompleteData({ ...completeData, life_needs_notes: e.target.value })}
                  placeholder="Catatan tentang kebutuhan hidup..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Partner</label>
                <input
                  type="text"
                  value={completeData.partner_category}
                  onChange={(e) => setCompleteData({ ...completeData, partner_category: e.target.value })}
                  placeholder="Kategori partner yang cocok..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Konsultan</label>
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
                  {actionLoading === 'edit' ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Creation Modal */}
      {showManualModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Tambah Hasil Bedah Value Manual</h3>
              <button onClick={() => setShowManualModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* User Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cari Pengguna</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={manualUserSearch}
                    onChange={(e) => {
                      setManualUserSearch(e.target.value)
                      setSelectedManualUser(null)
                    }}
                    placeholder="Ketik nama pengguna..."
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg"
                  />
                  {manualUserLoading && (
                    <RefreshCw className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" size={16} />
                  )}
                </div>
                {manualUsers.length > 0 && (
                  <div className="mt-2 border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-40 overflow-y-auto">
                    {manualUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => setSelectedManualUser(u)}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${
                          selectedManualUser?.id === u.id ? 'bg-emerald-50 text-emerald-700' : ''
                        }`}
                      >
                        <p className="font-medium text-sm">{u.full_name}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </button>
                    ))}
                  </div>
                )}
                {manualUserSearch.trim() && !manualUserLoading && manualUsers.length === 0 && (
                  <p className="mt-2 text-sm text-gray-500">Tidak ada pengguna ditemukan</p>
                )}
                {selectedManualUser && (
                  <div className="mt-2 p-3 bg-emerald-50 rounded-lg flex items-center gap-2">
                    <UserPlus size={16} className="text-emerald-600" />
                    <p className="text-sm text-emerald-700">
                      Dipilih: <strong>{selectedManualUser.full_name}</strong>
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skor Kualitas (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={manualFormData.quality_score || ''}
                    onChange={(e) => setManualFormData({ ...manualFormData, quality_score: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kesiapan Mental (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={manualFormData.mental_readiness_score || ''}
                    onChange={(e) => setManualFormData({ ...manualFormData, mental_readiness_score: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Beban Emosional</label>
                <textarea
                  value={manualFormData.emotional_baggage_notes}
                  onChange={(e) => setManualFormData({ ...manualFormData, emotional_baggage_notes: e.target.value })}
                  placeholder="Catatan tentang beban emosional..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Kebutuhan Hidup</label>
                <textarea
                  value={manualFormData.life_needs_notes}
                  onChange={(e) => setManualFormData({ ...manualFormData, life_needs_notes: e.target.value })}
                  placeholder="Catatan tentang kebutuhan hidup..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Partner</label>
                <input
                  type="text"
                  value={manualFormData.partner_category}
                  onChange={(e) => setManualFormData({ ...manualFormData, partner_category: e.target.value })}
                  placeholder="Kategori partner yang cocok..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Konsultan</label>
                <textarea
                  value={manualFormData.consultant_notes}
                  onChange={(e) => setManualFormData({ ...manualFormData, consultant_notes: e.target.value })}
                  placeholder="Catatan konsultan..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kode Sertifikat</label>
                <input
                  type="text"
                  value={manualFormData.certificate_code}
                  onChange={(e) => setManualFormData({ ...manualFormData, certificate_code: e.target.value })}
                  placeholder="BV-2026-XXXXX"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowManualModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleManualCreate}
                  disabled={actionLoading === 'manual' || !selectedManualUser}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                  <CheckCircle size={18} />
                  {actionLoading === 'manual' ? 'Menyimpan...' : 'Simpan Hasil'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Sertifikasi Bedah Value</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintCertificate}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Download size={14} />
                  Cetak
                </button>
                <button onClick={() => { setShowCertificateModal(false); setCertificateData(null); setCertificateUser(null) }} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6" id="certificate-content">
              {loadingCertificate ? (
                <div className="py-12 text-center">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gray-400 mb-3" />
                  <p className="text-sm text-gray-500">Memuat data sertifikat...</p>
                </div>
              ) : (
                <>
                {/* Certificate Card */}
                <div className="border-2 border-emerald-600 rounded-xl overflow-hidden">
                  {/* Certificate Header */}
                  <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-8 py-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Award size={28} className="text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-wide">SERTIFIKAT</h2>
                    <p className="text-emerald-100 text-sm mt-1">Bedah Value - Taaruf Samara</p>
                  </div>

                  {/* Certificate Body */}
                  <div className="px-8 py-6 space-y-5">
                    {/* User Info */}
                    <div className="text-center pb-4 border-b border-gray-200">
                      <p className="text-sm text-gray-500 mb-1">Diberikan kepada</p>
                      <p className="text-xl font-bold text-gray-900">
                        {certificateUser?.user?.full_name || '-'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {certificateUser?.user?.email || ''}
                      </p>
                    </div>

                    {/* Scores */}
                    {certificateData && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-emerald-50 rounded-lg p-4 text-center">
                          <p className="text-xs text-emerald-600 font-medium mb-1">Skor Kualitas</p>
                          <p className="text-2xl font-bold text-emerald-700">
                            {certificateData.quality_score || 0}
                          </p>
                          <p className="text-xs text-gray-500">/ 100</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                          <p className="text-xs text-blue-600 font-medium mb-1">Kesiapan Mental</p>
                          <p className="text-2xl font-bold text-blue-700">
                            {certificateData.mental_readiness_score || 0}
                          </p>
                          <p className="text-xs text-gray-500">/ 100</p>
                        </div>
                      </div>
                    )}

                    {/* Details */}
                    {certificateData && (
                      <div className="space-y-3">
                        {certificateData.partner_category && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs font-medium text-gray-500 mb-1">Kategori Partner</p>
                            <p className="text-sm text-gray-700">{certificateData.partner_category}</p>
                          </div>
                        )}
                        {certificateData.emotional_baggage_notes && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs font-medium text-gray-500 mb-1">Beban Emosional</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{certificateData.emotional_baggage_notes}</p>
                          </div>
                        )}
                        {certificateData.life_needs_notes && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs font-medium text-gray-500 mb-1">Kebutuhan Hidup</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{certificateData.life_needs_notes}</p>
                          </div>
                        )}
                        {certificateData.consultant_notes && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs font-medium text-gray-500 mb-1">Catatan Konsultan</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{certificateData.consultant_notes}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Certificate Code */}
                    {certificateData?.certificate_code && (
                      <div className="text-center pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500">Kode Sertifikat</p>
                        <p className="text-sm font-mono font-bold text-emerald-700 tracking-wider">
                          {certificateData.certificate_code}
                        </p>
                      </div>
                    )}

                    {/* Signature */}
                    <div className="flex justify-between items-end pt-4 border-t border-gray-200">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Tanggal Terbit</p>
                        <p className="text-sm font-medium text-gray-700">
                          {certificateUser?.created_at
                            ? new Date(certificateUser.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                            : '-'}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-20 border-b border-gray-400 mb-1" />
                        <p className="text-xs text-gray-500">Tim Pendampingan</p>
                        <p className="text-sm font-medium text-gray-700">Taaruf Samara</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Certificate URL Link */}
                {certificateUser?.certificate_url && (
                  <div className="mt-4 text-center">
                    <a
                      href={certificateUser.certificate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      <Eye size={14} />
                      Buka Sertifikat Online
                    </a>
                  </div>
                )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
