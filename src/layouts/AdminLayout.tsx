import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getCurrentUser } from '../lib/supabase'
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
  Ban,
  Package,
  Puzzle,
  MessageSquareQuote,
  ShieldAlert,
  UserCircle,
} from 'lucide-react'

const LOGO_URL = 'https://okgddlgugdkiswitewdi.supabase.co/storage/v1/object/public/profile-photos/taaruf-samara-logo.png'

// Navigation items with groups
const NAV_SECTIONS = [
  {
    title: 'Utama',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
      { id: 'users', label: 'Pengguna', icon: Users, path: '/admin/users' },
    ]
  },
  {
    title: 'Langganan',
    items: [
      { id: 'premium', label: 'Pengguna Premium', icon: Crown, path: '/admin/premium' },
      { id: 'packages', label: 'Paket', icon: Package, path: '/admin/packages' },
      { id: 'addons', label: 'Tambahan', icon: Puzzle, path: '/admin/addons' },
      { id: 'pendampingan', label: 'Premium Pendampingan', icon: Users, path: '/admin/pendampingan' },
    ]
  },
  {
    title: 'Fitur',
    items: [
      { id: 'selfvalue', label: 'Self-Value', icon: Award, path: '/admin/selfvalue' },
      { id: 'referral', label: 'Referral', icon: Gift, path: '/admin/referral' },
      { id: 'referral-settings', label: 'Pengaturan Referral', icon: Settings, path: '/admin/referral-settings' },
      { id: 'banner', label: 'Banner', icon: ImageIcon, path: '/admin/banner' },
      { id: 'testimonials', label: 'Testimoni', icon: MessageSquareQuote, path: '/admin/testimonials' },
    ]
  },
  {
    title: 'Pencocokan',
    items: [
      { id: 'matches', label: 'Pencocokan', icon: Heart, path: '/admin/matches' },
      { id: 'chats', label: 'Obrolan', icon: MessageCircle, path: '/admin/chats' },
      { id: 'chat-keywords', label: 'Sensor Chat', icon: ShieldAlert, path: '/admin/chat-keywords' },
      { id: 'blocked', label: 'Diblokir', icon: Ban, path: '/admin/blocked' },
    ]
  },
  {
    title: 'Laporan',
    items: [
      { id: 'reports', label: 'Laporan', icon: Flag, path: '/admin/reports' },
    ]
  },
  {
    title: 'Pengaturan',
    items: [
      { id: 'settings', label: 'Pengaturan', icon: Settings, path: '/admin/settings' },
      { id: 'profile', label: 'Profil Admin', icon: UserCircle, path: '/admin/profile' },
    ]
  },
]

export default function AdminLayout() {
  // Load sidebar state from localStorage, default to true (open)
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('taaruf-sidebar-open')
    return saved === null ? true : saved === 'true'
  })
  const [isMobile, setIsMobile] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [errorMessage, setErrorMessage] = useState('')
  const location = useLocation()
  const { signOut } = useAuth()
  const navigate = useNavigate()

  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('taaruf-sidebar-open', String(sidebarOpen))
  }, [sidebarOpen])

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => window.innerWidth < 768
    setIsMobile(checkMobile)

    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      await getCurrentUser()
      setConnectionStatus('connected')
    } catch (err) {
      setConnectionStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Gagal terhubung ke Supabase')
    }
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/')
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
            Silakan konfigurasi variabel lingkungan Supabase untuk melanjutkan.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">Langkah-langkah:</p>
            <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
              <li>Salin <code className="bg-gray-200 px-1 rounded">.env.example</code> menjadi <code className="bg-gray-200 px-1 rounded">.env</code></li>
              <li>Isi <code className="bg-gray-200 px-1 rounded">VITE_SUPABASE_URL</code> dengan URL project Supabase</li>
              <li>Isi <code className="bg-gray-200 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> dengan anon key</li>
              <li>Segarkan halaman</li>
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
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${!isMobile ? 'translate-x-0' : sidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${
          sidebarOpen ? 'w-64' : 'w-20'
        } fixed md:relative z-50 h-full bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-gray-200">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <img
                src={LOGO_URL}
                alt="Taaruf Samara"
                className="w-8 h-8 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-emerald-600 hidden sm:block">Taaruf Samara</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Admin CMS</p>
              </div>
            </div>
          ) : (
            <img
              src={LOGO_URL}
              alt="TS"
              className="w-8 h-8 object-contain"
            />
          )}
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg hover:bg-gray-100 md:hidden"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-3 space-y-4 overflow-y-auto">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              {sidebarOpen && (
                <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {section.title}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
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
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-gray-200">
          {/* Connection Status */}
          {sidebarOpen && (
            <div className="mb-3 px-3 py-2 bg-emerald-50 rounded-lg hidden md:block">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-600" />
                <span className="text-sm text-emerald-700 font-medium">Terhubung</span>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="font-medium">Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {sidebarOpen && !isMobile ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link to="/admin/profile" className="flex items-center gap-2 md:gap-4 hover:opacity-80 transition-opacity">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-gray-900">Pengguna Admin</p>
              <p className="text-xs text-gray-500">Super Admin</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="text-emerald-700 font-bold">A</span>
            </div>
          </Link>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Title */}
            <div className="mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                {(() => {
                  for (const section of NAV_SECTIONS) {
                    const found = section.items.find(i => i.path === location.pathname)
                    if (found) return found.label
                  }
                  return 'Dashboard'
                })()}
              </h2>
              <p className="text-gray-500 mt-1 text-sm md:text-base">
                Kelola {(() => {
                  for (const section of NAV_SECTIONS) {
                    const found = section.items.find(i => i.path === location.pathname)
                    if (found) return found.label.toLowerCase()
                  }
                  return 'dashboard'
                })()} aplikasi Taaruf Samara
              </p>
            </div>

            {/* Content */}
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
