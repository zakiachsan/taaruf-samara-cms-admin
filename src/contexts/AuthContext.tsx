import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

// Hardcoded admin credentials
const ADMIN_CREDENTIALS = {
  email: 'taarufsamara2026@gmail.com',
  password: 'xj1lAIFO3G8SQFVI'
}

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

// Create a fake admin user for hardcoded login
const createAdminUser = (): User => ({
  id: 'admin-hardcoded',
  email: ADMIN_CREDENTIALS.email,
  email_confirmed_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
})

const createAdminSession = (user: User): Session => ({
  access_token: 'hardcoded-token',
  refresh_token: 'hardcoded-refresh',
  expires_in: 3600,
  token_type: 'bearer',
  user
})

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for hardcoded admin in localStorage
    const storedAuth = localStorage.getItem('admin_auth')
    if (storedAuth === 'true') {
      const adminUser = createAdminUser()
      setUser(adminUser)
      setSession(createAdminSession(adminUser))
    }
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    // Check against hardcoded credentials
    if (email !== ADMIN_CREDENTIALS.email || password !== ADMIN_CREDENTIALS.password) {
      return { success: false, error: 'Email atau password salah' }
    }

    // Create admin user and session
    const adminUser = createAdminUser()
    const adminSession = createAdminSession(adminUser)

    setUser(adminUser)
    setSession(adminSession)

    // Store in localStorage
    localStorage.setItem('admin_auth', 'true')

    return { success: true }
  }

  const signOut = async () => {
    setUser(null)
    setSession(null)
    localStorage.removeItem('admin_auth')
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
