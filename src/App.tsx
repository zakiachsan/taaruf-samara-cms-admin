import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './pages/auth/ProtectedRoute'
import AdminLayout from './layouts/AdminLayout'
import PublicLayout from './layouts/PublicLayout'
import LoginPage from './pages/LoginPage'
import LandingPage from './pages/LandingPage'
import ConfirmEmail from './pages/ConfirmEmail'
import ResetPassword from './pages/ResetPassword'

// Lazy load admin page components
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

// Loading fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
  </div>
)

// Settings placeholder component
const SettingsPlaceholder = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">Halaman Settings</h3>
    <p className="text-gray-500 max-w-md mx-auto">Halaman ini sedang dalam pengembangan.</p>
  </div>
)

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <PublicLayout>
            <LandingPage />
          </PublicLayout>
        } />
        <Route path="/login" element={<LoginPage />} />

        {/* Email Confirmation & Password Reset Routes */}
        <Route path="/confirm-email" element={<ConfirmEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Backward compatibility: /landing redirects to / */}
        <Route path="/landing" element={<Navigate to="/" replace />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="premium" element={<PremiumManagement />} />
          <Route path="selfvalue" element={<SelfValueManagement />} />
          <Route path="referral" element={<ReferralManagement />} />
          <Route path="banner" element={<BannerManagement />} />
          <Route path="matches" element={<MatchesManagement />} />
          <Route path="reports" element={<ReportsManagement />} />
          <Route path="chats" element={<ChatsManagement />} />
          <Route path="blocked" element={<BlockedUsersManagement />} />
          <Route path="settings" element={<SettingsPlaceholder />} />
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
