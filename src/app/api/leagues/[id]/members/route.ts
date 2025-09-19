import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 헬퍼 함수: 리그 멤버들의 user_id 목록 조회
async function getLeagueMemberUserIds(leagueId: string, supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: members } = await supabase
    .from("league_members")
    .select("user_id")
    .eq("league_id", leagueId);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return members?.map((member: any) => member.user_id) || [];
}

// 멤버 목록 조회
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

    // 페이지네이션 및 필터 파라미터
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    
    // 필터 파라미터
    const roleFilter = searchParams.get('role');
    const tierFilter = searchParams.get('tier');
    const positionFilter = searchParams.get('position');

    // tier나 position 필터가 있는 경우 다른 방식으로 처리
    if (tierFilter || positionFilter) {
      // 1. 먼저 profiles에서 필터링된 user_id들을 가져옴
      let profilesQuery = supabase
        .from("profiles")
        .select("id")
        .in("id", await getLeagueMemberUserIds(leagueId, supabase));

      if (tierFilter) {
        profilesQuery = profilesQuery.eq("tier", tierFilter);
      }

      const { data: filteredProfiles, error: profilesError } = await profilesQuery;
      
      if (profilesError) {
        console.error("Error fetching filtered profiles:", profilesError);
        return NextResponse.json(
          { success: false, error: "프로필 필터링에 실패했습니다" },
          { status: 500 }
        );
      }

      const filteredUserIds = filteredProfiles?.map(p => p.id) || [];

      // 2. 필터링된 user_id들로 league_members 조회
      let membersQuery = supabase
        .from("league_members")
        .select("id, user_id, role, joined_at")
        .eq("league_id", leagueId)
        .in("user_id", filteredUserIds);

      if (roleFilter) {
        membersQuery = membersQuery.eq("role", roleFilter);
      }

      const { data: members, error: membersError } = await membersQuery
        .order("joined_at", { ascending: true })
        .range(offset, offset + limit - 1);

      // 3. 전체 카운트 조회
      let countQuery = supabase
        .from("league_members")
        .select("*", { count: "exact", head: true })
        .eq("league_id", leagueId)
        .in("user_id", filteredUserIds);

      if (roleFilter) {
        countQuery = countQuery.eq("role", roleFilter);
      }

      const { count: totalCount, error: countError } = await countQuery;

      if (countError) {
        console.error("Error fetching member count:", countError);
        return NextResponse.json(
          { success: false, error: "멤버 수를 불러오는데 실패했습니다" },
          { status: 500 }
        );
      }

      if (membersError) {
        console.error("Error fetching members:", membersError);
        return NextResponse.json(
          { success: false, error: "멤버 목록을 불러오는데 실패했습니다" },
          { status: 500 }
        );
      }

      // 4. 프로필 정보 조회
      const userIds = members?.map(member => member.user_id) || [];
      const { data: profiles, error: profilesError2 } = await supabase
        .from("profiles")
        .select("id, nickname, avatar_url, tier, positions")
        .in("id", userIds);

      if (profilesError2) {
        console.error("Error fetching profiles:", profilesError2);
        return NextResponse.json(
          { success: false, error: "프로필 정보를 불러오는데 실패했습니다" },
          { status: 500 }
        );
      }

      // 5. 데이터 조합 및 position 필터링
      const profileMap = new Map(profiles?.map(profile => [profile.id, profile]) || []);
      let transformedMembers = members?.map(member => {
        const profile = profileMap.get(member.user_id);
        return {
          id: member.id,
          user_id: member.user_id,
          nickname: profile?.nickname || "알 수 없음",
          avatar_url: profile?.avatar_url || null,
          tier: profile?.tier || "Unranked",
          positions: profile?.positions || [],
          role: member.role,
          joined_at: member.joined_at,
        };
      }) || [];

      // position 필터 적용
      if (positionFilter) {
        transformedMembers = transformedMembers.filter(member => 
          member.positions.includes(positionFilter)
        );
      }

      // 멤버 현황 정보 조회 (필터링 없이)
      const { data: allMembers, error: allMembersError } = await supabase
        .from("league_members")
        .select("role")
        .eq("league_id", leagueId);

      if (allMembersError) {
        console.error("Error fetching all members:", allMembersError);
      }

      // 현황 계산
      const totalMembers = allMembers?.length || 0;
      const adminCount = allMembers?.filter(member => ["owner", "admin"].includes(member.role)).length || 0;

      // 페이지네이션 정보 계산
      const totalPages = Math.ceil((totalCount || 0) / limit);
      const hasMore = page < totalPages;

      return NextResponse.json({
        success: true,
        data: {
          members: transformedMembers,
          pagination: {
            page,
            limit,
            total: totalCount || 0,
            totalPages,
            hasMore
          },
          stats: {
            totalMembers,
            adminCount
          }
        }
      });
    }

    // tier나 position 필터가 없는 경우 기존 로직 사용
    let membersQuery = supabase
      .from("league_members")
      .select("id, user_id, role, joined_at")
      .eq("league_id", leagueId);

    // role 필터 적용
    if (roleFilter) {
      membersQuery = membersQuery.eq("role", roleFilter);
    }

    const { data: members, error: membersError } = await membersQuery
      .order("joined_at", { ascending: true }) // 가입일 순
      .range(offset, offset + limit - 1);

    // 필터링된 전체 멤버 수 조회
    let countQuery = supabase
      .from("league_members")
      .select("*", { count: "exact", head: true })
      .eq("league_id", leagueId);

    if (roleFilter) {
      countQuery = countQuery.eq("role", roleFilter);
    }

    const { count: totalCount, error: countError } = await countQuery;

    if (countError) {
      console.error("Error fetching member count:", countError);
      return NextResponse.json(
        { success: false, error: "멤버 수를 불러오는데 실패했습니다" },
        { status: 500 }
      );
    }

    if (membersError) {
      console.error("Error fetching members:", membersError);
      return NextResponse.json(
        { success: false, error: "멤버 목록을 불러오는데 실패했습니다" },
        { status: 500 }
      );
    }

    // 프로필 정보 별도 조회 (tier, position 필터링 포함)
    const userIds = members?.map(member => member.user_id) || [];
    let profilesQuery = supabase
      .from("profiles")
      .select("id, nickname, avatar_url, tier, positions")
      .in("id", userIds);

    // tier 필터 적용
    if (tierFilter) {
      profilesQuery = profilesQuery.eq("tier", tierFilter);
    }

    const { data: profiles, error: profilesError } = await profilesQuery;

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      return NextResponse.json(
        { success: false, error: "프로필 정보를 불러오는데 실패했습니다" },
        { status: 500 }
      );
    }

    // 데이터 조합 및 position 필터링
    const profileMap = new Map(profiles?.map(profile => [profile.id, profile]) || []);
    let transformedMembers = members?.map(member => {
      const profile = profileMap.get(member.user_id);
      return {
        id: member.id,
        user_id: member.user_id,
        nickname: profile?.nickname || "알 수 없음",
        avatar_url: profile?.avatar_url || null,
        tier: profile?.tier || "Unranked",
        positions: profile?.positions || [],
        role: member.role,
        joined_at: member.joined_at,
      };
    }) || [];

    // position 필터 적용 (클라이언트 사이드에서)
    if (positionFilter) {
      transformedMembers = transformedMembers.filter(member => 
        member.positions.includes(positionFilter)
      );
    }

    // 멤버 현황 정보 조회 (필터링 없이)
    const { data: allMembers, error: allMembersError } = await supabase
      .from("league_members")
      .select("role")
      .eq("league_id", leagueId);

    if (allMembersError) {
      console.error("Error fetching all members:", allMembersError);
    }

    // 현황 계산
    const totalMembers = allMembers?.length || 0;
    const adminCount = allMembers?.filter(member => ["owner", "admin"].includes(member.role)).length || 0;

    // 페이지네이션 정보 계산
    const totalPages = Math.ceil((totalCount || 0) / limit);
    const hasMore = page < totalPages;

    return NextResponse.json({
      success: true,
      data: {
        members: transformedMembers,
        pagination: {
          page,
          limit,
          total: totalCount || 0,
          totalPages,
          hasMore
        },
        stats: {
          totalMembers,
          adminCount
        }
      }
    });
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// 멤버 역할 변경
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: leagueId } = await params;
    const body = await request.json();
    const { memberId, newRole } = body;

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
        { success: false, error: "리그 책임자만 멤버 역할을 변경할 수 있습니다" },
        { status: 403 }
      );
    }

    // 멤버 역할 변경
    const { error: updateError } = await supabase
      .from("league_members")
      .update({ role: newRole })
      .eq("id", memberId)
      .eq("league_id", leagueId);

    if (updateError) {
      console.error("Error updating member role:", updateError);
      return NextResponse.json(
        { success: false, error: "멤버 역할 변경에 실패했습니다" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "멤버 역할이 변경되었습니다",
    });
  } catch (error) {
    console.error("Error updating member role:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// 멤버 제거
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: leagueId } = await params;
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("memberId");

    if (!memberId) {
      return NextResponse.json(
        { success: false, error: "멤버 ID가 필요합니다" },
        { status: 400 }
      );
    }

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    // 사용자가 해당 리그의 owner 또는 admin인지 확인
    const { data: membership } = await supabase
      .from("league_members")
      .select("role")
      .eq("league_id", leagueId)
      .eq("user_id", user.id)
      .single();

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      return NextResponse.json(
        { success: false, error: "리그 책임자 또는 운영진만 멤버를 제거할 수 있습니다" },
        { status: 403 }
      );
    }

    // 제거할 멤버가 owner인지 확인
    const { data: targetMember } = await supabase
      .from("league_members")
      .select("role")
      .eq("id", memberId)
      .single();

    if (targetMember?.role === "owner") {
      return NextResponse.json(
        { success: false, error: "리그 책임자는 제거할 수 없습니다" },
        { status: 400 }
      );
    }

    // 멤버 제거
    const { error: deleteError } = await supabase
      .from("league_members")
      .delete()
      .eq("id", memberId)
      .eq("league_id", leagueId);

    if (deleteError) {
      console.error("Error removing member:", deleteError);
      return NextResponse.json(
        { success: false, error: "멤버 제거에 실패했습니다" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "멤버가 제거되었습니다",
    });
  } catch (error) {
    console.error("Error removing member:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
