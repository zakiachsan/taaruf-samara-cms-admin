import { Link } from 'react-router-dom'
import { Instagram, Facebook, Youtube, Mail, MessageCircle, MapPin } from 'lucide-react'

const LOGO_URL = 'https://okgddlgugdkiswitewdi.supabase.co/storage/v1/object/public/profile-photos/taaruf-samara-logo.png'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-400">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={LOGO_URL}
                alt="Taaruf Samara"
                className="w-10 h-10 object-contain"
              />
              <span className="text-xl font-bold text-white">Taaruf Samara</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Platform taaruf terpercaya untuk membantu Anda menemukan jodoh impian dengan cara yang sesuai syariat Islam.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="mailto:taarufsamara2026@gmail.com" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Bantuan */}
          <div>
            <h3 className="text-white font-semibold mb-4">Bantuan</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Syarat & Ketentuan</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Kebijakan Privasi</Link></li>
              <li><Link to="/refund" className="hover:text-white transition-colors">Kebijakan Refund</Link></li>
            </ul>
          </div>

          {/* Produk */}
          <div>
            <h3 className="text-white font-semibold mb-4">Produk</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/features" className="hover:text-white transition-colors">Fitur</Link></li>
              <li><Link to="/premium" className="hover:text-white transition-colors">Premium</Link></li>
              <li><Link to="/self-value" className="hover:text-white transition-colors">Self-Value</Link></li>
              <li><Link to="/referral" className="hover:text-white transition-colors">Referral</Link></li>
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h3 className="text-white font-semibold mb-4">Kontak</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="https://wa.me/6285782304240"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 hover:text-white transition-colors"
                >
                  <MessageCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>+62 857-8230-4240</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:taarufsamara2026@gmail.com"
                  className="flex items-start gap-2 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>taarufsamara2026@gmail.com</span>
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Taman Aries, JL Mustika 3, Blok A9 No 22, Meruya Utara, Kembangan, Jakarta Barat</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-sm">
              &copy; {currentYear} Taaruf Samara. All rights reserved.
            </p>

            {/* Hidden Login Link - inconspicuous */}
            <a
              href="/login"
              className="text-xs text-gray-600 hover:text-gray-500 transition-colors"
            >
              Admin
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
