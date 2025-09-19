'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function SupabaseTestPage() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [connectionInfo, setConnectionInfo] = useState<any>(null);

  async function testConnection() {
    setStatus('loading');
    setErrorMessage(null);
    
    try {
      const supabase = createClient();
      
      if (!supabase) {
        throw new Error('সুপাবেস ক্লায়েন্ট তৈরি করা যায়নি। আপনার .env.local ফাইল চেক করুন।');
      }
      
      // Simple query to test connection
      const { data, error } = await supabase.from('products').select('count').limit(1);
      
      if (error) throw error;
      
      // Get Supabase project info
      const { data: configData } = await supabase.auth.getSession();
      
      setConnectionInfo({
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        connected: true,
        session: configData?.session ? 'আছে' : 'নেই',
      });
      
      setStatus('connected');
    } catch (error: any) {
      console.error('Supabase connection error:', error);
      setStatus('error');
      setErrorMessage(error.message || 'অজানা ত্রুটি');
    }
  }

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>সুপাবেস কানেকশন টেস্ট</CardTitle>
          <CardDescription>
            আপনার সুপাবেস কানেকশন স্ট্যাটাস দেখুন
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'loading' && (
            <div className="flex items-center justify-center p-6">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          )}
          
          {status === 'connected' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <p className="text-green-600 font-medium">সুপাবেস সাথে সংযোগ সফল হয়েছে!</p>
              </div>
              
              {connectionInfo && (
                <div className="bg-muted p-3 rounded-md text-sm">
                  <p><strong>URL:</strong> {connectionInfo.url}</p>
                  <p><strong>সেশন:</strong> {connectionInfo.session}</p>
                </div>
              )}
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <p className="text-red-600 font-medium">সংযোগ ব্যর্থ হয়েছে</p>
              </div>
              
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-md text-sm text-red-800">
                  {errorMessage}
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={testConnection} 
            disabled={status === 'loading'}
            className="w-full"
          >
            কানেকশন পুনরায় চেক করুন
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}