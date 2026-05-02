import { useState, useEffect, useRef } from 'react'
import { supabase, supabaseAdmin } from '../../lib/supabase'
import { useChats, type ChatFilters } from '../../hooks/useChats'
import {
  Search,
  MessageCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Filter,
  Clock,
  Check,
  CheckCheck,
} from 'lucide-react'

const LIMIT_OPTIONS = [10, 20, 50]

interface ChatWithParticipants {
  id: string
  participant_ids: string[]
  match_request_id?: string
  created_at: string
  updated_at: string
  participants?: {
    id: string
    full_name: string
    email: string
  }[]
  last_message?: {
    content: string
    created_at: string
    sender_name: string
  }
  unread_count?: number
}

interface ChatMessage {
  id: string
  chat_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
}

interface Props {
  onViewChat?: (chatId: string) => void
}

export default function ChatsManagement({ onViewChat }: Props) {
  const [filters, setFilters] = useState<ChatFilters>({
    search: '',
  })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [selectedChat, setSelectedChat] = useState<ChatWithParticipants | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [userOptions, setUserOptions] = useState<Array<{ id: string; full_name: string }>>([])

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatMessagesLoading, setChatMessagesLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase
        .from('user_profiles')
        .select('user_id, full_name')
        .order('full_name', { ascending: true })
        .limit(200)
      if (data) {
        setUserOptions(data.map((u: any) => ({ id: u.user_id, full_name: u.full_name })))
      }
    }
    fetchUsers()
  }, [])

  const {
    chats,
    loading,
    totalCount,
    totalPages,
    refetch,
  } = useChats(filters, page, limit)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Baru saja'
    if (diffMins < 60) return `${diffMins} menit lalu`
    if (diffHours < 24) return `${diffHours} jam lalu`
    if (diffDays < 7) return `${diffDays} hari lalu`
    return formatDate(dateString)
  }

  const fetchChatMessages = async (chatId: string) => {
    setChatMessagesLoading(true)
    try {
      const { data, error } = await supabaseAdmin
        .from('chat_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })
        .limit(500)

      if (error) throw error
      setChatMessages(data || [])
    } catch (err) {
      console.error('Error fetching chat messages:', err)
      setChatMessages([])
    } finally {
      setChatMessagesLoading(false)
    }
  }

  const handleViewChat = (chat: ChatWithParticipants) => {
    setSelectedChat(chat)
    setShowDetailModal(true)
    fetchChatMessages(chat.id)
    onViewChat?.(chat.id)
  }

  useEffect(() => {
    if (!chatMessagesLoading && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages, chatMessagesLoading])

  const getSenderInfo = (senderId: string) => {
    if (!selectedChat?.participants) return { name: 'Pengguna', initial: '?' }
    const sender = selectedChat.participants.find((p) => p.id === senderId)
    return {
      name: sender?.full_name || 'Pengguna',
      initial: sender?.full_name?.charAt(0).toUpperCase() || '?',
    }
  }

  const getParticipantColor = (senderId: string, index: number) => {
    const colors = [
      'bg-emerald-100 text-emerald-700',
      'bg-blue-100 text-blue-700',
      'bg-purple-100 text-purple-700',
      'bg-orange-100 text-orange-700',
    ]
    if (!selectedChat?.participants) return colors[0]
    const idx = selectedChat.participants.findIndex((p) => p.id === senderId)
    return colors[idx >= 0 ? idx % colors.length : index % colors.length]
  }

  const groupMessagesByDate = (messages: ChatMessage[]) => {
    const groups: { date: string; messages: ChatMessage[] }[] = []
    messages.forEach((msg) => {
      const dateStr = new Date(msg.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
      const lastGroup = groups[groups.length - 1]
      if (lastGroup && lastGroup.date === dateStr) {
        lastGroup.messages.push(msg)
      } else {
        groups.push({ date: dateStr, messages: [msg] })
      }
    })
    return groups
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageCircle size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Chat</p>
              <p className="text-xl font-bold text-gray-900">{totalCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari berdasarkan nama atau email pengguna..."
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value })
                setPage(1)
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select
                value={filters.userId || ''}
                onChange={(e) => {
                  setFilters({ ...filters, userId: e.target.value || undefined })
                  setPage(1)
                }}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
              >
                <option value="">Semua Pengguna</option>
                {userOptions.map((u) => (
                  <option key={u.id} value={u.id}>{u.full_name}</option>
                ))}
              </select>
            </div>
            <button
              onClick={refetch}
              className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>Total: {totalCount} chat</span>
          <div className="flex items-center gap-2">
            <span>Tampilkan:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value))
                setPage(1)
              }}
              className="border border-gray-200 rounded px-2 py-1"
            >
              {LIMIT_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Chats Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="mt-4 text-gray-500">Memuat chat...</p>
          </div>
        ) : chats.length === 0 ? (
          <div className="p-12 text-center">
            <MessageCircle size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Tidak ada chat ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Peserta</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pesan Terakhir</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dimulai</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aktivitas Terakhir</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {chats.map((chat) => (
                  <tr key={chat.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {chat.participants?.slice(0, 2).map((p) => (
                            <div
                              key={p.id}
                              className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center"
                            >
                              <span className="text-emerald-700 font-semibold text-xs">
                                {p.full_name?.charAt(0).toUpperCase() || '?'}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div>
                          {chat.participants?.map(p => (
                            <p key={p.id} className="text-sm font-medium text-gray-900">
                              {p.full_name}
                            </p>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {chat.last_message ? (
                        <div className="max-w-xs">
                          <p className="text-sm text-gray-600 truncate">
                            {chat.last_message.sender_name}: {chat.last_message.content}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Belum ada pesan</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(chat.created_at)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatRelativeTime(chat.updated_at)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleViewChat(chat)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg"
                      >
                        <Eye size={16} />
                        Lihat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg disabled:opacity-50"
            >
              <ChevronLeft size={16} /> Sebelumnya
            </button>
            <span className="text-sm text-gray-500">
              Halaman {page} dari {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg disabled:opacity-50"
            >
              Berikutnya <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Chat History Modal */}
      {showDetailModal && selectedChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {selectedChat.participants?.slice(0, 2).map((p) => (
                    <div
                      key={p.id}
                      className="w-9 h-9 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center"
                    >
                      <span className="text-emerald-700 font-semibold text-sm">
                        {p.full_name?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                  ))}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedChat.participants?.map(p => p.full_name).join(' & ') || 'Percakapan'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {chatMessages.length} pesan · Dibuat {formatDate(selectedChat.created_at)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  setSelectedChat(null)
                  setChatMessages([])
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-4 min-h-0">
              {chatMessagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                </div>
              ) : chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <MessageCircle size={48} className="mb-3" />
                  <p>Belum ada pesan dalam chat ini</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {groupMessagesByDate(chatMessages).map((group) => (
                    <div key={group.date}>
                      <div className="flex items-center justify-center mb-4">
                        <span className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-200 rounded-full">
                          {group.date}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {group.messages.map((msg, idx) => {
                          const sender = getSenderInfo(msg.sender_id)
                          const colorClass = getParticipantColor(msg.sender_id, idx)
                          return (
                            <div key={msg.id} className="flex gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${colorClass}`}
                              >
                                <span className="font-semibold text-xs">{sender.initial}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-sm font-semibold text-gray-800">
                                    {sender.name}
                                  </span>
                                  <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Clock size={10} />
                                    {formatTime(msg.created_at)}
                                  </span>
                                  {msg.is_read ? (
                                    <CheckCheck size={12} className="text-blue-500" />
                                  ) : (
                                    <Check size={12} className="text-gray-300" />
                                  )}
                                </div>
                                <div className="bg-white border border-gray-200 rounded-lg rounded-tl-none px-3 py-2 shadow-sm">
                                  <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                                    {msg.content}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 bg-white shrink-0">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>ID Chat: {selectedChat.id}</span>
                <span>
                  {selectedChat.participants?.map(p => p.email).join(', ')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
