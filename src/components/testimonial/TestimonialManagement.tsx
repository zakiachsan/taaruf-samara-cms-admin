import { useState, useRef } from 'react'
import { useTestimonials } from '../../hooks/useTestimonials'
import { supabase } from '../../lib/supabase'
import { type Testimonial } from '../../types'
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  X,
  Save,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Star,
  StarIcon,
  ShieldCheck,
  Sparkles,
  MapPin,
  Upload,
} from 'lucide-react'

export default function TestimonialManagement() {
  const { testimonials, loading, refetch, createTestimonial, updateTestimonial, deleteTestimonial, toggleActive, toggleFeatured, toggleVerified } = useTestimonials()
  const [showModal, setShowModal] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [formData, setFormData] = useState({
    author_name: '',
    author_location: '',
    testimonial_text: '',
    rating: 5,
    avatar_url: '',
    is_verified: false,
    is_featured: false,
    is_active: true,
    display_order: 0,
  })

  const resetForm = () => {
    setFormData({
      author_name: '',
      author_location: '',
      testimonial_text: '',
      rating: 5,
      avatar_url: '',
      is_verified: false,
      is_featured: false,
      is_active: true,
      display_order: testimonials.length,
    })
    setEditingTestimonial(null)
    setPreviewUrl(null)
  }

  // Upload file to Supabase Storage
  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      setUploadingFile(true)

      // Validate file size (5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        alert('Ukuran file maksimal 5MB')
        return null
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        alert('Format file harus JPG, JPEG, PNG, atau WebP')
        return null
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('testimonial-avatars')
        .upload(fileName, file)

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('testimonial-avatars')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error('Upload error:', error)
      alert('Gagal mengupload file. Silakan coba lagi.')
      return null
    } finally {
      setUploadingFile(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Create preview
    const preview = URL.createObjectURL(file)
    setPreviewUrl(preview)

    // Upload file
    const uploadedUrl = await uploadFile(file)
    if (uploadedUrl) {
      setFormData({ ...formData, avatar_url: uploadedUrl })
    } else {
      setPreviewUrl(null)
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveAvatar = () => {
    setFormData({ ...formData, avatar_url: '' })
    setPreviewUrl(null)
  }

  const openCreateModal = () => {
    resetForm()
    setShowModal(true)
  }

  const openEditModal = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial)
    setFormData({
      author_name: testimonial.author_name,
      author_location: testimonial.author_location,
      testimonial_text: testimonial.testimonial_text,
      rating: testimonial.rating,
      avatar_url: testimonial.avatar_url || '',
      is_verified: testimonial.is_verified,
      is_featured: testimonial.is_featured,
      is_active: testimonial.is_active,
      display_order: testimonial.display_order,
    })
    setPreviewUrl(testimonial.avatar_url || null)
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading('submit')

    let result
    if (editingTestimonial) {
      result = await updateTestimonial(editingTestimonial.id, formData)
    } else {
      result = await createTestimonial(formData)
    }

    setActionLoading(null)

    if (result.success) {
      setShowModal(false)
      resetForm()
    } else {
      alert(result.error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus testimoni ini?')) return
    setActionLoading(id)
    await deleteTestimonial(id)
    setActionLoading(null)
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setActionLoading(id)
    await toggleActive(id, !currentStatus)
    setActionLoading(null)
  }

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    setActionLoading(id)
    await toggleFeatured(id, !currentStatus)
    setActionLoading(null)
  }

  const handleToggleVerified = async (id: string, currentStatus: boolean) => {
    setActionLoading(id)
    await toggleVerified(id, !currentStatus)
    setActionLoading(null)
  }

  const handleMoveUp = async (index: number) => {
    if (index === 0) return
    const testimonial = testimonials[index]
    const prevTestimonial = testimonials[index - 1]

    setActionLoading(testimonial.id)
    await updateTestimonial(testimonial.id, { display_order: prevTestimonial.display_order })
    await updateTestimonial(prevTestimonial.id, { display_order: testimonial.display_order })
    await refetch()
    setActionLoading(null)
  }

  const handleMoveDown = async (index: number) => {
    if (index === testimonials.length - 1) return
    const testimonial = testimonials[index]
    const nextTestimonial = testimonials[index + 1]

    setActionLoading(testimonial.id)
    await updateTestimonial(testimonial.id, { display_order: nextTestimonial.display_order })
    await updateTestimonial(nextTestimonial.id, { display_order: testimonial.display_order })
    await refetch()
    setActionLoading(null)
  }

  const getAvatarInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const activeCount = testimonials.filter(t => t.is_active).length
  const featuredCount = testimonials.filter(t => t.is_featured).length
  const verifiedCount = testimonials.filter(t => t.is_verified).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Testimonials</h1>
          <p className="text-gray-600">
            Total {testimonials.length} testimoni • {activeCount} active • {featuredCount} featured • {verifiedCount} verified
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refetch}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            <Plus size={18} />
            Tambah Testimoni
          </button>
        </div>
      </div>

      {/* Testimonials List */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Loading testimonials...</p>
        </div>
      ) : testimonials.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Sparkles className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">Belum ada testimoni</p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            <Plus size={18} />
            Buat Testimoni Pertama
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-16">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">Rating</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Text</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-20">Verified</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-20">Featured</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-20">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {testimonials.map((testimonial, index) => (
                  <tr key={testimonial.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0 || actionLoading === testimonial.id}
                          className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          onClick={() => handleMoveDown(index)}
                          disabled={index === testimonials.length - 1 || actionLoading === testimonial.id}
                          className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                        >
                          <ArrowDown size={16} />
                        </button>
                        <span className="text-gray-500 ml-1">{index + 1}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {testimonial.avatar_url ? (
                          <img
                            src={testimonial.avatar_url}
                            alt={testimonial.author_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {getAvatarInitials(testimonial.author_name)}
                          </div>
                        )}
                        <span className="font-medium text-gray-900">{testimonial.author_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={i < testimonial.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin size={14} />
                        <span className="text-sm">{testimonial.author_location}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-sm text-gray-600 truncate" title={testimonial.testimonial_text}>
                        "{testimonial.testimonial_text}"
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleVerified(testimonial.id, testimonial.is_verified)}
                        disabled={actionLoading === testimonial.id}
                        className={`inline-flex items-center justify-center p-1.5 rounded-lg ${
                          testimonial.is_verified
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        <ShieldCheck size={18} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleFeatured(testimonial.id, testimonial.is_featured)}
                        disabled={actionLoading === testimonial.id}
                        className={`inline-flex items-center justify-center p-1.5 rounded-lg ${
                          testimonial.is_featured
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        <StarIcon size={18} className={testimonial.is_featured ? 'fill-amber-700' : ''} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(testimonial.id, testimonial.is_active)}
                        disabled={actionLoading === testimonial.id}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          testimonial.is_active
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {testimonial.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                        {testimonial.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(testimonial)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <Edit2 size={16} className="text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(testimonial.id)}
                          disabled={actionLoading === testimonial.id}
                          className="p-2 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">
                {editingTestimonial ? 'Edit Testimoni' : 'Tambah Testimoni'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Author Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.author_name}
                    onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Ahmad & Fatimah"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.author_location}
                    onChange={(e) => setFormData({ ...formData, author_location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Jakarta"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Testimonial Text *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.testimonial_text}
                  onChange={(e) => setFormData({ ...formData, testimonial_text: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                  placeholder="Cerita pengalaman pengguna..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating })}
                      className={`p-1 ${rating <= formData.rating ? 'text-amber-400' : 'text-gray-300'}`}
                    >
                      <Star size={24} className={rating <= formData.rating ? 'fill-amber-400' : ''} />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">({formData.rating} stars)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Avatar
                </label>
                <div className="space-y-3">
                  {/* File Upload */}
                  <div className="flex items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleFileChange}
                      disabled={uploadingFile}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 ${
                        uploadingFile ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Upload size={18} />
                      {uploadingFile ? 'Uploading...' : 'Upload Foto'}
                    </label>
                    <span className="text-sm text-gray-500">Maksimal 5MB • JPG, PNG, WebP</span>
                  </div>

                  {/* Avatar Preview */}
                  {(formData.avatar_url || previewUrl) && (
                    <div className="flex items-center gap-4">
                      <img
                        src={previewUrl || formData.avatar_url}
                        alt="Avatar Preview"
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Hapus Foto
                      </button>
                    </div>
                  )}

                  {/* URL Input (fallback) */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Atau masukkan URL foto:
                    </label>
                    <input
                      type="url"
                      value={formData.avatar_url}
                      onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_verified"
                    checked={formData.is_verified}
                    onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <label htmlFor="is_verified" className="text-sm text-gray-700">
                    Verified
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <label htmlFor="is_featured" className="text-sm text-gray-700">
                    Featured
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <label htmlFor="is_active" className="text-sm text-gray-700">
                    Active
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'submit'}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                  <Save size={18} />
                  {actionLoading === 'submit' ? 'Saving...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
