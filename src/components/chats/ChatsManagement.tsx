import { useState } from 'react'
import { useChats, type ChatFilters } from '../../hooks/useChats'
import {
  Search,
  MessageCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
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

  const handleViewChat = (chat: ChatWithParticipants) => {
    setSelectedChat(chat)
    setShowDetailModal(true)
    onViewChat?.(chat.id)
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
              <p className="text-sm text-gray-500">Total Chats</p>
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
              placeholder="Search by user name or email..."
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value })
                setPage(1)
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refetch}
              className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>Total: {totalCount} chats</span>
          <div className="flex items-center gap-2">
            <span>Show:</span>
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
            <p className="mt-4 text-gray-500">Loading chats...</p>
          </div>
        ) : chats.length === 0 ? (
          <div className="p-12 text-center">
            <MessageCircle size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No chats found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Participants</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Message</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Started</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Activity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
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
                        <span className="text-gray-400 text-sm">No messages yet</span>
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
                        View
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
              <ChevronLeft size={16} /> Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg disabled:opacity-50"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {selectedChat.participants?.slice(0, 2).map((p) => (
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
                  <h3 className="font-semibold text-gray-900">Chat Conversation</h3>
                  <p className="text-sm text-gray-500">
                    {selectedChat.participants?.map(p => p.full_name).join(', ')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  setSelectedChat(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 text-center text-gray-500">
              <MessageCircle size={48} className="mx-auto text-gray-300 mb-2" />
              <p>Click "View Messages" to see the full conversation history</p>
              <p className="text-sm mt-2">Chat ID: {selectedChat.id}</p>
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  onViewChat?.(selectedChat.id)
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                View Messages
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}