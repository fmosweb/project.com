import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { success: false, error: 'Missing Supabase environment variables' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          Authorization: `Bearer ${supabaseAnonKey}`
        }
      }
    });
    
    // Test connection by making a simple query
    const { data, error } = await supabase.from('products').select('count').limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    // Also try to get project info
    const { data: authData } = await supabase.auth.getSession();
    
    return NextResponse.json({
      success: true,
      result: {
        data,
        projectInfo: {
          url: supabaseUrl,
          hasSession: !!authData?.session,
        }
      }
    });
  } catch (error: any) {
    console.error('Error testing Supabase connection:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}