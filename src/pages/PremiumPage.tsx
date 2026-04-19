import { Link } from 'react-router-dom'
import { Check, Crown, Sparkles, Shield } from 'lucide-react'
import { usePackages, formatPackageForDisplay } from '../hooks/usePackages'

const premiumBenefits = [
  { icon: Crown, text: 'Akses tidak terbatas ke semua profil' },
  { icon: Sparkles, text: 'Rekomendasi prioritas dari AI' },
  { icon: Shield, text: 'Pendampingan admin via WhatsApp' },
  { icon: Check, text: 'Kuota connect/likes tanpa batas' },
  { icon: Check, text: 'Lihat foto profil tanpa blur' },
  { icon: Check, text: 'Sertifikasi Self-Value gratis' },
]

export default function PremiumPage() {
  const { packages, loading, error } = usePackages()
  const plans = packages.map(formatPackageForDisplay)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-pink-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Crown className="w-16 h-16 mx-auto mb-4 opacity-90" />
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Paket Berlangganan
          </h1>
          <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
            Investasi untuk masa depan. Pilih paket yang sesuai dengan kebutuhan dan dekatkan diri pada jodoh impian.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="mt-4 text-gray-500">Memuat paket...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-700">Gagal memuat paket. Silakan coba lagi nanti.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-2xl p-6 lg:p-8 ${
                  plan.highlighted
                    ? 'bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-2xl md:scale-105'
                    : 'bg-white border border-gray-200 hover:border-emerald-200 hover:shadow-xl'
                } transition-all duration-300`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="bg-pink-500 text-white text-xs font-medium px-4 py-1 rounded-full shadow-lg">
                      {plan.badge}
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className={`text-xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                </div>

                <div className="text-center mb-4">
                  <div className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price}
                  </div>
                  <div className={`text-sm ${plan.highlighted ? 'text-emerald-100' : 'text-gray-500'}`}>
                    {plan.period}
                  </div>
                </div>

                <p className={`text-center text-sm mb-6 ${plan.highlighted ? 'text-emerald-100' : 'text-gray-600'}`}>
                  {plan.description}
                </p>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                        plan.highlighted ? 'bg-emerald-400' : 'bg-emerald-100'
                      }`}>
                        <Check className={`w-3 h-3 ${plan.highlighted ? 'text-emerald-900' : 'text-emerald-600'}`} />
                      </div>
                      <span className={`text-sm ${plan.highlighted ? 'text-white' : 'text-gray-600'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/"
                  className={`block w-full py-3 rounded-xl font-medium text-center transition-colors ${
                    plan.highlighted
                      ? 'bg-white text-emerald-600 hover:bg-emerald-50'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Benefits */}
        <div className="mt-16 bg-white rounded-2xl border border-gray-200 p-8 md:p-10">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Kenapa Upgrade ke Premium?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {premiumBenefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div key={index} className="flex items-center gap-3 p-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-gray-700">{benefit.text}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Trust */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Pembayaran aman dan terpercaya melalui iPaymu. <Link to="/refund" className="text-emerald-600 hover:underline">Lihat kebijakan refund</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
