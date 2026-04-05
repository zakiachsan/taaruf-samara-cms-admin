import { ArrowRight } from 'lucide-react'

const LOGO_URL = 'https://okgddlgugdkiswitewdi.supabase.co/storage/v1/object/public/profile-photos/taaruf-samara-logo.png'

// CSS-generated phone mockup
const PhoneMockup = ({ side }: { side: 'left' | 'right' }) => (
  <div className={`relative hidden xl:block ${side === 'left' ? 'xl:-ml-4' : 'xl:-mr-4'}`}>
    {/* Phone Frame */}
    <div className="w-56 h-[450px] bg-gradient-to-b from-gray-800 to-gray-900 rounded-[3rem] p-3 shadow-2xl">
      {/* Screen */}
      <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
        {/* Notch */}
        <div className="w-24 h-6 bg-gray-900 rounded-b-xl mx-auto"></div>
        {/* Screen Content */}
        <div className="p-4 space-y-3">
          <div className="bg-gradient-to-r from-emerald-500 to-pink-500 h-28 rounded-2xl"></div>
          <div className="space-y-2">
            <div className="bg-gray-100 h-14 rounded-xl flex items-center gap-3 p-3">
              <div className="w-10 h-10 bg-emerald-200 rounded-full"></div>
              <div className="flex-1">
                <div className="bg-gray-200 h-3 rounded w-20 mb-1"></div>
                <div className="bg-gray-100 h-2 rounded w-14"></div>
              </div>
            </div>
            <div className="bg-gray-100 h-14 rounded-xl flex items-center gap-3 p-3">
              <div className="w-10 h-10 bg-pink-200 rounded-full"></div>
              <div className="flex-1">
                <div className="bg-gray-200 h-3 rounded w-24 mb-1"></div>
                <div className="bg-gray-100 h-2 rounded w-16"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    {/* Shadow */}
    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-4 bg-black/20 rounded-full blur-xl"></div>
  </div>
)

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-pink-50">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="flex items-center justify-center gap-4 xl:gap-8">
          {/* Left Phone */}
          <PhoneMockup side="left" />

          {/* Center Content */}
          <div className="flex-1 max-w-3xl w-full px-2 sm:px-4 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-3 sm:px-4 py-1.5 sm:py-2 shadow-sm mb-4 sm:mb-6">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm font-medium text-gray-600">Platform Taaruf Terpercaya</span>
            </div>

            {/* Logo */}
            <div className="mb-6 sm:mb-8">
              <img
                src={LOGO_URL}
                alt="Taaruf Samara"
                className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto object-contain drop-shadow-lg"
              />
            </div>

            {/* Heading */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
              Temukan Jodoh Impian dengan{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-pink-600 bg-clip-text text-transparent block sm:inline">
                Cara yang Sesuai Syariat
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-xl mx-auto">
              Platform taaruf terverifikasi, aman, dan dipandu admin untuk membantu Anda menemukan pasangan hidup yang sesuai dengan nilai-nilai Islam.
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-10 flex-wrap">
              <div className="text-center min-w-[80px]">
                <div className="text-2xl sm:text-3xl font-bold text-emerald-600">10K+</div>
                <div className="text-xs sm:text-sm text-gray-500">Member Terverifikasi</div>
              </div>
              <div className="hidden sm:block w-px h-10 sm:h-12 bg-gray-200"></div>
              <div className="text-center min-w-[80px]">
                <div className="text-2xl sm:text-3xl font-bold text-pink-600">500+</div>
                <div className="text-xs sm:text-sm text-gray-500">Pernikahan</div>
              </div>
              <div className="hidden sm:block w-px h-10 sm:h-12 bg-gray-200"></div>
              <div className="text-center min-w-[80px]">
                <div className="text-2xl sm:text-3xl font-bold text-emerald-600">98%</div>
                <div className="text-xs sm:text-sm text-gray-500">Kepuasan</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
              <button
                disabled
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gray-900 text-white rounded-xl font-medium flex items-center justify-center gap-2 cursor-not-allowed opacity-60 text-sm sm:text-base"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <span>Download di App Store</span>
              </button>
              <button
                disabled
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gray-900 text-white rounded-xl font-medium flex items-center justify-center gap-2 cursor-not-allowed opacity-60 text-sm sm:text-base"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
                </svg>
                <span>Download di Google Play</span>
              </button>
            </div>

            {/* Scroll indicator */}
            <div className="mt-8 sm:mt-12 flex flex-col items-center gap-2 animate-bounce">
              <span className="text-xs sm:text-sm text-gray-400">Gulir ke bawah</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 rotate-90" />
            </div>
          </div>

          {/* Right Phone */}
          <PhoneMockup side="right" />
        </div>
      </div>
    </section>
  )
}
