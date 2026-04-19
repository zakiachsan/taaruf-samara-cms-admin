// Database Types for Taaruf Samara CMS Admin
// Synced with Mobile App types

export interface User {
  id: string
  email: string
  full_name: string
  role: 'user' | 'admin' | 'moderator'
  is_verified: boolean
  created_at: string
  updated_at?: string
  profile?: UserProfile
}

export interface UserProfile {
  id: string
  user_id: string
  full_name?: string
  age?: number
  gender?: 'male' | 'female'
  religion?: string
  prayer_condition?: 'taat' | 'sedang'
  salary_range?: string
  education?: string
  location?: string
  bio?: string
  photos?: string[]
  hobbies?: string[]
  interests?: string[]
  referral_code?: string
  is_verified: boolean
  is_blurred: boolean
  created_at: string
  updated_at?: string
}

export interface PremiumSubscription {
  id: string
  user_id: string
  plan_type: 'basic' | 'premium'  // Updated to match mobile
  type?: 'basic' | 'premium'      // Legacy field
  status: 'active' | 'expired' | 'cancelled'
  start_date: string
  end_date?: string
  expires_at?: string  // Alias for end_date
  amount: number
  created_at: string
  // Joined data
  user?: User
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
  // Joined data
  referrer?: User
  referred?: User
}

export interface ReferralWithdrawal {
  id: string
  user_id: string
  amount: number
  bank_name: string
  account_number: string
  account_name: string
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  admin_notes?: string
  processed_at?: string
  created_at: string
  // Joined data
  user?: User
}

export interface Banner {
  id: string
  title: string
  subtitle?: string
  image_url: string
  link_to?: string
  is_active: boolean
  display_order: number  // Updated from 'order'
  start_date?: string
  end_date?: string
  created_at?: string
  updated_at?: string
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
  updated_at?: string
  // Joined data
  user?: User
}

export interface MatchRequest {
  id: string
  requester_id: string
  recipient_id: string
  status: 'pending' | 'accepted' | 'rejected' | 'completed'
  introduction_message?: string
  created_at: string
  updated_at?: string
  // Joined data
  requester?: User
  recipient?: User
}

export interface Report {
  id: string
  reporter_id: string
  reported_id: string
  reason: string
  description?: string
  status: 'open' | 'investigating' | 'resolved' | 'dismissed'
  admin_notes?: string
  created_at: string
  updated_at?: string
  // Joined data
  reporter?: User
  reported?: User
}

export interface BlockedUser {
  id: string
  blocker_id: string
  blocked_id: string
  reason?: string
  created_at: string
}

export interface Chat {
  id: string
  participant_ids: string[]
  match_request_id?: string
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  chat_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
}

// Dashboard Stats
export interface DashboardStats {
  totalUsers: number
  newUsersToday: number
  verifiedUsers: number
  pendingVerifications: number
  activePremiumBasic: number
  activePremiumPremium: number
  todayMatches: number
  totalReferrals: number
  totalRevenue: number
  monthlyRevenue: number
  pendingWithdrawals: number
}

// Testimonial
export interface Testimonial {
  id: string
  author_name: string
  author_location: string
  testimonial_text: string
  rating: number
  avatar_url?: string
  is_verified: boolean
  is_featured: boolean
  is_active: boolean
  display_order: number
  created_at: string
  updated_at?: string
}

// Subscription types (synced with Mobile App)
export interface SubscriptionPackage {
  id: string
  name: string
  display_name: string
  duration_months: number
  price: number
  description?: string
  is_active: boolean
  sort_order: number
  is_popular?: boolean
  features?: string[]
  created_at: string
  updated_at: string
}

export interface SubscriptionAddon {
  id: string
  name: string
  description?: string
  price: number
  icon?: string
  features?: string[]
  is_active: boolean
  is_popular?: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface SubscriptionPurchase {
  id: string
  user_id: string
  package_id: string
  package?: SubscriptionPackage
  status: 'pending' | 'paid' | 'expired' | 'cancelled'
  start_date: string
  expires_at: string
  package_price: number
  addons_total: number
  total_amount: number
  payment_method?: string
  reference_id?: string
  ipaymu_payment_url?: string
  ipaymu_trx_id?: string
  paid_at?: string
  created_at: string
  updated_at: string
}
