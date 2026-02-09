import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface User {
  id: string
  email: string
  full_name: string
  role: 'user' | 'admin' | 'moderator'
  is_verified: boolean
  created_at: string
  profile?: {
    age?: number
    religion?: string
    location?: string
    is_premium?: boolean
    photos?: string[]
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
            religion,
            location,
            is_premium,
            photos
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

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      // Transform data
      const transformedUsers: User[] = (data || []).map((u: any) => ({
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        role: u.role,
        is_verified: u.is_verified,
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
      const { error } = await supabase
        .from('users')
        .update({ is_verified: verified })
        .eq('id', userId)
      
      if (error) throw error
      
      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, is_verified: verified } : u
      ))
      
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      // Delete from auth.users (this will cascade to users table due to foreign key)
      const { error } = await supabase.auth.admin.deleteUser(userId)
      
      if (error) throw error
      
      // Update local state
      setUsers(users.filter(u => u.id !== userId))
      setTotalCount(prev => prev - 1)
      
      return { success: true }
    } catch (err) {
      // Fallback: soft delete by updating role
      const { error: updateError } = await supabase
        .from('users')
        .update({ role: 'suspended' })
        .eq('id', userId)
      
      if (updateError) {
        return { success: false, error: updateError.message }
      }
      
      setUsers(users.filter(u => u.id !== userId))
      return { success: true }
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

  return {
    users,
    loading,
    totalCount,
    error,
    totalPages: Math.ceil(totalCount / limit),
    refetch: fetchUsers,
    verifyUser,
    deleteUser,
    changeRole,
  }
}
