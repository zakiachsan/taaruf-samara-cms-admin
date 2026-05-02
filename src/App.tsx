import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { UserAuthProvider } from './contexts/UserAuthContext'
import { ProtectedRoute } from './pages/auth/ProtectedRoute'
import AdminLayout from './layouts/AdminLayout'
import PublicLayout from './layouts/PublicLayout'
import LoginPage from './pages/LoginPage'
import LandingPage from './pages/LandingPage'
import ConfirmEmail from './pages/ConfirmEmail'
import ResetPassword from './pages/ResetPassword'
import FAQPage from './pages/FAQPage'
import RefundPolicyPage from './pages/RefundPolicyPage'
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'
import FeaturesPage from './pages/FeaturesPage'
import PremiumPage from './pages/PremiumPage'
import SelfValuePage from './pages/SelfValuePage'
import ReferralPage from './pages/ReferralPage'
import UserLoginPage from './pages/UserLoginPage'
import UserRegisterPage from './pages/UserRegisterPage'
import UserDashboardPage from './pages/UserDashboardPage'
import UserSubscribePage from './pages/UserSubscribePage'

// Lazy load admin page components
const Dashboard = lazy(() => import('./components/dashboard/Dashboard'))
const UsersManagement = lazy(() => import('./components/users/UsersManagement'))
const PremiumManagement = lazy(() => import('./components/premium/PremiumManagement'))
const PackageManagement = lazy(() => import('./components/subscription/PackageManagement'))
const AddonsManagement = lazy(() => import('./components/subscription/AddonsManagement'))
const ReferralManagement = lazy(() => import('./components/referral/ReferralManagement'))
const ReferralSettings = lazy(() => import('./components/referral/ReferralSettings'))
const ReportsManagement = lazy(() => import('./components/reports/ReportsManagement'))
const BannerManagement = lazy(() => import('./components/banner/BannerManagement'))
const SelfValueManagement = lazy(() => import('./components/selfvalue/SelfValueManagement'))
const MatchesManagement = lazy(() => import('./components/matches/MatchesManagement'))
const ChatsManagement = lazy(() => import('./components/chats/ChatsManagement'))
const BlockedUsersManagement = lazy(() => import('./components/blocked/BlockedUsersManagement'))
const TestimonialManagement = lazy(() => import('./components/testimonial/TestimonialManagement'))
const PendampinganManagement = lazy(() => import('./components/pendampingan/PendampinganManagement'))
const ChatKeywordSensor = lazy(() => import('./components/chats/ChatKeywordSensor'))
const AdminProfile = lazy(() => import('./components/settings/AdminProfile'))

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
    <h3 className="text-lg font-semibold text-gray-900 mb-2">Halaman Pengaturan</h3>
    <p className="text-gray-500 max-w-md mx-auto">Halaman ini sedang dalam pengembangan.</p>
  </div>
)

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function AppRoutes() {
  return (
    <>
    <ScrollToTop />
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <PublicLayout>
            <LandingPage />
          </PublicLayout>
        } />
        <Route path="/login" element={<LoginPage />} />

        {/* Legal Pages */}
        <Route path="/faq" element={<PublicLayout><FAQPage /></PublicLayout>} />
        <Route path="/refund" element={<PublicLayout><RefundPolicyPage /></PublicLayout>} />
        <Route path="/terms" element={<PublicLayout><TermsPage /></PublicLayout>} />
        <Route path="/privacy" element={<PublicLayout><PrivacyPage /></PublicLayout>} />

        {/* Product Pages */}
        <Route path="/features" element={<PublicLayout><FeaturesPage /></PublicLayout>} />
        <Route path="/premium" element={<PublicLayout><PremiumPage /></PublicLayout>} />
        <Route path="/self-value" element={<PublicLayout><SelfValuePage /></PublicLayout>} />
        <Route path="/referral" element={<PublicLayout><ReferralPage /></PublicLayout>} />

        {/* Email Confirmation & Password Reset Routes */}
        <Route path="/confirm-email" element={<ConfirmEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* User Routes */}
        <Route path="/user/login" element={<UserLoginPage />} />
        <Route path="/user/register" element={<UserRegisterPage />} />
        <Route path="/user/dashboard" element={<UserDashboardPage />} />
        <Route path="/user/subscribe" element={<UserSubscribePage />} />

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
          <Route path="packages" element={<PackageManagement />} />
          <Route path="addons" element={<AddonsManagement />} />
          <Route path="selfvalue" element={<SelfValueManagement />} />
          <Route path="referral" element={<ReferralManagement />} />
          <Route path="referral-settings" element={<ReferralSettings />} />
          <Route path="banner" element={<BannerManagement />} />
          <Route path="matches" element={<MatchesManagement />} />
          <Route path="reports" element={<ReportsManagement />} />
          <Route path="testimonials" element={<TestimonialManagement />} />
          <Route path="pendampingan" element={<PendampinganManagement />} />
          <Route path="chats" element={<ChatsManagement />} />
          <Route path="blocked" element={<BlockedUsersManagement />} />
          <Route path="settings" element={<SettingsPlaceholder />} />
          <Route path="chat-keywords" element={<ChatKeywordSensor />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <UserAuthProvider>
        <AppRoutes />
      </UserAuthProvider>
    </AuthProvider>
  )
}
