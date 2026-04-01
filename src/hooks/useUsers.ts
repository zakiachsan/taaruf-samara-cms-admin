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
      
      let query = supabase
        .from('users')
        .select(`
          *,
          user_profiles (
            age,
            gender,
            religion,
            education,
            location,
            bio,
            is_premium,
            is_blurred,
            photos,
            has_bedah_value_cert,
            bedah_value_cert_code
          )
        `, { count: 'exact' })

      // Apply filters
      if (filters.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
      }
      
      if (filters.role) {
        query = query.eq('role', filters.role)
      }
      
      if (filters.isVerified) {
        query = query.eq('is_verified', filters.isVerified === 'true')
      }

      // Get total count first
      const { count } = await query
      setTotalCount(count || 0)

      // Apply pagination
      const from = (page - 1) * limit
      const to = from + limit - 1
      
      query = query
        .order('created_at', { ascending: false })
        .range(from, to)

      let { data, error: fetchError } = await query

      // Fallback: if user_profiles relationship doesn't exist, query users only
      if (fetchError && fetchError.code === 'PGRST200') {
        let fallbackQuery = supabase
          .from('users')
          .select('*', { count: 'exact' })

        if (filters.search) {
          fallbackQuery = fallbackQuery.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
        }
        if (filters.role) {
          fallbackQuery = fallbackQuery.eq('role', filters.role)
        }
        if (filters.isVerified) {
          fallbackQuery = fallbackQuery.eq('is_verified', filters.isVerified === 'true')
        }

        const { count: fbCount } = await fallbackQuery
        setTotalCount(fbCount || 0)

        const fbResult = await fallbackQuery
          .order('created_at', { ascending: false })
          .range(from, to)

        data = fbResult.data
        fetchError = fbResult.error
      }

      if (fetchError) {
        console.error('Supabase users error:', fetchError)
        throw fetchError
      }

      // Transform data
      const transformedUsers: User[] = (data || []).map((u: any) => ({
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        role: u.role,
        is_verified: u.is_verified,
        is_blocked: u.is_blocked,
        created_at: u.created_at,
        profile: u.user_profiles?.[0] || {},
      }))

      // Filter by premium status (need to do this client-side due to join)
      let filteredUsers = transformedUsers
      if (filters.isPremium) {
        const isPremium = filters.isPremium === 'true'
        filteredUsers = transformedUsers.filter(u => 
          isPremium ? u.profile?.is_premium : !u.profile?.is_premium
        )
      }

      setUsers(filteredUsers)
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
      // Update both users.is_verified AND user_profiles.is_verified for consistency
      const { error: usersError } = await supabase
        .from('users')
        .update({ is_verified: verified, updated_at: new Date().toISOString() })
        .eq('id', userId)

      if (usersError) throw usersError

      const { error: profilesError } = await supabase
        .from('user_profiles')
        .update({ is_verified: verified })
        .eq('user_id', userId)

      if (profilesError) {
        console.error('Profile update failed (profile may not exist):', profilesError)
        // Don't throw - users table is updated, that's the main one
      }

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
      // Update is_blocked to true on users table
      const { error } = await supabase
        .from('users')
        .update({ is_blocked: true, updated_at: new Date().toISOString() })
        .eq('id', userId)

      if (error) throw error

      // Update local state using functional update to avoid stale closure
      setUsers(prevUsers => prevUsers.map(u =>
        u.id === userId ? { ...u, is_blocked: true } : u
      ))

      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  const changeRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)
      
      if (error) throw error
      
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole as any } : u
      ))
      
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    }
    }

  const unblockUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_blocked: false, updated_at: new Date().toISOString() })
        .eq('id', userId)

      if (error) throw error

      setUsers(prevUsers => prevUsers.map(u =>
        u.id === userId ? { ...u, is_blocked: false } : u
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
