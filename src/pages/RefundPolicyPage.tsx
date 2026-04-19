import { MessageCircle } from 'lucide-react'

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Kebijakan Pengembalian Dana (Refund Policy)
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
            Kebijakan ini menjelaskan syarat dan ketentuan pengembalian dana (refund) untuk pembayaran yang dilakukan pada platform Taaruf Samara. Dengan melakukan pembayaran, Anda dianggap telah membaca dan memahami kebijakan ini.
          </p>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Kelayakan Pengembalian Dana</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              Pengembalian dana dapat diajukan dengan kondisi berikut:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1.5 flex-shrink-0">&#10003;</span>
                <span>Permintaan refund diajukan dalam waktu <strong>maksimal 1 (satu) hari kalender</strong> setelah tanggal pembayaran.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1.5 flex-shrink-0">&#10003;</span>
                <span>Anda belum menggunakan fitur premium yang menjadi bagian dari paket berlangganan yang dibeli (contoh: belum mengirim connect/like melebihi kuota gratis, belum menggunakan fitur rekomendasi prioritas, dll).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1.5 flex-shrink-0">&#10003;</span>
                <span>Terjadi kesalahan teknis dari pihak Taaruf Samara yang menyebabkan layanan tidak dapat digunakan.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1.5 flex-shrink-0">&#10003;</span>
                <span>Pembayaran duplikat atau jumlah yang dibebankan tidak sesuai dengan harga paket.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Pengembalian Dana Tidak Berlaku (Non-Refundable)</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              Pengembalian dana <strong>tidak dapat</strong> diajukan dalam kondisi berikut:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1.5 flex-shrink-0">&#10007;</span>
                <span>Anda sudah menggunakan fitur premium dari paket berlangganan yang dibeli.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1.5 flex-shrink-0">&#10007;</span>
                <span>Permintaan refund diajukan melebihi 1 hari dari tanggal pembayaran.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1.5 flex-shrink-0">&#10007;</span>
                <span>Akun Anda dinonaktifkan karena pelanggaran Syarat & Ketentuan.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1.5 flex-shrink-0">&#10007;</span>
                <span>Anda menghapus akun secara sukarela setelah menggunakan layanan premium.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Proses Pengembalian Dana</h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">&#8226;</span>
                <span>Setelah permintaan refund disetujui, proses pengembalian dana membutuhkan waktu <strong>3-14 hari kerja</strong> tergantung metode pembayaran yang digunakan.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">&#8226;</span>
                <span>Refund akan dikembalikan ke metode pembayaran asli (rekening bank, e-wallet, dll) yang digunakan saat transaksi.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">&#8226;</span>
                <span>Jumlah yang dikembalikan adalah nominal pembayaran yang diterima Taaruf Samara (tidak termasuk biaya admin bank/payment gateway jika ada).</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Cara Mengajukan Refund</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              Untuk mengajukan pengembalian dana, silakan hubungi customer service kami melalui:
            </p>
            <div className="bg-gray-50 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="font-semibold text-gray-900">WhatsApp</p>
                  <a href="https://wa.me/6285782304240" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                    +62 857-8230-4240
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="font-semibold text-gray-900">Email</p>
                  <a href="mailto:taarufsamara2026@gmail.com" className="text-emerald-600 hover:underline">
                    taarufsamara2026@gmail.com
                  </a>
                </div>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed mt-3">
              Sertakan informasi berikut saat mengajukan refund: nama lengkap, email terdaftar, paket yang dibeli, tanggal pembayaran, dan alasan pengembalian dana.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Perubahan Kebijakan</h2>
            <p className="text-gray-600 leading-relaxed">
              Taaruf Samara berhak mengubah Kebijakan Pengembalian Dana ini sewaktu-waktu. Perubahan akan berlaku efektif sejak tanggal dipublikasikan di halaman ini. Kami menyarankan Anda untuk meninjau halaman ini secara berkala.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
