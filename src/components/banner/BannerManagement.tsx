import { useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useBanners } from '../../hooks/useBanners'
import { type Banner } from '../../types'
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  X,
  Save,
  Image as ImageIcon,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Upload,
  Loader2,
} from 'lucide-react'

export default function BannerManagement() {
  const { banners, loading, refetch, createBanner, updateBanner, deleteBanner, toggleActive } = useBanners()
  const [showModal, setShowModal] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Upload & crop state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Visual crop state (fixed 16:9)
  const [cropPos, setCropPos] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [imgSize, setImgSize] = useState({ naturalWidth: 0, naturalHeight: 0, renderedWidth: 0, renderedHeight: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    link_to: '',
    is_active: true,
    display_order: 0,
    start_date: '',
    end_date: '',
  })

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      image_url: '',
      link_to: '',
      is_active: true,
      display_order: banners.length,
      start_date: '',
      end_date: '',
    })
    setEditingBanner(null)
    setSelectedFile(null)
    setPreviewUrl(null)
    setCropPos({ x: 0, y: 0 })
    setImgSize({ naturalWidth: 0, naturalHeight: 0, renderedWidth: 0, renderedHeight: 0 })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Format file harus JPG, JPEG, PNG, atau WebP')
      return
    }
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      alert('Ukuran file maksimal 5MB')
      return
    }

    setSelectedFile(file)
    const preview = URL.createObjectURL(file)
    setPreviewUrl(preview)
  }

  const ASPECT_RATIO = 16 / 9

  const getCropBoxSize = () => {
    const { renderedWidth, renderedHeight } = imgSize
    let w = renderedWidth
    let h = renderedWidth / ASPECT_RATIO
    if (h > renderedHeight) {
      h = renderedHeight
      w = renderedHeight * ASPECT_RATIO
    }
    return { width: w, height: h }
  }

  const clampCropPos = (x: number, y: number) => {
    const { renderedWidth, renderedHeight } = imgSize
    const { width, height } = getCropBoxSize()
    return {
      x: Math.max(0, Math.min(renderedWidth - width, x)),
      y: Math.max(0, Math.min(renderedHeight - height, y)),
    }
  }

  const handleImageLoad = () => {
    const img = imageRef.current
    const container = containerRef.current
    if (!img || !container) return
    const renderedWidth = img.clientWidth
    const renderedHeight = img.clientHeight
    const naturalWidth = img.naturalWidth
    const naturalHeight = img.naturalHeight
    setImgSize({ naturalWidth, naturalHeight, renderedWidth, renderedHeight })
    // Center initial crop position
    const { width, height } = (() => {
      let w = renderedWidth
      let h = renderedWidth / ASPECT_RATIO
      if (h > renderedHeight) {
        h = renderedHeight
        w = renderedHeight * ASPECT_RATIO
      }
      return { width: w, height: h }
    })()
    setCropPos({
      x: (renderedWidth - width) / 2,
      y: (renderedHeight - height) / 2,
    })
  }

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    setIsDragging(true)
    setDragOffset({
      x: clientX - rect.left - cropPos.x,
      y: clientY - rect.top - cropPos.y,
    })
  }

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    const newX = clientX - rect.left - dragOffset.x
    const newY = clientY - rect.top - dragOffset.y
    setCropPos(clampCropPos(newX, newY))
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const cropAndUpload = async (): Promise<string | null> => {
    if (!selectedFile) return formData.image_url || null

    // Wait for imgSize to be populated
    if (imgSize.renderedWidth === 0 || imgSize.renderedHeight === 0) {
      alert('Gambar belum siap, silakan tunggu sebentar dan coba lagi.')
      return null
    }

    setUploadingImage(true)
    try {
      const img = await loadImage(previewUrl!, true)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!

      const { naturalWidth, naturalHeight, renderedWidth, renderedHeight } = imgSize
      const { width: cropBoxWidth, height: cropBoxHeight } = getCropBoxSize()

      const scaleX = naturalWidth / renderedWidth
      const scaleY = naturalHeight / renderedHeight

      const sx = cropPos.x * scaleX
      const sy = cropPos.y * scaleY
      const sWidth = cropBoxWidth * scaleX
      const sHeight = cropBoxHeight * scaleY

      canvas.width = Math.round(sWidth)
      canvas.height = Math.round(sHeight)
      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height)

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), selectedFile.type, 0.9)
      })
      const safeName = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const fileExt = safeName.split('.').pop() || 'jpg'
      const fileToUpload = new File([blob], safeName, { type: selectedFile.type })

      const fileName = `banners/${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`

      const { error } = await supabase.storage.from('public').upload(fileName, fileToUpload, {
        cacheControl: '3600',
        upsert: false,
      })
      if (error) throw error

      const { data: { publicUrl } } = supabase.storage.from('public').getPublicUrl(fileName)
      return publicUrl
    } catch (err) {
      console.error('Upload error:', err)
      alert('Gagal mengupload gambar. Silakan coba lagi.')
      return null
    } finally {
      setUploadingImage(false)
    }
  }

  const loadImage = (src: string, isLocalBlob = false): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      // Only set crossOrigin for external URLs, NOT for blob: URLs
      if (!isLocalBlob && !src.startsWith('blob:')) {
        img.crossOrigin = 'anonymous'
      }
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Gagal memuat gambar untuk crop'))
      img.src = src
    })
  }

  const openCreateModal = () => {
    resetForm()
    setShowModal(true)
  }

  const openEditModal = (banner: Banner) => {
    setEditingBanner(banner)
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      image_url: banner.image_url || '',
      link_to: banner.link_to || '',
      is_active: banner.is_active,
      display_order: banner.display_order,
      start_date: banner.start_date || '',
      end_date: banner.end_date || '',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading('submit')

    const imageUrl = await cropAndUpload()
    if (selectedFile && !imageUrl) {
      setActionLoading(null)
      return
    }

    const bannerData = {
      ...formData,
      image_url: imageUrl || formData.image_url,
      start_date: formData.start_date || undefined,
      end_date: formData.end_date || undefined,
    }

    let result
    if (editingBanner) {
      result = await updateBanner(editingBanner.id, bannerData)
    } else {
      result = await createBanner(bannerData)
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
    if (!confirm('Hapus banner ini?')) return
    setActionLoading(id)
    await deleteBanner(id)
    setActionLoading(null)
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setActionLoading(id)
    await toggleActive(id, !currentStatus)
    setActionLoading(null)
  }

  const handleMoveUp = async (index: number) => {
    if (index === 0) return
    const banner = banners[index]
    const prevBanner = banners[index - 1]
    
    setActionLoading(banner.id)
    await updateBanner(banner.id, { display_order: prevBanner.display_order })
    await updateBanner(prevBanner.id, { display_order: banner.display_order })
    await refetch()
    setActionLoading(null)
  }

  const handleMoveDown = async (index: number) => {
    if (index === banners.length - 1) return
    const banner = banners[index]
    const nextBanner = banners[index + 1]
    
    setActionLoading(banner.id)
    await updateBanner(banner.id, { display_order: nextBanner.display_order })
    await updateBanner(nextBanner.id, { display_order: banner.display_order })
    await refetch()
    setActionLoading(null)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600">Total {banners.length} banner</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refetch}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw size={18} />
            Segarkan
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            <Plus size={18} />
            Tambah Banner
          </button>
        </div>
      </div>

      {/* Banner List */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Memuat banner...</p>
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <ImageIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">Belum ada banner</p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            <Plus size={18} />
            Buat Banner Pertama
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Urutan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pratinjau</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Judul</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tautan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Periode</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {banners.map((banner, index) => (
                  <tr key={banner.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0 || actionLoading === banner.id}
                          className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          onClick={() => handleMoveDown(index)}
                          disabled={index === banners.length - 1 || actionLoading === banner.id}
                          className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                        >
                          <ArrowDown size={16} />
                        </button>
                        <span className="text-gray-500 ml-1">{index + 1}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {banner.image_url ? (
                        <img
                          src={banner.image_url}
                          alt={banner.title}
                          className="w-24 h-14 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-24 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
                          <ImageIcon size={20} className="text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{banner.title}</p>
                        {banner.subtitle && (
                          <p className="text-sm text-gray-500">{banner.subtitle}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {banner.link_to ? (
                        <span className="text-sm text-blue-600">{banner.link_to}</span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {banner.start_date || banner.end_date ? (
                        <div>
                          <p>{formatDate(banner.start_date)}</p>
                          <p>s/d {formatDate(banner.end_date)}</p>
                        </div>
                      ) : (
                        'Selalu'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(banner.id, banner.is_active)}
                        disabled={actionLoading === banner.id}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          banner.is_active
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {banner.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                        {banner.is_active ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(banner)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <Edit2 size={16} className="text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(banner.id)}
                          disabled={actionLoading === banner.id}
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
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">
                {editingBanner ? 'Ubah Banner' : 'Tambah Banner'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Judul *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Judul banner"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subjudul
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Subjudul (opsional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gambar Banner
                </label>
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Upload size={18} />
                    {selectedFile ? 'Ganti Gambar' : 'Pilih Gambar'}
                  </button>
                  {selectedFile && (
                    <span className="text-sm text-gray-500 self-center">{selectedFile.name}</span>
                  )}
                  {editingBanner && formData.image_url && !selectedFile && (
                    <span className="text-sm text-gray-500 self-center">Gambar sudah ada</span>
                  )}
                </div>

                {/* Visual Crop Preview */}
                {(previewUrl || formData.image_url) && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1">
                      {previewUrl ? 'Pratinjau & Atur Crop (16:9)' : 'Gambar Saat Ini'}
                    </p>
                    <div
                      ref={containerRef}
                      className="relative w-full rounded-lg border border-gray-200 overflow-hidden select-none"
                      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                      onMouseMove={handleDragMove}
                      onMouseUp={handleDragEnd}
                      onMouseLeave={handleDragEnd}
                      onTouchMove={handleDragMove}
                      onTouchEnd={handleDragEnd}
                    >
                      <img
                        ref={imageRef}
                        src={previewUrl || formData.image_url}
                        alt="Pratinjau"
                        className="w-full h-auto block"
                        onLoad={handleImageLoad}
                        onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none' }}
                        draggable={false}
                      />
                      {selectedFile && imgSize.renderedWidth > 0 && (
                        <>
                          {/* Dark overlay outside crop area */}
                          <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 0 9999px rgba(0,0,0,0.5)' }} />
                          {/* Crop box */}
                          <div
                            className="absolute border-2 border-white"
                            style={{
                              left: cropPos.x,
                              top: cropPos.y,
                              width: getCropBoxSize().width,
                              height: getCropBoxSize().height,
                            }}
                            onMouseDown={handleDragStart}
                            onTouchStart={handleDragStart}
                          >
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <span className="text-white text-xs font-medium bg-black/50 px-2 py-0.5 rounded">
                                16:9
                              </span>
                            </div>
                            {/* Grid lines */}
                            <div className="absolute inset-0 pointer-events-none opacity-40">
                              <div className="absolute left-1/3 top-0 bottom-0 border-l border-white/70" />
                              <div className="absolute left-2/3 top-0 bottom-0 border-l border-white/70" />
                              <div className="absolute top-1/3 left-0 right-0 border-t border-white/70" />
                              <div className="absolute top-2/3 left-0 right-0 border-t border-white/70" />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    {selectedFile && (
                      <p className="text-xs text-gray-400 mt-1">
                        Geser kotak putih untuk memilih area yang akan ditampilkan (rasio 16:9)
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tautan Ke (Layar/URL)
                </label>
                <input
                  type="text"
                  value={formData.link_to}
                  onChange={(e) => setFormData({ ...formData, link_to: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Premium, SelfValue, atau URL"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
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
                  Aktif (tampilkan di aplikasi)
                </label>
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
                  disabled={actionLoading === 'submit' || uploadingImage}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Mengupload...
                    </>
                  ) : actionLoading === 'submit' ? (
                    <>
                      <Save size={18} />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Simpan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
