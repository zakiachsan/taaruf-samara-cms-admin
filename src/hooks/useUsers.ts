import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase, supabaseAdmin } from '../lib/supabase'

export interface User {
  id: string
  email: string
  full_name: string
  role: 'user' | 'admin' | 'moderator'
  is_verified: boolean
  is_blocked?: boolean
  created_at: string
  profile?: {
    age?: number
    gender?: string
    religion?: string
    education?: string
    location?: string
    bio?: string
    is_premium?: boolean
    is_blurred?: boolean
    photos?: string[]
    has_bedah_value_cert?: boolean
    bedah_value_cert_code?: string
    whatsapp?: string
    phone?: string
  }
}

export interface UserFilters {
  search: string
  role: string
  isVerified: string
  isPremium: string
}

export const useUsers = (filters: UserFilters, page: number = 1, limit: number = 10) => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const fetchUsers = useCallback(async () => {
    try {
      if (mountedRef.current) {
        setLoading(true)
      }

      let query = supabase
        .from('user_profiles')
        .select('*', { count: 'exact' })

      if (filters.search) {
        query = query.or(`full_name.ilike.%${filters.search}%`)
      }

      if (filters.isVerified === 'true') {
        query = query.eq('is_verified', true)
      } else if (filters.isVerified === 'false') {
        query = query.eq('is_verified', false)
      }

      const { count } = await query
      if (mountedRef.current) {
        setTotalCount(count || 0)
      }

      const from = (page - 1) * limit
      const to = from + limit - 1

      query = query
        .order('created_at', { ascending: false })
        .range(from, to)

      let { data: profiles, error: profilesError } = await query

      if (profilesError) {
        console.error('Supabase profiles error:', profilesError)
        throw profilesError
      }

      if (!profiles || profiles.length === 0) {
        if (mountedRef.current) {
          setUsers([])
        }
        if (mountedRef.current) {
          setLoading(false)
        }
        return
      }

      const userIds = profiles.map(p => p.user_id)

      const now = new Date().toISOString()
      const { data: subscriptions } = await supabase
        .from('subscription_purchases')
        .select('user_id, status, expires_at')
        .in('user_id', userIds)
        .eq('status', 'paid')
        .gt('expires_at', now)

      const premiumUserIds = new Set((subscriptions || []).map(s => s.user_id))

      let transformedUsers: User[] = profiles.map((p: any) => ({
        id: p.user_id,
        email: p.email || '',
        full_name: p.full_name,
        role: 'user' as const,
        is_verified: p.is_verified,
        is_blocked: p.is_blocked || false,
        created_at: p.created_at,
        profile: {
          age: p.age,
          gender: p.gender,
          religion: p.religion,
          education: p.education,
          location: p.location,
          bio: p.bio,
          is_premium: premiumUserIds.has(p.user_id) || p.is_premium,
          is_blurred: p.is_blurred,
          photos: p.photos,
          has_bedah_value_cert: p.has_bedah_value_cert,
          bedah_value_cert_code: p.bedah_value_cert_code,
          whatsapp: p.whatsapp,
          phone: p.phone,
        },
      }))

      try {
        const { data: usersData } = await supabase
          .from('users')
          .select('id, email')
          .in('id', userIds)

        if (usersData && usersData.length > 0) {
          const emailMap = new Map(usersData.map(u => [u.id, u.email]))
          transformedUsers = transformedUsers.map(u => ({
            ...u,
            email: emailMap.get(u.id) || u.email
          }))
        }
      } catch (e) {
        console.log('Could not fetch emails from users table:', e)
      }

      if (filters.isPremium) {
        const isPremium = filters.isPremium === 'true'
        transformedUsers = transformedUsers.filter(u =>
          isPremium ? u.profile?.is_premium : !u.profile?.is_premium
        )
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        transformedUsers = transformedUsers.filter(u =>
          u.full_name.toLowerCase().includes(searchLower) ||
          u.email.toLowerCase().includes(searchLower)
        )
      }

      if (mountedRef.current) {
        setUsers(transformedUsers)
      }
      if (mountedRef.current) {
        setError(null)
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [filters, page, limit])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])
  const verifyUser = async (userId: string, verified: boolean) => {
    try {
      const { error: profilesError } = await supabase
        .from('user_profiles')
        .update({ is_verified: verified })
        .eq('user_id', userId)

      if (profilesError) throw profilesError

      await supabase
        .from('users')
        .update({ is_verified: verified, updated_at: new Date().toISOString() })
        .eq('id', userId)

      setUsers(users.map(u =>
        u.id === userId ? { ...u, is_verified: verified } : u
      ))

      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Terjadi kesalahan' }
    }
  }

  const blockUser = async (userId: string) => {
    try {
      const { error: profilesError } = await supabase
        .from('user_profiles')
        .update({ is_blocked: true })
        .eq('user_id', userId)

      if (profilesError) throw profilesError

      await supabase
        .from('users')
        .update({ is_blocked: true, updated_at: new Date().toISOString() })
        .eq('id', userId)

      setUsers(prevUsers => prevUsers.map(u =>
        u.id === userId ? { ...u, is_blocked: true } : u
      ))

      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Terjadi kesalahan' }
    }
  }

  const unblockUser = async (userId: string) => {
    try {
      const { error: profilesError } = await supabase
        .from('user_profiles')
        .update({ is_blocked: false })
        .eq('user_id', userId)

      if (profilesError) throw profilesError

      await supabase
        .from('users')
        .update({ is_blocked: false, updated_at: new Date().toISOString() })
        .eq('id', userId)

      setUsers(prevUsers => prevUsers.map(u =>
        u.id === userId ? { ...u, is_blocked: false } : u
      ))

      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Terjadi kesalahan' }
    }
  }

  const changeRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) {
        console.error('Role update error:', error)
      }

      setUsers(users.map(u =>
        u.id === userId ? { ...u, role: newRole as any } : u
      ))

      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Terjadi kesalahan' }
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      const tables = [
        { name: 'mentoring_sessions', col: 'user_id' },
        { name: 'purchase_addons', col: 'purchase_id', sub: 'subscription_purchases' },
        { name: 'subscription_purchases', col: 'user_id' },
        { name: 'premium_subscriptions', col: 'user_id' },
        { name: 'chat_messages', col: 'sender_id' },
        { name: 'reports', col: 'reporter_id' },
        { name: 'blocked_users', col: 'blocker_id' },
        { name: 'match_requests', col: 'requester_id' },
        { name: 'referral_withdrawals', col: 'user_id' },
        { name: 'referrals', col: 'referrer_id' },
        { name: 'self_value_registrations', col: 'user_id' },
        { name: 'chat_violations', col: 'user_id' },
        { name: 'addon_admin_alerts', col: 'user_id' },
      ]

      for (const t of tables) {
        try {
          if (t.sub) {
            const { data: purchaseIds } = await supabaseAdmin
              .from(t.sub)
              .select('id')
              .eq('user_id', userId)
            if (purchaseIds && purchaseIds.length > 0) {
              await supabaseAdmin
                .from(t.name)
                .delete()
                .in(t.col, purchaseIds.map((p: any) => p.id))
            }
          } else if (t.name === 'reports') {
            await supabaseAdmin.from(t.name).delete().eq('reporter_id', userId)
            await supabaseAdmin.from(t.name).delete().eq('reported_id', userId)
          } else if (t.name === 'blocked_users') {
            await supabaseAdmin.from(t.name).delete().eq('blocker_id', userId)
            await supabaseAdmin.from(t.name).delete().eq('blocked_id', userId)
          } else if (t.name === 'match_requests') {
            await supabaseAdmin.from(t.name).delete().eq('requester_id', userId)
            await supabaseAdmin.from(t.name).delete().eq('recipient_id', userId)
          } else if (t.name === 'referrals') {
            await supabaseAdmin.from(t.name).delete().eq('referrer_id', userId)
            await supabaseAdmin.from(t.name).delete().eq('referred_id', userId)
          } else if (t.name === 'chat_messages') {
            await supabaseAdmin.from(t.name).delete().eq('sender_id', userId)
          } else {
            await supabaseAdmin.from(t.name).delete().eq(t.col as string, userId)
          }
        } catch (e) {
          console.log(`Skip ${t.name}:`, e)
        }
      }

      try {
        const { data: userChats } = await supabaseAdmin
          .from('chats')
          .select('id')
          .or(`participant_ids.cs.{${userId}}`)
        if (userChats && userChats.length > 0) {
          for (const chat of userChats) {
            await supabaseAdmin.from('chat_messages').delete().eq('chat_id', chat.id)
            await supabaseAdmin.from('chats').delete().eq('id', chat.id)
          }
        }
      } catch (e) {
        console.log('Skip chats:', e)
      }

      try { await supabaseAdmin.from('user_profiles').delete().eq('user_id', userId) } catch (e) {}
      try { await supabaseAdmin.from('users').delete().eq('id', userId) } catch (e) {}

      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)
      if (authError) {
        console.error('Delete auth user error:', authError)
        throw authError
      }

      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId))
      setTotalCount(prev => Math.max(0, prev - 1))

      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Terjadi kesalahan' }
    }
  }

  return {
    users,
    loading,
    totalCount,
    error,
    totalPages: Math.ceil(totalCount / limit),
    refetch: fetchUsers,
    verifyUser,
    blockUser,
    unblockUser,
    changeRole,
    deleteUser,
  }
}