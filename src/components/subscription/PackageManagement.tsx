import { useState } from 'react'
import { usePackages, featuresToString, stringToFeatures } from '../../hooks/usePackages'
import {
  Edit,
  CheckCircle,
  XCircle,
  RefreshCw,
  Package,
  X,
  Star,
  List,
} from 'lucide-react'

const formatPrice = (amount: number) => {
  return 'Rp ' + amount.toLocaleString('id-ID')
}

const formatDuration = (months: number) => {
  if (months === 0) return 'Selamanya'
  if (months === 1) return '1 Bulan'
  return `${months} Bulan`
}

export default function PackageManagement() {
  const { packages, loading, error, refetch, updatePackage } = usePackages()

  const [editingPackage, setEditingPackage] = useState<any>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    display_name: '',
    description: '',
    price: '',
    features: '',
    is_popular: false,
  })

  const handleSavePackage = async () => {
    if (!editingPackage) return

    const price = parseInt(formData.price)
    if (isNaN(price) || price < 0) {
      alert('Harga harus berupa angka yang valid')
      return
    }

    setSaving(true)
    const result = await updatePackage(editingPackage.id, {
      display_name: formData.display_name,
      description: formData.description,
      price,
      features: stringToFeatures(formData.features),
      is_popular: formData.is_popular,
    })
    setSaving(false)

    if (result.success) {
      setShowEditModal(false)
      setEditingPackage(null)
    } else {
      alert(result.error || 'Gagal mengupdate paket')
    }
  }

  const openEditModal = (pkg: any) => {
    setEditingPackage(pkg)
    setFormData({
      display_name: pkg.display_name,
      description: pkg.description || '',
      price: pkg.price.toString(),
      features: featuresToString(pkg.features),
      is_popular: pkg.is_popular || false,
    })
    setShowEditModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Package Management</h2>
          <p className="text-gray-500 mt-1">Kelola harga dan informasi paket berlangganan</p>
        </div>
        <button
          onClick={refetch}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <XCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading packages...</p>
        </div>
      ) : (
        /* Packages Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-100 rounded-lg">
                    <Package size={24} className="text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      {pkg.display_name}
                      {pkg.is_popular && (
                        <Star size={16} className="text-yellow-500 fill-yellow-500" />
                      )}
                    </h3>
                    <p className="text-sm text-gray-500 capitalize">{pkg.name} Package</p>
                  </div>
                </div>
                <button
                  onClick={() => openEditModal(pkg)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  title="Edit Package"
                >
                  <Edit size={18} />
                </button>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-medium text-gray-900">{formatDuration(pkg.duration_months)}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Price</span>
                  <span className="text-lg font-bold text-emerald-600">
                    {formatPrice(pkg.price)}
                  </span>
                </div>

                {pkg.description && (
                  <div className="py-2">
                    <p className="text-sm text-gray-500">{pkg.description}</p>
                  </div>
                )}
              </div>

              {/* Features */}
              {pkg.features && pkg.features.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <List size={16} />
                    <span>Features</span>
                  </div>
                  <ul className="space-y-1">
                    {pkg.features.slice(0, 3).map((feature: string, idx: number) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                        <CheckCircle size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{feature}</span>
                      </li>
                    ))}
                    {pkg.features.length > 3 && (
                      <li className="text-sm text-gray-500 pl-6">
                        +{pkg.features.length - 3} more...
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Info */}
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-500 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Sort Order: {pkg.sort_order}</span>
                  {pkg.is_popular && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star size={10} className="fill-yellow-500 text-yellow-500" />
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-xs">ID: {pkg.id}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingPackage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Edit Package</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingPackage(null)
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-3 overflow-y-auto flex-1">
              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  placeholder="e.g., Basic (3 Bulan)"
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
                  placeholder="Deskripsi paket..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (Rp)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="50000"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Features (Satu fitur per baris)
                </label>
                <textarea
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Unlimited profil lihat&#10;Unlimited chat&#10;Filter lanjutan"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              {/* Is Popular Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tampilkan sebagai Paket Populer
                  </label>
                  <p className="text-xs text-gray-500">Highlight paket ini di halaman landing page</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_popular: !formData.is_popular })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.is_popular ? 'bg-emerald-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.is_popular ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingPackage(null)
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePackage}
                disabled={saving}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
