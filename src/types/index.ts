// Database Types for Taaruf Samara

export interface User {
  id: string
  email: string
  full_name: string
  role: 'user' | 'admin' | 'moderator'
  is_verified: boolean
  created_at: string
  updated_at: string
  profile?: UserProfile
}

export interface UserProfile {
  id: string
  user_id: string
  age: number
  religion: string
  prayer_condition: 'taat' | 'sedang'
  salary_range: string
  education: string
  location: string
  bio?: string
  photos?: string[]
  hobbies?: string[]
  interests?: string[]
  is_premium: boolean
  is_blurred: boolean
  created_at: string
}

export interface PremiumSubscription {
  id: string
  user_id: string
  type: 'basic' | 'premium'
  status: 'active' | 'expired' | 'cancelled'
  start_date: string
  end_date?: string
  amount: number
  created_at: string
}

export interface Referral {
  id: string
  referrer_id: string
  referred_id: string
  code: string
  status: 'pending' | 'successful' | 'failed'
  reward_amount: number
  created_at: string
  completed_at?: string
}

export interface Banner {
  id: string
  title: string
  subtitle?: string
  image_url: string
  link_to: string
  is_active: boolean
  order: number
  start_date?: string
  end_date?: string
  created_at: string
  updated_at: string
}

export interface SelfValueRegistration {
  id: string
  user_id: string
  status: 'registered' | 'scheduled' | 'completed' | 'cancelled'
  scheduled_date?: string
  scheduled_time?: string
  location?: string
  certificate_url?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface MatchRequest {
  id: string
  requester_id: string
  recipient_id: string
  status: 'pending' | 'accepted' | 'rejected' | 'completed'
  introduction_message?: string
  created_at: string
  updated_at: string
}

export interface Report {
  id: string
  reporter_id: string
  reported_id: string
  reason: string
  description?: string
  status: 'open' | 'investigating' | 'resolved' | 'dismissed'
  created_at: string
  updated_at: string
}

export interface BlockedUser {
  id: string
  blocker_id: string
  blocked_id: string
  reason?: string
  created_at: string
}

// Dashboard Stats
export interface DashboardStats {
  totalUsers: number
  newUsersToday: number
  activePremiumUsers: number
  pendingVerifications: number
  todayMatches: number
  totalRevenue: number
  monthlyRevenue: number
}
