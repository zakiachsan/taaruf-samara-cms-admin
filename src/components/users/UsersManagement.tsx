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
} from 'lucide-react'

const ROLES = [
  { value: '', label: 'All Roles' },
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
  { value: 'moderator', label: 'Moderator' },
]

const VERIFIED_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'true', label: 'Verified' },
  { value: 'false', label: 'Unverified' },
]

const PREMIUM_OPTIONS = [
  { value: '', label: 'All Users' },
  { value: 'true', label: 'Premium' },
  { value: 'false', label: 'Free' },
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
  }>({ open: false, userId: null, currentStatus: false, userName: '' })

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
    changeRole
  } = useUsers(filters, page, limit)

  const handleVerify = (userId: string, currentStatus: boolean, userName: string) => {
    setVerifyModal({ open: true, userId, currentStatus, userName })
  }

  const confirmVerify = async () => {
    if (!verifyModal.userId) return
    setActionLoading(verifyModal.userId)
    setVerifyModal({ open: false, userId: null, currentStatus: false, userName: '' })
    await verifyUser(verifyModal.userId, !verifyModal.currentStatus)
    setActionLoading(null)
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
              placeholder="Search by name or email..."
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
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
          <span>Total: {totalCount} users</span>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="hidden sm:inline">Show:</span>
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
            <p className="mt-4 text-gray-500">Loading users...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <XCircle size={48} className="mx-auto text-red-400 mb-4" />
            <p className="text-red-600 font-medium mb-2">Failed to load users</p>
            <p className="text-gray-500 text-sm mb-4">{error}</p>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <User size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Verification</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Membership</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Joined</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
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
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {user.is_blocked ? (
                        <span className="flex items-center gap-1 text-red-600 text-sm">
                          <Ban size={16} /> Blocked
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-emerald-600 text-sm">
                          <CheckCircle size={16} /> Active
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
                        <option value="user">User</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {user.is_verified ? (
                        <span className="flex items-center gap-1 text-emerald-600 text-sm">
                          <CheckCircle size={16} /> Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-600 text-sm">
                          <XCircle size={16} /> Unverified
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
                          <span className="text-gray-400 text-sm">Free</span>
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
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleVerify(user.id, user.is_verified, user.full_name)}
                          disabled={actionLoading === user.id}
                          className={`p-2 rounded-lg transition-colors ${
                            user.is_verified
                              ? 'text-emerald-600 hover:bg-emerald-50'
                              : 'text-amber-600 hover:bg-amber-50'
                          }`}
                          title={user.is_verified ? 'Unverify' : 'Verify'}
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
                          title={user.is_blocked ? 'Unblock' : 'Block'}
                        >
                          {actionLoading === user.id ? (
                            <div className="animate-spin h-4 w-4 border-2 border-current rounded-full" />
                          ) : user.is_blocked ? (
                            <Unlock size={18} />
                          ) : (
                            <Ban size={18} />
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
              <ChevronLeft size={16} /> <span className="hidden sm:inline">Previous</span>
            </button>
            <span className="text-xs md:text-sm text-gray-500">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-2 md:px-3 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
            >
              <span className="hidden sm:inline">Next</span> <ChevronRight size={16} />
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
                  {verifyModal.currentStatus ? 'Unverify User' : 'Verify User'}
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  {verifyModal.currentStatus
                    ? `Are you sure you want to unverify ${verifyModal.userName}? They will lose their verified status.`
                    : `Are you sure you want to verify ${verifyModal.userName}? They will receive a verified badge.`}
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setVerifyModal({ open: false, userId: null, currentStatus: false, userName: '' })}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
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
                  {actionLoading !== null ? 'Loading...' : (verifyModal.currentStatus ? 'Unverify' : 'Verify')}
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
                  Block User
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Are you sure you want to block {blockModal.userName}? They will not be able to login to the app.
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setBlockModal({ open: false, userId: null, userName: '' })}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBlock}
                  disabled={actionLoading !== null}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {actionLoading !== null ? 'Loading...' : 'Block'}
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
                  Unblock User
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Are you sure you want to unblock {unblockModal.userName}? They will be able to login to the app again.
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setUnblockModal({ open: false, userId: null, userName: '' })}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmUnblock}
                  disabled={actionLoading !== null}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {actionLoading !== null ? 'Loading...' : 'Unblock'}
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
