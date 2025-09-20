import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get("leagueId");
    const status = searchParams.get("status");

    let query = supabase.from("matches").select("*").is("deleted_at", null);

    // Filter by league ID
    if (leagueId) {
      query = query.eq("league_id", leagueId);
    }

    // Filter by status
    if (status) {
      query = query.eq("status", status);
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
      total: data?.length || 0,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch matches" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Validate required fields
    if (!body.leagueId || !body.title || !body.description) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Generate match code
    const timestamp = new Date().getTime().toString().slice(-6);
    const matchCode = `MATCH${timestamp}`;

    // Create new match
    const { data, error } = await supabase
      .from("matches")
      .insert({
        league_id: body.leagueId,
        title: body.title,
        description: body.description,
        riot_tournament_code: matchCode,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to create match" },
      { status: 500 }
    );
  }
}
