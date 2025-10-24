// test-supabase.ts

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('Testing Supabase connection...')
  
  // Test 1: Check connection
  const { data, error } = await supabase.from('profiles').select('count')
  
  if (error) {
    console.error(' Connection failed:', error)
  } else {
    console.log(' Supabase connected successfully!')
    console.log('Tables are ready to use')
  }
}

testConnection()