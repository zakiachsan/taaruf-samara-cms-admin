import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserAuth } from '../contexts/UserAuthContext'
import { supabase } from '../lib/supabase'
import PublicLayout from '../layouts/PublicLayout'
import type { SubscriptionPurchase } from '../types'
import { formatPrice, useWebSubscription } from '../hooks/useWebSubscription'
import {
  CreditCard,
  LogOut,
  Package,
  User,
  Check,
  Clock,
  AlertCircle,
  ExternalLink,
  Crown,
} from 'lucide-react'

export default function UserDashboardPage() {
  const { user, isAuthenticated, loading: authLoading, signOut } = useUserAuth()
  const navigate = useNavigate()
  const [purchases, setPurchases] = useState<SubscriptionPurchase[]>([])
  const [loadingPurchases, setLoadingPurchases] = useState(true)
  const { currentPurchase } = useWebSubscription(user?.id)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/user/login?redirect=/user/dashboard')
    }
  }, [authLoading, isAuthenticated, navigate])

  useEffect(() => {
    if (!user?.id) return
    const fetch = async () => {
      try {
        setLoadingPurchases(true)
        const { data } = await supabase
          .from('subscription_purchases')
          .select('*, package:subscription_packages(*)')
          .eq('user_id', user.id)
          .in('status', ['paid', 'success'])
          .order('created_at', { ascending: false })
          .limit(10)
        setPurchases((data as SubscriptionPurchase[]) || [])
      } catch (err) {
        console.error('Error fetching purchases:', err)
      } finally {
        setLoadingPurchases(false)
      }
    }
    fetch()
  }, [user?.id])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const handlePurchaseClick = (p: SubscriptionPurchase) => {
    const paymentUrl = p.midtrans_redirect_url || p.ipaymu_payment_url
    if (paymentUrl) {
      window.open(paymentUrl, '_blank')
    }
  }

  const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    paid: { color: 'bg-emerald-100 text-emerald-700', icon: <Check size={14} />, label: 'Berhasil' },
    success: { color: 'bg-emerald-100 text-emerald-700', icon: <Check size={14} />, label: 'Berhasil' },
    pending: { color: 'bg-amber-100 text-amber-700', icon: <Clock size={14} />, label: 'Menunggu' },
    expired: { color: 'bg-gray-100 text-gray-600', icon: <AlertCircle size={14} />, label: 'Kadaluarsa' },
    cancelled: { color: 'bg-red-100 text-red-700', icon: <AlertCircle size={14} />, label: 'Dibatalkan' },
  }

  if (authLoading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Header */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <User className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {user?.profile?.full_name || 'Pengguna'}
                </h1>
                <p className="text-emerald-100 text-sm">{user?.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  {user?.profile?.is_verified && (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-900 bg-emerald-200 px-2 py-0.5 rounded-full">
                      <Check size={12} /> Terverifikasi
                    </span>
                  )}
                  {currentPurchase ? (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-900 bg-amber-200 px-2 py-0.5 rounded-full">
                      <Crown size={12} /> {currentPurchase.package?.display_name || 'Premium'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-700 bg-gray-200 px-2 py-0.5 rounded-full">
                      <Package size={12} /> Gratis
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4 mb-8 -mt-6">
            <button
              onClick={() => navigate('/user/subscribe')}
              className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col items-center gap-2 hover:border-emerald-200 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Package className="text-emerald-600" size={24} />
              </div>
              <span className="text-sm font-semibold text-gray-900">Langganan</span>
            </button>
            <button
              onClick={handleSignOut}
              className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col items-center gap-2 hover:border-red-200 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                <LogOut className="text-gray-500" size={24} />
              </div>
              <span className="text-sm font-semibold text-gray-900">Keluar</span>
            </button>
          </div>

          {/* Purchase History */}
          <h3 className="text-lg font-bold text-gray-900 mb-4">Riwayat Langganan</h3>

          {loadingPurchases ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
            </div>
          ) : purchases.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="text-gray-300" size={32} />
              </div>
              <p className="text-gray-600 mb-4">Belum ada riwayat langganan</p>
              <button
                onClick={() => navigate('/user/subscribe')}
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
              >
                <CreditCard size={16} />
                Berlangganan Sekarang
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {purchases.map(p => {
                  const s = statusConfig[p.status] || statusConfig.pending
                  return (
                    <div
                      key={p.id}
                      onClick={() => handlePurchaseClick(p)}
                      className="bg-white rounded-2xl border border-gray-200 p-5 cursor-pointer hover:border-emerald-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900">
                            {p.package?.display_name || 'Paket'}
                          </p>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {new Date(p.created_at).toLocaleDateString('id-ID', {
                              year: 'numeric', month: 'short', day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${s.color}`}>
                            {s.icon} {s.label}
                          </span>
                          <p className="text-sm font-bold text-gray-900 mt-1">
                            {formatPrice(p.total_amount)}
                          </p>
                          <p className="text-xs text-emerald-600 mt-0.5 inline-flex items-center gap-0.5">
                            <ExternalLink size={10} /> Lihat detail pembayaran
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}

          {/* Footer note */}
          <p className="text-center text-xs text-gray-400 mt-10">
            Untuk fitur lengkap seperti chat dan profil, silakan gunakan aplikasi Taaruf Samara.
          </p>
        </div>
      </div>
    </PublicLayout>
  )
}
