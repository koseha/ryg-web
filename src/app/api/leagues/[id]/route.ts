import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: leagueId } = await params;

    if (!leagueId) {
      return NextResponse.json(
        { success: false, error: "리그 ID가 필요합니다" },
        { status: 400 }
      );
    }

    // 리그 기본 정보와 통계 정보 조회
    const { data: league, error: leagueError } = await supabase
      .from("leagues")
      .select(`
        *,
        league_stats (
          member_count,
          match_count,
          last_matched_at
        )
      `)
      .eq("id", leagueId)
      .single();

    if (leagueError || !league) {
      return NextResponse.json(
        { success: false, error: "리그를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 리그 소유자 정보 조회
    let owner = null;
    if (league.owner_id) {
      const { data: ownerProfile } = await supabase
        .from("profiles")
        .select("id, nickname, avatar_url, tier, positions")
        .eq("id", league.owner_id)
        .single();
      owner = ownerProfile;
    }

    // 리그 멤버 정보 조회 (최근 가입한 순으로)
    const { data: members, error: membersError } = await supabase
      .from("league_members")
      .select(`
        id,
        user_id,
        role,
        joined_at
      `)
      .eq("league_id", leagueId)
      .order("joined_at", { ascending: false })
      .limit(10);

    if (membersError) {
      console.error("Error fetching members:", membersError);
    }

    // 멤버별 프로필 정보 조회
    const recentMembers = await Promise.all(
      members?.map(async (member) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, nickname, avatar_url, tier, positions")
          .eq("id", member.user_id)
          .single();

        return {
          id: member.id,
          user_id: member.user_id,
          nickname: profile?.nickname || "알 수 없음",
          tier: profile?.tier || "Unranked",
          positions: profile?.positions || [],
          role: member.role,
          joined_at: member.joined_at,
          avatar_url: profile?.avatar_url || null,
        };
      }) || []
    );

    // 현재 사용자의 가입 신청 상태 조회
    let userJoinRequest = null;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: joinRequest } = await supabase
        .from("league_join_requests")
        .select("id, status, created_at")
        .eq("league_id", leagueId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      
      userJoinRequest = joinRequest;
    }

    // 데이터 변환
    const transformedData = {
      id: league.id,
      name: league.name,
      description: league.description,
      rules: league.rules || [],
      member_count: league.league_stats?.[0]?.member_count || 1,
      match_count: league.league_stats?.[0]?.match_count || 0,
      last_matched_at: league.league_stats?.[0]?.last_matched_at || null,
      created_at: league.created_at,
      updated_at: league.updated_at,
      owner_id: league.owner_id,
      owner: owner ? {
        id: owner.id,
        nickname: owner.nickname,
        avatar_url: owner.avatar_url,
        tier: owner.tier,
        positions: owner.positions,
      } : null,
      region: league.region,
      type: league.type,
      accepting: league.accepting,
      user_join_request: userJoinRequest,
      recent_members: recentMembers,
    };

    return NextResponse.json({
      success: true,
      data: transformedData,
    });
  } catch (error) {
    console.error("Error fetching league details:", error);
    return NextResponse.json(
      { success: false, error: "리그 정보를 불러오는데 실패했습니다" },
      { status: 500 }
    );
  }
}