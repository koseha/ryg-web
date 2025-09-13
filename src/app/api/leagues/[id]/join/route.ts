import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leagueId } = await params;
    const body = await request.json();

    // Validate required fields
    if (!body.tier || !body.positions || body.positions.length === 0) {
      return NextResponse.json(
        { success: false, error: "티어와 포지션은 필수입니다" },
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
        { success: false, error: "로그인이 필요합니다" },
        { status: 401 }
      );
    }

    // Check if user is already a member
    const { data: existingMember, error: memberCheckError } = await supabase
      .from("league_members")
      .select("id")
      .eq("league_id", leagueId)
      .eq("user_id", user.id)
      .single();

    if (memberCheckError && memberCheckError.code !== "PGRST116") {
      return NextResponse.json(
        { success: false, error: "멤버 확인 중 오류가 발생했습니다" },
        { status: 500 }
      );
    }

    if (existingMember) {
      return NextResponse.json(
        { success: false, error: "이미 가입된 리그입니다" },
        { status: 400 }
      );
    }

    // Check if there's already a pending application
    const { data: existingApplication, error: applicationCheckError } =
      await supabase
        .from("league_join_requests")
        .select("id")
        .eq("league_id", leagueId)
        .eq("user_id", user.id)
        .eq("status", "pending")
        .single();

    if (applicationCheckError && applicationCheckError.code !== "PGRST116") {
      return NextResponse.json(
        { success: false, error: "신청 확인 중 오류가 발생했습니다" },
        { status: 500 }
      );
    }

    if (existingApplication) {
      return NextResponse.json(
        { success: false, error: "이미 가입 신청이 진행 중입니다" },
        { status: 400 }
      );
    }

    // Create join application
    const { data, error } = await supabase
      .from("league_join_requests")
      .insert({
        league_id: leagueId,
        user_id: user.id,
        tier: body.tier,
        positions: body.positions,
        message: body.message || null,
        status: "pending",
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
        message: "가입 신청이 완료되었습니다",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating join application:", error);
    return NextResponse.json(
      { success: false, error: "가입 신청 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
