import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

declare global {
  interface Window {
    __supabaseClient?: SupabaseClient
    __supabaseAdminClient?: SupabaseClient
  }
}

// Fetch wrapper with timeout to prevent hung requests after tab switch
const fetchWithTimeout = async (input: URL | RequestInfo, init?: RequestInit) => {
  const timeout = (init as any)?.timeout ?? 8000
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  const existingSignal = init?.signal
  if (existingSignal) {
    existingSignal.addEventListener('abort', () => controller.abort())
  }

  try {
    const response = await fetch(input, { ...init, signal: controller.signal })
    return response
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Request timeout - please check your connection and try again')
    }
    throw err
  } finally {
    clearTimeout(id)
  }
}

export const supabase: SupabaseClient =
  window.__supabaseClient ??
  createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
    },
    global: {
      fetch: fetchWithTimeout,
    },
  })

if (!window.__supabaseClient) {
  window.__supabaseClient = supabase
}

export const supabaseAdmin: SupabaseClient =
  window.__supabaseAdminClient ??
  createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storageKey: 'sb-admin-token',
    },
    global: {
      headers: {
        apikey: supabaseServiceRoleKey,
      },
      fetch: fetchWithTimeout,
    },
  })

if (!window.__supabaseAdminClient) {
  window.__supabaseAdminClient = supabaseAdmin
}

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
