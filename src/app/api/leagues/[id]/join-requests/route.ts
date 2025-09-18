import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 가입 신청 목록 조회
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

    // 가입 신청 목록 조회
    const { data: requests, error: requestsError } = await supabase
      .from("league_join_requests")
      .select("id, user_id, message, status, created_at")
      .eq("league_id", leagueId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (requestsError) {
      console.error("Error fetching join requests:", requestsError);
      return NextResponse.json(
        { success: false, error: "가입 신청 목록을 불러오는데 실패했습니다" },
        { status: 500 }
      );
    }

    // 프로필 정보 별도 조회
    const userIds = requests?.map(request => request.user_id) || [];
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
    const transformedRequests = requests?.map(request => {
      const profile = profileMap.get(request.user_id);
      return {
        id: request.id,
        user_id: request.user_id,
        nickname: profile?.nickname || "알 수 없음",
        avatar_url: profile?.avatar_url || null,
        tier: profile?.tier || "Unranked",
        positions: profile?.positions || [],
        message: request.message,
        status: request.status,
        applied_at: request.created_at,
      };
    }) || [];

    return NextResponse.json({
      success: true,
      data: transformedRequests,
    });
  } catch (error) {
    console.error("Error fetching join requests:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// 가입 신청 승인/거부
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: leagueId } = await params;
    const body = await request.json();
    const { requestId, action } = body; // action: "approve" or "reject"

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
        { success: false, error: "리그 책임자 또는 운영진만 가입 신청을 처리할 수 있습니다" },
        { status: 403 }
      );
    }

    // 가입 신청 조회
    const { data: joinRequest, error: fetchError } = await supabase
      .from("league_join_requests")
      .select("*")
      .eq("id", requestId)
      .eq("league_id", leagueId)
      .eq("status", "pending")
      .single();

    if (fetchError || !joinRequest) {
      return NextResponse.json(
        { success: false, error: "처리할 수 있는 가입 신청이 없습니다" },
        { status: 404 }
      );
    }

    if (action === "approve") {
      // 가입 신청 승인
      const { error: updateError } = await supabase
        .from("league_join_requests")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
        })
        .eq("id", requestId);

      if (updateError) {
        console.error("Error approving join request:", updateError);
        return NextResponse.json(
          { success: false, error: "가입 신청 승인에 실패했습니다" },
          { status: 500 }
        );
      }

      // 리그 멤버로 추가
      const { error: insertError } = await supabase
        .from("league_members")
        .insert({
          league_id: leagueId,
          user_id: joinRequest.user_id,
          role: "member",
        });

      if (insertError) {
        console.error("Error adding member:", insertError);
        return NextResponse.json(
          { success: false, error: "멤버 추가에 실패했습니다" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "가입 신청이 승인되었습니다",
      });
    } else if (action === "reject") {
      // 가입 신청 거부
      const { error: updateError } = await supabase
        .from("league_join_requests")
        .update({
          status: "rejected",
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
        })
        .eq("id", requestId);

      if (updateError) {
        console.error("Error rejecting join request:", updateError);
        return NextResponse.json(
          { success: false, error: "가입 신청 거부에 실패했습니다" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "가입 신청이 거부되었습니다",
      });
    } else {
      return NextResponse.json(
        { success: false, error: "잘못된 액션입니다" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error processing join request:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
