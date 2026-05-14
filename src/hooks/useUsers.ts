import { useState, useEffect, useCallback } from 'react'
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

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)

      // Query user_profiles directly (user_id references auth.users.id)
      let query = supabase
        .from('user_profiles')
        .select('*', { count: 'exact' })

      // Apply filters
      if (filters.search) {
        query = query.or(`full_name.ilike.%${filters.search}%`)
      }

      if (filters.isVerified === 'true') {
        query = query.eq('is_verified', true)
      } else if (filters.isVerified === 'false') {
        query = query.eq('is_verified', false)
      }

      // Get total count
      const { count } = await query
      setTotalCount(count || 0)

      // Apply pagination
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
        setUsers([])
        setLoading(false)
        return
      }

      // Get user_ids for fetching auth.users emails and subscriptions
      const userIds = profiles.map(p => p.user_id)

      // Fetch active subscriptions from subscription_purchases for all users in this page
      const now = new Date().toISOString()
      const { data: subscriptions } = await supabase
        .from('subscription_purchases')
        .select('user_id, status, expires_at')
        .in('user_id', userIds)
        .eq('status', 'paid')
        .gt('expires_at', now)

      const premiumUserIds = new Set((subscriptions || []).map(s => s.user_id))

      // Transform data - use user_profiles data as source of truth
      let transformedUsers: User[] = profiles.map((p: any) => ({
        id: p.user_id,
        email: p.email || '', // Will be filled if we can get from auth
        full_name: p.full_name,
        role: 'user' as const, // Default role
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

      // Try to get emails from users table (if it has matching user_ids)
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
        // users table might not exist or not have the right data, continue without email
        console.log('Could not fetch emails from users table:', e)
      }

      // Filter by premium status (already computed from subscription_purchases)
      if (filters.isPremium) {
        const isPremium = filters.isPremium === 'true'
        transformedUsers = transformedUsers.filter(u =>
          isPremium ? u.profile?.is_premium : !u.profile?.is_premium
        )
      }

      // Filter by search (if searching by email, we need to check after we have emails)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        transformedUsers = transformedUsers.filter(u =>
          u.full_name.toLowerCase().includes(searchLower) ||
          u.email.toLowerCase().includes(searchLower)
        )
      }

      setUsers(transformedUsers)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }, [filters, page, limit])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const verifyUser = async (userId: string, verified: boolean) => {
    try {
      // Update user_profiles.is_verified
      const { error: profilesError } = await supabase
        .from('user_profiles')
        .update({ is_verified: verified })
        .eq('user_id', userId)

      if (profilesError) throw profilesError

      // Also update legacy users table if exists
      await supabase
        .from('users')
        .update({ is_verified: verified, updated_at: new Date().toISOString() })
        .eq('id', userId)

      // Update local state
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
      // Update user_profiles.is_blocked
      const { error: profilesError } = await supabase
        .from('user_profiles')
        .update({ is_blocked: true })
        .eq('user_id', userId)

      if (profilesError) throw profilesError

      // Also update legacy users table if exists
      await supabase
        .from('users')
        .update({ is_blocked: true, updated_at: new Date().toISOString() })
        .eq('id', userId)

      // Update local state
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
      // Update user_profiles.is_blocked
      const { error: profilesError } = await supabase
        .from('user_profiles')
        .update({ is_blocked: false })
        .eq('user_id', userId)

      if (profilesError) throw profilesError

      // Also update legacy users table if exists
      await supabase
        .from('users')
        .update({ is_blocked: false, updated_at: new Date().toISOString() })
        .eq('id', userId)

      // Update local state
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
      // Update legacy users table
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) {
        console.error('Role update error:', error)
        // Don't throw - the main functionality is updating user_profiles
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
      // Step 1: Hapus data dari tabel public yang mungkin punya data user
      // Urutan: child tables dulu, parent tables belakangan
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
            // Untuk purchase_addons: hapus berdasarkan purchase_id dari subscription_purchases
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
          // Abaikan error kalau tabel/kolom nggak ada
          console.log(`Skip ${t.name}:`, e)
        }
      }

      // Hapus chats (participant_ids adalah array)
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

      // Step 2: Hapus user_profiles dan public.users
      try { await supabaseAdmin.from('user_profiles').delete().eq('user_id', userId) } catch (e) {}
      try { await supabaseAdmin.from('users').delete().eq('id', userId) } catch (e) {}

      // Step 3: Hapus user dari auth.users via admin API
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)
      if (authError) {
        console.error('Delete auth user error:', authError)
        throw authError
      }

      // Update local state
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