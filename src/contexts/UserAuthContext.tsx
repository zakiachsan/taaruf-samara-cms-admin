import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { ReactNode } from 'react'
import type { UserProfile } from '../types'

interface User {
  id: string
  email: string
}

interface UserWithProfile extends User {
  profile?: UserProfile
}

interface UserAuthContextType {
  user: UserWithProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, fullName: string, referralCode?: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  isAuthenticated: boolean
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined)

export const useUserAuth = () => {
  const context = useContext(UserAuthContext)
  if (!context) {
    throw new Error('useUserAuth must be used within a UserAuthProvider')
  }
  return context
}

interface UserAuthProviderProps {
  children: ReactNode
}

export const UserAuthProvider = ({ children }: UserAuthProviderProps) => {
  const [user, setUser] = useState<UserWithProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | undefined> => {
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()
      return data as UserProfile | undefined
    } catch {
      return undefined
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          profile,
        })
      }
    } catch {
      // Ignore refresh errors
    }
  }, [fetchProfile])

  useEffect(() => {
    let mounted = true
    let subscription: { unsubscribe: () => void } | null = null

    const initAuth = async () => {
      // 1. Explicitly get the current session from localStorage
      //    (onAuthStateChange INITIAL_SESSION already fired before React mount
      //     because of the singleton client, so we must read it manually)
      const { data: { session } } = await supabase.auth.getSession()

      if (mounted && session?.user) {
        const profile = await fetchProfile(session.user.id)
        if (mounted) {
          setUser({
            id: session.user.id,
            email: session.user.email ?? '',
            profile,
          })
        }
      }

      if (!mounted) return
      setLoading(false)

      // 2. Subscribe to future auth changes (login, logout, token refresh)
      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!mounted) return

          if (session?.user) {
            const profile = await fetchProfile(session.user.id)
            if (!mounted) return
            setUser({
              id: session.user.id,
              email: session.user.email ?? '',
              profile,
            })
          } else if (event === 'SIGNED_OUT') {
            setUser(null)
          }
        }
      )

      subscription = sub
    }

    initAuth()

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [fetchProfile])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      return { success: false, error: error.message === 'Invalid login credentials' ? 'Email atau password salah' : error.message }
    }
    return { success: true }
  }

  const signUp = async (email: string, password: string, fullName: string, referralCode?: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      if (error.message.includes('already registered')) {
        return { success: false, error: 'Email sudah terdaftar. Silakan login.' }
      }
      return { success: false, error: error.message }
    }

    if (data.user) {
      // Generate referral code
      const refCode = fullName.slice(0, 3).toUpperCase() + Math.random().toString(36).slice(2, 7).toUpperCase()

      // Create user profile
      await supabase.from('user_profiles').insert({
        user_id: data.user.id,
        full_name: fullName,
        referral_code: refCode,
        is_verified: false,
        is_blurred: true,
      })

      // Handle referral if code provided
      if (referralCode) {
        const { data: referrer } = await supabase
          .from('user_profiles')
          .select('user_id')
          .eq('referral_code', referralCode)
          .maybeSingle()

        if (referrer) {
          await supabase.from('referrals').insert({
            referrer_id: referrer.user_id,
            referred_id: data.user.id,
            code: referralCode,
            status: 'pending',
            reward_amount: 0,
          })
        }
      }
    }

    return { success: true }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch {
      // Force clear if signOut fails
      localStorage.removeItem('sb-okgddlgugdkiswitewdi-auth-token')
    }
    setUser(null)
  }

  return (
    <UserAuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      isAuthenticated: !!user,
    }}>
      {children}
    </UserAuthContext.Provider>
  )
}
