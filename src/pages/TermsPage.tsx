import { Link } from 'react-router-dom'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Syarat & Ketentuan
          </h1>
          <p className="text-emerald-100 text-lg">
            Terakhir diperbarui: 18 April 2026
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 md:p-12 space-y-8">
          <p className="text-gray-600 leading-relaxed">
            Selamat datang di Taaruf Samara. Dengan mengunduh, mengakses, atau menggunakan aplikasi Taaruf Samara (&quot;Aplikasi&quot;), Anda setuju untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak setuju dengan syarat-syarat ini, mohon untuk tidak menggunakan Aplikasi.
          </p>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Penerimaan Syarat</h2>
            <p className="text-gray-600 leading-relaxed">
              Dengan mengakses dan menggunakan Taaruf Samara, Anda mengakui bahwa Anda telah membaca, memahami, dan setuju untuk terikat oleh Syarat dan Ketentuan ini serta Kebijakan Privasi kami. Jika Anda menggunakan Aplikasi atas nama orang lain, Anda menyatakan bahwa Anda memiliki otoritas untuk mengikat orang tersebut pada syarat-syarat ini.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Deskripsi Layanan</h2>
            <p className="text-gray-600 leading-relaxed">
              Taaruf Samara adalah platform pernikahan Islam digital yang menyediakan layanan mempertemukan calon pasangan untuk proses ta&apos;aruf. Platform ini memungkinkan pengguna untuk membuat profil, melihat profil pengguna lain, mengirim permintaan ta&apos;aruf, dan berkomunikasi melalui fitur chat yang tersedia.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Kelayakan Pengguna</h2>
            <p className="text-gray-600 leading-relaxed mb-3">Untuk menggunakan Taaruf Samara, Anda harus:</p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Berusia minimal 18 tahun atau sudah dewasa menurut hukum Indonesia</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Muslim dan mencari pasangan sesama muslim</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Tidak dalam ikatan pernikahan dengan orang lain</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Menyediakan informasi yang akurat dan lengkap</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Bertanggung jawab atas penggunaan akun Anda</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Pendaftaran dan Akun</h2>
            <p className="text-gray-600 leading-relaxed mb-3">Anda setuju untuk:</p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Menyediakan informasi pendaftaran yang akurat dan terkini</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Menjaga kerahasiaan kata sandi akun Anda</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Bertanggung jawab atas semua aktivitas yang terjadi di akun Anda</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Segera memberitahu kami jika ada penggunaan tidak sah atas akun Anda</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Paket Berlangganan dan Pembayaran</h2>
            <p className="text-gray-600 leading-relaxed mb-3">Taaruf Samara menyediakan paket berlangganan dengan fitur berbeda:</p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Paket Free: Fitur dasar dengan keterbatasan</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Paket Basic: Akses tidak terbatas dengan fitur standar</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Paket Premium: Fitur lengkap termasuk pendampingan dan konseling</span></li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-3">
              Pembayaran dilakukan melalui mitra pembayaran pihak ketiga (Midtrans). Semua transaksi bersifat final dan tidak dapat dikembalikan kecuali ditentukan lain oleh <Link to="/refund" className="text-emerald-600 hover:underline">kebijakan refund kami</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Penggunaan yang Dilarang</h2>
            <p className="text-gray-600 leading-relaxed mb-3">Anda tidak diperkenankan untuk:</p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Menggunakan identitas palsu atau mengklaim sebagai orang lain</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Memuat konten yang tidak sesuai dengan nilai-nilai Islam</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Mengirim spam, konten terlarang, atau materi berbahaya</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Melanggar hak privasi atau properti intelektual orang lain</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Menggunakan automated bots atau scrapers</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Melakukan intimidasi, pelecehan, atau ancaman</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Privasi dan Pengumpulan Data</h2>
            <p className="text-gray-600 leading-relaxed">
              Kami menghargai privasi Anda. Pengumpulan, penggunaan, dan perlindungan data pribadi Anda dijelaskan dalam <Link to="/privacy" className="text-emerald-600 hover:underline">Kebijakan Privasi</Link> kami. Dengan menggunakan Aplikasi, Anda menyetujui praktik pengumpulan data kami.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Penyelesaian Masalah dan Sengketa</h2>
            <p className="text-gray-600 leading-relaxed">
              Kami berkomitmen untuk menyelesaikan masalah dengan baik. Untuk komplain atau sengketa, silakan hubungi customer service kami melalui email atau WhatsApp yang tertera di aplikasi.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Batasan Tanggung Jawab</h2>
            <p className="text-gray-600 leading-relaxed mb-3">Taaruf Samara tidak bertanggung jawab atas:</p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Tindakan atau keputusan pengguna lain</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Kehilangan data atau informasi akibat kesalahan teknis</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Konten yang diposting oleh pengguna lain</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Transaksi yang dilakukan di luar platform</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Perubahan Syarat</h2>
            <p className="text-gray-600 leading-relaxed">
              Kami dapat memperbarui Syarat dan Ketentuan ini sewaktu-waktu. Perubahan akan efektif sejak tanggal dipublikasikan. Kami menyarankan Anda untuk secara berkala meninjau syarat-syarat ini.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Informasi Kontak</h2>
            <p className="text-gray-600 leading-relaxed mb-3">Jika Anda memiliki pertanyaan tentang Syarat dan Ketentuan ini, silakan hubungi kami:</p>
            <div className="bg-gray-50 rounded-xl p-6 space-y-2">
              <p className="text-gray-600">Email: <a href="mailto:taarufsamara2026@gmail.com" className="text-emerald-600 hover:underline">taarufsamara2026@gmail.com</a></p>
              <p className="text-gray-600">WhatsApp: <a href="https://wa.me/6285811897662" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">+62 858-1189-7662</a></p>
            </div>
          </section>

          <div className="border-t border-gray-200 pt-6">
            <p className="text-gray-500 italic text-center">
              Dengan menggunakan Taaruf Samara, Anda menyatakan bahwa Anda telah membaca, memahami, dan setuju untuk terikat oleh Syarat dan Ketentuan ini.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
