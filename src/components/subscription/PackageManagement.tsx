import { useState } from 'react'
import { usePackages } from '../../hooks/usePackages'
import {
  DollarSign,
  Edit,
  CheckCircle,
  XCircle,
  RefreshCw,
  Package,
  X,
} from 'lucide-react'

const formatPrice = (amount: number) => {
  return 'Rp ' + amount.toLocaleString('id-ID')
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
    })
    setSaving(false)

    if (result.success) {
      setShowEditModal(false)
      setEditingPackage(null)
    } else {
      alert(result.error || 'Gagal mengupdate harga')
    }
  }

  const openEditModal = (pkg: any) => {
    setEditingPackage(pkg)
    setFormData({
      display_name: pkg.display_name,
      description: pkg.description || '',
      price: pkg.price.toString(),
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
                    <h3 className="text-lg font-semibold text-gray-900">{pkg.display_name}</h3>
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
                  <span className="font-medium text-gray-900">{pkg.duration_months} Bulan</span>
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

              {/* Info */}
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-500">
                <p>Sort Order: {pkg.sort_order}</p>
                <p className="text-xs mt-1">ID: {pkg.id}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingPackage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
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
            <div className="p-6 space-y-4">
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
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
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
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
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
