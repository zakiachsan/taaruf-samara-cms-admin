import { useState, useEffect } from 'react'
import { X, Calendar, MapPin, Briefcase, Heart, BookOpen, Users, Award, Crown, Shield, Camera, User, CheckCircle, XCircle, Clock, BadgeIndianRupee } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface UserDetailProps {
  userId: string
  userName: string
  onClose: () => void
}

interface SubscriptionInfo {
  package_name?: string
  package_display_name?: string
  status?: string
  expires_at?: string
  start_date?: string
}

interface FullUserProfile {
  // Basic info
  user_id: string
  full_name?: string
  age?: number
  gender?: 'male' | 'female'
  birth_date?: string
  religion?: string
  prayer_condition?: 'taat' | 'sedang'
  salary_range?: string
  education?: string
  profession?: string
  location?: string
  whatsapp?: string
  bio?: string

  // Photos
  photo_closeup?: string
  photo_fullbody?: string
  photos?: string[]

  // Background
  marital_status?: string
  children_count?: number
  willing_to_relocate?: boolean
  willing_to_work?: boolean
  body_weight?: number
  body_height?: number

  // Preferences
  preferred_age_min?: number
  preferred_age_max?: number
  preferred_religion?: string[]
  preferred_location?: string[]
  preferred_marital_status?: string[]
  referral_code?: string

  // Status
  is_verified: boolean
  is_blurred: boolean
  is_premium?: boolean
  has_bedah_value_cert?: boolean
  bedah_value_cert_code?: string

  // Timestamps
  created_at: string
  updated_at?: string
}

const STORAGE_URL = 'https://okgddlgugdkiswitewdi.supabase.co/storage/v1/object/public/profile-photos'

