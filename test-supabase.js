// Test file to check Supabase connection
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

console.log('Environment variables:');
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('ANON KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set (length: ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length + ')' : 'Not set');
console.log('SERVICE KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set (length: ' + process.env.SUPABASE_SERVICE_ROLE_KEY.length + ')' : 'Not set');

// Try with anon key
try {
  console.log('\nTrying with ANON key...');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  supabase.from('products').select('count').then(res => {
    console.log('Response with ANON key:', res);
  }).catch(err => {
    console.error('Error with ANON key:', err.message);
  });
} catch (err) {
  console.error('Exception with ANON key:', err.message);
}

// Try with service role key
try {
  console.log('\nTrying with SERVICE ROLE key...');
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
  
  supabaseAdmin.from('products').select('count').then(res => {
    console.log('Response with SERVICE key:', res);
  }).catch(err => {
    console.error('Error with SERVICE key:', err.message);
  });
} catch (err) {
  console.error('Exception with SERVICE key:', err.message);
}

// Add a delay to ensure promises complete before script exits
setTimeout(() => {
  console.log('\nTest completed.');
}, 5000);