import { useState } from 'react'
import { useUsers, UserFilters } from '../../hooks/useUsers'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Shield, 
  User,
  ChevronLeft,
  ChevronRight,
  Crown,
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
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      admin: 'default',
      moderator: 'secondary',
      user: 'outline',
    }
    return (
      <Badge variant={variants[role] || 'outline'}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header & Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={filters.search}
                onChange={(e) => {
                  setFilters({ ...filters, search: e.target.value })
                  setPage(1)
                }}
                className="pl-10"
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
                className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:ring-2 focus:ring-ring"
              >
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>

              <select
                value={filters.isVerified}
                onChange={(e) => {
                  setFilters({ ...filters, isVerified: e.target.value })
                  setPage(1)
                }}
                className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:ring-2 focus:ring-ring"
              >
                {VERIFIED_OPTIONS.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
              </select>

              <select
                value={filters.isPremium}
                onChange={(e) => {
                  setFilters({ ...filters, isPremium: e.target.value })
                  setPage(1)
                }}
                className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:ring-2 focus:ring-ring"
              >
                {PREMIUM_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>

              <Button variant="outline" onClick={refetch}>
                <RefreshCw size={18} className="mr-2" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>Total: {totalCount} users</span>
            <div className="flex items-center gap-2">
              <span>Show:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value))
                  setPage(1)
                }}
                className="border border-input rounded px-2 py-1 bg-background"
              >
                {LIMIT_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <User size={48} className="mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No users found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Premium</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {user.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{user.full_name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>
                    {user.is_verified ? (
                      <Badge variant="success" className="gap-1">
                        <CheckCircle size={14} /> Verified
                      </Badge>
                    ) : (
                      <Badge variant="warning" className="gap-1">
                        <XCircle size={14} /> Unverified
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.profile?.is_premium ? (
                      <Badge variant="warning" className="gap-1">
                        <Crown size={14} /> Premium
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">Free</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(user.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleVerify(user.id, user.is_verified)}
                        disabled={actionLoading === user.id}
                        title={user.is_verified ? 'Unverify' : 'Verify'}
                      >
                        {actionLoading === user.id ? (
                          <div className="animate-spin h-4 w-4 border-2 border-current rounded-full" />
                        ) : user.is_verified ? (
                          <CheckCircle size={18} className="text-emerald-600" />
                        ) : (
                          <Shield size={18} className="text-amber-600" />
                        )}
                      </Button>

                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={actionLoading === user.id}
                        className="text-sm border border-input rounded px-2 py-1 bg-background"
                      >
                        <option value="user">User</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(user.id)}
                        disabled={actionLoading === user.id}
                        className="text-destructive hover:text-destructive"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft size={16} className="mr-1" /> Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
