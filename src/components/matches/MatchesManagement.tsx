import { useState } from 'react'
import { useMatches, MatchFilters } from '../../hooks/useMatches'
import { MatchRequest } from '../../types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Search, Heart, Clock, CheckCircle, XCircle, Trash2, RefreshCw, ChevronLeft, ChevronRight, ArrowRight, Eye } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'completed', label: 'Completed' },
]

const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: number; icon: React.ElementType; color: string }) => (
  <Card><CardContent className="p-4"><div className="flex items-start justify-between"><div><p className="text-sm text-muted-foreground mb-1">{title}</p><h3 className="text-2xl font-bold">{value}</h3></div><div className={`p-2 rounded-lg ${color}`}><Icon size={20} className="text-white" /></div></div></CardContent></Card>
)

export default function MatchesManagement() {
  const [filters, setFilters] = useState<MatchFilters>({ status: '', search: '' })
  const [page, setPage] = useState(1)
  const [selectedMatch, setSelectedMatch] = useState<MatchRequest | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const { matches, loading, totalCount, totalPages, stats, refetch, updateStatus, deleteMatch } = useMatches(filters, page)

  const handleStatusChange = async (id: string, status: MatchRequest['status']) => {
    setActionLoading(id)
    await updateStatus(id, status)
    setActionLoading(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this match request?')) return
    setActionLoading(id)
    await deleteMatch(id)
    setActionLoading(null)
  }

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'warning' | 'success' | 'destructive' | 'default'> = { pending: 'warning', accepted: 'success', rejected: 'destructive', completed: 'default' }
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Pending" value={stats.pending} icon={Clock} color="bg-amber-500" />
        <StatCard title="Accepted" value={stats.accepted} icon={CheckCircle} color="bg-emerald-500" />
        <StatCard title="Rejected" value={stats.rejected} icon={XCircle} color="bg-red-500" />
        <StatCard title="Completed" value={stats.completed} icon={Heart} color="bg-pink-500" />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input placeholder="Search by name..." value={filters.search} onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setPage(1) }} className="pl-10" />
            </div>
            <div className="flex gap-2">
              <select value={filters.status} onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1) }} className="px-3 py-2 border border-input rounded-md bg-background text-sm">
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <Button variant="outline" size="icon" onClick={refetch}><RefreshCw size={18} /></Button>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Total: {totalCount} matches</p>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="p-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div></div>
        ) : matches.length === 0 ? (
          <div className="p-12 text-center"><Heart size={48} className="mx-auto text-muted-foreground/50 mb-4" /><p className="text-muted-foreground">No matches found</p></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Requester</TableHead>
                <TableHead></TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matches.map((match) => (
                <TableRow key={match.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center"><span className="text-pink-600 font-semibold">{match.requester_name?.charAt(0)}</span></div>
                      <div><p className="font-medium">{match.requester_name}</p><p className="text-sm text-muted-foreground">{match.requester_gender}</p></div>
                    </div>
                  </TableCell>
                  <TableCell><ArrowRight size={20} className="text-muted-foreground" /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"><span className="text-blue-600 font-semibold">{match.target_name?.charAt(0)}</span></div>
                      <div><p className="font-medium">{match.target_name}</p><p className="text-sm text-muted-foreground">{match.target_gender}</p></div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(match.status)}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(match.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedMatch(match)}><Eye size={18} /></Button>
                      {match.status === 'pending' && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => handleStatusChange(match.id, 'accepted')} disabled={actionLoading === match.id}><CheckCircle size={18} className="text-emerald-600" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleStatusChange(match.id, 'rejected')} disabled={actionLoading === match.id}><XCircle size={18} className="text-red-600" /></Button>
                        </>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(match.id)} disabled={actionLoading === match.id} className="text-destructive"><Trash2 size={18} /></Button>
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
      <Dialog open={!!selectedMatch} onOpenChange={() => setSelectedMatch(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Match Details</DialogTitle></DialogHeader>
          {selectedMatch && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-2"><span className="text-2xl text-pink-600 font-bold">{selectedMatch.requester_name?.charAt(0)}</span></div>
                  <p className="font-medium">{selectedMatch.requester_name}</p>
                </div>
                <Heart className="text-pink-500" size={32} />
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2"><span className="text-2xl text-blue-600 font-bold">{selectedMatch.target_name?.charAt(0)}</span></div>
                  <p className="font-medium">{selectedMatch.target_name}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Status:</span> {getStatusBadge(selectedMatch.status)}</div>
                <div><span className="text-muted-foreground">Date:</span> {formatDate(selectedMatch.created_at)}</div>
              </div>
              {selectedMatch.message && <div><p className="text-sm text-muted-foreground">Message:</p><p className="bg-muted p-3 rounded-lg">{selectedMatch.message}</p></div>}
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setSelectedMatch(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
