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

    // 매치 목록 조회 (league_matches와 matches 조인)
    const { data: leagueMatches, error: leagueMatchesError } = await supabase
      .from("league_matches")
      .select(
        `
        id,
        title,
        description,
        created_at,
        created_by,
        matches!inner(
          id,
          status,
          riot_tournament_code,
          match_duration,
          game_version,
          winner,
          completed_at,
          created_at,
          updated_at
        )
      `
      )
      .eq("league_id", leagueId)
      .order("created_at", { ascending: false });

    if (leagueMatchesError) {
      console.error("Error fetching league matches:", leagueMatchesError);
      return NextResponse.json(
        { success: false, error: "매치 목록을 불러오는데 실패했습니다" },
        { status: 500 }
      );
    }

    // 생성자 프로필 정보 별도 조회
    const creatorIds =
      leagueMatches?.map((lm) => lm.created_by).filter(Boolean) || [];
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
    const profileMap = new Map(
      profiles?.map((profile) => [profile.id, profile]) || []
    );
    const transformedMatches =
      leagueMatches?.map((leagueMatch) => {
        const profile = profileMap.get(leagueMatch.created_by);
        const match = Array.isArray(leagueMatch.matches)
          ? leagueMatch.matches[0]
          : leagueMatch.matches;
        return {
          id: leagueMatch.id, // league_matches의 id
          match_id: match?.id, // matches의 id
          title: leagueMatch.title,
          description: leagueMatch.description,
          status: match?.status,
          code: match?.riot_tournament_code,
          match_duration: match?.match_duration,
          game_version: match?.game_version,
          winner: match?.winner,
          created_at: leagueMatch.created_at,
          completed_at: match?.completed_at,
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
    const { title, description, region } = body;

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

    // Edge Function 호출하여 매치 생성 (Riot API 연동)
    const { data, error } = await supabase.functions.invoke("create-match", {
      body: {
        leagueId,
        title,
        description: description || null,
        region: region || "NA",
        userId: user.id,
      },
    });

    if (error) {
      console.error("Edge Function Error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!data.success) {
      return NextResponse.json(
        { success: false, error: data.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.data.leagueMatchId,
        match_id: data.data.matchId,
        title,
        description: description || null,
        status: "planned",
        code: data.data.tournamentCode,
        created_at: new Date().toISOString(),
        created_by: user.id,
      },
      message: "매치가 성공적으로 생성되었습니다",
    });
  } catch (error) {
    console.error("Error creating match:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
