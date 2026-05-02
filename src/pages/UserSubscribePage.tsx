import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useUserAuth } from '../contexts/UserAuthContext'
import { useWebSubscription, formatPrice } from '../hooks/useWebSubscription'
import { Button } from '../components/ui/button'
import PublicLayout from '../layouts/PublicLayout'
import {
  Check,
  CreditCard,
  Shield,
  Star,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Package,
  Heart,
} from 'lucide-react'

export default function UserSubscribePage() {
  const { user, isAuthenticated, loading: authLoading } = useUserAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const paymentStatus = searchParams.get('payment')
  const preselectedPackageId = searchParams.get('package')

  const {
    packages,
    addons,
    selectedPackage,
    selectedAddons,
    currentPurchase,
    loadingPackages,
    loadingAddons,
    purchasing,
    selectPackage,
    toggleAddon,
    isAddonSelected,
    purchase,
    totalPrice,
    packagePrice,
    addonsPrice,
  } = useWebSubscription(user?.id)

  const [showAllAddons, setShowAllAddons] = useState(false)

  // Auto-select package from URL param or current subscription
  useEffect(() => {
    if (loadingPackages || packages.length === 0) return
    if (selectedPackage) return

    if (preselectedPackageId) {
      const found = packages.find(p => p.id === preselectedPackageId)
      if (found) {
        selectPackage(found)
        return
      }
    }

    if (currentPurchase?.package?.id) {
      const current = packages.find(p => p.id === currentPurchase.package?.id)
      if (current) selectPackage(current)
    }
  }, [loadingPackages, packages, preselectedPackageId, currentPurchase, selectedPackage, selectPackage])

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      const redirectUrl = preselectedPackageId
        ? `/user/subscribe?package=${preselectedPackageId}`
        : '/user/subscribe'
      navigate(`/user/login?redirect=${encodeURIComponent(redirectUrl)}`)
      return
    }
    if (!selectedPackage) return
    const result = await purchase()
    if (!result.success && result.error) {
      alert(result.error)
    }
  }

  const displayedAddons = showAllAddons ? addons : addons.slice(0, 4)

  if (authLoading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      {/* Hero header */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white py-12">
        <div className="max-w-3xl mx-auto px-4">
          <Link
            to={isAuthenticated ? '/user/dashboard' : '/'}
            className="inline-flex items-center gap-2 text-emerald-200 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">{isAuthenticated ? 'Kembali ke Dashboard' : 'Kembali ke Beranda'}</span>
          </Link>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-full mb-4">
              <Heart className="text-white" size={28} />
            </div>
            <h1 className="text-3xl font-bold mb-2">Pilih Paket Berlangganan</h1>
            <p className="text-emerald-100 text-lg">Mulai perjalanan ta'aruf Anda dengan paket yang sesuai</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Payment status banners */}
          {paymentStatus === 'success' && (
            <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                <Check className="text-emerald-600" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-emerald-800">Pembayaran Berhasil!</h3>
                <p className="text-sm text-emerald-700 mt-1">
                  Langganan Anda sedang diproses. Kami akan mengonfirmasi setelah pembayaran terverifikasi.
                </p>
              </div>
            </div>
          )}
          {paymentStatus === 'cancel' && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                <Shield className="text-amber-600" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-amber-800">Pembayaran Dibatalkan</h3>
                <p className="text-sm text-amber-700 mt-1">
                  Anda dapat melanjutkan pembayaran nanti dari halaman ini.
                </p>
              </div>
            </div>
          )}

          {/* Active subscription banner */}
          {currentPurchase && (
            <div className="mb-6 bg-white border border-emerald-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                <Package className="text-emerald-600" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-emerald-800">
                  Langganan Aktif: {currentPurchase.package?.display_name}
                </h3>
                <p className="text-sm text-emerald-600 mt-1">
                  Berlaku hingga {new Date(currentPurchase.expires_at).toLocaleDateString('id-ID', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Package Selection */}
          {loadingPackages ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
            </div>
          ) : (
            <div className="space-y-4 mb-8">
              {packages.map(pkg => {
                const isSelected = selectedPackage?.id === pkg.id
                const isFree = pkg.name === 'free' || pkg.duration_months === 0
                const isCurrent = currentPurchase?.package?.id === pkg.id
                const isPopular = pkg.is_popular

                return (
                  <button
                    key={pkg.id}
                    onClick={() => selectPackage(pkg)}
                    className={`relative w-full text-left rounded-2xl p-6 transition-all duration-200 ${
                      isSelected
                        ? isPopular
                          ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg scale-[1.02]'
                          : 'bg-emerald-50 border-2 border-emerald-500 shadow-md'
                        : 'bg-white border border-gray-200 hover:border-emerald-200 hover:shadow-md'
                    }`}
                  >
                    {/* Badges */}
                    {isCurrent && (
                      <span className="absolute -top-2.5 right-4 bg-emerald-600 text-white text-xs font-semibold px-3 py-0.5 rounded-full">
                        Paket Saat Ini
                      </span>
                    )}
                    {!isCurrent && isPopular && !isSelected && (
                      <span className="absolute -top-2.5 right-4 bg-pink-500 text-white text-xs font-semibold px-3 py-0.5 rounded-full flex items-center gap-1">
                        <Star size={12} /> Rekomendasi
                      </span>
                    )}
                    {isSelected && isPopular && (
                      <span className="absolute -top-2.5 right-4 bg-white text-emerald-600 text-xs font-semibold px-3 py-0.5 rounded-full flex items-center gap-1">
                        <Star size={12} /> Rekomendasi
                      </span>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`font-bold text-lg ${isSelected && isPopular ? 'text-white' : isSelected ? 'text-emerald-700' : 'text-gray-900'}`}>
                          {pkg.display_name}
                        </h3>
                        {!isFree && !isCurrent && (
                          <p className={`text-2xl font-bold mt-1 ${isSelected && isPopular ? 'text-white' : 'text-gray-900'}`}>
                            {formatPrice(pkg.price)}
                          </p>
                        )}
                      </div>
                      <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? isPopular ? 'border-white bg-white' : 'border-emerald-500 bg-emerald-500'
                          : 'border-gray-300'
                      }`}>
                        {isSelected && <Check className={isPopular ? 'text-emerald-600' : 'text-white'} size={18} />}
                      </div>
                    </div>

                    {pkg.features && pkg.features.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {pkg.features.slice(0, 4).map((f, i) => (
                          <span key={i} className={`flex items-center gap-2 text-sm ${
                            isSelected && isPopular ? 'text-emerald-100' : 'text-gray-600'
                          }`}>
                            <Check size={14} className={isSelected && isPopular ? 'text-emerald-200' : 'text-emerald-500'} />
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* Add-ons */}
          {addons.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Fitur Tambahan Pendukung</h2>
                  <p className="text-sm text-gray-500">Tingkatkan pengalaman dengan fitur tambahan</p>
                </div>
                <Sparkles className="text-emerald-500" size={20} />
              </div>

              {loadingAddons ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500" />
                </div>
              ) : (
                <div className="space-y-3">
                  {displayedAddons.map(addon => {
                    const selected = isAddonSelected(addon.id)
                    return (
                      <button
                        key={addon.id}
                        onClick={() => toggleAddon(addon.id)}
                        className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                          selected
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 bg-white hover:border-emerald-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{addon.name}</span>
                              {addon.is_popular && (
                                <span className="bg-pink-100 text-pink-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                                  Populer
                                </span>
                              )}
                            </div>
                            {addon.description && (
                              <p className="text-sm text-gray-500 mt-1">{addon.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-3 ml-4">
                            <span className="font-bold text-emerald-600">{formatPrice(addon.price)}</span>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              selected ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
                            }`}>
                              {selected && <Check className="text-white" size={14} />}
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}

                  {addons.length > 4 && (
                    <button
                      onClick={() => setShowAllAddons(!showAllAddons)}
                      className="w-full text-center py-2 text-emerald-600 hover:text-emerald-700 flex items-center justify-center gap-1 text-sm font-medium"
                    >
                      {showAllAddons ? (
                        <>Sembunyikan <ChevronUp size={16} /></>
                      ) : (
                        <>Lihat {addons.length - 4} fitur tambahan lainnya <ChevronDown size={16} /></>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Summary & CTA */}
          {selectedPackage && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 mb-6">
              <h3 className="font-bold text-lg mb-4 text-gray-900">Ringkasan Pembelian</h3>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Paket {selectedPackage.display_name}</span>
                  <span className="font-medium text-gray-900">{formatPrice(packagePrice)}</span>
                </div>

                {selectedAddons.size > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Fitur Tambahan ({selectedAddons.size})</span>
                    <span className="font-medium text-gray-900">{formatPrice(addonsPrice)}</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-3 flex justify-between items-center mb-4">
                <span className="font-bold text-lg text-gray-900">Total</span>
                <span className="font-bold text-xl text-emerald-600">{formatPrice(totalPrice)}</span>
              </div>

              <Button
                className="w-full h-12 text-base bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handlePurchase}
                disabled={purchasing}
              >
                {purchasing ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Memproses...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CreditCard size={18} />
                    Lanjut Pembayaran - {formatPrice(totalPrice)}
                  </span>
                )}
              </Button>
            </div>
          )}

          {/* Trust badge */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-8">
            <Shield size={16} />
            <span>Pembayaran aman melalui iPaymu</span>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
