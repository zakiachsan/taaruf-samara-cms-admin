import { Suspense, lazy, useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Users,
  Crown,
  Gift,
  Image as ImageIcon,
  Award,
  Heart,
  Flag,
  Settings,
  Menu,
  X,
  LogOut,
  Database,
  AlertCircle,
  CheckCircle,
  MessageCircle,
  Ban
} from 'lucide-react'
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { getCurrentUser } from './lib/supabase'

// Lazy load all page components
const Dashboard = lazy(() => import('./components/dashboard/Dashboard'))
const UsersManagement = lazy(() => import('./components/users/UsersManagement'))
const PremiumManagement = lazy(() => import('./components/premium/PremiumManagement'))
const ReferralManagement = lazy(() => import('./components/referral/ReferralManagement'))
const ReportsManagement = lazy(() => import('./components/reports/ReportsManagement'))
const BannerManagement = lazy(() => import('./components/banner/BannerManagement'))
const SelfValueManagement = lazy(() => import('./components/selfvalue/SelfValueManagement'))
const MatchesManagement = lazy(() => import('./components/matches/MatchesManagement'))
const ChatsManagement = lazy(() => import('./components/chats/ChatsManagement'))
const BlockedUsersManagement = lazy(() => import('./components/blocked/BlockedUsersManagement'))

// Navigation items
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 'users', label: 'Users', icon: Users, path: '/users' },
  { id: 'premium', label: 'Premium', icon: Crown, path: '/premium' },
  { id: 'referral', label: 'Referral', icon: Gift, path: '/referral' },
  { id: 'banner', label: 'Banner', icon: ImageIcon, path: '/banner' },
  { id: 'selfvalue', label: 'Self-Value', icon: Award, path: '/selfvalue' },
  { id: 'matches', label: 'Matches', icon: Heart, path: '/matches' },
  { id: 'reports', label: 'Reports', icon: Flag, path: '/reports' },
  { id: 'chats', label: 'Chats', icon: MessageCircle, path: '/chats' },
  { id: 'blocked', label: 'Blocked', icon: Ban, path: '/blocked' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
]

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [errorMessage, setErrorMessage] = useState('')
  const location = useLocation()

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      await getCurrentUser()
      setConnectionStatus('connected')
    } catch (err) {
      setConnectionStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Failed to connect to Supabase')
    }
  }

  if (connectionStatus === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Database className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">
            Supabase Belum Terkonfigurasi
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Silakan konfigurasi environment variables Supabase untuk melanjutkan.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">Langkah-langkah:</p>
            <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
              <li>Copy <code className="bg-gray-200 px-1 rounded">.env.example</code> menjadi <code className="bg-gray-200 px-1 rounded">.env</code></li>
              <li>Isi <code className="bg-gray-200 px-1 rounded">VITE_SUPABASE_URL</code> dengan URL project Supabase</li>
              <li>Isi <code className="bg-gray-200 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> dengan anon key</li>
              <li>Refresh halaman</li>
            </ol>
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            </div>
          )}

          <button 
            onClick={checkConnection}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside 
        className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          {sidebarOpen ? (
            <div>
              <h1 className="text-xl font-bold text-emerald-600">Taaruf Samara</h1>
              <p className="text-xs text-gray-500">Admin CMS</p>
            </div>
          ) : (
            <span className="text-2xl font-bold text-emerald-600">TS</span>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-gray-200">
          {/* Connection Status */}
          {sidebarOpen && (
            <div className="mb-3 px-3 py-2 bg-emerald-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-600" />
                <span className="text-sm text-emerald-700 font-medium">Terhubung</span>
              </div>
            </div>
          )}
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors">
            <LogOut size={20} />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">Super Admin</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="text-emerald-700 font-bold">A</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Title */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {NAV_ITEMS.find(i => i.path === location.pathname)?.label || 'Dashboard'}
              </h2>
              <p className="text-gray-500 mt-1">
                Kelola {(NAV_ITEMS.find(i => i.path === location.pathname)?.label || 'Dashboard').toLowerCase()} aplikasi Taaruf Samara
              </p>
            </div>

            {/* Content */}
            <Suspense fallback={
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/users" element={<UsersManagement />} />
                <Route path="/premium" element={<PremiumManagement />} />
                <Route path="/referral" element={<ReferralManagement />} />
                <Route path="/reports" element={<ReportsManagement />} />
                <Route path="/banner" element={<BannerManagement />} />
                <Route path="/selfvalue" element={<SelfValueManagement />} />
                <Route path="/matches" element={<MatchesManagement />} />
                <Route path="/chats" element={<ChatsManagement />} />
                <Route path="/blocked" element={<BlockedUsersManagement />} />
                <Route path="/settings" element={
                  <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Settings size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Halaman Settings</h3>
                    <p className="text-gray-500 max-w-md mx-auto">Halaman ini sedang dalam pengembangan.</p>
                  </div>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return <AppContent />
}
