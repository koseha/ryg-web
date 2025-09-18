import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 매치 목록 조회
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

    // 매치 목록 조회
    const { data: matches, error: matchesError } = await supabase
      .from("matches")
      .select("id, title, description, status, riot_tournament_code, created_at, completed_at, created_by")
      .eq("league_id", leagueId)
      .order("created_at", { ascending: false });

    if (matchesError) {
      console.error("Error fetching matches:", matchesError);
      return NextResponse.json(
        { success: false, error: "매치 목록을 불러오는데 실패했습니다" },
        { status: 500 }
      );
    }

    // 생성자 프로필 정보 별도 조회
    const creatorIds = matches?.map(match => match.created_by).filter(Boolean) || [];
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, nickname")
      .in("id", creatorIds);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      return NextResponse.json(
        { success: false, error: "프로필 정보를 불러오는데 실패했습니다" },
        { status: 500 }
      );
    }

    // 데이터 조합
    const profileMap = new Map(profiles?.map(profile => [profile.id, profile]) || []);
    const transformedMatches = matches?.map(match => {
      const profile = profileMap.get(match.created_by);
      return {
        id: match.id,
        title: match.title,
        description: match.description,
        status: match.status,
        code: match.riot_tournament_code,
        created_at: match.created_at,
        completed_at: match.completed_at,
        created_by: profile?.nickname || "알 수 없음",
      };
    }) || [];

    return NextResponse.json({
      success: true,
      data: transformedMatches,
    });
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// 새 매치 생성
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: leagueId } = await params;
    const body = await request.json();
    const { title, description, riot_tournament_code } = body;

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

    // 매치 생성
    const { data: newMatch, error: insertError } = await supabase
      .from("matches")
      .insert({
        league_id: leagueId,
        title,
        description,
        riot_tournament_code,
        created_by: user.id,
        status: "active",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating match:", insertError);
      return NextResponse.json(
        { success: false, error: "매치 생성에 실패했습니다" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: newMatch,
      message: "매치가 생성되었습니다",
    });
  } catch (error) {
    console.error("Error creating match:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