export default function UserDetail({ userId, userName, onClose }: UserDetailProps) {
  const [profile, setProfile] = useState<FullUserProfile | null>(null)
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageLoading, setImageLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchUserProfile()
  }, [userId])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      setProfile(data as FullUserProfile)

      // Fetch active subscription info
      const now = new Date().toISOString()
      const { data: subData } = await supabase
        .from('subscription_purchases')
        .select(`
          status,
          expires_at,
          start_date,
          package:subscription_packages(display_name, name)
        `)
        .eq('user_id', userId)
        .eq('status', 'paid')
        .gt('expires_at', now)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (subData) {
        setSubscription({
          package_name: (subData.package as any)?.name,
          package_display_name: (subData.package as any)?.display_name,
          status: subData.status,
          expires_at: subData.expires_at,
          start_date: subData.start_date,
        })
      } else {
        setSubscription(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat profil')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return null
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4">
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat profil...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4">
          <div className="p-12 text-center">
            <XCircle size={48} className="mx-auto text-red-400 mb-4" />
            <p className="text-red-600 font-medium mb-2">Gagal memuat profil</p>
            <p className="text-gray-500 text-sm mb-4">{error || 'Profil tidak ditemukan'}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    )
  }

  const allPhotos = [
    ...(profile.photo_closeup ? [{ url: profile.photo_closeup, type: 'Close-up' as const }] : []),
    ...(profile.photo_fullbody ? [{ url: profile.photo_fullbody, type: 'Full Body' as const }] : []),
    ...(profile.photos?.map(p => ({ url: p, type: 'Tambahan' as const })) || [])
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <User size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{profile.full_name || userName}</h2>
              <p className="text-emerald-100 text-sm">ID Pengguna: {userId.slice(0, 8)}...</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Photos & Status */}
            <div className="lg:col-span-1 space-y-4">
              {/* Status Badges */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Shield size={18} />
                  Status
                </h3>
                <div className="space-y-2">
                  {profile.is_verified ? (
                    <div className="flex items-center gap-2 text-emerald-600 text-sm">
                      <CheckCircle size={16} />
                      <span>Terverifikasi</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-600 text-sm">
                      <XCircle size={16} />
                      <span>Belum Terverifikasi</span>
                    </div>
                  )}
                  {(profile.is_premium || subscription) && (
                    <div className="flex items-center gap-2 text-amber-600 text-sm">
                      <Crown size={16} />
                      <span>
                        {subscription?.package_display_name || subscription?.package_name || 'Premium'}
                      </span>
                    </div>
                  )}
                  {subscription?.expires_at && (
                    <div className="text-xs text-gray-500">
                      Berlaku sampai: {formatDate(subscription.expires_at)}
                    </div>
                  )}
                  {profile.has_bedah_value_cert && (
                    <div className="flex items-center gap-2 text-emerald-600 text-sm">
                      <Award size={16} />
                      <span>Bersertifikat</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Photos */}
              {allPhotos.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Camera size={18} />
                    Foto ({allPhotos.length})
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {allPhotos.map((photo, index) => (
                      <div key={index} className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden">
                        {imageLoading === photo.url ? (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
                          </div>
                        ) : null}
                        <img
                          src={photo.url.startsWith('http') ? photo.url : `${STORAGE_URL}/${photo.url}`}
                          alt={photo.type}
                          className="w-full h-full object-cover"
                          onLoad={() => setImageLoading(null)}
                          onError={() => setImageLoading(null)}
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                          <p className="text-white text-xs">{photo.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Clock size={18} />
                  Waktu
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Dibuat: {formatDate(profile.created_at)}</p>
                  {profile.updated_at && (
                    <p>Diupdate: {formatDate(profile.updated_at)}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Profile Details */}
            <div className="lg:col-span-2 space-y-4">
              {/* Data Pribadi */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b">Data Pribadi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <User size={18} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Nama Lengkap</p>
                      <p className="font-medium">{profile.full_name || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar size={18} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Umur</p>
                      <p className="font-medium">{profile.age || calculateAge(profile.birth_date) || '-'} tahun</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users size={18} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Jenis Kelamin</p>
                      <p className="font-medium">{profile.gender === 'male' ? 'Laki-laki' : profile.gender === 'female' ? 'Perempuan' : '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Lokasi</p>
                      <p className="font-medium">{profile.location || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-green-500 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 8.71-20.49 9.53-22.15 5.34A2 2 0 0 1 22 16.92z"/>
                        <path d="M15 7a2 2 0 0 1 3.5 0"/>
                        <path d="M15 3a6 6 0 0 0 6 6"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">WhatsApp</p>
                      <p className="font-medium">{profile.whatsapp || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Briefcase size={18} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Pekerjaan</p>
                      <p className="font-medium">{profile.profession || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <BookOpen size={18} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Pendidikan</p>
                      <p className="font-medium">{profile.education || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <BadgeIndianRupee size={18} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Range Gaji</p>
                      <p className="font-medium">{profile.salary_range || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Heart size={18} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Status Menikah</p>
                      <p className="font-medium">{profile.marital_status || '-'}</p>
                    </div>
                  </div>
                </div>
                {profile.bio && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-500 mb-1">Bio</p>
                    <p className="text-gray-700">{profile.bio}</p>
                  </div>
                )}
              </div>

              {/* Background */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b">Latar Belakang</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="text-gray-400 mt-0.5">🕌</div>
                    <div>
                      <p className="text-sm text-gray-500">Agama</p>
                      <p className="font-medium">{profile.religion || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-gray-400 mt-0.5">🙏</div>
                    <div>
                      <p className="text-sm text-gray-500">Kondisi Sholat</p>
                      <p className="font-medium">{profile.prayer_condition === 'taat' ? 'Taat' : profile.prayer_condition === 'sedang' ? 'Sedang' : '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-gray-400 mt-0.5">👶</div>
                    <div>
                      <p className="text-sm text-gray-500">Jumlah Anak</p>
                      <p className="font-medium">{profile.children_count !== undefined ? profile.children_count : '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-gray-400 mt-0.5">📏</div>
                    <div>
                      <p className="text-sm text-gray-500">Tinggi / Berat</p>
                      <p className="font-medium">{profile.body_height ? `${profile.body_height} cm` : '-'} / {profile.body_weight ? `${profile.body_weight} kg` : '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-gray-400 mt-0.5">🏠</div>
                    <div>
                      <p className="text-sm text-gray-500">Mau Pindah</p>
                      <p className="font-medium">{profile.willing_to_relocate ? 'Ya' : 'Tidak'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-gray-400 mt-0.5">💼</div>
                    <div>
                      <p className="text-sm text-gray-500">Mau Bekerja</p>
                      <p className="font-medium">{profile.willing_to_work ? 'Ya' : 'Tidak'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferensi */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b">Preferensi</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Usia yang Dicari</p>
                    <p className="font-medium">
                      {profile.preferred_age_min || profile.preferred_age_max
                        ? `${profile.preferred_age_min || '-'} - ${profile.preferred_age_max || '-'} tahun`
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Agama yang Dicari</p>
                    <p className="font-medium">
                      {profile.preferred_religion && profile.preferred_religion.length > 0
                        ? profile.preferred_religion.join(', ')
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Lokasi yang Dicari</p>
                    <p className="font-medium">
                      {profile.preferred_location && profile.preferred_location.length > 0
                        ? profile.preferred_location.join(', ')
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status Menikah yang Dicari</p>
                    <p className="font-medium">
                      {profile.preferred_marital_status && profile.preferred_marital_status.length > 0
                        ? profile.preferred_marital_status.join(', ')
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Kode Referral</p>
                    <p className="font-mono font-medium">{profile.referral_code || '-'}</p>
                  </div>
                  {profile.bedah_value_cert_code && (
                    <div>
                      <p className="text-gray-500">Kode Sertifikat</p>
                      <p className="font-mono font-medium">{profile.bedah_value_cert_code}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            ID Pengguna: <span className="font-mono">{userId}</span>
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
