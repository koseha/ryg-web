import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    // 멤버 목록 조회
    const { data: members, error: membersError } = await supabase
      .from("league_members")
      .select("id, user_id, role, joined_at")
      .eq("league_id", leagueId)
      .order("joined_at", { ascending: false });

    if (membersError) {
      console.error("Error fetching members:", membersError);
      return NextResponse.json(
        { success: false, error: "멤버 목록을 불러오는데 실패했습니다" },
        { status: 500 }
      );
    }

    // 프로필 정보 별도 조회
    const userIds = members?.map(member => member.user_id) || [];
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, nickname, avatar_url, tier, positions")
      .in("id", userIds);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      return NextResponse.json(
        { success: false, error: "프로필 정보를 불러오는데 실패했습니다" },
        { status: 500 }
      );
    }

    // 데이터 조합
    const profileMap = new Map(profiles?.map(profile => [profile.id, profile]) || []);
    const transformedMembers = members?.map(member => {
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

    return NextResponse.json({
      success: true,
      data: transformedMembers,
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
