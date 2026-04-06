import { useState } from 'react'
import { useReferralSettings } from '../../hooks/useReferralSettings'
import {
  DollarSign,
  Wallet,
  Lock,
  Clock,
  Edit,
  Info,
  RefreshCw,
  CheckCircle,
  XCircle,
  Settings,
} from 'lucide-react'

const formatPrice = (amount: number) => {
  return 'Rp ' + amount.toLocaleString('id-ID')
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatNumberWithDots = (value: string): string => {
  // Remove all non-digits first
  const digits = value.replace(/\D/g, '')
  // Add dots as thousand separators
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

const parseFormattedNumber = (value: string): number => {
  // Remove all dots and parse as number
  return parseInt(value.replace(/\./g, ''), 10) || 0
}

export default function ReferralSettings() {
  const { settings, loading, error, refetch, updateSettings } = useReferralSettings()

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    reward_amount: '',
    min_withdrawal: '',
    max_withdrawal: '',
    withdrawal_processing_days: '',
  })
  const [formError, setFormError] = useState<string | null>(null)

  const handleEdit = () => {
    if (!settings) return
    setFormData({
      reward_amount: settings.reward_amount.toString(),
      min_withdrawal: settings.min_withdrawal.toString(),
      max_withdrawal: settings.max_withdrawal?.toString() || '',
      withdrawal_processing_days: settings.withdrawal_processing_days.toString(),
    })
    setEditing(true)
    setFormError(null)
  }

  const handleCancel = () => {
    setEditing(false)
    setFormError(null)
  }

  const handleSave = async () => {
    if (!settings) return

    setFormError(null)
    setSaving(true)

    const rewardAmount = parseFormattedNumber(formData.reward_amount)
    const minWithdrawal = parseFormattedNumber(formData.min_withdrawal)
    const maxWithdrawal = formData.max_withdrawal ? parseFormattedNumber(formData.max_withdrawal) : null
    const processingDays = parseInt(formData.withdrawal_processing_days)

    // Client-side validation
    if (isNaN(rewardAmount) || rewardAmount <= 0) {
      setFormError('Reward amount must be greater than 0')
      setSaving(false)
      return
    }
    if (isNaN(minWithdrawal) || minWithdrawal <= 0) {
      setFormError('Minimum withdrawal must be greater than 0')
      setSaving(false)
      return
    }
    if (maxWithdrawal !== null && maxWithdrawal < minWithdrawal) {
      setFormError('Maximum withdrawal must be greater than or equal to minimum withdrawal')
      setSaving(false)
      return
    }
    if (isNaN(processingDays) || processingDays < 1) {
      setFormError('Processing days must be at least 1')
      setSaving(false)
      return
    }

    const result = await updateSettings({
      reward_amount: rewardAmount,
      min_withdrawal: minWithdrawal,
      max_withdrawal: maxWithdrawal,
      withdrawal_processing_days: processingDays,
    })
    setSaving(false)

    if (result.success) {
      setEditing(false)
    } else {
      setFormError(result.error || 'Failed to update settings')
    }
  }

  if (editing) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Referral Settings</h2>
            <p className="text-gray-500 mt-1">Ubah konfigurasi sistem referral</p>
          </div>
        </div>

        {/* Form Error */}
        {formError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <XCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{formError}</p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          {/* Reward Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reward Amount
            </label>
            <input
              type="text"
              value={formData.reward_amount}
              onChange={(e) => setFormData({ ...formData, reward_amount: formatNumberWithDots(e.target.value) })}
              placeholder="10.000"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              disabled={saving}
            />
            <p className="text-xs text-gray-500 mt-1">Komisi per referral berhasil (dalam Rupiah)</p>
          </div>

          {/* Minimum Withdrawal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Withdrawal
            </label>
            <input
              type="text"
              value={formData.min_withdrawal}
              onChange={(e) => setFormData({ ...formData, min_withdrawal: formatNumberWithDots(e.target.value) })}
              placeholder="50.000"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              disabled={saving}
            />
            <p className="text-xs text-gray-500 mt-1">Minimum penarikan yang diizinkan (dalam Rupiah)</p>
          </div>

          {/* Maximum Withdrawal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Withdrawal <span className="text-gray-400">(Opsional)</span>
            </label>
            <input
              type="text"
              value={formData.max_withdrawal}
              onChange={(e) => setFormData({ ...formData, max_withdrawal: formatNumberWithDots(e.target.value) })}
              placeholder="Biarkan kosong untuk tanpa batas"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              disabled={saving}
            />
            <p className="text-xs text-gray-500 mt-1">Biarkan kosong untuk tanpa batas penarikan</p>
          </div>

          {/* Processing Days */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Processing Days
            </label>
            <input
              type="number"
              value={formData.withdrawal_processing_days}
              onChange={(e) => setFormData({ ...formData, withdrawal_processing_days: e.target.value })}
              placeholder="3"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              disabled={saving}
            />
            <p className="text-xs text-gray-500 mt-1">Jumlah hari untuk memproses penarikan</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Referral Settings</h2>
          <p className="text-gray-500 mt-1">Konfigurasi sistem referral aplikasi</p>
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
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            <Edit size={18} />
            Edit Settings
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <XCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-blue-800 font-medium">Penting</p>
          <p className="text-sm text-blue-700 mt-1">
            Perubahan konfigurasi hanya berlaku untuk referral baru yang dibuat setelah perubahan disimpan.
            Referral yang sudah ada tidak akan terpengaruh.
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Memuat pengaturan...</p>
        </div>
      ) : settings ? (
        <>
          {/* Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Reward Amount */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <DollarSign size={24} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Reward Amount</h3>
                  <p className="text-sm text-gray-500">Komisi per referral</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-emerald-600">
                {formatPrice(settings.reward_amount)}
              </div>
            </div>

            {/* Minimum Withdrawal */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Wallet size={24} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Minimum Withdrawal</h3>
                  <p className="text-sm text-gray-500">Minimum penarikan</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {formatPrice(settings.min_withdrawal)}
              </div>
            </div>

            {/* Maximum Withdrawal */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Lock size={24} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Maximum Withdrawal</h3>
                  <p className="text-sm text-gray-500">Maksimum penarikan</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-purple-600">
                {settings.max_withdrawal ? formatPrice(settings.max_withdrawal) : 'Tanpa Batas'}
              </div>
            </div>

            {/* Processing Days */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <Clock size={24} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Processing Days</h3>
                  <p className="text-sm text-gray-500">Hari pemrosesan</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-amber-600">
                {settings.withdrawal_processing_days} Hari
              </div>
            </div>
          </div>

          {/* Audit Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Settings size={16} className="text-gray-400" />
              <span>Terakhir diperbarui: {formatDateTime(settings.updated_at)}</span>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
