import { useState } from 'react'
import { useReports, ReportFilters } from '../../hooks/useReports'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Search, Flag, AlertCircle, CheckCircle, XCircle, Eye, RefreshCw, ChevronLeft, ChevronRight, Clock, Check, X, Ban } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'open', label: 'Open' },
  { value: 'investigating', label: 'Investigating' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
]

const REASON_OPTIONS = [
  { value: '', label: 'All Reasons' },
  { value: 'Inappropriate content', label: 'Inappropriate content' },
  { value: 'Fake profile', label: 'Fake profile' },
  { value: 'Harassment', label: 'Harassment' },
  { value: 'Spam', label: 'Spam' },
  { value: 'Scam/Fraud', label: 'Scam/Fraud' },
  { value: 'Other', label: 'Other' },
]

const LIMIT_OPTIONS = [10, 25, 50]

const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: number; icon: React.ElementType; color: string }) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
        <div className={`p-2 rounded-lg ${color}`}><Icon size={20} className="text-white" /></div>
      </div>
    </CardContent>
  </Card>
)

export default function ReportsManagement() {
  const [filters, setFilters] = useState<ReportFilters>({ search: '', status: '', reason: '' })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

  const { reports, loading, totalCount, totalPages, stats, refetch, updateStatus, blockUser } = useReports(filters, page, limit)

  const handleStatusChange = async (reportId: string, newStatus: string) => {
    setActionLoading(reportId)
    await updateStatus(reportId, newStatus, notes)
    setActionLoading(null)
    setNotes('')
    if (showDetailModal) { setShowDetailModal(false); setSelectedReport(null) }
  }

  const handleBlockUser = async (userId: string) => {
    if (!confirm('Block this user?')) return
    setActionLoading(userId)
    await blockUser(userId)
    setActionLoading(null)
  }

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'warning' | 'success' | 'secondary'> = { open: 'destructive' as any, investigating: 'warning', resolved: 'success', dismissed: 'secondary' }
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Open Reports" value={stats.open} icon={AlertCircle} color="bg-red-500" />
        <StatCard title="Investigating" value={stats.investigating} icon={Clock} color="bg-amber-500" />
        <StatCard title="Resolved" value={stats.resolved} icon={CheckCircle} color="bg-emerald-500" />
        <StatCard title="Dismissed" value={stats.dismissed} icon={XCircle} color="bg-gray-500" />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input placeholder="Search..." value={filters.search} onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setPage(1) }} className="pl-10" />
            </div>
            <div className="flex flex-wrap gap-2">
              <select value={filters.status} onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1) }} className="px-3 py-2 border border-input rounded-md bg-background text-sm">
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select value={filters.reason} onChange={(e) => { setFilters({ ...filters, reason: e.target.value }); setPage(1) }} className="px-3 py-2 border border-input rounded-md bg-background text-sm">
                {REASON_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <Button variant="outline" size="icon" onClick={refetch}><RefreshCw size={18} /></Button>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>Total: {totalCount} reports</span>
            <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1) }} className="border border-input rounded px-2 py-1 bg-background">
              {LIMIT_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="p-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div></div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center"><Flag size={48} className="mx-auto text-muted-foreground/50 mb-4" /><p className="text-muted-foreground">No reports found</p></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reporter</TableHead>
                <TableHead>Reported User</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell><p className="font-medium">{report.reporter_name}</p></TableCell>
                  <TableCell><p className="font-medium">{report.reported_name}</p></TableCell>
                  <TableCell><Badge variant="outline">{report.reason}</Badge></TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatDate(report.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setSelectedReport(report); setShowDetailModal(true) }}><Eye size={18} /></Button>
                      {report.status === 'open' && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => handleStatusChange(report.id, 'resolved')} disabled={actionLoading === report.id}><Check size={18} className="text-emerald-600" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleStatusChange(report.id, 'dismissed')} disabled={actionLoading === report.id}><X size={18} className="text-muted-foreground" /></Button>
                        </>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleBlockUser(report.reported_id)} disabled={actionLoading === report.reported_id}><Ban size={18} className="text-destructive" /></Button>
                    </div>
                  </TableCell>
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

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Report Details</DialogTitle></DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-muted-foreground">Reporter</p><p className="font-medium">{selectedReport.reporter_name}</p></div>
                <div><p className="text-sm text-muted-foreground">Reported User</p><p className="font-medium">{selectedReport.reported_name}</p></div>
                <div><p className="text-sm text-muted-foreground">Reason</p><Badge variant="outline">{selectedReport.reason}</Badge></div>
                <div><p className="text-sm text-muted-foreground">Status</p>{getStatusBadge(selectedReport.status)}</div>
              </div>
              <div><p className="text-sm text-muted-foreground">Description</p><p className="bg-muted p-3 rounded-lg">{selectedReport.description || 'No description'}</p></div>
              <div><label className="text-sm font-medium">Admin Notes</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full mt-1 p-3 border border-input rounded-lg" rows={3} placeholder="Add notes..." /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>Close</Button>
            {selectedReport?.status === 'open' && (
              <>
                <Button variant="outline" onClick={() => handleStatusChange(selectedReport.id, 'investigating')}>Investigate</Button>
                <Button onClick={() => handleStatusChange(selectedReport.id, 'resolved')}>Resolve</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
