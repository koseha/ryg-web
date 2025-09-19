import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
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

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    // 사용자가 해당 리그의 멤버인지 확인
    const { data: membership, error: membershipError } = await supabase
      .from("league_members")
      .select("id, role")
      .eq("league_id", leagueId)
      .eq("user_id", user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json(
        { success: false, error: "리그 멤버가 아닙니다" },
        { status: 403 }
      );
    }

    // Owner는 탈퇴할 수 없음 (위임 후 탈퇴해야 함)
    if (membership.role === "owner") {
      return NextResponse.json(
        { success: false, error: "책임자는 먼저 책임자를 다른 운영진에게 위임한 후 탈퇴할 수 있습니다" },
        { status: 400 }
      );
    }

    // 리그에서 멤버 제거
    const { error: deleteError } = await supabase
      .from("league_members")
      .delete()
      .eq("id", membership.id);

    if (deleteError) {
      console.error("Error removing member from league:", deleteError);
      return NextResponse.json(
        { success: false, error: "리그 탈퇴에 실패했습니다" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "리그에서 성공적으로 탈퇴했습니다",
    });
  } catch (error) {
    console.error("Error leaving league:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
