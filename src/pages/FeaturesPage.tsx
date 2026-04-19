import { Link } from 'react-router-dom'
import { ShieldCheck, Sparkles, Users, MessageCircle, Filter, Lock, Award, Gift } from 'lucide-react'

const features = [
  {
    icon: ShieldCheck,
    title: 'Profil Terverifikasi',
    description: 'Semua profil diverifikasi oleh admin dengan validasi KTP untuk keamanan dan kenyamanan semua member.',
    detail: 'Proses verifikasi meliputi pengecekan KTP, selfie verifikasi, dan review oleh tim admin kami. Ini memastikan setiap pengguna di platform Taaruf Samara adalah orang yang benar-benar serius mencari jodoh melalui proses ta\'aruf.',
    color: 'from-emerald-500 to-teal-500'
  },
  {
    icon: Sparkles,
    title: 'Rekomendasi AI',
    description: 'Sistem kecerdasan buatan yang mencarikan pasangan yang cocok berdasarkan preferensi dan kriteria Anda.',
    detail: 'Algoritma AI kami menganalisis preferensi usia, lokasi, pendidikan, latar belakang, dan kriteria lainnya untuk menampilkan profil yang paling relevan. Semakin sering Anda menggunakan aplikasi, semakin akurat rekomendasi yang diberikan.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: Users,
    title: 'Pendampingan Admin',
    description: 'Untuk member Premium, admin akan memandu proses taaruf melalui WhatsApp hingga tahap Nadzor.',
    detail: 'Tim pendamping kami yang berpengalaman akan membantu menjembatani komunikasi, memberikan saran, dan memastikan proses ta\'aruf berjalan sesuai syariat Islam. Layanan ini tersedia untuk member Premium.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Award,
    title: 'Sertifikasi Self-Value',
    description: 'Program sertifikasi karakter untuk mengenal diri sendiri dan mengetahui tipe pasangan yang cocok.',
    detail: 'Program unggulan ini membantu Anda memahami nilai diri, kepribadian, dan kesiapan memasuki hubungan. Peserta yang lulus akan mendapat badge sertifikasi di profilnya, meningkatkan kepercayaan calon pasangan.',
    color: 'from-amber-500 to-orange-500'
  },
  {
    icon: MessageCircle,
    title: 'Chat Aman',
    description: 'Sistem pesan yang aman dengan fitur report dan block untuk menjaga kenyamanan berkomunikasi.',
    detail: 'Berkomunikasi dengan tenang melalui sistem chat yang dilengkapi fitur report dan block. Semua pesan terenkripsi dan privasi Anda terjaga. Admin juga memantau aktivitas untuk mencegah perilaku yang tidak pantas.',
    color: 'from-rose-500 to-pink-500'
  },
  {
    icon: Filter,
    title: 'Filter Pencarian',
    description: 'Cari pasangan berdasarkan usia, lokasi, pendidikan, etnis, dan preferensi lainnya dengan mudah.',
    detail: 'Tentukan kriteria pasangan ideal Anda dengan filter yang lengkap: rentang usia, lokasi kota, tingkat pendidikan, suku/etnis, status pekerjaan, dan banyak lagi. Temukan jodoh yang benar-benar sesuai dengan kriteria Anda.',
    color: 'from-indigo-500 to-purple-500'
  },
  {
    icon: Gift,
    title: 'Program Referral',
    description: 'Dapatkan reward dengan mengajak teman bergabung di Taaruf Samara.',
    detail: 'Bagikan kode referral unik Anda ke teman-teman. Setiap teman yang mendaftar dan berlangganan akan memberikan Anda benefit khusu. Semakin banyak teman yang Anda ajak, semakin besar reward yang Anda dapatkan.',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Lock,
    title: 'Privasi Terjaga',
    description: 'Kontrol penuh atas privasi Anda. Sembunyikan foto, gunakan nama samaran, dan batasi akses.',
    detail: 'Secara default, foto profil ditampilkan dengan blur. Hanya pengguna premium atau yang sudah saling terhubung yang bisa melihat foto jelas. Anda juga bisa menggunakan nama samaran dan mengatur siapa yang bisa melihat profil Anda.',
    color: 'from-slate-500 to-gray-500'
  }
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Fitur Taaruf Samara
          </h1>
          <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
            Fitur-fitur yang dirancang khusus untuk memudahkan proses ta&apos;aruf Anda sesuai dengan syariat Islam
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed mb-3">{feature.description}</p>
                    <p className="text-gray-500 text-sm leading-relaxed">{feature.detail}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-6">Tertarik menggunakan fitur-fitur ini?</p>
          <Link
            to="/premium"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
          >
            Lihat Paket Premium
          </Link>
        </div>
      </div>
    </div>
  )
}
