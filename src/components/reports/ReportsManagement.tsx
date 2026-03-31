import { useState } from 'react'
import { useReports, type ReportFilters } from '../../hooks/useReports'
import {
  Search,
  Flag,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Shield,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Clock,
  Check,
  X,
  User,
  MessageSquare,
  Ban,
} from 'lucide-react'

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

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white rounded-xl p-4 border border-gray-200">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
  </div>
)

export default function ReportsManagement() {
  const [filters, setFilters] = useState<ReportFilters>({
    search: '',
    status: '',
    reason: '',
  })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

  const {
    reports,
    loading,
    totalCount,
    totalPages,
    stats,
    reasons,
    refetch,
    updateStatus,
    blockUser,
  } = useReports(filters, page, limit)

  const handleStatusChange = async (reportId: string, newStatus: string) => {
    setActionLoading(reportId)
    await updateStatus(reportId, newStatus, notes)
    setActionLoading(null)
    setNotes('')
    if (showDetailModal) {
      setShowDetailModal(false)
      setSelectedReport(null)
    }
  }

  const handleBlockUser = async (userId: string) => {
    if (!confirm('Block this user? They will not be able to use the app.')) return
    setActionLoading(userId)
    await blockUser(userId)
    setActionLoading(null)
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

  const getStatusBadge = (status: string) => {
    const styles = {
      open: 'bg-red-100 text-red-700',
      investigating: 'bg-amber-100 text-amber-700',
      resolved: 'bg-emerald-100 text-emerald-700',
      dismissed: 'bg-gray-100 text-gray-700',
    }
    const icons = {
      open: AlertCircle,
      investigating: Clock,
      resolved: CheckCircle,
      dismissed: XCircle,
    }
    const Icon = icons[status as keyof typeof icons] || AlertCircle
    return (
      <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        <Icon size={12} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getReasonBadge = (reason: string) => {
    const colors: Record<string, string> = {
      'Inappropriate content': 'bg-purple-100 text-purple-700',
      'Fake profile': 'bg-blue-100 text-blue-700',
      'Harassment': 'bg-red-100 text-red-700',
      'Spam': 'bg-orange-100 text-orange-700',
      'Scam/Fraud': 'bg-rose-100 text-rose-700',
      'Other': 'bg-gray-100 text-gray-700',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[reason] || colors['Other']}`}>
        {reason}
      </span>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Reports"
          value={stats.totalReports}
          icon={Flag}
          color="bg-blue-500"
        />
        <StatCard
          title="Open"
          value={stats.openReports}
          icon={AlertCircle}
          color="bg-red-500"
        />
        <StatCard
          title="Investigating"
          value={stats.investigatingReports}
          icon={Clock}
          color="bg-amber-500"
        />
        <StatCard
          title="Resolved"
          value={stats.resolvedReports}
          icon={CheckCircle}
          color="bg-emerald-500"
        />
      </div>

      {/* Open Reports Alert */}
      {stats.openReports > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-red-100 rounded-lg">
            <AlertCircle className="text-red-600" size={24} />
          </div>
          <div className="flex-1">
            <p className="text-red-900 font-semibold">{stats.openReports} reports need attention</p>
            <p className="text-red-700 text-sm">Please review and take action on open reports</p>
          </div>
          <button
            onClick={() => setFilters({ ...filters, status: 'open' })}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            View Open
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by user or reason..."
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value })
                setPage(1)
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={filters.status}
              onChange={(e) => {
                setFilters({ ...filters, status: e.target.value })
                setPage(1)
              }}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <select
              value={filters.reason}
              onChange={(e) => {
                setFilters({ ...filters, reason: e.target.value })
                setPage(1)
              }}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              {REASON_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <button
              onClick={refetch}
              className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>Total: {totalCount} reports</span>
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

      {/* Reports Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle size={48} className="mx-auto text-emerald-400 mb-4" />
            <p className="text-gray-500">No reports found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reporter</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reported User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-700 font-semibold text-sm">
                            {report.reporter_name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{report.reporter_name}</p>
                          <p className="text-xs text-gray-500">{report.reporter_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                          <span className="text-red-700 font-semibold text-sm">
                            {report.reported_name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{report.reported_name}</p>
                          <p className="text-xs text-gray-500">{report.reported_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{getReasonBadge(report.reason)}</td>
                    <td className="px-4 py-3">{getStatusBadge(report.status)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(report.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedReport(report)
                            setShowDetailModal(true)
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>

                        {report.status === 'open' && (
                          <button
                            onClick={() => handleStatusChange(report.id, 'investigating')}
                            disabled={actionLoading === report.id}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
                            title="Mark Investigating"
                          >
                            {actionLoading === report.id ? (
                              <div className="animate-spin h-4 w-4 border-2 border-current rounded-full" />
                            ) : (
                              <Clock size={18} />
                            )}
                          </button>
                        )}

                        {(report.status === 'open' || report.status === 'investigating') && (
                          <>
                            <button
                              onClick={() => handleStatusChange(report.id, 'resolved')}
                              disabled={actionLoading === report.id}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                              title="Resolve"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              onClick={() => handleStatusChange(report.id, 'dismissed')}
                              disabled={actionLoading === report.id}
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                              title="Dismiss"
                            >
                              <X size={18} />
                            </button>
                          </>
                        )}
                      </div>
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
              <ChevronLeft size={16} /> Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg disabled:opacity-50"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Report Details</h3>
                <button
                  onClick={() => {
                    setShowDetailModal(false)
                    setSelectedReport(null)
                    setNotes('')
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center gap-4">
                <span className="text-gray-500">Status:</span>
                {getStatusBadge(selectedReport.status)}
              </div>

              {/* Reporter Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <User size={16} /> Reporter
                </h4>
                <p className="text-blue-800">{selectedReport.reporter_name}</p>
                <p className="text-blue-600 text-sm">{selectedReport.reporter_email}</p>
              </div>

              {/* Reported User Info */}
              <div className="bg-red-50 rounded-lg p-4">
                <h4 className="font-medium text-red-900 mb-2 flex items-center gap-2">
                  <Shield size={16} /> Reported User
                </h4>
                <p className="text-red-800">{selectedReport.reported_name}</p>
                <p className="text-red-600 text-sm">{selectedReport.reported_email}</p>
              </div>

              {/* Reason */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Reason</h4>
                {getReasonBadge(selectedReport.reason)}
              </div>

              {/* Description */}
              {selectedReport.description && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600 bg-gray-50 rounded-lg p-4">
                    {selectedReport.description}
                  </p>
                </div>
              )}

              {/* Notes */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Admin Notes</h4>
                <textarea
                  value={notes || selectedReport.notes || ''}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this report..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 min-h-[100px]"
                />
              </div>

              {/* Handler Info */}
              {selectedReport.handler_name && (
                <div className="text-sm text-gray-500">
                  Handled by: {selectedReport.handler_name}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex flex-wrap gap-3 justify-end">
              <button
                onClick={() => handleBlockUser(selectedReport.reported_id)}
                disabled={actionLoading === selectedReport.reported_id}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                <Ban size={18} />
                Block User
              </button>

              {selectedReport.status !== 'resolved' && (
                <button
                  onClick={() => handleStatusChange(selectedReport.id, 'resolved')}
                  disabled={actionLoading === selectedReport.id}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                  <Check size={18} />
                  Mark Resolved
                </button>
              )}

              {selectedReport.status !== 'dismissed' && (
                <button
                  onClick={() => handleStatusChange(selectedReport.id, 'dismissed')}
                  disabled={actionLoading === selectedReport.id}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                >
                  <X size={18} />
                  Dismiss
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
