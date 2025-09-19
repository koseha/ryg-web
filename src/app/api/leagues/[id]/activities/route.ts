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

    // 현재 사용자 인증 확인
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
      .select("id")
      .eq("league_id", leagueId)
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      return NextResponse.json(
        { success: false, error: "리그 멤버만 활동을 조회할 수 있습니다" },
        { status: 403 }
      );
    }

    // 리그 활동 조회 (최근 10개)
    const { data: activities, error: activitiesError } = await supabase
      .from("league_activities")
      .select(`
        id,
        activity_type,
        title,
        description,
        target_id,
        target_type,
        metadata,
        is_visible,
        created_at
      `)
      .eq("league_id", leagueId)
      .eq("is_visible", true)
      .order("created_at", { ascending: false })
      .limit(10);

    if (activitiesError) {
      console.error("Error fetching activities:", activitiesError);
      return NextResponse.json(
        { success: false, error: "활동 데이터를 불러올 수 없습니다" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: activities || [],
    });
  } catch (error) {
    console.error("Error fetching league activities:", error);
    return NextResponse.json(
      { success: false, error: "활동 데이터를 불러오는데 실패했습니다" },
      { status: 500 }
    );
  }
}
