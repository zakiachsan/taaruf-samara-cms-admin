import { useState } from 'react'
import { useAddons, type Addon, type CreateAddonData } from '../../hooks/useAddons'
import {
  Puzzle,
  Edit,
  Trash2,
  Power,
  Plus,
  RefreshCw,
  CheckCircle,
  XCircle,
  DollarSign,
  Star,
  X,
  AlertCircle,
  GripVertical,
} from 'lucide-react'

const formatPrice = (amount: number) => {
  return amount === 0 ? 'Hubungi Admin' : 'Rp ' + amount.toLocaleString('id-ID')
}

const ICON_OPTIONS = [
  'crown',
  'people',
  'sparkles',
  'document-text',
  'chatbubbles',
  'finger-print',
  'home',
  'diamond',
  'heart',
  'award',
  'shield',
]

export default function AddonsManagement() {
  const { addons, loading, error, refetch, createAddon, updateAddon, deleteAddon, toggleAddonActive, reorderAddons } = useAddons()

  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null)
  const [saving, setSaving] = useState(false)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [reordering, setReordering] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    icon: 'crown',
    features: '',
    is_popular: false,
    is_active: true,
  })

  const handleDragStart = (e: React.DragEvent, addonId: string) => {
    setDraggingId(addonId)
    e.dataTransfer.effectAllowed = 'move'
    // Required for Firefox
    e.dataTransfer.setData('text/plain', addonId)
  }

  const handleDragOver = (e: React.DragEvent, addonId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (addonId !== draggingId) {
      setDragOverId(addonId)
    }
  }

  const handleDragLeave = () => {
    setDragOverId(null)
  }

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    setDragOverId(null)

    if (!draggingId || draggingId === targetId) {
      setDraggingId(null)
      return
    }

    // Reorder locally
    const fromIndex = addons.findIndex(a => a.id === draggingId)
    const toIndex = addons.findIndex(a => a.id === targetId)

    if (fromIndex === -1 || toIndex === -1) {
      setDraggingId(null)
      return
    }

    const newAddons = [...addons]
    const [moved] = newAddons.splice(fromIndex, 1)
    newAddons.splice(toIndex, 0, moved)

    // Update local state immediately for smooth UX
    // But we need to call the hook's setter - however useAddons doesn't expose setAddons
    // So we'll call reorderAddons with the new order
    const reorderedIds = newAddons.map(a => a.id)

    setReordering(true)
    const result = await reorderAddons(reorderedIds)
    setReordering(false)
    setDraggingId(null)

    if (!result.success) {
      alert(result.error || 'Gagal mengubah urutan')
    }
  }

  const handleDragEnd = () => {
    setDraggingId(null)
    setDragOverId(null)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus "${name}"? Tindakan ini tidak dapat dibatalkan.`)) return

    const result = await deleteAddon(id)
    if (!result.success) {
      alert(result.error || 'Gagal menghapus add-on')
    }
  }

  const handleToggleActive = async (id: string) => {
    const result = await toggleAddonActive(id)
    if (!result.success) {
      alert(result.error || 'Gagal mengubah status add-on')
    }
  }

  const openCreateModal = () => {
    setModalMode('create')
    setFormData({
      name: '',
      description: '',
      price: '',
      icon: 'crown',
      features: '',
      is_popular: false,
      is_active: true,
    })
    setShowModal(true)
  }

  const openEditModal = (addon: Addon) => {
    setModalMode('edit')
    setEditingAddon(addon)
    setFormData({
      name: addon.name,
      description: addon.description || '',
      price: addon.price.toString(),
      icon: addon.icon || 'crown',
      features: addon.features?.join('\n') || '',
      is_popular: addon.is_popular || false,
      is_active: addon.is_active,
    })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      alert('Nama wajib diisi')
      return
    }

    const price = parseInt(formData.price)
    if (isNaN(price) || price < 0) {
      alert('Harga harus berupa angka yang valid')
      return
    }

    // Parse features (one per line)
    const featuresArray = formData.features
      .split('\n')
      .map(f => f.trim())
      .filter(f => f.length > 0)

    const data: CreateAddonData | Partial<Addon> = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      price,
      icon: formData.icon,
      features: featuresArray.length > 0 ? featuresArray : undefined,
      is_popular: formData.is_popular,
      is_active: formData.is_active,
    }

    setSaving(true)

    if (modalMode === 'create') {
      const result = await createAddon(data as CreateAddonData)
      if (result.success) {
        setShowModal(false)
      } else {
        alert(result.error || 'Gagal membuat add-on')
      }
    } else {
      if (editingAddon) {
        const result = await updateAddon(editingAddon.id, data)
        if (result.success) {
          setShowModal(false)
          setEditingAddon(null)
        } else {
          alert(result.error || 'Gagal mengupdate add-on')
        }
      }
    }

    setSaving(false)
  }

  const getAddonIcon = (iconName?: string) => {
    // Return a simple div with the icon name first letter
    return (
      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
        <span className="text-xl font-bold text-gray-600">
          {iconName?.charAt(0)?.toUpperCase() || 'A'}
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Add-on</h2>
          <p className="text-gray-500 mt-1">Kelola fitur tambahan yang dapat dibeli pengguna</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refetch}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw size={18} />
            Segarkan
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            <Plus size={18} />
            Tambah Baru
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Memuat add-on...</p>
        </div>
      ) : addons.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Puzzle size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Tidak ada add-on ditemukan</p>
        </div>
      ) : (
        /* Add-ons Grid (Draggable) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {addons.map((addon) => (
            <div
              key={addon.id}
              draggable={!reordering}
              onDragStart={(e) => handleDragStart(e, addon.id)}
              onDragOver={(e) => handleDragOver(e, addon.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, addon.id)}
              onDragEnd={handleDragEnd}
              className={`bg-white rounded-xl border p-4 transition-all cursor-move ${
                !addon.is_active ? 'opacity-60' : 'border-gray-200'
              } ${draggingId === addon.id ? 'opacity-50 ring-2 ring-emerald-300' : ''} ${
                dragOverId === addon.id ? 'ring-2 ring-emerald-400 border-emerald-400' : ''
              } ${reordering ? 'pointer-events-none' : 'hover:shadow-md'}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <GripVertical size={18} className="text-gray-300" />
                  {getAddonIcon(addon.icon)}
                </div>
                <div className="flex items-center gap-1">
                  {addon.is_popular && (
                    <span className="flex items-center gap-1 text-amber-600 text-xs">
                      <Star size={12} fill="currentColor" />
                    </span>
                  )}
                  <button
                    onClick={() => openEditModal(addon)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Ubah"
                  >
                    <Edit size={16} />
                  </button>
                  {addon.name !== 'Premium Pendampingan' && addon.name !== 'Bedah Value' && (
                    <button
                      onClick={() => handleDelete(addon.id, addon.name)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Hapus"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Content */}
              <h3 className="font-semibold text-gray-900 mb-1">{addon.name}</h3>
              {addon.description && (
                <p className="text-sm text-gray-500 mb-2 line-clamp-2">{addon.description}</p>
              )}

              <div className="flex items-center gap-2 mb-3">
                <DollarSign size={16} className="text-gray-400" />
                <span className="text-lg font-bold text-emerald-600">
                  {formatPrice(addon.price)}
                </span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  {addon.is_active ? (
                    <span className="flex items-center gap-1 text-emerald-600 text-sm">
                      <CheckCircle size={14} />
                      Aktif
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-400 text-sm">
                      <XCircle size={14} />
                      Nonaktif
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleToggleActive(addon.id)}
                  className={`p-1.5 rounded-lg ${
                    addon.is_active
                      ? 'text-amber-600 hover:bg-amber-50'
                      : 'text-emerald-600 hover:bg-emerald-50'
                  }`}
                  title={addon.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                >
                  <Power size={16} />
                </button>
              </div>

              {/* Info */}
              <div className="mt-3 text-xs text-gray-400">
                Urutan: {addon.sort_order}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  {modalMode === 'create' ? 'Tambah Add-on Baru' : 'Ubah Add-on'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setEditingAddon(null)
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="misal: Bedah Value"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi singkat add-on..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Price & Icon */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Harga (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="50000"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ikon
                  </label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    {ICON_OPTIONS.map(icon => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fitur (satu per baris)
                </label>
                <textarea
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Fitur 1&#10;Fitur 2&#10;Fitur 3"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Masukkan setiap fitur pada baris baru</p>
              </div>

              {/* Checkboxes */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_popular}
                    onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Populer</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Aktif</span>
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingAddon(null)
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : modalMode === 'create' ? 'Buat Add-on' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
