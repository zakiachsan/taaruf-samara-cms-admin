import { useDashboardStats, useRegistrationChart, useRecentActivities } from '../../hooks/useDashboard'
import { 
  Users, 
  UserPlus, 
  Crown, 
  ShieldAlert, 
  Heart,
  TrendingUp,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Calendar
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'
import { RefreshCw } from 'lucide-react'

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendUp,
  color 
}: { 
  title: string
  value: string | number
  icon: any
  trend?: string
  trendUp?: boolean
  color: string
}) => (
  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-sm ${trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
            {trendUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </div>
)

const ActivityItem = ({ activity }: { activity: any }) => {
  const icons = {
    register: UserPlus,
    premium: Crown,
    report: ShieldAlert,
    match: Heart,
  }
  
  const colors = {
    register: 'bg-blue-100 text-blue-600',
    premium: 'bg-amber-100 text-amber-600',
    report: 'bg-red-100 text-red-600',
    match: 'bg-pink-100 text-pink-600',
  }
  
  const Icon = icons[activity.type as keyof typeof icons] || Activity
  const colorClass = colors[activity.type as keyof typeof colors] || 'bg-gray-100 text-gray-600'
  
  const timeAgo = (date: string) => {
    const now = new Date()
    const then = new Date(date)
    const diff = now.getTime() - then.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }
  
  return (
    <div className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
      <div className={`p-2 rounded-lg ${colorClass}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
        {activity.userName && (
          <p className="text-xs text-gray-500 mt-0.5">{activity.userName}</p>
        )}
      </div>
      <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(activity.timestamp)}</span>
    </div>
  )
}

export default function Dashboard() {
  const { stats, loading: statsLoading, refetch: refetchStats } = useDashboardStats()
  const { data: chartData, loading: chartLoading } = useRegistrationChart()
  const { activities, loading: activitiesLoading } = useRecentActivities(10)

  const handleRefresh = () => {
    window.location.reload()
  }

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  return (
    <div className="space-y-6">
      {/* Refresh Bar */}
      <div className="flex justify-end">
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={18} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={statsLoading ? '...' : stats.totalUsers.toLocaleString('id-ID')}
          icon={Users}
          trend="+12%"
          trendUp={true}
          color="bg-blue-500"
        />
        <StatCard
          title="New Users Today"
          value={statsLoading ? '...' : stats.newUsersToday}
          icon={UserPlus}
          trend="Hari ini"
          color="bg-emerald-500"
        />
        <StatCard
          title="Active Premium"
          value={statsLoading ? '...' : stats.activePremiumUsers}
          icon={Crown}
          trend="Aktif"
          color="bg-amber-500"
        />
        <StatCard
          title="Pending Verifications"
          value={statsLoading ? '...' : stats.pendingVerifications}
          icon={ShieldAlert}
          trend="Butuh review"
          color="bg-red-500"
        />
      </div>

      {/* Charts & Activities Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registration Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Registrasi 7 Hari Terakhir</h3>
              <p className="text-sm text-gray-500">Grafik user baru yang mendaftar</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar size={16} />
              <span>Last 7 days</span>
            </div>
          </div>
          
          <div className="h-64">
            {chartLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={256} minWidth={100}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Aktivitas Terbaru</h3>
              <p className="text-sm text-gray-500">Update real-time</p>
            </div>
            <Activity size={20} className="text-gray-400" />
          </div>
          
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {activitiesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
              </div>
            ) : activities.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Belum ada aktivitas</p>
            ) : (
              activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Revenue Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-emerald-100 text-sm mb-1">Total Revenue</p>
              <h3 className="text-2xl font-bold">
                {statsLoading ? '...' : formatCurrency(stats.totalRevenue)}
              </h3>
            </div>
            <div className="p-2 bg-white/20 rounded-lg">
              <DollarSign size={24} className="text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-emerald-100">
            <TrendingUp size={16} />
            <span>All time earnings</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Monthly Revenue</p>
              <h3 className="text-2xl font-bold">
                {statsLoading ? '...' : formatCurrency(stats.monthlyRevenue)}
              </h3>
            </div>
            <div className="p-2 bg-white/20 rounded-lg">
              <Calendar size={24} className="text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-blue-100">
            <TrendingUp size={16} />
            <span>This month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-1">Today's Matches</p>
              <h3 className="text-2xl font-bold">
                {statsLoading ? '...' : stats.todayMatches}
              </h3>
            </div>
            <div className="p-2 bg-white/20 rounded-lg">
              <Heart size={24} className="text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-purple-100">
            <TrendingUp size={16} />
            <span>Match requests today</span>
          </div>
        </div>
      </div>


    </div>
  )
}
