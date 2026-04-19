import type { ReactNode } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useUserAuth } from '../contexts/UserAuthContext'
import { useWebSubscription } from '../hooks/useWebSubscription'
import { LogIn, LogOut, User, Package, Crown } from 'lucide-react'

const LOGO_URL = 'https://okgddlgugdkiswitewdi.supabase.co/storage/v1/object/public/profile-photos/taaruf-samara-logo.png'

interface PublicLayoutProps {
  children: ReactNode
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const { isAuthenticated, user, signOut } = useUserAuth()
  const { currentPurchase } = useWebSubscription(user?.id)
  const navigate = useNavigate()
  const location = useLocation()

  const handleSignOut = async () => {
    navigate('/')
    await signOut()
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <img
                src={LOGO_URL}
                alt="Taaruf Samara"
                className="w-10 h-10 object-contain"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-pink-600 bg-clip-text text-transparent">
                Taaruf Samara
              </span>
            </Link>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/user/dashboard"
                    className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-emerald-600 transition-colors"
                  >
                    <User size={16} />
                    <span className="hidden sm:inline">{user?.profile?.full_name || 'Dashboard'}</span>
                  </Link>
                  {currentPurchase ? (
                    <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                      <Crown size={12} /> {currentPurchase.package?.display_name || 'Premium'}
                    </span>
                  ) : (
                    <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                      <Package size={12} /> Free
                    </span>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors"
                    title="Keluar"
                  >
                    <LogOut size={16} />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/user/login"
                    className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-emerald-600 transition-colors"
                  >
                    <LogIn size={16} />
                    <span className="hidden sm:inline">Masuk</span>
                  </Link>
                  {!location.pathname.startsWith('/user') && (
                    <Link
                      to="/user/register"
                      className="inline-flex items-center gap-1.5 text-sm bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Daftar
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  )
}
