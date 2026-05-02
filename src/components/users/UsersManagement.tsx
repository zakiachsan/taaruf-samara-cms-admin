import { useState } from 'react'
import { useUsers, type UserFilters } from '../../hooks/useUsers'
import UserDetail from './UserDetail'
import {
  Search,
  CheckCircle,
  XCircle,
  Ban,
  Unlock,
  Shield,
  User,
  ChevronLeft,
  ChevronRight,
  Crown,
  Award,
  RefreshCw,
  ExternalLink,
  Trash2,
  Phone,
  MessageCircle,
} from 'lucide-react'

const ROLES = [
  { value: '', label: 'Semua Peran' },
  { value: 'user', label: 'Pengguna' },
  { value: 'admin', label: 'Admin' },
  { value: 'moderator', label: 'Moderator' },
]

const VERIFIED_OPTIONS = [
  { value: '', label: 'Semua Status' },
  { value: 'true', label: 'Terverifikasi' },
  { value: 'false', label: 'Belum Terverifikasi' },
]

const PREMIUM_OPTIONS = [
  { value: '', label: 'Semua Pengguna' },
  { value: 'true', label: 'Premium' },
  { value: 'false', label: 'Gratis' },
]

const LIMIT_OPTIONS = [10, 25, 50]

export default function UsersManagement() {
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: '',
    isVerified: '',
    isPremium: '',
  })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<{ userId: string; userName: string } | null>(null)
  const [verifyModal, setVerifyModal] = useState<{
    open: boolean
    userId: string | null
    currentStatus: boolean
    userName: string
    userPhone?: string
  }>({ open: false, userId: null, currentStatus: false, userName: '' })
  const [sendWANotif, setSendWANotif] = useState(false)

  const [blockModal, setBlockModal] = useState<{
    open: boolean
    userId: string | null
    userName: string
  }>({ open: false, userId: null, userName: '' })

  const [unblockModal, setUnblockModal] = useState<{
    open: boolean
    userId: string | null
    userName: string
  }>({ open: false, userId: null, userName: '' })

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean
    userId: string | null
    userName: string
  }>({ open: false, userId: null, userName: '' })

  const {
    users,
    loading,
    totalCount,
    totalPages,
    error,
    refetch,
    verifyUser,
    blockUser,
    unblockUser,
    changeRole,
    deleteUser
  } = useUsers(filters, page, limit)

  const handleVerify = (userId: string, currentStatus: boolean, userName: string, userPhone?: string) => {
    setVerifyModal({ open: true, userId, currentStatus, userName, userPhone })
    setSendWANotif(false)
  }

  const confirmVerify = async () => {
    if (!verifyModal.userId) return
    setActionLoading(verifyModal.userId)
    await verifyUser(verifyModal.userId, !verifyModal.currentStatus)

    setActionLoading(null)
    setVerifyModal({ open: false, userId: null, currentStatus: false, userName: '' })
    setSendWANotif(false)
  }

  const handleBlock = (userId: string, userName: string) => {
    setBlockModal({ open: true, userId, userName })
  }

  const confirmBlock = async () => {
    if (!blockModal.userId) return
    setActionLoading(blockModal.userId)
    setBlockModal({ open: false, userId: null, userName: '' })
    await blockUser(blockModal.userId)
    setActionLoading(null)
  }

  const handleUnblock = (userId: string, userName: string) => {
    setUnblockModal({ open: true, userId, userName })
  }

  const confirmUnblock = async () => {
    if (!unblockModal.userId) return
    setActionLoading(unblockModal.userId)
    setUnblockModal({ open: false, userId: null, userName: '' })
    await unblockUser(unblockModal.userId)
    setActionLoading(null)
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    setActionLoading(userId)
    await changeRole(userId, newRole)
    setActionLoading(null)
  }

  const handleDelete = (userId: string, userName: string) => {
    setDeleteModal({ open: true, userId, userName })
  }

  const confirmDelete = async () => {
    if (!deleteModal.userId) return
    setActionLoading(deleteModal.userId)
    setDeleteModal({ open: false, userId: null, userName: '' })
    const result = await deleteUser(deleteModal.userId)
    setActionLoading(null)
    if (!result.success && result.error) {
      alert('Gagal menghapus pengguna: ' + result.error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-4">
      {/* Header & Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
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
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-2">
            <select
              value={filters.role}
              onChange={(e) => {
                setFilters({ ...filters, role: e.target.value })
                setPage(1)
              }}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 flex-1"
            >
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>

            <select
              value={filters.isVerified}
              onChange={(e) => {
                setFilters({ ...filters, isVerified: e.target.value })
                setPage(1)
              }}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 flex-1"
            >
              {VERIFIED_OPTIONS.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
            </select>

            <select
              value={filters.isPremium}
              onChange={(e) => {
                setFilters({ ...filters, isPremium: e.target.value })
                setPage(1)
              }}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 flex-1"
            >
              {PREMIUM_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>

            <button
              onClick={refetch}
              className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw size={18} />
              <span className="hidden sm:inline">Segarkan</span>
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
          <span>Total: {totalCount} pengguna</span>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="hidden sm:inline">Tampilkan:</span>
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

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="mt-4 text-gray-500">Memuat pengguna...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <XCircle size={48} className="mx-auto text-red-400 mb-4" />
            <p className="text-red-600 font-medium mb-2">Gagal memuat pengguna</p>
            <p className="text-gray-500 text-sm mb-4">{error}</p>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <User size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Tidak ada pengguna ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pengguna</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Peran</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Verifikasi</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Keanggotaan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Bergabung</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">WhatsApp</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                          <span className="text-emerald-700 font-semibold">
                            {user.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <button
                            onClick={() => setSelectedUser({ userId: user.id, userName: user.full_name })}
                            className="font-medium text-gray-900 hover:text-emerald-600 flex items-center gap-1 transition-colors"
                          >
                            {user.full_name}
                            <ExternalLink size={14} />
                          </button>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          {user.profile?.whatsapp && (
                            <p className="text-xs text-emerald-600 flex items-center gap-1">
                              <Phone size={10} /> {user.profile.whatsapp}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {user.is_blocked ? (
                        <span className="flex items-center gap-1 text-red-600 text-sm">
                          <Ban size={16} /> Diblokir
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-emerald-600 text-sm">
                          <CheckCircle size={16} /> Aktif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={actionLoading === user.id}
                        className="text-sm border border-gray-200 rounded px-2 py-1 bg-white"
                      >
                        <option value="user">Pengguna</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {user.is_verified ? (
                        <span className="flex items-center gap-1 text-emerald-600 text-sm">
                          <CheckCircle size={16} /> Terverifikasi
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-600 text-sm">
                          <XCircle size={16} /> Belum Terverifikasi
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex flex-col gap-1">
                        {user.profile?.is_premium ? (
                          <span className="flex items-center gap-1 text-amber-600 text-sm">
                            <Crown size={16} /> Premium
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">Gratis</span>
                        )}
                        {user.profile?.has_bedah_value_cert && (
                          <span className="flex items-center gap-1 text-emerald-600 text-sm">
                            <Award size={16} /> Bersertifikat
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden lg:table-cell">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {user.profile?.whatsapp ? (
                        <a
                          href={`https://wa.me/${user.profile.whatsapp.replace(/\D/g, '').replace(/^0/, '62')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
                        >
                          <MessageCircle size={14} />
                          {user.profile.whatsapp}
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleVerify(user.id, user.is_verified, user.full_name, user.profile?.whatsapp)}
                          disabled={actionLoading === user.id}
                          className={`p-2 rounded-lg transition-colors ${
                            user.is_verified
                              ? 'text-emerald-600 hover:bg-emerald-50'
                              : 'text-amber-600 hover:bg-amber-50'
                          }`}
                          title={user.is_verified ? 'Batalkan Verifikasi' : 'Verifikasi'}
                        >
                          {actionLoading === user.id ? (
                            <div className="animate-spin h-4 w-4 border-2 border-current rounded-full" />
                          ) : user.is_verified ? (
                            <CheckCircle size={18} />
                          ) : (
                            <Shield size={18} />
                          )}
                        </button>

                        <button
                          onClick={() => user.is_blocked ? handleUnblock(user.id, user.full_name) : handleBlock(user.id, user.full_name)}
                          disabled={actionLoading === user.id}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title={user.is_blocked ? 'Buka Blokir' : 'Blokir'}
                        >
                          {actionLoading === user.id ? (
                            <div className="animate-spin h-4 w-4 border-2 border-current rounded-full" />
                          ) : user.is_blocked ? (
                            <Unlock size={18} />
                          ) : (
                            <Ban size={18} />
                          )}
                        </button>

                        <button
                          onClick={() => handleDelete(user.id, user.full_name)}
                          disabled={actionLoading === user.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Pengguna"
                        >
                          {actionLoading === user.id ? (
                            <div className="animate-spin h-4 w-4 border-2 border-current rounded-full" />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-2 md:px-3 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
            >
              <ChevronLeft size={16} /> <span className="hidden sm:inline">Sebelumnya</span>
            </button>
            <span className="text-xs md:text-sm text-gray-500">
              Halaman {page} dari {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-2 md:px-3 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
            >
              <span className="hidden sm:inline">Berikutnya</span> <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Verify Confirmation Modal */}
      {verifyModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setVerifyModal({ open: false, userId: null, currentStatus: false, userName: '' })}
          />
          {/* Modal */}
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4 animate-in fade-in zoom-in-95">
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {verifyModal.currentStatus ? 'Batalkan Verifikasi Pengguna' : 'Verifikasi Pengguna'}
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  {verifyModal.currentStatus
                    ? `Apakah Anda yakin ingin membatalkan verifikasi ${verifyModal.userName}? Mereka akan kehilangan status terverifikasi.`
                    : `Apakah Anda yakin ingin memverifikasi ${verifyModal.userName}? Mereka akan menerima lencana terverifikasi.`}
                </p>
                {!verifyModal.currentStatus && verifyModal.userPhone && (
                  <label className="mt-3 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendWANotif}
                      onChange={(e) => setSendWANotif(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-700">Kirim notifikasi WhatsApp</span>
                  </label>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setVerifyModal({ open: false, userId: null, currentStatus: false, userName: '' })}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={confirmVerify}
                  disabled={actionLoading !== null}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${
                    verifyModal.currentStatus
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {actionLoading !== null ? 'Memuat...' : (verifyModal.currentStatus ? 'Batalkan Verifikasi' : 'Verifikasi')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Block Confirmation Modal */}
      {blockModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setBlockModal({ open: false, userId: null, userName: '' })}
          />
          {/* Modal */}
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4 animate-in fade-in zoom-in-95">
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Blokir Pengguna
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Apakah Anda yakin ingin memblokir {blockModal.userName}? Mereka tidak akan dapat masuk ke aplikasi.
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setBlockModal({ open: false, userId: null, userName: '' })}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={confirmBlock}
                  disabled={actionLoading !== null}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {actionLoading !== null ? 'Memuat...' : 'Blokir'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unblock Confirmation Modal */}
      {unblockModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setUnblockModal({ open: false, userId: null, userName: '' })}
          />
          {/* Modal */}
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4 animate-in fade-in zoom-in-95">
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Buka Blokir Pengguna
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Apakah Anda yakin ingin membuka blokir {unblockModal.userName}? Mereka akan dapat masuk ke aplikasi lagi.
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setUnblockModal({ open: false, userId: null, userName: '' })}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={confirmUnblock}
                  disabled={actionLoading !== null}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {actionLoading !== null ? 'Memuat...' : 'Buka Blokir'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDeleteModal({ open: false, userId: null, userName: '' })}
          />
          {/* Modal */}
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4 animate-in fade-in zoom-in-95">
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-lg font-semibold text-red-700">
                  Hapus Pengguna Permanen
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Apakah Anda yakin ingin menghapus <strong>{deleteModal.userName}</strong> secara permanen? Semua data pengguna (profil, chat, langganan, dsb.) akan dihapus dan tidak bisa dikembalikan.
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteModal({ open: false, userId: null, userName: '' })}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={actionLoading !== null}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {actionLoading !== null ? 'Memuat...' : 'Hapus Permanen'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetail
          userId={selectedUser.userId}
          userName={selectedUser.userName}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  )
}
