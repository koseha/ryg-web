import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, password, name } = body;

    if (action === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          user: data.user,
          session: data.session
        }
      });
    }

    if (action === 'register') {
      if (!email || !password || !name) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields' },
          { status: 400 }
        );
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          user: data.user,
          session: data.session
        }
      }, { status: 201 });
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
