import { useState } from 'react'
import { useReferrals, ReferralFilters } from '../../hooks/useReferrals'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Search,
  Gift,
  Users,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Wallet,
} from 'lucide-react'

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'successful', label: 'Successful' },
  { value: 'failed', label: 'Failed' },
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

export default function ReferralManagement() {
  const [activeTab, setActiveTab] = useState<'referrals' | 'withdrawals'>('referrals')
  const [filters, setFilters] = useState<ReferralFilters>({ search: '', status: '' })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const { referrals, withdrawals, loading, totalCount, totalPages, stats, refetch, approveWithdrawal, rejectWithdrawal } = useReferrals(filters, page, limit, activeTab)

  const handleApprove = async (id: string) => {
    setActionLoading(id)
    await approveWithdrawal(id)
    setActionLoading(null)
  }

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to reject this withdrawal?')) return
    setActionLoading(id)
    await rejectWithdrawal(id)
    setActionLoading(null)
  }

  const formatCurrency = (amount: number) => `Rp ${amount.toLocaleString('id-ID')}`
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Referrers" value={stats.totalReferrers} icon={Users} color="bg-blue-500" />
        <StatCard title="Total Referrals" value={stats.totalReferrals} icon={Gift} color="bg-emerald-500" />
        <StatCard title="Successful Referrals" value={stats.successfulReferrals} icon={CheckCircle} color="bg-purple-500" />
        <StatCard title="Total Commission" value={formatCurrency(stats.totalCommission)} icon={DollarSign} color="bg-amber-500" />
      </div>

      {/* Pending Alert */}
      {stats.pendingWithdrawals > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-lg"><Clock className="text-amber-600" size={24} /></div>
            <div>
              <p className="text-amber-900 font-semibold">{stats.pendingWithdrawals} pending withdrawals</p>
              <p className="text-amber-700 text-sm">Require your approval</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as 'referrals' | 'withdrawals'); setPage(1) }}>
        <TabsList>
          <TabsTrigger value="referrals" className="gap-2"><Gift size={16} /> Referrals</TabsTrigger>
          <TabsTrigger value="withdrawals" className="gap-2"><Wallet size={16} /> Withdrawals</TabsTrigger>
        </TabsList>

        <TabsContent value="referrals" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                  <Input placeholder="Search by referrer or referred user..." value={filters.search} onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setPage(1) }} className="pl-10" />
                </div>
                <div className="flex gap-2">
                  <select value={filters.status} onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1) }} className="px-3 py-2 border border-input rounded-md bg-background text-sm">
                    {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <Button variant="outline" size="icon" onClick={refetch}><RefreshCw size={18} /></Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            {loading ? (
              <div className="p-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div></div>
            ) : referrals.length === 0 ? (
              <div className="p-12 text-center"><Gift size={48} className="mx-auto text-muted-foreground/50 mb-4" /><p className="text-muted-foreground">No referrals found</p></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referrer</TableHead>
                    <TableHead>Referred User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals.map((ref) => (
                    <TableRow key={ref.id}>
                      <TableCell><p className="font-medium">{ref.referrer_name}</p><p className="text-sm text-muted-foreground">{ref.referrer_email}</p></TableCell>
                      <TableCell><p className="font-medium">{ref.referred_name}</p><p className="text-sm text-muted-foreground">{ref.referred_email}</p></TableCell>
                      <TableCell><Badge variant={ref.status === 'successful' ? 'success' : ref.status === 'failed' ? 'destructive' : 'warning'}>{ref.status}</Badge></TableCell>
                      <TableCell className="font-medium">{formatCurrency(ref.commission)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(ref.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={16} /> Previous</Button>
                <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next <ChevronRight size={16} /></Button>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals" className="space-y-4">
          <Card>
            {loading ? (
              <div className="p-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div></div>
            ) : withdrawals.length === 0 ? (
              <div className="p-12 text-center"><Wallet size={48} className="mx-auto text-muted-foreground/50 mb-4" /><p className="text-muted-foreground">No withdrawals found</p></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Bank</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.map((w) => (
                    <TableRow key={w.id}>
                      <TableCell><p className="font-medium">{w.user_name}</p><p className="text-sm text-muted-foreground">{w.user_email}</p></TableCell>
                      <TableCell className="font-medium">{formatCurrency(w.amount)}</TableCell>
                      <TableCell><p className="font-medium">{w.bank_name}</p><p className="text-sm text-muted-foreground">{w.account_number}</p></TableCell>
                      <TableCell><Badge variant={w.status === 'approved' ? 'success' : w.status === 'rejected' ? 'destructive' : 'warning'}>{w.status}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(w.created_at)}</TableCell>
                      <TableCell>
                        {w.status === 'pending' && (
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleApprove(w.id)} disabled={actionLoading === w.id}><Check size={18} className="text-emerald-600" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleReject(w.id)} disabled={actionLoading === w.id}><X size={18} className="text-destructive" /></Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
