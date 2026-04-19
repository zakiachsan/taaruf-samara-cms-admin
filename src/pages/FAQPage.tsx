import { useState } from 'react'
import { ChevronDown, MessageCircle } from 'lucide-react'

const FAQ_ITEMS = [
  {
    question: 'Apa itu Taaruf Samara?',
    answer: 'Taaruf Samara adalah platform pernikahan Islam digital yang membantu Anda menemukan jodoh melalui proses ta\'aruf yang aman, terverifikasi, dan sesuai syariat Islam. Platform ini menyediakan fitur matchmaking berbasis AI, verifikasi profil oleh admin, serta pendampingan selama proses ta\'aruf.'
  },
  {
    question: 'Bagaimana cara mendaftar di Taaruf Samara?',
    answer: 'Cukup download aplikasi Taaruf Samara di Google Play Store, lalu daftar menggunakan email aktif. Setelah verifikasi email, lengkapi profil Anda dengan foto, data diri, dan preferensi pasangan. Tim admin akan memverifikasi profil Anda sebelum Anda bisa mulai mencari jodoh.'
  },
  {
    question: 'Apakah profil di Taaruf Samara diverifikasi?',
    answer: 'Ya, setiap profil yang didaftarkan akan diverifikasi oleh tim admin kami. Kami memvalidasi identitas melalui KTP dan foto profil untuk memastikan keamanan dan keaslian setiap pengguna. Hanya profil yang sudah terverifikasi yang bisa berinteraksi di platform.'
  },
  {
    question: 'Bagaimana proses ta\'aruf bekerja di platform ini?',
    answer: 'Prosesnya dimulai dari melihat profil rekomendasi AI, lalu mengirim permintaan connect jika tertarik. Setelah disetujui kedua belah pihak, Anda bisa berkomunikasi melalui fitur chat. Kami juga menyediakan layanan pendampingan oleh admin untuk membantu proses ta\'aruf berpartisipasi dalam program Sertifikasi Self-Value untuk meningkatkan kualitas profil.'
  },
  {
    question: 'Apa saja paket berlangganan yang tersedia?',
    answer: 'Kami menyediakan beberapa paket: Paket Free (fitur dasar dengan keterbatasan), Paket Basic (akses lebih banyak profil dan fitur chat), dan Paket Premium (fitur lengkap termasuk pendampingan admin, rekomendasi prioritas, dan sertifikasi Self-Value). Detail harga bisa dilihat di halaman Premium pada aplikasi.'
  },
  {
    question: 'Bagaimana cara upgrade ke Premium?',
    answer: 'Buka aplikasi Taaruf Samara, pilih menu "Upgrade Premium" di halaman profil atau home screen. Pilih paket yang sesuai, lalu lakukan pembayaran melalui metode yang tersedia. Setelah pembayaran berhasil, fitur premium langsung aktif di akun Anda.'
  },
  {
    question: 'Apa itu Sertifikasi Self-Value?',
    answer: 'Sertifikasi Self-Value adalah program unggulan Taaruf Samara dimana pengguna mengikuti sesi pendampingan dan konseling untuk memahami nilai diri sebelum memasuki proses ta\'aruf. Peserta yang lulus akan mendapat badge sertifikasi di profilnya yang meningkatkan kepercayaan calon pasangan.'
  },
  {
    question: 'Apakah data pribadi saya aman?',
    answer: 'Keamanan data adalah prioritas kami. Kami menggunakan enkripsi SSL untuk semua transmisi data, dan data disimpan dengan aman di server yang terlindungi. Foto profil default ditampilkan dengan blur untuk melindungi privasi. Kami mematuhi UU Pelindungan Data Pribadi (UU PDP) Indonesia.'
  },
  {
    question: 'Bagaimana cara berhenti berlangganan?',
    answer: 'Anda bisa berhenti berlangganan kapan saja melalui pengaturan di aplikasi. Langganan akan tetap aktif sampai periode yang sudah dibayar berakhir. Kami tidak melakukan perpanjangan otomatis tanpa persetujuan Anda.'
  },
  {
    question: 'Apakah ada program referral?',
    answer: 'Ya! Kami memiliki program referral dimana Anda bisa mendapatkan reward dengan mengajak teman bergabung di Taaruf Samara. Bagikan kode referral Anda, dan setiap teman yang mendaftar dan berlangganan akan memberikan Anda benefit khusus.'
  },
  {
    question: 'Bagaimana jika ada kendala atau ingin melaporkan pengguna?',
    answer: 'Anda bisa menghubungi customer service kami melalui WhatsApp di +62 857-8230-4240 atau email taarufsamara2026@gmail.com. Untuk melaporkan pengguna yang melanggar aturan, gunakan fitur "Laporkan" yang tersedia di setiap profil. Tim kami akan menindaklanjuti setiap laporan dalam 1x24 jam.'
  },
  {
    question: 'Apakah Taaruf Samara tersedia di iOS?',
    answer: 'Saat ini Taaruf Samara tersedia di Google Play Store untuk perangkat Android. Versi iOS sedang dalam pengembangan dan akan segera tersedia di Apple App Store.'
  }
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Pertanyaan yang Sering Diajukan
          </h1>
          <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
            Temukan jawaban untuk pertanyaan umum tentang Taaruf Samara
          </p>
        </div>
      </div>

      {/* FAQ Items */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900 pr-4">{item.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5">
                  <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still have questions */}
        <div className="mt-12 bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Masih ada pertanyaan?
          </h3>
          <p className="text-gray-600 mb-6">
            Hubungi kami dan tim kami siap membantu Anda
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/6285782304240"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Chat WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
