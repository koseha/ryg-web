"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          router.push('/?error=auth_failed');
          return;
        }

        if (data.session) {
          // 로그인 성공
          router.push('/');
        } else {
          // 세션이 없음
          router.push('/?error=no_session');
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        router.push('/?error=unexpected');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">로그인 처리 중...</p>
      </div>
    </div>
  );
}
