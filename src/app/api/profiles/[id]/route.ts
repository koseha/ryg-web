import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 다른 사용자의 프로필 조회 (제한된 정보만)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: userId } = await params;

    // 인증 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    // 프로필 정보 조회 (제한된 정보만)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(
        `
        id,
        nickname,
        avatar_url,
        tier,
        positions,
        created_at
      `
      )
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: "프로필을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 사용자 통계 정보 조회
    const [leaguesResult, matchesResult] = await Promise.all([
      // 참여 중인 리그 수
      supabase
        .from("league_members")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),

      // 생성한 매치 수
      supabase
        .from("matches")
        .select("*", { count: "exact", head: true })
        .eq("created_by", userId)
        .is("deleted_at", null),
    ]);

    const totalLeagues = leaguesResult.count || 0;
    const totalMatches = matchesResult.count || 0;

    return NextResponse.json({
      success: true,
      data: {
        id: profile.id,
        nickname: profile.nickname,
        avatar_url: profile.avatar_url,
        tier: profile.tier,
        positions: profile.positions,
        joined_at: profile.created_at,
        // 통계 정보
        total_leagues: totalLeagues,
        total_matches: totalMatches,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { success: false, error: "프로필 조회 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
