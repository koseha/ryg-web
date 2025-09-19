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
      .is("deleted_at", null) // 삭제되지 않은 리그만 조회
      .single();

    if (leagueError || !league) {
      return NextResponse.json(
        { success: false, error: "리그를 찾을 수 없습니다" },
        { status: 404 }
      );
    }


    // 리그 운영진 정보 조회 (owner, admin만)
    const { data: admins, error: adminsError } = await supabase
      .from("league_members")
      .select(`
        id,
        user_id,
        role,
        joined_at
      `)
      .eq("league_id", leagueId)
      .in("role", ["owner", "admin"])
      .order("role", { ascending: false }); // owner가 먼저, admin이 나중에

    if (adminsError) {
      console.error("Error fetching admins:", adminsError);
    }

    // 운영진별 프로필 정보 조회
    const adminMembers = await Promise.all(
      admins?.map(async (member) => {
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

    // 현재 사용자의 가입 상태 및 신청 상태 조회
    let userJoinRequest = null;
    let userMembership = null;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // 1. 사용자가 이미 리그 멤버인지 확인
      const { data: membership } = await supabase
        .from("league_members")
        .select("id, role, joined_at")
        .eq("league_id", leagueId)
        .eq("user_id", user.id)
        .single();
      
      userMembership = membership;

      // 2. 가입 신청 상태 조회 (멤버가 아닌 경우에만)
      if (!membership) {
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
    }

    // owner 정보를 adminMembers에서 찾기
    const ownerMember = adminMembers.find(member => member.role === 'owner');

    // league_stats가 배열인지 객체인지 확인
    const stats = Array.isArray(league.league_stats) 
      ? league.league_stats[0] 
      : league.league_stats;

    // 데이터 변환
    const transformedData = {
      id: league.id,
      name: league.name,
      description: league.description,
      rules: league.rules || [],
      member_count: stats?.member_count || 1,
      match_count: stats?.match_count || 0,
      last_matched_at: stats?.last_matched_at || null,
      created_at: league.created_at,
      updated_at: league.updated_at,
      owner_id: league.owner_id,
      owner: ownerMember ? {
        id: ownerMember.user_id,
        nickname: ownerMember.nickname,
        avatar_url: ownerMember.avatar_url,
        tier: ownerMember.tier,
        positions: ownerMember.positions,
      } : null,
      region: league.region,
      type: league.type,
      accepting: league.accepting,
      user_join_request: userJoinRequest,
      user_membership: userMembership,
      admin_members: adminMembers,
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