export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Kebijakan Privasi
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
            Taaruf Samara (&quot;kami&quot; atau &quot;platform&quot;) berkomitmen untuk melindungi privasi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, mengungkapkan, dan melindungi informasi pribadi Anda saat Anda menggunakan aplikasi Taaruf Samara.
          </p>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Informasi yang Kami Kumpulkan</h2>
            <p className="text-gray-600 leading-relaxed mb-3">Kami mengumpulkan informasi yang Anda berikan langsung kepada kami, termasuk:</p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Data profil: nama, tanggal lahir, jenis kelamin, agama, pendidikan, pekerjaan, lokasi</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Foto profil dan foto close-up</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Data verifikasi identitas (KTP)</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Preferensi pasangan dan kriteria pencarian</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Hobi, minat, dan informasi latar belakang</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Riwayat komunikasi dalam aplikasi</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Data langganan premium dan informasi pembayaran</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Bagaimana Kami Menggunakan Informasi Anda</h2>
            <p className="text-gray-600 leading-relaxed mb-3">Kami menggunakan informasi yang dikumpulkan untuk:</p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Menyediakan layanan ta&apos;aruf dan matchmaking</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Memverifikasi identitas pengguna</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Mencocokkan Anda dengan calon pasangan yang sesuai</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Memfasilitasi komunikasi antar pengguna</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Mengirim notifikasi dan update terkait layanan</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Memproses langganan premium</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Mencegah penipuan dan penyalahgunaan layanan</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Kepatuhan terhadap kewajiban hukum</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Berbagi Informasi</h2>
            <p className="text-gray-600 leading-relaxed mb-3">Kami tidak menjual data pribadi Anda. Kami dapat membagikan informasi dalam keadaan berikut:</p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Dengan persetujuan Anda</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Dengan administrator platform untuk tujuan moderasi</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Untuk memenuhi persyaratan hukum dan peraturan yang berlaku di Indonesia</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Dalam konteks ta&apos;aruf yang disetujui kedua belah pihak</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Keamanan Data</h2>
            <p className="text-gray-600 leading-relaxed mb-3">Kami menggunakan langkah keamanan yang sesuai untuk melindungi data pribadi Anda, termasuk:</p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Enkripsi data saat transit dan saat disimpan</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Akses terbatas ke data pribadi</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Pemantauan berkelanjutan terhadap potensi kerentanan</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Retensi Data</h2>
            <p className="text-gray-600 leading-relaxed">
              Kami menyimpan data pribadi Anda selama akun Anda aktif atau selama diperlukan untuk menyediakan layanan. Anda dapat meminta penghapusan data kapan saja dengan menghubungi customer service kami.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Hak Anda</h2>
            <p className="text-gray-600 leading-relaxed mb-3">Sehubungan dengan data pribadi Anda, Anda memiliki hak untuk:</p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Mengakses data pribadi Anda</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Mengoreksi data yang tidak akurat</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Menghapus data pribadi Anda</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Membatasi pemrosesan data</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Menarik persetujuan kapan saja</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Mengajukan keberatan atas pemrosesan</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Foto dan Visibilitas Profil</h2>
            <p className="text-gray-600 leading-relaxed">
              Secara default, foto profil ditampilkan dengan blur untuk melindungi privasi. Foto jelas hanya dapat dilihat oleh pengguna premium atau setelah ada persetujuan ta&apos;aruf. Anda dapat mengatur visibilitas foto melalui pengaturan privasi.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Layanan Pihak Ketiga</h2>
            <p className="text-gray-600 leading-relaxed">
              Aplikasi ini menggunakan layanan pihak ketiga termasuk Supabase untuk backend dan Firebase/Expo untuk push notifications. Setiap penyedia layanan memiliki kebijakan privasi masing-masing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Perubahan Kebijakan</h2>
            <p className="text-gray-600 leading-relaxed">
              Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan akan diinformasikan melalui aplikasi atau email. Penggunaan aplikasi yang berkelanjutan setelah perubahan merupakan penerimaan terhadap kebijakan yang diperbarui.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Kepatuhan Regulasi</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              Aplikasi ini dioperasikan sesuai dengan hukum yang berlaku di Republik Indonesia, termasuk:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Peraturan pemerintah terkait penyelenggaraan aplikasi dan transaksi elektronik</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&#8226;</span><span>Ketentuan Google Play Store dan Apple App Store</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Informasi Anak-anak</h2>
            <p className="text-gray-600 leading-relaxed">
              Layanan ini hanya tersedia untuk pengguna yang berusia 17 tahun ke atas. Kami tidak dengan sengaja mengumpulkan data dari anak-anak di bawah usia tersebut.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">12. Hubungi Kami</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini atau ingin menggunakan hak Anda, silakan hubungi kami melalui:
            </p>
            <div className="bg-gray-50 rounded-xl p-6 space-y-2">
              <p className="text-gray-600">Email: <a href="mailto:taarufsamara2026@gmail.com" className="text-emerald-600 hover:underline">taarufsamara2026@gmail.com</a></p>
              <p className="text-gray-600">WhatsApp: <a href="https://wa.me/6285782304240" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">+62 857-8230-4240</a></p>
            </div>
          </section>

          <div className="border-t border-gray-200 pt-6">
            <p className="text-gray-500 italic text-center">
              Dengan menggunakan aplikasi Taaruf Samara, Anda mengakui bahwa Anda telah membaca, memahami, dan menyetujui Kebijakan Privasi ini.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
