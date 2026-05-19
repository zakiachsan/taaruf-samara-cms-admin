import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../lib/supabase'

interface User {
  id: string
  email: string
  email_confirmed_at?: string
  created_at: string
  updated_at?: string
}

interface Session {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  user: User
}

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [validating, setValidating] = useState(false)
  const isRefreshingRef = useRef(false)

  const mapUser = (u: any): User => ({
    id: u.id,
    email: u.email ?? '',
    email_confirmed_at: u.email_confirmed_at,
    created_at: u.created_at,
    updated_at: u.updated_at,
  })

  const mapSession = (s: any): Session => ({
    access_token: s.access_token,
    refresh_token: s.refresh_token,
    expires_in: s.expires_in ?? 3600,
    token_type: s.token_type,
    user: mapUser(s.user),
  })

  const refreshSession = useCallback(async () => {
    if (isRefreshingRef.current) return
    isRefreshingRef.current = true
    setValidating(true)

    try {
      const { data: { session: refreshedSession } } = await supabase.auth.getSession()

      if (refreshedSession?.user) {
        setUser(mapUser(refreshedSession.user))
        setSession(mapSession(refreshedSession))
      } else {
        try {
          const { data: { session: retrySession } } = await supabase.auth.refreshSession()
          if (retrySession?.user) {
            setUser(mapUser(retrySession.user))
            setSession(mapSession(retrySession))
          } else {
            setUser(null)
            setSession(null)
          }
        } catch {
          setUser(null)
          setSession(null)
        }
      }
    } catch {
      setUser(null)
      setSession(null)
    } finally {
      isRefreshingRef.current = false
      setValidating(false)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    let sub: { unsubscribe: () => void } | null = null

    const initAuth = async () => {
      const { data: { session: existingSession } } = await supabase.auth.getSession()

      if (mounted && existingSession?.user) {
        setUser(mapUser(existingSession.user))
        setSession(mapSession(existingSession))
      }

      if (!mounted) return
      setLoading(false)

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, newSession) => {
          if (!mounted) return
          if (newSession?.user) {
            setUser(mapUser(newSession.user))
            setSession(mapSession(newSession))
          } else {
            setUser(null)
            setSession(null)
          }
        }
      )

      sub = subscription
    }

    initAuth()

    return () => {
      mounted = false
      sub?.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const handleVisibility = async () => {
      if (document.visibilityState !== 'visible') return
      await refreshSession()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [refreshSession])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      return { success: false, error: error.message === 'Invalid login credentials' ? 'Email atau password salah' : error.message }
    }
    return { success: true }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch {
      const tokenKey = 'sb-okgddlgugdkiswitewdi-auth-token'
      localStorage.removeItem(tokenKey)
    }
    setUser(null)
    setSession(null)
  }

  const value = {
    user,
    session,
    loading: loading || validating,
    signIn,
    signOut,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}