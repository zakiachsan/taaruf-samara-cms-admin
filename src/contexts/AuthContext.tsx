import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../lib/supabase'

// User type definition
interface User {
  id: string
  email: string
  email_confirmed_at?: string
  created_at: string
  updated_at?: string
}

// Session type definition
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

  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      // Check for existing Supabase session
      const { data: { session: existingSession } } = await supabase.auth.getSession()

      if (mounted && existingSession?.user) {
        const u = existingSession.user
        setUser({
          id: u.id,
          email: u.email ?? '',
          email_confirmed_at: u.email_confirmed_at,
          created_at: u.created_at,
          updated_at: u.updated_at,
        })
        setSession({
          access_token: existingSession.access_token,
          refresh_token: existingSession.refresh_token,
          expires_in: existingSession.expires_in ?? 3600,
          token_type: existingSession.token_type,
          user: {
            id: u.id,
            email: u.email ?? '',
            email_confirmed_at: u.email_confirmed_at,
            created_at: u.created_at,
            updated_at: u.updated_at,
          },
        })
      }

      if (!mounted) return
      setLoading(false)

      // Listen for auth state changes
      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(
        (_event, newSession) => {
          if (!mounted) return
          if (newSession?.user) {
            const u = newSession.user
            setUser({
              id: u.id,
              email: u.email ?? '',
              email_confirmed_at: u.email_confirmed_at,
              created_at: u.created_at,
              updated_at: u.updated_at,
            })
            setSession({
              access_token: newSession.access_token,
              refresh_token: newSession.refresh_token,
              expires_in: newSession.expires_in ?? 3600,
              token_type: newSession.token_type,
              user: {
                id: u.id,
                email: u.email ?? '',
                email_confirmed_at: u.email_confirmed_at,
                created_at: u.created_at,
                updated_at: u.updated_at,
              },
            })
          } else {
            setUser(null)
            setSession(null)
          }
        }
      )

      return () => {
        sub.unsubscribe()
      }
    }

    initAuth()

    return () => {
      mounted = false
    }
  }, [])

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
      // Force clear if signOut fails
      localStorage.removeItem('sb-okgddlgugdkiswitewdi-auth-token')
    }
    setUser(null)
    setSession(null)
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
