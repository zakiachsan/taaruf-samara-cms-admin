import { useState, useEffect, useCallback } from 'react'
import { supabase, supabaseAdmin } from '../lib/supabase'

export interface Chat {
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

export interface ChatFilters {
  search: string
  dateFrom?: string
  dateTo?: string
  userId?: string
}

export const useChats = (filters: ChatFilters, page: number = 1, limit: number = 20) => {
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  const fetchChats = useCallback(async () => {
    try {
      setLoading(true)

      let query = supabaseAdmin
        .from('chats')
        .select('*', { count: 'exact' })
        .order('updated_at', { ascending: false })

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom)
      }

      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo + 'T23:59:59')
      }

      // Note: userId filter is applied client-side since participant_ids is an array

      const { count } = await query
      setTotalCount(count || 0)

      const from = (page - 1) * limit
      const to = from + limit - 1

      query = query.range(from, to)

      const { data, error } = await query

      if (error) throw error

      // Fetch participant details for each chat
      const chatsWithParticipants = await Promise.all(
        (data || []).map(async (chat) => {
          // Get participant user details
          const { data: participants } = await supabase
            .from('users')
            .select('id, full_name, email')
            .in('id', chat.participant_ids)

          // Get last message
          const { data: lastMsg } = await supabaseAdmin
            .from('chat_messages')
            .select('content, created_at, sender_id')
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          // Get unread count for each participant (we'll calculate total)
          const { data: unreadData } = await supabaseAdmin
            .from('chat_messages')
            .select('sender_id')
            .eq('chat_id', chat.id)
            .eq('is_read', false)

          let lastMessageWithSender = null
          if (lastMsg && participants) {
            const sender = participants.find(p => p.id === lastMsg.sender_id)
            lastMessageWithSender = {
              content: lastMsg.content,
              created_at: lastMsg.created_at,
              sender_name: sender?.full_name || 'Unknown',
            }
          }

          return {
            ...chat,
            participants: participants || [],
            last_message: lastMessageWithSender,
            unread_count: unreadData?.length || 0,
          }
        })
      )

      // Client-side search filter
      let filtered = chatsWithParticipants
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filtered = filtered.filter((chat: Chat) =>
          chat.participants?.some((p: { id: string; full_name: string; email: string }) =>
            p.full_name?.toLowerCase().includes(searchLower) ||
            p.email?.toLowerCase().includes(searchLower)
          ) ||
          chat.last_message?.content?.toLowerCase().includes(searchLower)
        )
      }

      if (filters.userId) {
        filtered = filtered.filter((chat: Chat) =>
          chat.participant_ids?.includes(filters.userId!)
        )
      }

      setChats(filtered)
    } catch (err) {
      console.error('Error fetching chats:', err)
    } finally {
      setLoading(false)
    }
  }, [filters, page, limit])

  useEffect(() => {
    fetchChats()
  }, [fetchChats])

  const getChatById = async (chatId: string) => {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('id', chatId)
        .single()

      if (error) throw error

      // Get participants
      const { data: participants } = await supabase
        .from('users')
        .select('id, full_name, email')
        .in('id', data.participant_ids)

      return { ...data, participants }
    } catch (err) {
      console.error('Error fetching chat:', err)
      return null
    }
  }

  return {
    chats,
    loading,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    refetch: fetchChats,
    getChatById,
  }
}