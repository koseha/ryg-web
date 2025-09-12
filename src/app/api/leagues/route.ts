import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'newest';

    let query = supabase
      .from('leagues')
      .select('*');

    // Filter by search term
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Sort leagues
    if (sortBy === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else if (sortBy === 'members') {
      query = query.order('member_count', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      total: data?.length || 0
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leagues' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.description || !body.region || !body.type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Create new league
    const { data, error } = await supabase
      .from('leagues')
      .insert({
        name: body.name,
        description: body.description,
        region: body.region,
        type: body.type,
        owner_id: user.id,
        rules: body.rules || []
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data
    }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to create league' },
      { status: 500 }
    );
  }
}
