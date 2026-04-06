import { Star, Quote, RefreshCw } from 'lucide-react'
import { usePublicTestimonials } from '../../hooks/usePublicTestimonials'

export default function Testimonials() {
  const { testimonials, loading } = usePublicTestimonials()

  const getAvatarInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-amber-50 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-3 sm:mb-4">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600 fill-amber-600" />
            <span className="text-xs sm:text-sm font-medium text-amber-700">Testimoni</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
    Cerita Sukses Mereka
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
            Ribuan pasangan telah menemukan jodoh melalui Taaruf Samara. Berikut cerita dari beberapa alumni kami.
          </p>
        </div>

        {/* Testimonials Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-gradient-to-b from-white to-gray-50 rounded-2xl p-5 sm:p-6 lg:p-8 border border-gray-100 hover:shadow-xl transition-shadow"
              >
                {/* Quote Icon */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                  <Quote className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3 sm:mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>

                {/* Text */}
                <p className="text-gray-700 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                  "{testimonial.testimonial_text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Avatar */}
                  {testimonial.avatar_url ? (
                    <img
                      src={testimonial.avatar_url}
                      alt={testimonial.author_name}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                      {getAvatarInitials(testimonial.author_name)}
                    </div>
                  )}

                  {/* Info */}
                  <div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">{testimonial.author_name}</div>
                    <div className="text-xs sm:text-sm text-gray-500">{testimonial.author_location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Bar */}
        <div className="mt-16 bg-gradient-to-r from-emerald-500 to-pink-500 rounded-2xl p-8 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-emerald-100">Pernikahan Terwujud</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-emerald-100">Member Puas</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.9/5</div>
              <div className="text-emerald-100">Rating App</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
