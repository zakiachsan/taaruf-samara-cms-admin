import { useState, useEffect, useMemo } from 'react'
import {
  ShieldAlert,
  Plus,
  Trash2,
  Search,
  AlertTriangle,
  MessageSquareWarning,
  Phone,
  Frown,
  Activity,
  CheckCircle2,
  XCircle,
  Sparkles,
} from 'lucide-react'

// ─── Types ──────────────────────────────────────────────

type Severity = 'low' | 'medium' | 'high'
type Category = 'harsh_words' | 'contact_info' | 'inappropriate'

interface KeywordItem {
  id: string
  word: string
  category: Category
  severity: Severity
  createdAt: string
}

// ─── Constants ──────────────────────────────────────────

const STORAGE_KEY = 'taaruf_chat_keywords'

const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: 'harsh_words', label: 'Kata Kasar' },
  { value: 'contact_info', label: 'Info Kontak' },
  { value: 'inappropriate', label: 'Tidak Pantas' },
]

const SEVERITY_OPTIONS: { value: Severity; label: string }[] = [
  { value: 'low', label: 'Rendah' },
  { value: 'medium', label: 'Sedang' },
  { value: 'high', label: 'Tinggi' },
]

const DEFAULT_KEYWORDS: Omit<KeywordItem, 'id' | 'createdAt'>[] = [
  { word: 'kontak', category: 'contact_info', severity: 'medium' },
  { word: 'wa', category: 'contact_info', severity: 'medium' },
  { word: 'whatsapp', category: 'contact_info', severity: 'medium' },
  { word: 'telepon', category: 'contact_info', severity: 'medium' },
  { word: 'no hp', category: 'contact_info', severity: 'medium' },
  { word: 'jamin', category: 'inappropriate', severity: 'low' },
  { word: 'pasti', category: 'inappropriate', severity: 'low' },
]

// ─── Helpers ────────────────────────────────────────────

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function loadKeywords(): KeywordItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as KeywordItem[]
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // ignore
  }
  // Preload defaults
  const defaults = DEFAULT_KEYWORDS.map((k) => ({
    ...k,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults))
  return defaults
}

