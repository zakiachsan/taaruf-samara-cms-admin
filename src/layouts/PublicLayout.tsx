import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
const LOGO_URL = 'https://okgddlgugdkiswitewdi.supabase.co/storage/v1/object/public/profile-photos/taaruf-samara-logo.png'

interface PublicLayoutProps {
  children: ReactNode
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Simple Header */}
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

            {/* Right side - empty for now, could add language selector later */}
            <div></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  )
}
