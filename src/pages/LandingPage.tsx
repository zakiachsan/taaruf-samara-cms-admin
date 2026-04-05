import Hero from '../components/landing/Hero'
import Features from '../components/landing/Features'
import Pricing from '../components/landing/Pricing'
import Testimonials from '../components/landing/Testimonials'
import CTA from '../components/landing/CTA'
import Footer from '../components/landing/Footer'
import { ShieldCheck, Users, Sparkles } from 'lucide-react'

// Introduction Section
function Introduction() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-50 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-4 sm:mb-6">
          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
          <span className="text-xs sm:text-sm font-medium text-emerald-700">Apa itu Taaruf Samara?</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
          Lebih dari Sekadar Aplikasi Taaruf
        </h2>
        <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed px-2">
          Taaruf Samara adalah platform matchmaking yang menggabungkan teknologi modern dengan nilai-nilai Islam.
          Kami membantu Anda menemukan pasangan hidup yang sesuai dengan cara yang <strong className="text-emerald-600">halal, aman, dan terverifikasi</strong>.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
          <div className="bg-emerald-50 rounded-xl p-4 sm:p-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Terverifikasi</h3>
            <p className="text-xs sm:text-sm text-gray-600">Semua profil diverifikasi admin dengan KTP untuk keamanan</p>
          </div>
          <div className="bg-pink-50 rounded-xl p-4 sm:p-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Dipandu Admin</h3>
            <p className="text-xs sm:text-sm text-gray-600">Premium member mendapat pendampingan hingga Nadzor</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 sm:p-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Sesuai Syariat</h3>
            <p className="text-xs sm:text-sm text-gray-600">Proses taaruf yang mengikuti tuntunan Islam</p>
          </div>
        </div>
      </div>
    </section>
  )
}

// Trust Signals Section
function TrustSignals() {
  return (
    <section className="py-10 sm:py-12 lg:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-10">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Kenapa Member Percaya Kami?</h3>
          <p className="text-sm sm:text-base text-gray-600">Keamanan dan privasi adalah prioritas kami</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
          {[
            { label: 'Profil Terverifikasi', value: '100%' },
            { label: 'KTP Divalidasi', value: 'Admin' },
            { label: 'Data Terenkripsi', value: 'SSL' },
            { label: 'Support', value: '24/7' }
          ].map((item, index) => (
            <div key={index} className="bg-white rounded-xl p-3 sm:p-6 text-center border border-gray-100">
              <div className="text-xl sm:text-2xl font-bold text-emerald-600 mb-1">{item.value}</div>
              <div className="text-xs sm:text-sm text-gray-600">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Introduction />
      <Features />
      <TrustSignals />
      <Pricing />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  )
}