function saveKeywords(items: KeywordItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

function getCategoryLabel(cat: Category) {
  return CATEGORY_OPTIONS.find((c) => c.value === cat)?.label ?? cat
}

function getSeverityLabel(sev: Severity) {
  return SEVERITY_OPTIONS.find((s) => s.value === sev)?.label ?? sev
}

function getSeverityColor(sev: Severity) {
  switch (sev) {
    case 'high':
      return 'bg-red-100 text-red-700'
    case 'medium':
      return 'bg-amber-100 text-amber-700'
    case 'low':
      return 'bg-blue-100 text-blue-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

function getCategoryIcon(cat: Category) {
  switch (cat) {
    case 'harsh_words':
      return Frown
    case 'contact_info':
      return Phone
    case 'inappropriate':
      return MessageSquareWarning
    default:
      return MessageSquareWarning
  }
}

function getCategoryColor(cat: Category) {
  switch (cat) {
    case 'harsh_words':
      return 'bg-rose-100 text-rose-700'
    case 'contact_info':
      return 'bg-blue-100 text-blue-700'
    case 'inappropriate':
      return 'bg-purple-100 text-purple-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ─── Component ──────────────────────────────────────────

export default function ChatKeywordSensor() {
  const [keywords, setKeywords] = useState<KeywordItem[]>(loadKeywords)
  const [newWord, setNewWord] = useState('')
  const [newCategory, setNewCategory] = useState<Category>('contact_info')
  const [newSeverity, setNewSeverity] = useState<Severity>('medium')
  const [searchTerm, setSearchTerm] = useState('')
  const [testMessage, setTestMessage] = useState('')

  // Persist on change
  useEffect(() => {
    saveKeywords(keywords)
  }, [keywords])

  const stats = useMemo(() => {
    const total = keywords.length
    const low = keywords.filter((k) => k.severity === 'low').length
    const medium = keywords.filter((k) => k.severity === 'medium').length
    const high = keywords.filter((k) => k.severity === 'high').length
    const harshWords = keywords.filter((k) => k.category === 'harsh_words').length
    const contactInfo = keywords.filter((k) => k.category === 'contact_info').length
    const inappropriate = keywords.filter((k) => k.category === 'inappropriate').length
    return { total, low, medium, high, harshWords, contactInfo, inappropriate }
  }, [keywords])

  const filteredKeywords = useMemo(() => {
    if (!searchTerm.trim()) return keywords
    const q = searchTerm.toLowerCase()
    return keywords.filter(
      (k) =>
        k.word.toLowerCase().includes(q) ||
        getCategoryLabel(k.category).toLowerCase().includes(q)
    )
  }, [keywords, searchTerm])

  const testResults = useMemo(() => {
    if (!testMessage.trim()) return []
    const lowerMsg = testMessage.toLowerCase()
    return keywords.filter((k) => {
      const pattern = new RegExp(`\\b${escapeRegExp(k.word.toLowerCase())}\\b`, 'i')
      return pattern.test(lowerMsg) || lowerMsg.includes(k.word.toLowerCase())
    })
  }, [testMessage, keywords])

  const handleAdd = () => {
    const trimmed = newWord.trim().toLowerCase()
    if (!trimmed) return
    if (keywords.some((k) => k.word.toLowerCase() === trimmed)) {
      alert('Kata kunci sudah ada dalam daftar.')
      return
    }
    const item: KeywordItem = {
      id: generateId(),
      word: trimmed,
      category: newCategory,
      severity: newSeverity,
      createdAt: new Date().toISOString(),
    }
    setKeywords((prev) => [item, ...prev])
    setNewWord('')
  }

  const handleDelete = (id: string) => {
    if (!confirm('Hapus kata kunci ini?')) return
    setKeywords((prev) => prev.filter((k) => k.id !== id))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAdd()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ShieldAlert size={28} className="text-emerald-600" />
          Sensor Kata Kunci Chat
        </h1>
        <p className="text-gray-500 mt-1">
          Kelola kata kunci yang akan mendeteksi pesan berbahaya atau tidak pantas dalam percakapan.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Kata Kunci</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500">
              <Activity size={20} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Keparahan Tinggi</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.high}</h3>
            </div>
            <div className="p-2 rounded-lg bg-red-500">
              <AlertTriangle size={20} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Keparahan Sedang</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.medium}</h3>
            </div>
            <div className="p-2 rounded-lg bg-amber-500">
              <MessageSquareWarning size={20} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Keparahan Rendah</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.low}</h3>
            </div>
            <div className="p-2 rounded-lg bg-blue-500">
              <Sparkles size={20} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center gap-4">
          <div className="p-2 rounded-lg bg-rose-100">
            <Frown size={20} className="text-rose-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Kata Kasar</p>
            <p className="text-xl font-bold text-gray-900">{stats.harshWords}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center gap-4">
          <div className="p-2 rounded-lg bg-blue-100">
            <Phone size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Info Kontak</p>
            <p className="text-xl font-bold text-gray-900">{stats.contactInfo}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center gap-4">
          <div className="p-2 rounded-lg bg-purple-100">
            <MessageSquareWarning size={20} className="text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Tidak Pantas</p>
            <p className="text-xl font-bold text-gray-900">{stats.inappropriate}</p>
          </div>
        </div>
      </div>

      {/* Add Keyword Form */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tambah Kata Kunci Baru</h2>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Masukkan kata kunci..."
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as Category)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <select
            value={newSeverity}
            onChange={(e) => setNewSeverity(e.target.value as Severity)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
          >
            {SEVERITY_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            disabled={!newWord.trim()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus size={18} />
            Tambah
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari kata kunci atau kategori..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
        <div className="mt-3 text-sm text-gray-500">
          Menampilkan {filteredKeywords.length} dari {stats.total} kata kunci
        </div>
      </div>

      {/* Keywords Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {keywords.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldAlert size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">Belum ada kata kunci</p>
            <p className="text-sm text-gray-400 mt-1">
              Tambahkan kata kunci pertama untuk mulai memantau percakapan.
            </p>
          </div>
        ) : filteredKeywords.length === 0 ? (
          <div className="p-12 text-center">
            <Search size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Tidak ada kata kunci yang cocok dengan pencarian</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Kata Kunci
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Kategori
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Keparahan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">
                    Tanggal Ditambahkan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredKeywords.map((k) => {
                  const CatIcon = getCategoryIcon(k.category)
                  return (
                    <tr key={k.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">{k.word}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                            k.category
                          )}`}
                        >
                          <CatIcon size={12} />
                          {getCategoryLabel(k.category)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                            k.severity
                          )}`}
                        >
                          {getSeverityLabel(k.severity)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">
                        {formatDate(k.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(k.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                          Hapus
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Test / Preview */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles size={20} className="text-emerald-600" />
            Uji Coba Pesan
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Ketik pesan di bawah untuk melihat apakah ada kata kunci yang terdeteksi.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Pesan</label>
          <textarea
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Contoh: Boleh minta kontak wa-nya?"
            rows={4}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
          />
        </div>

        {testMessage.trim() && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {testResults.length > 0 ? (
                <>
                  <XCircle size={20} className="text-red-600" />
                  <span className="font-medium text-red-700">
                    Terdeteksi {testResults.length} kata kunci
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} className="text-emerald-600" />
                  <span className="font-medium text-emerald-700">
                    Tidak ada kata kunci terdeteksi
                  </span>
                </>
              )}
            </div>

            {testResults.length > 0 && (
              <div className="space-y-2">
                {testResults.map((k) => {
                  const CatIcon = getCategoryIcon(k.category)
                  return (
                    <div
                      key={k.id}
                      className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-lg"
                    >
                      <AlertTriangle size={18} className="text-red-600 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-red-900">
                          "{k.word}" terdeteksi
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                          k.category
                        )}`}
                      >
                        <CatIcon size={10} />
                        {getCategoryLabel(k.category)}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                          k.severity
                        )}`}
                      >
                        {getSeverityLabel(k.severity)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
