import { useState, useEffect } from 'react'
import { useChatMessages, type ChatMessage } from '../../hooks/useChatMessages'
import { X, ArrowLeft, User } from 'lucide-react'

interface Props {
  chatId: string
  participants?: { id: string; full_name: string; email: string }[]
  onBack?: () => void
}

export default function ChatDetail({ chatId, participants = [], onBack }: Props) {
  const { messages, loading, refetch, markAllAsRead } = useChatMessages(chatId)
  const [autoRefresh, setAutoRefresh] = useState(false)

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(refetch, 5000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refetch])

  const handleMarkAllRead = async () => {
    await markAllAsRead()
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  // Group messages by date
  const groupedMessages: { date: string; messages: ChatMessage[] }[] = []
  let currentDate = ''

  messages.forEach(msg => {
    const msgDate = formatDate(msg.created_at)
    if (msgDate !== currentDate) {
      currentDate = msgDate
      groupedMessages.push({ date: msgDate, messages: [] })
    }
    groupedMessages[groupedMessages.length - 1].messages.push(msg)
  })

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">Conversation</h3>
            <p className="text-sm text-gray-500">
              {participants.map(p => p.full_name).join(', ')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300"
            />
            Auto-refresh
          </label>
          <button
            onClick={handleMarkAllRead}
            className="px-3 py-1.5 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg"
          >
            Mark All Read
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p>No messages yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedMessages.map((group) => (
              <div key={group.date}>
                {/* Date separator */}
                <div className="flex items-center justify-center my-4">
                  <span className="px-3 py-1 bg-gray-200 rounded-full text-xs text-gray-600">
                    {group.date}
                  </span>
                </div>

                {/* Messages for this date */}
                {group.messages.map((msg) => {
                  const isOwnMessage = participants.some(p => p.id === msg.sender_id)
                  const sender = participants.find(p => p.id === msg.sender_id)

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 mb-4 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        isOwnMessage ? 'bg-emerald-100' : 'bg-gray-200'
                      }`}>
                        <User size={16} className={isOwnMessage ? 'text-emerald-600' : 'text-gray-500'} />
                      </div>

                      <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[70%]`}>
                        <div className="text-xs text-gray-500 mb-1">
                          {sender?.full_name || msg.sender_name || 'Unknown'}
                        </div>
                        <div className={`px-4 py-2 rounded-lg ${
                          isOwnMessage
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white border border-gray-200 text-gray-900'
                        }`}>
                          <p className="text-sm">{msg.content}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400">
                            {formatTime(msg.created_at)}
                          </span>
                          {msg.is_read && isOwnMessage && (
                            <span className="text-xs text-emerald-500">Read</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="p-3 border-t border-gray-200 bg-white text-center text-xs text-gray-500">
        Showing {messages.length} messages • Chat ID: {chatId.slice(0, 8)}...
      </div>
    </div>
  )
}