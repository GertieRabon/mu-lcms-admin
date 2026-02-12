import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // 1. Handle CORS for the browser
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { email, first_name, last_name, role } = body
    
    console.log('Edge Function received:', { email, first_name, last_name, role })

    // Validate required fields
    if (!email || !role) {
      throw new Error(`Missing required fields: email=${email}, role=${role}`)
    }

    // 2. Initialize Admin Client with the Service Role Key (Server-side only!)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    console.log('Environment check - URL exists:', !!supabaseUrl, 'Key exists:', !!serviceRoleKey)
    
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    // 3. Check if user already exists in the users table
    console.log('Checking if user already exists:', email)
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (existingUser) {
      console.error('User already exists:', email)
      const error = new Error(`Duplicated user data: This email address is already registered. Please use a different email or delete the existing account first.`)
      error.code = 'email_exists'
      throw error
    }

    // 4. Invite the user via official email
    const redirectUrl = `${Deno.env.get('REDIRECT_URL') || 'http://localhost:5173'}/change-password`
    console.log('Redirect URL for invite:', redirectUrl)
    
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { first_name, last_name, role },
      redirectTo: redirectUrl
    })

    if (error) {
      console.error('Auth invitation error:', error);
      throw error;
    }

    // 5. Get the invited user's ID
    const userId = data?.user?.id
    console.log('Invited user ID:', userId);
    if (!userId) throw new Error('Failed to get user ID from invitation')

    // 6. Insert user profile into users table
    const { error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        user_id: userId,
        email: email,
        first_name: first_name,
        last_name: last_name,
        role: role,
        created_at: new Date().toISOString(),
        last_login: null,
        must_change_password: true
      })

    if (insertError) {
      console.error('Insert error:', insertError)
      throw insertError
    }

    console.log('User successfully invited and profile created')
    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Function error:', error)
    
    // Check if it's a duplicate user error
    const errorMessage = error?.message || error?.toString() || ''
    const isDuplicateError = errorMessage.includes('Duplicated user data') || errorMessage.includes('user already exists')
    
    return new Response(JSON.stringify({ 
      error: error.message || error.toString(),
      code: isDuplicateError ? 'email_exists' : 'unknown_error',
      details: error.toString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: isDuplicateError ? 400 : 400,
    })
  }
})