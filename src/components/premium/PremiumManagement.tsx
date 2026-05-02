import { useState } from 'react'
import { usePremium, type PremiumFilters } from '../../hooks/usePremium'
import { useAddonPurchases, type AddonPurchaseFilters } from '../../hooks/useAddonPurchases'
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
  Puzzle,
  Package,
} from 'lucide-react'

const TYPE_OPTIONS = [
  { value: '', label: 'Semua Tipe' },
  { value: 'basic', label: 'Basic' },
  { value: 'premium', label: 'Premium' },
]

const STATUS_OPTIONS = [
  { value: '', label: 'Semua Status' },
  { value: 'active', label: 'Aktif' },
  { value: 'expired', label: 'Kadaluarsa' },
  { value: 'cancelled', label: 'Dibatalkan' },
]

const EXPIRING_OPTIONS = [
  { value: '', label: 'Semua' },
  { value: 'week', label: 'Kadaluarsa Minggu Ini' },
  { value: 'month', label: 'Kadaluarsa Bulan Ini' },
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

type TabType = 'subscriptions' | 'addons'

export default function PremiumManagement() {
  const [activeTab, setActiveTab] = useState<TabType>('subscriptions')

  // Subscription tab state
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
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null)
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

  // Add-on purchases tab state
  const [addonFilters, setAddonFilters] = useState<AddonPurchaseFilters>({
    search: '',
    addonName: '',
  })
  const [addonPage, setAddonPage] = useState(1)
  const [addonLimit, setAddonLimit] = useState(10)

  const {
    purchases: addonPurchases,
    loading: addonLoading,
    totalCount: addonTotalCount,
    totalPages: addonTotalPages,
    refetch: refetchAddons,
  } = useAddonPurchases(addonFilters, addonPage, addonLimit)

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
    if (!confirm('Yakin ingin membatalkan langganan ini?')) return
    setActionLoading(subscriptionId)
    await cancelSubscription(subscriptionId)
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
      active: 'bg-emerald-100 text-emerald-700',
      expired: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {({ active: 'Aktif', expired: 'Kadaluarsa', cancelled: 'Dibatalkan' }[status] || status.charAt(0).toUpperCase() + status.slice(1))}
      </span>
    )
  }

  const getTypeBadge = (type: string) => {
    return (
      <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
        type === 'premium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
      }`}>
        <Crown size={12} />
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    )
  }

  const isExpiringSoon = (endDate: string) => {
    const daysUntilExpiry = Math.ceil(
      (new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-1">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'subscriptions'
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Package size={18} />
            Langganan
          </button>
          <button
            onClick={() => setActiveTab('addons')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'addons'
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Puzzle size={18} />
            Pembelian Add-on
          </button>
        </div>
      </div>

      {activeTab === 'subscriptions' ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Pendapatan"
              value={formatCurrency(stats.totalRevenue)}
              icon={DollarSign}
              color="bg-emerald-500"
            />
            <StatCard
              title="Pendapatan Basic"
              value={formatCurrency(stats.basicRevenue)}
              icon={TrendingUp}
              color="bg-blue-500"
              subtitle="Langganan"
            />
            <StatCard
              title="Pendapatan Premium"
              value={formatCurrency(stats.premiumRevenue)}
              icon={Crown}
              color="bg-amber-500"
              subtitle="Langganan"
            />
            <StatCard
              title="Langganan Aktif"
              value={stats.activeSubscriptions}
              icon={CheckCircle}
              color="bg-purple-500"
            />
          </div>

          {/* Expiry Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <AlertTriangle className="text-amber-600" size={24} />
              </div>
              <div>
                <p className="text-amber-900 font-semibold">{stats.expiringThisWeek} langganan</p>
                <p className="text-amber-700 text-sm">Kadaluarsa dalam 7 hari</p>
              </div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="text-orange-600" size={24} />
              </div>
              <div>
                <p className="text-orange-900 font-semibold">{stats.expiringThisMonth} langganan</p>
                <p className="text-orange-700 text-sm">Kadaluarsa dalam 30 hari</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama atau email..."
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
                  value={filters.type}
                  onChange={(e) => {
                    setFilters({ ...filters, type: e.target.value })
                    setPage(1)
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>

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
                  value={filters.expiringSoon}
                  onChange={(e) => {
                    setFilters({ ...filters, expiringSoon: e.target.value })
                    setPage(1)
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  {EXPIRING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
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
              <span>Total: {totalCount} langganan</span>
              <div className="flex items-center gap-2">
                <span>Tampilkan:</span>
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

          {/* Subscriptions Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
                <p className="mt-4 text-gray-500">Memuat langganan...</p>
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="p-12 text-center">
                <Crown size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Tidak ada langganan</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pengguna</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Mulai</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Berakhir</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {subscriptions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">{sub.user_name}</p>
                            <p className="text-sm text-gray-500">{sub.user_email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">{getTypeBadge(sub.plan_type)}</td>
                        <td className="px-4 py-3">{getStatusBadge(sub.status)}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {formatCurrency(sub.amount)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {formatDate(sub.start_date)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm ${isExpiringSoon(sub.expires_at) ? 'text-amber-600 font-medium' : 'text-gray-500'}`}>
                              {formatDate(sub.expires_at)}
                            </span>
                            {isExpiringSoon(sub.expires_at) && (
                              <AlertTriangle size={16} className="text-amber-500" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {sub.status === 'active' && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedSubscription(sub)
                                    setExtendDate(sub.expires_at.split('T')[0])
                                    setShowExtendModal(true)
                                  }}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                  title="Perpanjang"
                                >
                                  <Edit2 size={18} />
                                </button>
                                <button
                                  onClick={() => handleCancel(sub.id)}
                                  disabled={actionLoading === sub.id}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                  title="Batalkan"
                                >
                                  {actionLoading === sub.id ? (
                                    <div className="animate-spin h-4 w-4 border-2 border-current rounded-full" />
                                  ) : (
                                    <Ban size={18} />
                                  )}
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
                  <ChevronLeft size={16} /> Sebelumnya
                </button>
                <span className="text-sm text-gray-500">
                  Halaman {page} dari {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg disabled:opacity-50"
                >
                  Berikutnya <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Extend Modal */}
          {showExtendModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Perpanjang Langganan</h3>
                <p className="text-gray-500 mb-4">
                  Perpanjang langganan untuk <strong>{selectedSubscription?.user_name}</strong>
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Berakhir Baru
                  </label>
                  <input
                    type="date"
                    value={extendDate}
                    onChange={(e) => setExtendDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowExtendModal(false)
                      setSelectedSubscription(null)
                      setExtendDate('')
                    }}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleExtend}
                    disabled={!extendDate || actionLoading === selectedSubscription?.id}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {actionLoading === selectedSubscription?.id ? 'Menyimpan...' : 'Perpanjang'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Add-on Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Total Pembelian Add-on"
              value={addonTotalCount}
              icon={Puzzle}
              color="bg-indigo-500"
            />
            <StatCard
              title="Pendapatan Add-on"
              value={formatCurrency(addonPurchases.reduce((sum, p) => sum + (p.addon_price || 0), 0))}
              icon={DollarSign}
              color="bg-emerald-500"
            />
            <StatCard
              title="Pembeli Unik"
              value={new Set(addonPurchases.map(p => p.user_id)).size}
              icon={CheckCircle}
              color="bg-purple-500"
            />
          </div>

          {/* Add-on Filters */}
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama atau email..."
                  value={addonFilters.search}
                  onChange={(e) => {
                    setAddonFilters({ ...addonFilters, search: e.target.value })
                    setAddonPage(1)
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  placeholder="Filter nama add-on..."
                  value={addonFilters.addonName}
                  onChange={(e) => {
                    setAddonFilters({ ...addonFilters, addonName: e.target.value })
                    setAddonPage(1)
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={refetchAddons}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <span>Total: {addonTotalCount} pembelian add-on</span>
              <div className="flex items-center gap-2">
                <span>Tampilkan:</span>
                <select
                  value={addonLimit}
                  onChange={(e) => {
                    setAddonLimit(Number(e.target.value))
                    setAddonPage(1)
                  }}
                  className="border border-gray-200 rounded px-2 py-1"
                >
                  {LIMIT_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Add-on Purchases Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {addonLoading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
                <p className="mt-4 text-gray-500">Memuat pembelian add-on...</p>
              </div>
            ) : addonPurchases.length === 0 ? (
              <div className="p-12 text-center">
                <Puzzle size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Tidak ada pembelian add-on</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pengguna</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Add-on</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paket</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kadaluarsa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {addonPurchases.map((purchase) => (
                      <tr key={purchase.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">{purchase.user_name}</p>
                            <p className="text-sm text-gray-500">{purchase.user_email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                            <Puzzle size={12} />
                            {purchase.addon_name}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {formatCurrency(purchase.addon_price)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {purchase.package_name || '-'}
                        </td>
                        <td className="px-4 py-3">
                          {purchase.subscription_status === 'paid' ? (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Aktif</span>
                          ) : purchase.subscription_status === 'expired' ? (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Kadaluarsa</span>
                          ) : purchase.subscription_status === 'cancelled' ? (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Dibatalkan</span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{purchase.subscription_status || 'Pending'}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {formatDate(purchase.created_at)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {purchase.expires_at ? formatDate(purchase.expires_at) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {addonTotalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <button
                  onClick={() => setAddonPage(p => Math.max(1, p - 1))}
                  disabled={addonPage === 1}
                  className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg disabled:opacity-50"
                >
                  <ChevronLeft size={16} /> Sebelumnya
                </button>
                <span className="text-sm text-gray-500">
                  Halaman {addonPage} dari {addonTotalPages}
                </span>
                <button
                  onClick={() => setAddonPage(p => Math.min(addonTotalPages, p + 1))}
                  disabled={addonPage === addonTotalPages}
                  className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg disabled:opacity-50"
                >
                  Berikutnya <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
