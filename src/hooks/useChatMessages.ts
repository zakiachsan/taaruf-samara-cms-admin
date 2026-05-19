import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useVisibilityRefetch } from './useVisibilityRefetch'

export interface ChatMessage {
  id: string
  chat_id: string
  sender_id: string
  sender_name?: string
  content: string
  is_read: boolean
  created_at: string
}

export const useChatMessages = (chatId: string, page: number = 1, limit: number = 50) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  const fetchMessages = useCallback(async () => {
    if (!chatId) return

    try {
      setLoading(true)

      let query = supabase
        .from('chat_messages')
        .select('*', { count: 'exact' })
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })

      const { count } = await query
      setTotalCount(count || 0)

      const from = Math.max(0, (page - 1) * limit)
      const to = from + limit - 1

      query = query.range(from, to)

      const { data, error } = await query

      if (error) throw error

      // Get all unique sender IDs
      const senderIds = [...new Set((data || []).map(m => m.sender_id))]

      // Fetch sender details
      const { data: senders } = await supabase
        .from('users')
        .select('id, full_name')
        .in('id', senderIds)

      const senderMap = new Map(senders?.map(s => [s.id, s.full_name]) || [])

      const transformed: ChatMessage[] = (data || []).map(m => ({
        id: m.id,
        chat_id: m.chat_id,
        sender_id: m.sender_id,
        sender_name: senderMap.get(m.sender_id) || 'Unknown',
        content: m.content,
        is_read: m.is_read,
        created_at: m.created_at,
      }))

      setMessages(transformed)
    } catch (err) {
      console.error('Error fetching messages:', err)
    } finally {
      setLoading(false)
    }
  }, [chatId, page, limit])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  useVisibilityRefetch(fetchMessages)

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('id', messageId)

      if (error) throw error

      setMessages(msgs =>
        msgs.map(m => m.id === messageId ? { ...m, is_read: true } : m)
      )

      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Terjadi kesalahan' }
    }
  }

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('chat_id', chatId)
        .eq('is_read', false)

      if (error) throw error

      setMessages(msgs => msgs.map(m => ({ ...m, is_read: true })))

      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Terjadi kesalahan' }
    }
  }

  return {
    messages,
    loading,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    refetch: fetchMessages,
    markAsRead,
    markAllAsRead,
  }
}