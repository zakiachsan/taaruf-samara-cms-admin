import { useState } from 'react'
import { useUsers, UserFilters } from '../../hooks/useUsers'
import { 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Shield, 
  User,
  ChevronLeft,
  ChevronRight,
  Crown,
  Calendar,
  Mail,
  RefreshCw
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
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const { 
    users, 
    loading, 
    totalCount, 
    totalPages, 
    refetch,
    verifyUser, 
    deleteUser, 
    changeRole 
  } = useUsers(filters, page, limit)

  const handleVerify = async (userId: string, currentStatus: boolean) => {
    setActionLoading(userId)
    await verifyUser(userId, !currentStatus)
    setActionLoading(null)
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    setActionLoading(userId)
    await deleteUser(userId)
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

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-700',
      moderator: 'bg-blue-100 text-blue-700',
      user: 'bg-gray-100 text-gray-700',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[role as keyof typeof styles] || styles.user}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    )
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
          <div className="flex flex-wrap gap-2">
            <select
              value={filters.role}
              onChange={(e) => {
                setFilters({ ...filters, role: e.target.value })
                setPage(1)
              }}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>

            <select
              value={filters.isVerified}
              onChange={(e) => {
                setFilters({ ...filters, isVerified: e.target.value })
                setPage(1)
              }}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              {VERIFIED_OPTIONS.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
            </select>

            <select
              value={filters.isPremium}
              onChange={(e) => {
                setFilters({ ...filters, isPremium: e.target.value })
                setPage(1)
              }}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              {PREMIUM_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>

            <button
              onClick={refetch}
              className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw size={18} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>Total: {totalCount} users</span>
          <div className="flex items-center gap-2">
            <span>Show:</span>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Premium</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
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
                          <p className="font-medium text-gray-900">{user.full_name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                    <td className="px-4 py-3">
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
                    <td className="px-4 py-3">
                      {user.profile?.is_premium ? (
                        <span className="flex items-center gap-1 text-amber-600 text-sm">
                          <Crown size={16} /> Premium
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Free</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleVerify(user.id, user.is_verified)}
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

                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          disabled={actionLoading === user.id}
                          className="text-sm border border-gray-200 rounded px-2 py-1"
                        >
                          <option value="user">User</option>
                          <option value="moderator">Moderator</option>
                          <option value="admin">Admin</option>
                        </select>

                        <button
                          onClick={() => handleDelete(user.id)}
                          disabled={actionLoading === user.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
