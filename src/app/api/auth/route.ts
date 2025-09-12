import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'google-login') {
      // 구글 OAuth 로그인 URL 생성
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`
        }
      });

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          url: data.url
        }
      });
    }

    if (action === 'logout') {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Logged out successfully'
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Token validation failed' },
      { status: 500 }
    );
  }
}
