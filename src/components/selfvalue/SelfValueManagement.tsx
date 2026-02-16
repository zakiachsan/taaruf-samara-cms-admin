import { useState } from 'react'
import { useSelfValue, SelfValueFilters } from '../../hooks/useSelfValue'
import { SelfValueRegistration } from '../../types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Search, Calendar, Clock, CheckCircle, XCircle, RefreshCw, ChevronLeft, ChevronRight, Award, Save } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'registered', label: 'Registered' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: number; icon: React.ElementType; color: string }) => (
  <Card><CardContent className="p-4"><div className="flex items-start justify-between"><div><p className="text-sm text-muted-foreground mb-1">{title}</p><h3 className="text-2xl font-bold">{value}</h3></div><div className={`p-2 rounded-lg ${color}`}><Icon size={20} className="text-white" /></div></div></CardContent></Card>
)

export default function SelfValueManagement() {
  const [filters, setFilters] = useState<SelfValueFilters>({ status: '', search: '' })
  const [page, setPage] = useState(1)
  const [selectedRegistration, setSelectedRegistration] = useState<SelfValueRegistration | null>(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [scheduleData, setScheduleData] = useState({ date: '', time: '', location: '' })
  const [completeData, setCompleteData] = useState({ certificateUrl: '', notes: '' })

  const { registrations, loading, totalCount, totalPages, stats, refetch, scheduleSession, completeSession, cancelSession } = useSelfValue(filters, page)

  const handleSchedule = async () => {
    if (!selectedRegistration || !scheduleData.date || !scheduleData.time) return
    setActionLoading(selectedRegistration.id)
    await scheduleSession(selectedRegistration.id, { ...scheduleData, datetime: `${scheduleData.date}T${scheduleData.time}:00` })
    setActionLoading(null)
    setShowScheduleModal(false)
    setSelectedRegistration(null)
    setScheduleData({ date: '', time: '', location: '' })
  }

  const handleComplete = async () => {
    if (!selectedRegistration || !completeData.certificateUrl) return
    setActionLoading(selectedRegistration.id)
    await completeSession(selectedRegistration.id, completeData)
    setActionLoading(null)
    setShowCompleteModal(false)
    setSelectedRegistration(null)
    setCompleteData({ certificateUrl: '', notes: '' })
  }

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this registration?')) return
    setActionLoading(id)
    await cancelSession(id)
    setActionLoading(null)
  }

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  const formatDateTime = (dateString: string) => new Date(dateString).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'warning' | 'default' | 'success' | 'destructive'> = { registered: 'warning', scheduled: 'default', completed: 'success', cancelled: 'destructive' }
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Registered" value={stats.registered} icon={Clock} color="bg-amber-500" />
        <StatCard title="Scheduled" value={stats.scheduled} icon={Calendar} color="bg-blue-500" />
        <StatCard title="Completed" value={stats.completed} icon={CheckCircle} color="bg-emerald-500" />
        <StatCard title="Cancelled" value={stats.cancelled} icon={XCircle} color="bg-red-500" />
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
          <p className="mt-4 text-sm text-muted-foreground">Total: {totalCount} registrations</p>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="p-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div></div>
        ) : registrations.length === 0 ? (
          <div className="p-12 text-center"><Award size={48} className="mx-auto text-muted-foreground/50 mb-4" /><p className="text-muted-foreground">No registrations found</p></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.map((reg) => (
                <TableRow key={reg.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center"><span className="text-purple-600 font-semibold">{reg.user_name?.charAt(0)}</span></div>
                      <div><p className="font-medium">{reg.user_name}</p><p className="text-sm text-muted-foreground">{reg.user_email}</p></div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(reg.status)}</TableCell>
                  <TableCell className="text-muted-foreground">{reg.scheduled_at ? formatDateTime(reg.scheduled_at) : '-'}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(reg.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {reg.status === 'registered' && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => { setSelectedRegistration(reg); setShowScheduleModal(true) }}><Calendar size={16} className="mr-1" /> Schedule</Button>
                          <Button variant="ghost" size="icon" onClick={() => handleCancel(reg.id)} disabled={actionLoading === reg.id}><XCircle size={18} className="text-destructive" /></Button>
                        </>
                      )}
                      {reg.status === 'scheduled' && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => { setSelectedRegistration(reg); setShowCompleteModal(true) }}><CheckCircle size={16} className="mr-1" /> Complete</Button>
                          <Button variant="ghost" size="icon" onClick={() => handleCancel(reg.id)} disabled={actionLoading === reg.id}><XCircle size={18} className="text-destructive" /></Button>
                        </>
                      )}
                      {reg.status === 'completed' && reg.certificate_url && (
                        <Button variant="outline" size="sm" onClick={() => window.open(reg.certificate_url, '_blank')}><Award size={16} className="mr-1" /> Certificate</Button>
                      )}
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

      {/* Schedule Modal */}
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Schedule Bedah Value Session</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">Schedule for: <strong>{selectedRegistration?.user_name}</strong></p>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium">Date *</label><Input type="date" value={scheduleData.date} onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })} /></div>
              <div><label className="text-sm font-medium">Time *</label><Input type="time" value={scheduleData.time} onChange={(e) => setScheduleData({ ...scheduleData, time: e.target.value })} /></div>
            </div>
            <div><label className="text-sm font-medium">Location</label><Input value={scheduleData.location} onChange={(e) => setScheduleData({ ...scheduleData, location: e.target.value })} placeholder="Online / Offline location" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowScheduleModal(false); setSelectedRegistration(null) }}>Cancel</Button>
            <Button onClick={handleSchedule} disabled={!scheduleData.date || !scheduleData.time || actionLoading === selectedRegistration?.id}><Save size={16} className="mr-1" /> Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Modal */}
      <Dialog open={showCompleteModal} onOpenChange={setShowCompleteModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Complete Bedah Value Session</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">Complete session for: <strong>{selectedRegistration?.user_name}</strong></p>
            <div><label className="text-sm font-medium">Certificate URL *</label><Input value={completeData.certificateUrl} onChange={(e) => setCompleteData({ ...completeData, certificateUrl: e.target.value })} placeholder="https://..." /></div>
            <div><label className="text-sm font-medium">Notes</label><textarea className="w-full p-3 border border-input rounded-lg" rows={3} value={completeData.notes} onChange={(e) => setCompleteData({ ...completeData, notes: e.target.value })} placeholder="Session notes..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCompleteModal(false); setSelectedRegistration(null) }}>Cancel</Button>
            <Button onClick={handleComplete} disabled={!completeData.certificateUrl || actionLoading === selectedRegistration?.id}><CheckCircle size={16} className="mr-1" /> Complete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
