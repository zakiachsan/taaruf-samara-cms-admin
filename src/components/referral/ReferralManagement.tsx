import { useState } from 'react'
import { useReferrals, ReferralFilters } from '../../hooks/useReferrals'
import {
  Search,
  Gift,
  Users,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Wallet,
  Banknote,
} from 'lucide-react'

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'successful', label: 'Successful' },
  { value: 'failed', label: 'Failed' },
]

const LIMIT_OPTIONS = [10, 25, 50]

const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
  <div className="bg-white rounded-xl p-4 border border-gray-200">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <h3 className="text-xl font-bold text-gray-900">{value}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
  </div>
)

export default function ReferralManagement() {
  const [activeTab, setActiveTab] = useState<'referrals' | 'withdrawals'>('referrals')
  const [filters, setFilters] = useState<ReferralFilters>({
    search: '',
    status: '',
  })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const {
    referrals,
    withdrawals,
    loading,
    totalCount,
    totalPages,
    stats,
    refetch,
    approveWithdrawal,
    rejectWithdrawal,
  } = useReferrals(filters, page, limit)

  const handleApprove = async (withdrawalId: string) => {
    if (!confirm('Approve this withdrawal?')) return
    setActionLoading(withdrawalId)
    await approveWithdrawal(withdrawalId)
    setActionLoading(null)
  }

  const handleReject = async (withdrawalId: string) => {
    if (!confirm('Reject this withdrawal?')) return
    setActionLoading(withdrawalId)
    await rejectWithdrawal(withdrawalId)
    setActionLoading(null)
  }

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-700',
      successful: 'bg-emerald-100 text-emerald-700',
      failed: 'bg-red-100 text-red-700',
      approved: 'bg-emerald-100 text-emerald-700',
      rejected: 'bg-red-100 text-red-700',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending')
  const processedWithdrawals = withdrawals.filter(w => w.status !== 'pending')

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Referrers"
          value={stats.totalReferrers}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Successful Referrals"
          value={stats.totalSuccessful}
          icon={CheckCircle}
          color="bg-emerald-500"
        />
        <StatCard
          title="Commission Paid"
          value={formatCurrency(stats.totalCommissionPaid)}
          icon={DollarSign}
          color="bg-purple-500"
        />
        <StatCard
          title="Pending Withdrawals"
          value={stats.pendingWithdrawals}
          icon={Clock}
          color="bg-amber-500"
          subtitle={formatCurrency(stats.pendingAmount)}
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('referrals')}
            className={`flex items-center gap-2 px-6 py-4 font-medium ${
              activeTab === 'referrals'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Gift size={18} />
            Referrals
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`flex items-center gap-2 px-6 py-4 font-medium ${
              activeTab === 'withdrawals'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Wallet size={18} />
            Withdrawals
            {pendingWithdrawals.length > 0 && (
              <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                {pendingWithdrawals.length}
              </span>
            )}
          </button>
        </div>

        <div className="p-4">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={activeTab === 'referrals' ? "Search by name or code..." : "Search by user..."}
                value={filters.search}
                onChange={(e) => {
                  setFilters({ ...filters, search: e.target.value })
                  setPage(1)
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {activeTab === 'referrals' && (
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
            )}

            <button
              onClick={refetch}
              className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw size={18} />
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading...</p>
            </div>
          ) : activeTab === 'referrals' ? (
            // Referrals Table
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referrer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referred User</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reward</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {referrals.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                          <Gift size={48} className="mx-auto text-gray-300 mb-4" />
                          No referrals found
                        </td>
                      </tr>
                    ) : (
                      referrals.map((ref) => (
                        <tr key={ref.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-gray-900">{ref.referrer_name}</p>
                              <p className="text-sm text-gray-500">{ref.referrer_email}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-900">{ref.referred_name}</td>
                          <td className="px-4 py-3">
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm">{ref.code}</code>
                          </td>
                          <td className="px-4 py-3">{getStatusBadge(ref.status)}</td>
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {formatCurrency(ref.reward_amount)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {formatDate(ref.created_at)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 mt-4">
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
            </>
          ) : (
            // Withdrawals Section
            <div className="space-y-6">
              {/* Pending Withdrawals */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="text-amber-500" size={20} />
                  Pending Withdrawals ({pendingWithdrawals.length})
                </h3>
                {pendingWithdrawals.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                    <CheckCircle size={48} className="mx-auto text-emerald-400 mb-4" />
                    No pending withdrawals
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingWithdrawals.map((w) => (
                      <div key={w.id} className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                <span className="text-amber-700 font-semibold">
                                  {w.user_name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{w.user_name}</p>
                                <p className="text-sm text-gray-500">{w.user_email}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                              <div>
                                <p className="text-gray-500">Amount</p>
                                <p className="font-semibold text-gray-900">{formatCurrency(w.amount)}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Bank</p>
                                <p className="font-medium text-gray-900">{w.bank_name || '-'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Account Number</p>
                                <p className="font-medium text-gray-900">{w.account_number || '-'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Account Name</p>
                                <p className="font-medium text-gray-900">{w.account_name || '-'}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(w.id)}
                              disabled={actionLoading === w.id}
                              className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                            >
                              {actionLoading === w.id ? (
                                <div className="animate-spin h-4 w-4 border-2 border-white rounded-full" />
                              ) : (
                                <Check size={18} />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(w.id)}
                              disabled={actionLoading === w.id}
                              className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                              <X size={18} />
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Processed Withdrawals */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Processed Withdrawals</h3>
                {processedWithdrawals.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                    No processed withdrawals yet
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bank</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {processedWithdrawals.slice(0, 10).map((w) => (
                          <tr key={w.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-900">{w.user_name}</p>
                              <p className="text-sm text-gray-500">{w.user_email}</p>
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(w.amount)}</td>
                            <td className="px-4 py-3 text-gray-600">{w.bank_name}</td>
                            <td className="px-4 py-3">{getStatusBadge(w.status)}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{formatDate(w.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
