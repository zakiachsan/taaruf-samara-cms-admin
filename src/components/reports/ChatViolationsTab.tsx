import { useState } from 'react'
import { useChatViolations, type ChatViolationFilters } from '../../hooks/useChatViolations'
import {
  Search,
  ShieldAlert,
  Phone,
  MessageSquareWarning,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Users,
} from 'lucide-react'

const LIMIT_OPTIONS = [10, 20, 50]

const VIOLATION_TYPE_OPTIONS = [
  { value: '', label: 'Semua Tipe' },
  { value: 'phone_number', label: 'Nomor Telepon' },
  { value: 'inappropriate_language', label: 'Bahasa Tidak Pantas' },
]

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white rounded-xl p-4 border border-gray-200">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
  </div>
)

const getViolationBadge = (type: string) => {
  if (type === 'phone_number') {
    return (
      <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
        <Phone size={12} />
        Nomor Telepon
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
      <MessageSquareWarning size={12} />
      Bahasa Tidak Pantas
    </span>
  )
}

export default function ChatViolationsTab() {
  const [filters, setFilters] = useState<ChatViolationFilters>({
    search: '',
    violationType: '',
  })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [selectedViolation, setSelectedViolation] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const { violations, loading, totalCount, totalPages, stats, refetch } = useChatViolations(
    filters,
    page,
    limit
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleViewDetail = (violation: any) => {
    setSelectedViolation(violation)
    setShowDetailModal(true)
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Pelanggaran" value={stats.totalViolations} icon={ShieldAlert} color="bg-red-500" />
        <StatCard title="Nomor Telepon" value={stats.phoneNumberFlags} icon={Phone} color="bg-amber-500" />
        <StatCard
          title="Bahasa Tidak Pantas"
          value={stats.inappropriateFlags}
          icon={MessageSquareWarning}
          color="bg-rose-500"
        />
        <StatCard title="User Ditandai" value={stats.uniqueUsers} icon={Users} color="bg-blue-500" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari berdasarkan nama user atau isi pesan..."
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value })
                setPage(1)
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-2">
            <select
              value={filters.violationType}
              onChange={(e) => {
                setFilters({ ...filters, violationType: e.target.value })
                setPage(1)
              }}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 flex-1"
            >
              {VIOLATION_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            <button
              onClick={refetch}
              className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>Total: {totalCount} pelanggaran</span>
          <div className="flex items-center gap-2">
            <span>Tampilkan:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value))
                setPage(1)
              }}
              className="border border-gray-200 rounded px-2 py-1"
            >
              {LIMIT_OPTIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="mt-4 text-gray-500">Memuat pelanggaran chat...</p>
          </div>
        ) : violations.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldAlert size={48} className="mx-auto text-emerald-400 mb-4" />
            <p className="text-gray-500">Tidak ada pelanggaran chat ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Isi Pesan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Tanggal</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {violations.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                          <span className="text-red-700 font-semibold text-sm">
                            {v.user_name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{v.user_name}</p>
                          <p className="text-xs text-gray-500">{v.user_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{getViolationBadge(v.violation_type)}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-600 max-w-xs truncate">{v.message_content}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{formatDate(v.created_at)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleViewDetail(v)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Lihat Detail"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg disabled:opacity-50"
            >
              <ChevronLeft size={16} /> Sebelumnya
            </button>
            <span className="text-sm text-gray-500">
              Halaman {page} dari {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg disabled:opacity-50"
            >
              Berikutnya <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedViolation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Detail Pelanggaran Chat</h3>
                <button
                  onClick={() => {
                    setShowDetailModal(false)
                    setSelectedViolation(null)
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <span className="text-gray-500">Tipe:</span>
                {getViolationBadge(selectedViolation.violation_type)}
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <h4 className="font-medium text-red-900 mb-2">User</h4>
                <p className="text-red-800">{selectedViolation.user_name}</p>
                <p className="text-red-600 text-sm">{selectedViolation.user_email}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Isi Pesan</h4>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedViolation.message_content}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Chat ID</h4>
                  <p className="text-sm text-gray-600 font-mono">{selectedViolation.chat_id}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Tanggal</h4>
                  <p className="text-sm text-gray-600">{formatDate(selectedViolation.created_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
