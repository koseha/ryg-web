import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 프로필 요청 처리 함수
async function handleProfileRequest(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  try {
    // 사용자 프로필 조회
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError) {
      // 프로필이 없는 경우 기본 프로필 생성
      if (profileError.code === "PGRST116") {
        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert({
            id: userId,
            nickname: "사용자",
            avatar_url: null,
            tier: "Unranked",
            role: "user",
            positions: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (createError) {
          console.error("Error creating profile:", createError);
          return {
            success: false,
            error: "프로필 생성에 실패했습니다",
          };
        }

        // 기본 프로필로 통계 조회
        const stats = await getUserStats(supabase, userId);
        return {
          success: true,
          data: {
            ...newProfile,
            ...stats,
          },
        };
      }

      console.error("Error fetching profile:", profileError);
      return {
        success: false,
        error: "프로필을 불러올 수 없습니다",
      };
    }

    // 사용자 통계 조회
    const stats = await getUserStats(supabase, userId);

    return {
      success: true,
      data: {
        ...profile,
        ...stats,
      },
    };
  } catch (error) {
    console.error("Error in handleProfileRequest:", error);
    return {
      success: false,
      error: "프로필 조회 중 오류가 발생했습니다",
    };
  }
}

// 사용자 프로필 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Authorization 헤더에서 토큰 확인
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const {
        data: { user },
      } = await supabase.auth.getUser(token);
      if (user) {
        // 토큰이 유효한 경우 해당 사용자로 처리
        const profile = await handleProfileRequest(supabase, user.id);
        return NextResponse.json(profile);
      }
    }

    // 쿠키 기반 인증 시도
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

    // 프로필 요청 처리
    const result = await handleProfileRequest(supabase, user.id);
    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { success: false, error: "프로필 조회 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// 사용자 프로필 업데이트
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Authorization 헤더에서 토큰 확인
    const authHeader = request.headers.get("authorization");
    let user = null;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const {
        data: { user: tokenUser },
      } = await supabase.auth.getUser(token);
      if (tokenUser) {
        user = tokenUser;
      }
    }

    // 쿠키 기반 인증 시도
    if (!user) {
      const {
        data: { user: cookieUser },
      } = await supabase.auth.getUser();
      user = cookieUser;
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    // Authorization 헤더에서 토큰을 가져왔다면, 해당 토큰으로 새로운 Supabase 클라이언트 생성
    let supabaseClient = supabase;
    if (authHeader && user) {
      const token = authHeader.replace("Bearer ", "");
      const { createClient } = await import("@supabase/supabase-js");
      supabaseClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        }
      );
    }

    const body = await request.json();
    const { nickname, tier, positions, avatar_url } = body;

    // 입력 검증
    if (!nickname || nickname.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "닉네임은 필수입니다" },
        { status: 400 }
      );
    }

    if (nickname.length > 20) {
      return NextResponse.json(
        { success: false, error: "닉네임은 20자 이하여야 합니다" },
        { status: 400 }
      );
    }

    if (nickname.length < 2) {
      return NextResponse.json(
        { success: false, error: "닉네임은 2자 이상이어야 합니다" },
        { status: 400 }
      );
    }

    // 닉네임 중복 확인
    const { data: existingProfile, error: checkError } = await supabase
      .from("profiles")
      .select("id")
      .eq("nickname", nickname.trim())
      .neq("id", user.id)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking nickname:", checkError);
      return NextResponse.json(
        { success: false, error: "닉네임 확인 중 오류가 발생했습니다" },
        { status: 500 }
      );
    }

    if (existingProfile) {
      return NextResponse.json(
        { success: false, error: "이미 사용 중인 닉네임입니다" },
        { status: 400 }
      );
    }

    const validTiers = [
      "Iron",
      "Bronze",
      "Silver",
      "Gold",
      "Platinum",
      "Emerald",
      "Diamond",
      "Master",
      "Grandmaster",
      "Challenger",
      "Unranked",
    ];

    if (tier && !validTiers.includes(tier)) {
      return NextResponse.json(
        { success: false, error: "유효하지 않은 티어입니다" },
        { status: 400 }
      );
    }

    const validPositions = ["Top", "Jungle", "Mid", "ADC", "Support"];
    if (positions && !Array.isArray(positions)) {
      return NextResponse.json(
        { success: false, error: "포지션은 배열이어야 합니다" },
        { status: 400 }
      );
    }

    if (
      positions &&
      positions.some((pos: string) => !validPositions.includes(pos))
    ) {
      return NextResponse.json(
        { success: false, error: "유효하지 않은 포지션이 포함되어 있습니다" },
        { status: 400 }
      );
    }

    // 프로필 업데이트
    const updateData: {
      nickname: string;
      updated_at: string;
      tier?: string;
      positions?: string[];
      avatar_url?: string | null;
    } = {
      nickname: nickname.trim(),
      updated_at: new Date().toISOString(),
    };

    if (tier) updateData.tier = tier;
    if (positions) updateData.positions = positions;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

    // 현재 세션 상태 확인
    await supabase.auth.getSession();

    const { data: updatedProfile, error: updateError } = await supabaseClient
      .from("profiles")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating profile:", updateError);
      return NextResponse.json(
        { success: false, error: "프로필 업데이트에 실패했습니다" },
        { status: 500 }
      );
    }

    // 업데이트된 통계 조회
    const stats = await getUserStats(supabaseClient, user.id);

    return NextResponse.json({
      success: true,
      data: {
        ...updatedProfile,
        ...stats,
      },
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { success: false, error: "프로필 업데이트 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}


// 사용자 통계 조회 함수
async function getUserStats(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  try {
    // 참여 중인 리그 수 조회 (league_members 테이블에는 status 컬럼이 없으므로 모든 멤버십을 카운트)
    const { count: totalLeagues, error: leaguesError } = await supabase
      .from("league_members")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (leaguesError) {
      console.error("Error fetching leagues count:", leaguesError);
    }

    // 생성한 매치 수 조회
    const { count: totalMatches, error: matchesError } = await supabase
      .from("matches")
      .select("*", { count: "exact", head: true })
      .eq("created_by", userId);

    if (matchesError) {
      console.error("Error fetching matches count:", matchesError);
    }

    // 가입일 조회 (profiles 테이블의 created_at 사용)
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("created_at")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Error fetching profile created_at:", profileError);
    }

    return {
      totalLeagues: totalLeagues || 0,
      totalMatches: totalMatches || 0,
      joinedAt: profileData?.created_at
        ? new Date(profileData.created_at).toISOString()
        : new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return {
      totalLeagues: 0,
      totalMatches: 0,
      joinedAt: new Date().toISOString(),
    };
  }
}
