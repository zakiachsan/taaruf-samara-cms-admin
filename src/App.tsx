import { useState } from 'react'
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
  LogOut
} from 'lucide-react'

// Navigation items
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'premium', label: 'Premium', icon: Crown },
  { id: 'referral', label: 'Referral', icon: Gift },
  { id: 'banner', label: 'Banner', icon: ImageIcon },
  { id: 'selfvalue', label: 'Self-Value', icon: Award },
  { id: 'matches', label: 'Matches', icon: Heart },
  { id: 'reports', label: 'Reports', icon: Flag },
  { id: 'settings', label: 'Settings', icon: Settings },
]

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)

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
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  activeTab === item.id 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-gray-200">
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
                {NAV_ITEMS.find(i => i.id === activeTab)?.label}
              </h2>
              <p className="text-gray-500 mt-1">
                Kelola {NAV_ITEMS.find(i => i.id === activeTab)?.label.toLowerCase()} aplikasi Taaruf Samara
              </p>
            </div>

            {/* Placeholder Content */}
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {(() => {
                  const Icon = NAV_ITEMS.find(i => i.id === activeTab)?.icon || LayoutDashboard
                  return <Icon size={32} className="text-gray-400" />
                })()}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Halaman {NAV_ITEMS.find(i => i.id === activeTab)?.label}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Halaman ini sedang dalam pengembangan. Silakan pilih menu lain atau kembali lagi nanti.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
