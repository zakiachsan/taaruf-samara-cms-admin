import { useState } from 'react'
import { usePremium, PremiumFilters } from '../../hooks/usePremium'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import {
  Search,
  Crown,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Ban,
} from 'lucide-react'

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'basic', label: 'Basic' },
  { value: 'premium', label: 'Premium' },
]

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'cancelled', label: 'Cancelled' },
]

const EXPIRING_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'week', label: 'Expiring This Week' },
  { value: 'month', label: 'Expiring This Month' },
]

const LIMIT_OPTIONS = [10, 25, 50]

const StatCard = ({ title, value, icon: Icon, color, subtitle }: { title: string; value: string | number; icon: React.ElementType; color: string; subtitle?: string }) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <h3 className="text-xl font-bold">{value}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
)

export default function PremiumManagement() {
  const [filters, setFilters] = useState<PremiumFilters>({
    search: '',
    type: '',
    status: '',
    expiringSoon: '',
  })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showExtendModal, setShowExtendModal] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<{ id: string; user_name: string; end_date: string } | null>(null)
  const [extendDate, setExtendDate] = useState('')

  const {
    subscriptions,
    loading,
    totalCount,
    totalPages,
    stats,
    refetch,
    extendSubscription,
    cancelSubscription,
  } = usePremium(filters, page, limit)

  const handleExtend = async () => {
    if (!selectedSubscription || !extendDate) return
    setActionLoading(selectedSubscription.id)
    await extendSubscription(selectedSubscription.id, extendDate)
    setActionLoading(null)
    setShowExtendModal(false)
    setSelectedSubscription(null)
    setExtendDate('')
  }

  const handleCancel = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) return
    setActionLoading(subscriptionId)
    await cancelSubscription(subscriptionId)
    setActionLoading(null)
  }

  const formatCurrency = (amount: number) => `Rp ${amount.toLocaleString('id-ID')}`
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

  const isExpiringSoon = (endDate: string) => {
    const daysUntilExpiry = Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={formatCurrency(stats.totalRevenue)} icon={DollarSign} color="bg-emerald-500" />
        <StatCard title="Basic Revenue" value={formatCurrency(stats.basicRevenue)} icon={TrendingUp} color="bg-blue-500" subtitle="Subscriptions" />
        <StatCard title="Premium Revenue" value={formatCurrency(stats.premiumRevenue)} icon={Crown} color="bg-amber-500" subtitle="Subscriptions" />
        <StatCard title="Active Subscriptions" value={stats.activeSubscriptions} icon={CheckCircle} color="bg-purple-500" />
      </div>

      {/* Expiry Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <AlertTriangle className="text-amber-600" size={24} />
            </div>
            <div>
              <p className="text-amber-900 font-semibold">{stats.expiringThisWeek} subscriptions</p>
              <p className="text-amber-700 text-sm">Expiring within 7 days</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="text-orange-600" size={24} />
            </div>
            <div>
              <p className="text-orange-900 font-semibold">{stats.expiringThisMonth} subscriptions</p>
              <p className="text-orange-700 text-sm">Expiring within 30 days</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="Search by user name or email..."
                value={filters.search}
                onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setPage(1) }}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select value={filters.type} onChange={(e) => { setFilters({ ...filters, type: e.target.value }); setPage(1) }} className="px-3 py-2 border border-input rounded-md bg-background text-sm">
                {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select value={filters.status} onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1) }} className="px-3 py-2 border border-input rounded-md bg-background text-sm">
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select value={filters.expiringSoon} onChange={(e) => { setFilters({ ...filters, expiringSoon: e.target.value }); setPage(1) }} className="px-3 py-2 border border-input rounded-md bg-background text-sm">
                {EXPIRING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <Button variant="outline" size="icon" onClick={refetch}><RefreshCw size={18} /></Button>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>Total: {totalCount} subscriptions</span>
            <div className="flex items-center gap-2">
              <span>Show:</span>
              <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1) }} className="border border-input rounded px-2 py-1 bg-background">
                {LIMIT_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading subscriptions...</p>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="p-12 text-center">
            <Crown size={48} className="mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No subscriptions found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{sub.user_name}</p>
                      <p className="text-sm text-muted-foreground">{sub.user_email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={sub.type === 'premium' ? 'default' : 'secondary'} className="gap-1">
                      <Crown size={12} /> {sub.type.charAt(0).toUpperCase() + sub.type.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={sub.status === 'active' ? 'success' : sub.status === 'cancelled' ? 'destructive' : 'secondary'}>
                      {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(sub.amount)}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(sub.start_date)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={isExpiringSoon(sub.end_date) ? 'text-amber-600 font-medium' : 'text-muted-foreground'}>{formatDate(sub.end_date)}</span>
                      {isExpiringSoon(sub.end_date) && <AlertTriangle size={16} className="text-amber-500" />}
                    </div>
                  </TableCell>
                  <TableCell>
                    {sub.status === 'active' && (
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedSubscription(sub); setExtendDate(sub.end_date.split('T')[0]); setShowExtendModal(true) }} title="Extend">
                          <Edit2 size={18} className="text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleCancel(sub.id)} disabled={actionLoading === sub.id} className="text-destructive" title="Cancel">
                          {actionLoading === sub.id ? <div className="animate-spin h-4 w-4 border-2 border-current rounded-full" /> : <Ban size={18} />}
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft size={16} className="mr-1" /> Previous
            </Button>
            <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              Next <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
        )}
      </Card>

      {/* Extend Modal */}
      <Dialog open={showExtendModal} onOpenChange={setShowExtendModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend Subscription</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">Extend subscription for <strong>{selectedSubscription?.user_name}</strong></p>
          <div className="space-y-2">
            <label className="text-sm font-medium">New End Date</label>
            <Input type="date" value={extendDate} onChange={(e) => setExtendDate(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowExtendModal(false); setSelectedSubscription(null); setExtendDate('') }}>Cancel</Button>
            <Button onClick={handleExtend} disabled={!extendDate || actionLoading === selectedSubscription?.id}>
              {actionLoading === selectedSubscription?.id ? 'Saving...' : 'Extend'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
