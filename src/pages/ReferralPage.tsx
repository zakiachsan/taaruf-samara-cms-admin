import { Link } from 'react-router-dom'
import { Users, Gift, DollarSign, Share2, CheckCircle } from 'lucide-react'

const steps = [
  {
    icon: Share2,
    title: 'Bagikan Kode Referral',
    description: 'Dapatkan kode referral unik Anda di aplikasi Taaruf Samara, lalu bagikan ke teman-teman melalui WhatsApp, media sosial, atau pesan langsung.'
  },
  {
    icon: Users,
    title: 'Teman Mendaftar',
    description: 'Teman Anda mendaftar di Taaruf Samara menggunakan kode referral Anda. Mereka akan langsung mendapat manfaat khusus dari kode tersebut.'
  },
  {
    icon: CheckCircle,
    title: 'Teman Berlangganan',
    description: 'Setelah teman Anda berlangganan paket berbayar (Basic atau Premium), Anda akan mendapatkan reward dari program referral.'
  },
  {
    icon: Gift,
    title: 'Dapatkan Reward',
    description: 'Reward akan dikreditkan ke akun Anda. Semakin banyak teman yang bergabung, semakin besar benefit yang Anda dapatkan.'
  }
]

export default function ReferralPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Gift className="w-16 h-16 mx-auto mb-4 opacity-90" />
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Program Referral Taaruf Samara
          </h1>
          <p className="text-green-100 text-lg max-w-2xl mx-auto">
            Ajak teman menemukan jodoh dan dapatkan reward menarik untuk setiap referral yang berhasil
          </p>
        </div>
      </div>

      {/* Cara Kerja */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Cara Kerja</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="bg-white rounded-2xl border border-gray-200 p-6 relative">
                <div className="absolute -top-3 -left-2 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex items-start gap-4 mt-2">
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{step.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Benefits */}
        <div className="mt-16 bg-white rounded-2xl border border-gray-200 p-8 md:p-10">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Keuntungan Program Referral</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Reward Finansial</h3>
              <p className="text-gray-600 text-sm">Dapatkan reward untuk setiap teman yang berhasil berlangganan paket berbayar.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Bantu Teman</h3>
              <p className="text-gray-600 text-sm">Bantu teman menemukan jodoh melalui platform ta&apos;aruf yang aman dan terpercaya.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Gift className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Tanpa Batas</h3>
              <p className="text-gray-600 text-sm">Ajak teman sebanyak mungkin. Tidak ada batasan jumlah referral yang bisa Anda berikan.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-center text-white">
          <h3 className="text-xl font-bold mb-2">Siap Mengajak Teman?</h3>
          <p className="text-green-100 mb-6">Download aplikasi Taaruf Samara dan dapatkan kode referral Anda sekarang</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-white text-emerald-700 px-6 py-3 rounded-xl font-semibold hover:bg-green-50 transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  )
}
