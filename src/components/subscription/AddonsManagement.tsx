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
  const { addons, loading, error, refetch, createAddon, updateAddon, deleteAddon, toggleAddonActive } = useAddons()

  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    icon: 'crown',
    features: '',
    is_popular: false,
    is_active: true,
  })

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return

    const result = await deleteAddon(id)
    if (!result.success) {
      alert(result.error || 'Failed to delete add-on')
    }
  }

  const handleToggleActive = async (id: string) => {
    const result = await toggleAddonActive(id)
    if (!result.success) {
      alert(result.error || 'Failed to toggle add-on')
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
      alert('Name is required')
      return
    }

    const price = parseInt(formData.price)
    if (isNaN(price) || price < 0) {
      alert('Price must be a valid number')
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
        alert(result.error || 'Failed to create add-on')
      }
    } else {
      if (editingAddon) {
        const result = await updateAddon(editingAddon.id, data)
        if (result.success) {
          setShowModal(false)
          setEditingAddon(null)
        } else {
          alert(result.error || 'Failed to update add-on')
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
          <h2 className="text-2xl font-bold text-gray-900">Add-ons Management</h2>
          <p className="text-gray-500 mt-1">Kelola fitur tambahan yang dapat dibeli pengguna</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refetch}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            <Plus size={18} />
            Add New
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
          <p className="mt-4 text-gray-500">Loading add-ons...</p>
        </div>
      ) : addons.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Puzzle size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No add-ons found</p>
        </div>
      ) : (
        /* Add-ons Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {addons.map((addon) => (
            <div
              key={addon.id}
              className={`bg-white rounded-xl border p-4 hover:shadow-md transition-shadow ${
                !addon.is_active ? 'opacity-60' : 'border-gray-200'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                {getAddonIcon(addon.icon)}
                <div className="flex items-center gap-1">
                  {addon.is_popular && (
                    <span className="flex items-center gap-1 text-amber-600 text-xs">
                      <Star size={12} fill />
                    </span>
                  )}
                  <button
                    onClick={() => openEditModal(addon)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(addon.id, addon.name)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
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
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-400 text-sm">
                      <XCircle size={14} />
                      Inactive
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
                  title={addon.is_active ? 'Deactivate' : 'Activate'}
                >
                  <Power size={16} />
                </button>
              </div>

              {/* Info */}
              <div className="mt-3 text-xs text-gray-400">
                Order: {addon.sort_order}
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
                  {modalMode === 'create' ? 'Add New Add-on' : 'Edit Add-on'}
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
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Bedah Value"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the add-on..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Price & Icon */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (Rp) <span className="text-red-500">*</span>
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
                    Icon
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
                  Features (one per line)
                </label>
                <textarea
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Enter each feature on a new line</p>
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
                  <span className="text-sm font-medium text-gray-700">Popular</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
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
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : modalMode === 'create' ? 'Create Add-on' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
