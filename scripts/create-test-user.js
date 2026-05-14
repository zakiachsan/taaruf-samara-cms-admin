import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://okgddlgugdkiswitewdi.supabase.co'
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rZ2RkbGd1Z2RraXN3aXRld2RpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYzMjQ0NiwiZXhwIjoyMDg2MjA4NDQ2fQ.HwHxnuTOJaQypO94zqusVCRhXMXAMA0SVWD4kpo6z2A'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      apikey: supabaseServiceKey,
    },
  },
})

async function createTestUser() {
  const email = 'female.admin.test@example.com'
  const password = 'TestPassword123!'
  const fullName = 'Female Admin'

  try {
    // 1. Cek apakah user sudah ada
    const { data: existingUsers } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)

    if (existingUsers && existingUsers.length > 0) {
      console.log('⚠️ User dengan email ini sudah ada:', email)
      return
    }

    // 2. Buat user di auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    })

    if (authError) {
      console.error('❌ Gagal buat auth user:', authError.message)
      return
    }

    const userId = authData.user.id
    console.log('✅ Auth user created:', userId)

    // 3. Insert ke tabel users
    const { error: usersError } = await supabaseAdmin.from('users').insert({
      id: userId,
      email,
      full_name: fullName,
      role: 'user',
      is_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (usersError) {
      console.error('❌ Gagal insert users table:', usersError.message)
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return
    }
    console.log('✅ Inserted into users table')

    // 4. Insert ke tabel user_profiles (hanya kolom yang aman)
    const referralCode = 'FEMADMIN' + Math.random().toString(36).substring(2, 6).toUpperCase()

    const profileData = {
      user_id: userId,
      full_name: fullName,
      age: 25,
      gender: 'female',
      religion: 'Islam',
      prayer_condition: null,
      salary_range: '5 - 10 Juta',
      education: 'S1 - Sarjana',
      location: 'Jakarta Selatan',
      bio: 'Akun testing untuk pengguna perempuan dengan status langganan free. Dibuat untuk keperluan testing aplikasi.',
      photos: [],
      hobbies: ['Membaca', 'Memasak', 'Traveling'],
      interests: ['Technology', 'Education', 'Family'],
      referral_code: referralCode,
      is_verified: true,
      is_blurred: false,
      is_premium: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Data tambahan
      profession: 'Software Tester',
      profession_type: null,
      marriage_status: 'menikah',
      manhaj: 'Aswaja',
      height_cm: 160,
      weight_kg: 55,
      photo_closeup: null,
      photo_fullbody: null,
      partner_pref_ethnicity: ['Tidak masalah'],
      has_bedah_value_cert: false,
      bedah_value_cert_code: null,
      referral_balance: 0,
      bank_name: null,
      bank_account_number: null,
      bank_account_name: null,
      is_blocked: false,
      latitude: -6.2607,
      longitude: 106.7816,
      address: 'Jl. Sudirman No. 1, Jakarta Selatan',
      partner_pref_age_min: 25,
      partner_pref_age_max: 32,
      partner_pref_location: 'Jakarta,Bogor,Depok',
      whatsapp: '081234567890',
    }

    const { error: profileError } = await supabaseAdmin.from('user_profiles').insert(profileData)

    if (profileError) {
      console.error('❌ Gagal insert user_profiles:', profileError.message)
      console.error('Detail:', profileError)
      // Cleanup
      await supabaseAdmin.from('users').delete().eq('id', userId)
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return
    }
    console.log('✅ Inserted into user_profiles table')

    console.log('\n🎉 AKUN TESTING BERHASIL DIBUAT!')
    console.log('═══════════════════════════════════════')
    console.log('📧 Email    :', email)
    console.log('🔑 Password :', password)
    console.log('👤 Nama     :', fullName)
    console.log('🆔 User ID  :', userId)
    console.log('🚻 Gender   : Perempuan')
    console.log('👑 Premium  : Free (is_premium = false)')
    console.log('═══════════════════════════════════════')

  } catch (err) {
    console.error('❌ Unexpected error:', err)
  }
}

createTestUser()
