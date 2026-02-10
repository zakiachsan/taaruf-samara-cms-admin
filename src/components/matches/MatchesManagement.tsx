import { useState } from 'react'
import { useMatches, MatchFilters } from '../../hooks/useMatches'
import { MatchRequest } from '../../types'
import {
  Search,
  Heart,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  User,
  ArrowRight,
  MessageCircle,
  Eye,
} from 'lucide-react'

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'completed', label: 'Completed' },
]

export default function MatchesManagement() {
  const [filters, setFilters] = useState<MatchFilters>({
    status: '',
    search: '',
  })
  const [page, setPage] = useState(1)
  const [selectedMatch, setSelectedMatch] = useState<MatchRequest | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const {
    matches,
    loading,
    totalCount,
    totalPages,
    stats,
    refetch,
    updateStatus,
    deleteMatch,
  } = useMatches(filters, page)

  const handleStatusChange = async (id: string, status: MatchRequest['status']) => {
    setActionLoading(id)
    await updateStatus(id, status)
    setActionLoading(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus match request ini?')) return
    setActionLoading(id)
    await deleteMatch(id)
    setActionLoading(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; icon: any }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      accepted: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
      completed: { bg: 'bg-purple-100', text: 'text-purple-700', icon: Heart },
    }
    const { bg, text, icon: Icon } = config[status] || config.pending
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
        <Icon size={12} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Heart size={20} className="text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.accepted}</p>
              <p className="text-sm text-gray-500">Accepted</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              <p className="text-sm text-gray-500">Rejected</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Heart size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              <p className="text-sm text-gray-500">Completed</p>
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
            placeholder="Cari nama user..."
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
        ) : matches.length === 0 ? (
          <div className="p-12 text-center">
            <Heart className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Belum ada match request</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requester</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase"></th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipient</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {matches.map((match) => (
                <tr key={match.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                        <User size={20} className="text-pink-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{(match as any).requester?.full_name || '-'}</p>
                        <p className="text-sm text-gray-500">{(match as any).requester?.email || '-'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <ArrowRight size={20} className="text-gray-400 mx-auto" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{(match as any).recipient?.full_name || '-'}</p>
                        <p className="text-sm text-gray-500">{(match as any).recipient?.email || '-'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(match.status)}</td>
                  <td className="px-4 py-3">
                    {match.introduction_message ? (
                      <button
                        onClick={() => setSelectedMatch(match)}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                      >
                        <MessageCircle size={14} />
                        Lihat
                      </button>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(match.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {match.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(match.id, 'accepted')}
                            disabled={actionLoading === match.id}
                            className="p-2 hover:bg-emerald-50 rounded-lg"
                            title="Accept"
                          >
                            <CheckCircle size={16} className="text-emerald-600" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(match.id, 'rejected')}
                            disabled={actionLoading === match.id}
                            className="p-2 hover:bg-red-50 rounded-lg"
                            title="Reject"
                          >
                            <XCircle size={16} className="text-red-600" />
                          </button>
                        </>
                      )}
                      {match.status === 'accepted' && (
                        <button
                          onClick={() => handleStatusChange(match.id, 'completed')}
                          disabled={actionLoading === match.id}
                          className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                        >
                          Complete
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(match.id)}
                        disabled={actionLoading === match.id}
                        className="p-2 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
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

      {/* Message Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Pesan Perkenalan</h3>
              <button onClick={() => setSelectedMatch(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <XCircle size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                  <User size={20} className="text-pink-600" />
                </div>
                <div>
                  <p className="font-medium">{(selectedMatch as any).requester?.full_name}</p>
                  <p className="text-sm text-gray-500">ke {(selectedMatch as any).recipient?.full_name}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedMatch.introduction_message || 'Tidak ada pesan'}
                </p>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                {formatDate(selectedMatch.created_at)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
