import { Link } from 'react-router-dom'
import { Award, BookOpen, Heart, Shield, Users, CheckCircle } from 'lucide-react'

const benefits = [
  {
    icon: Heart,
    title: 'Kenali Diri Sendiri',
    description: 'Pahami kepribadian, nilai, dan kebutuhan Anda dalam hubungan melalui sesi pendampingan terstruktur.'
  },
  {
    icon: Shield,
    title: 'Profil Lebih Dipercaya',
    description: 'Badge sertifikasi di profil Anda menunjukkan keseriusan dan kesiapan memasuki proses ta\'aruf.'
  },
  {
    icon: Users,
    title: 'Pendampingan Ahli',
    description: 'Dibimbing oleh tim pendamping berpengalaman yang memahami proses ta\'aruf sesuai syariat Islam.'
  },
  {
    icon: BookOpen,
    title: 'Wawasan Berharga',
    description: 'Dapatkan insight tentang tipe pasangan yang cocok dan cara membangun rumah tangga sakinah.'
  }
]

const process = [
  {
    step: 1,
    title: 'Daftar Program',
    description: 'Aktifkan program Self-Value melalui aplikasi Taaruf Samara (tersedia untuk member Premium).'
  },
  {
    step: 2,
    title: 'Sesi Pendampingan',
    description: 'Ikuti sesi konseling dan pendampingan bersama tim kami untuk mengenal diri sendiri lebih dalam.'
  },
  {
    step: 3,
    title: 'Evaluasi & Sertifikasi',
    description: 'Setelah menyelesaikan program, Anda akan mendapat badge sertifikasi Self-Value di profil Anda.'
  }
]

export default function SelfValuePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Award className="w-16 h-16 mx-auto mb-4 opacity-90" />
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Sertifikasi Self-Value
          </h1>
          <p className="text-amber-100 text-lg max-w-2xl mx-auto">
            Kenali diri sendiri sebelum menemukan jodoh. Program sertifikasi karakter eksklusif dari Taaruf Samara.
          </p>
        </div>
      </div>

      {/* What is Self-Value */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 md:p-10 mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Apa itu Self-Value?</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Self-Value adalah program sertifikasi unggulan Taaruf Samara yang dirancang untuk membantu Anda memahami nilai diri, kepribadian, dan kesiapan sebelum memasuki proses ta&apos;aruf.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Melalui serangkaian sesi pendampingan dan konseling, Anda akan mendapatkan pemahaman yang lebih baik tentang diri sendiri dan tipe pasangan yang paling cocok untuk Anda. Peserta yang berhasil menyelesaikan program akan mendapatkan badge sertifikasi yang ditampilkan di profil.
          </p>
        </div>

        {/* Benefits */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Manfaat Program</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <div key={index} className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{benefit.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Process */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 md:p-10 mb-10">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Proses Sertifikasi</h2>
          <div className="space-y-6">
            {process.map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Badge Preview */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-8 text-center text-white mb-10">
          <Award className="w-12 h-12 mx-auto mb-3 opacity-90" />
          <h3 className="text-xl font-bold mb-2">Badge Self-Value di Profil Anda</h3>
          <p className="text-amber-100 mb-4">Setelah lulus sertifikasi, profil Anda akan menampilkan badge khusus yang meningkatkan kepercayaan calon pasangan.</p>
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Terverifikasi Self-Value</span>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">Tersedia untuk member Premium. Upgrade sekarang untuk mengikuti program.</p>
          <Link
            to="/premium"
            className="inline-flex items-center gap-2 bg-amber-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-amber-600 transition-colors"
          >
            Lihat Paket Premium
          </Link>
        </div>
      </div>
    </div>
  )
}
