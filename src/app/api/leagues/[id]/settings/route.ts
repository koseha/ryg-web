import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 리그 설정 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: leagueId } = await params;

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    // 사용자가 해당 리그의 멤버인지 확인
    const { data: membership } = await supabase
      .from("league_members")
      .select("role")
      .eq("league_id", leagueId)
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      return NextResponse.json(
        { success: false, error: "리그 멤버가 아닙니다" },
        { status: 403 }
      );
    }

    // 리그 정보 조회
    const { data: league, error: leagueError } = await supabase
      .from("leagues")
      .select("*")
      .eq("id", leagueId)
      .single();

    if (leagueError) {
      console.error("Error fetching league:", leagueError);
      return NextResponse.json(
        { success: false, error: "리그 정보를 불러오는데 실패했습니다" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: league.id,
        name: league.name,
        description: league.description,
        rules: league.rules || [],
        accepting: league.accepting,
        region: league.region,
        type: league.type,
        owner_id: league.owner_id,
        created_at: league.created_at,
        updated_at: league.updated_at,
        user_role: membership.role,
      },
    });
  } catch (error) {
    console.error("Error fetching league settings:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// 리그 설정 업데이트
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: leagueId } = await params;
    const body = await request.json();
    const { name, description, rules, accepting } = body;

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    // 사용자가 해당 리그의 owner인지 확인
    const { data: membership } = await supabase
      .from("league_members")
      .select("role")
      .eq("league_id", leagueId)
      .eq("user_id", user.id)
      .single();

    if (!membership || membership.role !== "owner") {
      return NextResponse.json(
        { success: false, error: "리그 책임자만 설정을 변경할 수 있습니다" },
        { status: 403 }
      );
    }

    // 리그 설정 업데이트
    const { error: updateError } = await supabase
      .from("leagues")
      .update({
        name,
        description,
        rules: rules || [],
        accepting,
        updated_at: new Date().toISOString(),
      })
      .eq("id", leagueId);

    if (updateError) {
      console.error("Error updating league settings:", updateError);
      return NextResponse.json(
        { success: false, error: "리그 설정 업데이트에 실패했습니다" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "리그 설정이 업데이트되었습니다",
    });
  } catch (error) {
    console.error("Error updating league settings:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// 리그 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: leagueId } = await params;

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    // 사용자가 해당 리그의 owner인지 확인
    const { data: membership } = await supabase
      .from("league_members")
      .select("role")
      .eq("league_id", leagueId)
      .eq("user_id", user.id)
      .single();

    if (!membership || membership.role !== "owner") {
      return NextResponse.json(
        { success: false, error: "리그 책임자만 리그를 삭제할 수 있습니다" },
        { status: 403 }
      );
    }

    // 리그 삭제 (CASCADE로 관련 데이터도 함께 삭제됨)
    const { error: deleteError } = await supabase
      .from("leagues")
      .delete()
      .eq("id", leagueId);

    if (deleteError) {
      console.error("Error deleting league:", deleteError);
      return NextResponse.json(
        { success: false, error: "리그 삭제에 실패했습니다" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "리그가 삭제되었습니다",
    });
  } catch (error) {
    console.error("Error deleting league:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
