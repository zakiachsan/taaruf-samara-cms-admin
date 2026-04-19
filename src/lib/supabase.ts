import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Singleton pattern to prevent multiple GoTrueClient instances
// during HMR / React Strict Mode double-mount
declare global {
  interface Window {
    __supabaseClient?: SupabaseClient
    __supabaseAdminClient?: SupabaseClient
  }
}

// Regular client (with RLS) — shared session across tabs
export const supabase: SupabaseClient =
  window.__supabaseClient ??
  createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
    },
  })

if (!window.__supabaseClient) {
  window.__supabaseClient = supabase
}

// Admin client (bypasses RLS for admin operations)
export const supabaseAdmin: SupabaseClient =
  window.__supabaseAdminClient ??
  createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        apikey: supabaseServiceRoleKey,
      },
    },
  })

if (!window.__supabaseAdminClient) {
  window.__supabaseAdminClient = supabaseAdmin
}

// Auth helpers
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}
