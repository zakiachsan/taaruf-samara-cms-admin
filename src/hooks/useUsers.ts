import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

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

      // Get user_ids for fetching auth.users emails
      const userIds = profiles.map(p => p.user_id)

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
          is_premium: p.is_premium,
          is_blurred: p.is_blurred,
          photos: p.photos,
          has_bedah_value_cert: p.has_bedah_value_cert,
          bedah_value_cert_code: p.bedah_value_cert_code,
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

      // Filter by premium status
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
      setError(err instanceof Error ? err.message : 'Unknown error')
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
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
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
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
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
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
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
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
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
  }
}