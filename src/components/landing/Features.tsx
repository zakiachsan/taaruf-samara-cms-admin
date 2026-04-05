import { ShieldCheck, Sparkles, Users, MessageCircle, Heart, Filter, Lock, Award, Gift } from 'lucide-react'

const features = [
  {
    icon: ShieldCheck,
    title: 'Profil Terverifikasi',
    description: 'Semua profil diverifikasi oleh admin dengan validasi KTP untuk keamanan dan kenyamanan semua member.',
    color: 'from-emerald-500 to-teal-500'
  },
  {
    icon: Sparkles,
    title: 'Rekomendasi AI',
    description: 'Sistem kecerdasan buatan yang mencarikan pasangan yang cocok berdasarkan preferensi dan kriteria Anda.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: Users,
    title: 'Pendampingan Admin',
    description: 'Untuk member Premium, admin akan memandu proses taaruf melalui WhatsApp hingga tahap Nadzor.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Award,
    title: 'Sertifikasi Self-Value',
    description: 'Program sertifikasi karakter untuk mengenal diri sendiri dan mengetahui tipe pasangan yang cocok.',
    color: 'from-amber-500 to-orange-500'
  },
  {
    icon: MessageCircle,
    title: 'Chat Aman',
    description: 'Sistem pesan yang aman dengan fitur report dan block untuk menjaga kenyamanan berkomunikasi.',
    color: 'from-rose-500 to-pink-500'
  },
  {
    icon: Filter,
    title: 'Filter Pencarian',
    description: 'Cari pasangan berdasarkan usia, lokasi, pendidikan, etnis, dan preferensi lainnya dengan mudah.',
    color: 'from-indigo-500 to-purple-500'
  },
  {
    icon: Gift,
    title: 'Program Referral',
    description: 'Dapatkan penghasilan tambahan dengan mengajak teman bergabung. Rp 10.000 per referral yang berhasil berlangganan.',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Lock,
    title: 'Privasi Terjaga',
    description: 'Kontrol penuh atas privasi Anda. Sembunyikan foto, gunakan nama samaran, dan batasi akses.',
    color: 'from-slate-500 to-gray-500'
  }
]

export default function Features() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-emerald-50 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-3 sm:mb-4">
            <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
            <span className="text-xs sm:text-sm font-medium text-emerald-700">Fitur Unggulan</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Mengapa Taaruf Samara?
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
            Fitur-fitur yang dirancang khusus untuk memudahkan proses taaruf Anda sesuai dengan syariat Islam
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 hover:border-emerald-200 hover:shadow-xl transition-all duration-300"
              >
                {/* Icon */}
                <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
