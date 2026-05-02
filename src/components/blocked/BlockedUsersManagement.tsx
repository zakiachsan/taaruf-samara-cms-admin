import { useState } from 'react'
import { useBlockedUsers, type BlockedFilters } from '../../hooks/useBlockedUsers'
import {
  Search,
  UserX,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Unlock,
  Shield,
  MessageCircle,
} from 'lucide-react'

const LIMIT_OPTIONS = [10, 20, 50]

export default function BlockedUsersManagement() {
  const [filters, setFilters] = useState<BlockedFilters>({
    search: '',
  })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const {
    blockedUsers,
    loading,
    totalCount,
    totalPages,
    refetch,
    unblockById,
  } = useBlockedUsers(filters, page, limit)

  const handleUnblock = async (userId: string, userName: string) => {
    if (!confirm(`Buka blokir ${userName}? Mereka akan dapat menggunakan aplikasi lagi.`)) return

    setActionLoading(userId)
    const result = await unblockById(userId)
    setActionLoading(null)

    if (result.success) {
      alert('Pengguna berhasil dibuka blokirnya')
    } else {
      alert('Gagal membuka blokir pengguna: ' + result.error)
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

  const cleanWhatsApp = (num: string | null | undefined): string | null => {
    if (!num) return null
    const cleaned = num.replace(/\D/g, '').replace(/^0/, '62')
    return cleaned || null
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <UserX size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Diblokir</p>
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
              placeholder="Cari berdasarkan nama, email, atau nomor WA..."
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
          <span>Total: {totalCount} pengguna diblokir</span>
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
              {LIMIT_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Blocked Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="mt-4 text-gray-500">Memuat pengguna yang diblokir...</p>
          </div>
        ) : blockedUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Shield size={48} className="mx-auto text-emerald-400 mb-4" />
            <p className="text-gray-500">Tidak ada pengguna yang diblokir</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pengguna</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">WhatsApp</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Bergabung</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {blockedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                          <span className="text-red-700 font-semibold text-sm">
                            {user.full_name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.full_name}</p>
                          <p className="text-xs text-gray-500">{user.user_id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-gray-600">{user.email || '-'}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {user.whatsapp ? (
                        <a
                          href={`https://wa.me/${cleanWhatsApp(user.whatsapp)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
                        >
                          <MessageCircle size={14} />
                          {user.whatsapp}
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden lg:table-cell">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleUnblock(user.user_id, user.full_name || 'Pengguna')}
                        disabled={actionLoading === user.user_id}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg disabled:opacity-50"
                      >
                        {actionLoading === user.user_id ? (
                          <div className="animate-spin h-4 w-4 border-2 border-current rounded-full" />
                        ) : (
                          <Unlock size={16} />
                        )}
                        Buka Blokir
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
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg disabled:opacity-50"
            >
              <ChevronLeft size={16} /> Sebelumnya
            </button>
            <span className="text-sm text-gray-500">
              Halaman {page} dari {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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
