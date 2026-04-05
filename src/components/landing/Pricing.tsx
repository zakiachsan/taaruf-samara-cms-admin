import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: 'Rp 0',
    period: 'Selamanya',
    description: 'Coba platform taaruf kami tanpa biaya',
    features: [
      '3 profil lihat per hari',
      'Chat terbatas',
      'Filter dasar',
      'Profil terverifikasi',
      'Akses komunitas'
    ],
    cta: 'Mulai Gratis',
    highlighted: false
  },
  {
    name: 'Basic',
    price: 'Rp 50.000',
    period: '/bulan',
    description: 'Untuk yang serius mencari jodoh',
    features: [
      'Unlimited profil lihat',
      'Unlimited chat',
      'Filter lanjutan',
      'Lihat yang menyukai Anda',
      'Badge Basic member',
      'Prioritas support'
    ],
    cta: 'Pilih Basic',
    highlighted: true
  },
  {
    name: 'Premium',
    price: 'Rp 300.000',
    period: 'sekali bayar',
    description: 'Pendampingan penuh sampai menikah',
    features: [
      '3x Kesempatan Taaruf',
      'Pendampingan Admin via WhatsApp',
      'Konseling & Tes Lengkap',
      'Sertifikasi Self-Value',
      'Akses Member Premium',
      'Bedah Value & CV',
      'Tes STIFIn (opsional)',
      'Nadzor (pendampingan offline)'
    ],
    cta: 'Pilih Premium',
    highlighted: false,
    badge: 'Paling Populer'
  }
]

export default function Pricing() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-pink-50 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-3 sm:mb-4">
            <span className="text-xs sm:text-sm font-medium text-pink-700">Pilihan Paket</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Investasi untuk Masa Depan
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
            Pilih paket yang sesuai dengan kebutuhan dan budget Anda. Semua paket membantu Anda mendekatkan pada jodoh impian.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-5 sm:p-6 lg:p-8 ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-2xl scale-105'
                  : 'bg-white border border-gray-200 hover:border-emerald-200 hover:shadow-xl'
              } transition-all duration-300`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-pink-500 text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-1 rounded-full shadow-lg">
                    {plan.badge}
                  </div>
                </div>
              )}

              {/* Plan Name */}
              <div className="text-center mb-4 sm:mb-6">
                <h3 className={`text-lg sm:text-xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
              </div>

              {/* Price */}
              <div className="text-center mb-4">
                <div className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                  {plan.price}
                </div>
                <div className={`text-sm ${plan.highlighted ? 'text-emerald-100' : 'text-gray-500'}`}>
                  {plan.period}
                </div>
              </div>

              {/* Description */}
              <p className={`text-center text-sm mb-6 ${plan.highlighted ? 'text-emerald-100' : 'text-gray-600'}`}>
                {plan.description}
              </p>

              {/* Features */}
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

              {/* CTA Button */}
              <button
                disabled
                className={`w-full py-3 rounded-xl font-medium transition-colors ${
                  plan.highlighted
                    ? 'bg-white text-emerald-600 hover:bg-emerald-50'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Trust Note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            💡 Pembayaran aman dan terpercaya. Garansi uang kembali jika tidak puas.
          </p>
        </div>
      </div>
    </section>
  )
}
