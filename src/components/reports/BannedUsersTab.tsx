import { useState } from 'react'
import { useBannedUsers, type BannedUserFilters } from '../../hooks/useBannedUsers'
import {
  Search,
  Ban,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react'

const LIMIT_OPTIONS = [10, 20, 50]

export default function BannedUsersTab() {
  const [filters, setFilters] = useState<BannedUserFilters>({
    search: '',
  })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const { bannedUsers, loading, totalCount, totalPages, refetch, unbanUser } = useBannedUsers(
    filters,
    page,
    limit
  )

  const handleUnban = async (userId: string) => {
    if (!confirm('Unban user ini? Mereka akan bisa menggunakan aplikasi lagi.')) return

    setActionLoading(userId)
    const result = await unbanUser(userId)
    setActionLoading(null)

    if (result.success) {
      alert('User berhasil di-unban')
    } else {
      alert('Gagal unban user: ' + result.error)
    }
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

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Ban size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Dibanned</p>
              <p className="text-xl font-bold text-gray-900">{totalCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari berdasarkan nama atau email..."
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value })
                setPage(1)
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refetch}
              className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>Total: {totalCount} user dibanned</span>
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
            <p className="mt-4 text-gray-500">Memuat user dibanned...</p>
          </div>
        ) : bannedUsers.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldCheck size={48} className="mx-auto text-emerald-400 mb-4" />
            <p className="text-gray-500">Tidak ada user yang dibanned</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pelanggaran</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Tanggal Dibanned</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bannedUsers.map((user) => (
                  <tr key={user.user_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                          <span className="text-red-700 font-semibold text-sm">
                            {user.full_name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.full_name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={16} className="text-amber-500" />
                        <span className="text-sm text-gray-700">{user.violation_count}x pelanggaran</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">
                      {formatDate(user.updated_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        <Ban size={12} />
                        Dibanned
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleUnban(user.user_id)}
                        disabled={actionLoading === user.user_id}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg disabled:opacity-50"
                      >
                        {actionLoading === user.user_id ? (
                          <div className="animate-spin h-4 w-4 border-2 border-current rounded-full" />
                        ) : (
                          <ShieldCheck size={16} />
                        )}
                        Unban
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
    </div>
  )
}
