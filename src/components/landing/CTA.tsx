import { Heart, ArrowRight } from 'lucide-react'

export default function CTA() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-emerald-600 via-emerald-700 to-pink-600 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-64 sm:w-80 lg:w-96 h-64 sm:h-80 lg:h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 sm:w-80 lg:w-96 h-64 sm:h-80 lg:h-96 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full mb-6 sm:mb-8 backdrop-blur-sm">
          <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-white" />
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-6">
          Mulai Perjalanan Taaruf Anda Sekarang
        </h2>

        {/* Subheading */}
        <p className="text-base sm:text-lg lg:text-xl text-emerald-100 mb-6 sm:mb-10 max-w-2xl mx-auto px-2">
          Jangan tunda lagi. Jodoh bisa datang kapan saja. Bergabunglah dengan ribuan member lain yang sedang mencari pasangan hidup.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <button
            disabled
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-emerald-600 rounded-xl font-medium sm:font-semibold flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors cursor-not-allowed opacity-80 text-sm sm:text-base"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            <span>Download di App Store</span>
          </button>
          <button
            disabled
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-emerald-600 rounded-xl font-medium sm:font-semibold flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors cursor-not-allowed opacity-80 text-sm sm:text-base"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
            </svg>
            <span>Download di Google Play</span>
          </button>
        </div>

        {/* Trust Note */}
        <p className="mt-6 sm:mt-8 text-emerald-100 text-xs sm:text-sm flex items-center justify-center gap-2 px-2">
          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
          Gratis untuk didownload. Tidak perlu kartu kredit.
        </p>
      </div>
    </section>
  )
}
