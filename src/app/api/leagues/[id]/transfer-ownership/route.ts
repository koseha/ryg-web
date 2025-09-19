import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 책임자 위임
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: leagueId } = await params;
    const { newOwnerId } = await request.json();

    if (!newOwnerId) {
      return NextResponse.json(
        { success: false, error: "새 책임자 ID가 필요합니다" },
        { status: 400 }
      );
    }

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

    // 사용자가 해당 리그의 owner인지 확인
    const { data: membership } = await supabase
      .from("league_members")
      .select("role")
      .eq("league_id", leagueId)
      .eq("user_id", user.id)
      .single();

    if (!membership || membership.role !== "owner") {
      return NextResponse.json(
        { success: false, error: "리그 책임자만 위임할 수 있습니다" },
        { status: 403 }
      );
    }

    // 새 책임자가 admin인지 확인
    const { data: newOwnerMembership } = await supabase
      .from("league_members")
      .select("role")
      .eq("league_id", leagueId)
      .eq("user_id", newOwnerId)
      .single();

    if (!newOwnerMembership || newOwnerMembership.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "새 책임자는 리그 운영진이어야 합니다" },
        { status: 400 }
      );
    }

    // 책임자 위임 함수 호출
    const { error } = await supabase.rpc("transfer_league_ownership", {
      p_league_id: leagueId,
      p_current_owner_id: user.id,
      p_new_owner_id: newOwnerId,
    });

    if (error) {
      console.error("Error transferring ownership:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "책임자 위임이 완료되었습니다",
    });
  } catch (error) {
    console.error("Error in transfer ownership:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
