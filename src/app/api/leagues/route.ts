import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope") || "all"; // all 또는 my
    
    // 내가 가입한 리그 조회
    if (scope === "my") {
      return await getMyLeagues(request, supabase);
    }
    
    // 모든 리그 조회 (기존 로직)
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "newest";
    const region = searchParams.get("region");
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const offset = (page - 1) * limit;

    // Build query with filters - league_stats와 LEFT JOIN
    let query = supabase
      .from("leagues")
      .select(`
        *,
        league_stats (
          member_count,
          match_count,
          last_matched_at
        )
      `, { count: "exact" })
      .is("deleted_at", null); // 삭제되지 않은 리그만 조회

    // Filter by search term - SQL 인젝션 방지
    if (search) {
      // 특수 문자 이스케이프 처리
      const sanitizedSearch = search.replace(/[%_\\]/g, '\\$&');
      query = query.or(`name.ilike.%${sanitizedSearch}%,description.ilike.%${sanitizedSearch}%`);
    }

    // Filter by region
    if (region) {
      query = query.eq("region", region);
    }

    // Filter by type
    if (type) {
      query = query.eq("type", type);
    }

    // Sort leagues
    if (sortBy === "newest") {
      query = query.order("created_at", { ascending: false });
    } else if (sortBy === "members") {
      // member_count로 정렬할 때는 league_stats 테이블의 데이터 사용
      query = query.order("league_stats(member_count)", { ascending: false });
    } else if (sortBy === "name") {
      query = query.order("name", { ascending: true });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Query error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // 데이터 변환 - league_stats 정보를 평면화하고 owner 닉네임 조회
    const transformedData = await Promise.all(
      data?.map(async (league) => {
        // 리그 소유자 정보 조회
        let owner = null;
        if (league.owner_id) {
          const { data: ownerProfile } = await supabase
            .from("profiles")
            .select("id, nickname, avatar_url")
            .eq("id", league.owner_id)
            .single();
          owner = ownerProfile;
        }

        // league_stats가 배열인지 객체인지 확인
        const stats = Array.isArray(league.league_stats) 
          ? league.league_stats[0] 
          : league.league_stats;

        return {
          ...league,
          member_count: stats?.member_count || 1,
          match_count: stats?.match_count || 0,
          last_matched_at: stats?.last_matched_at || null,
          owner: owner ? {
            id: owner.id,
            nickname: owner.nickname,
            avatar_url: owner.avatar_url
          } : null,
          league_stats: undefined // 원본 데이터에서 제거
        };
      }) || []
    );

    const total = count || 0;
    const hasMore = offset + limit < total;

    return NextResponse.json({
      success: true,
      data: transformedData,
      pagination: {
        page,
        limit,
        total,
        hasMore,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching leagues:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leagues" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.description || !body.region || !body.type) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Create new league
    const { data, error } = await supabase
      .from("leagues")
      .insert({
        name: body.name,
        description: body.description,
        region: body.region,
        type: body.type || 'Basic',
        owner_id: user.id,
        rules: body.rules || [],
      })
      .select()
      .single();

      console.log(error);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to create league" },
      { status: 500 }
    );
  }
}

// 내가 가입한 리그 조회 함수
async function getMyLeagues(request: NextRequest, supabase: Awaited<ReturnType<typeof createClient>>) {
  try {
    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // 1. 내가 가입한 리그 조회
    const { data: joinedData, error: joinedError } = await supabase
      .from("league_members")
      .select(`
        *,
        leagues!inner (
          *,
          league_stats (
            member_count,
            match_count,
            last_matched_at
          )
        )
      `)
      .eq("user_id", user.id)
      .is("leagues.deleted_at", null); // 삭제되지 않은 리그만 조회

    if (joinedError) {
      console.error("Error fetching joined leagues:", joinedError);
    }

    // 2. 내가 신청한 대기 중인 리그 조회
    const { data: pendingData, error: pendingError } = await supabase
      .from("league_join_requests")
      .select(`
        *,
        leagues!inner (
          *,
          league_stats (
            member_count,
            match_count,
            last_matched_at
          )
        )
      `)
      .eq("user_id", user.id)
      .eq("status", "pending")
      .is("leagues.deleted_at", null); // 삭제되지 않은 리그만 조회

    if (pendingError) {
      console.error("Error fetching pending requests:", pendingError);
    }

    // 가입한 리그 데이터 변환
    const joinedLeagues = await Promise.all(
      joinedData?.map(async (member) => {
        // 리그 소유자 정보 별도 조회
        let owner = null;
        if (member.leagues?.owner_id) {
          const { data: ownerProfile } = await supabase
            .from("profiles")
            .select("id, nickname, avatar_url")
            .eq("id", member.leagues.owner_id)
            .single();
          owner = ownerProfile;
        }

        // league_stats가 배열인지 객체인지 확인
        const stats = Array.isArray(member.leagues?.league_stats) 
          ? member.leagues?.league_stats[0] 
          : member.leagues?.league_stats;

        return {
          id: member.leagues?.id,
          name: member.leagues?.name,
          description: member.leagues?.description,
          region: member.leagues?.region,
          type: member.leagues?.type,
          member_count: stats?.member_count || 1,
          match_count: stats?.match_count || 0,
          last_matched_at: stats?.last_matched_at || null,
          created_at: member.leagues?.created_at,
          updated_at: member.leagues?.updated_at,
          owner: owner ? {
            id: owner.id,
            nickname: owner.nickname,
            avatar_url: owner.avatar_url
          } : null,
          my_role: member.role,
          joined_at: member.joined_at
        };
      }) || []
    );

    // 대기 중인 신청 데이터 변환
    const pendingRequests = await Promise.all(
      pendingData?.map(async (request) => {
        // 리그 소유자 정보 별도 조회
        let owner = null;
        if (request.leagues?.owner_id) {
          const { data: ownerProfile } = await supabase
            .from("profiles")
            .select("id, nickname, avatar_url")
            .eq("id", request.leagues.owner_id)
            .single();
          owner = ownerProfile;
        }

        // league_stats가 배열인지 객체인지 확인
        const stats = Array.isArray(request.leagues?.league_stats) 
          ? request.leagues?.league_stats[0] 
          : request.leagues?.league_stats;

        return {
          id: request.id,
          league: {
            id: request.leagues?.id,
            name: request.leagues?.name,
            description: request.leagues?.description,
            region: request.leagues?.region,
            type: request.leagues?.type,
            member_count: stats?.member_count || 1,
            match_count: stats?.match_count || 0,
            last_matched_at: stats?.last_matched_at || null,
            created_at: request.leagues?.created_at,
            updated_at: request.leagues?.updated_at,
            owner: owner ? {
              id: owner.id,
              nickname: owner.nickname,
              avatar_url: owner.avatar_url
            } : null,
          },
          status: request.status,
          message: request.message,
          applied_at: request.created_at
        };
      }) || []
    );

    const filteredJoinedLeagues = joinedLeagues.filter(league => league.id);
    const filteredPendingRequests = pendingRequests.filter(request => request.league.id);

    return NextResponse.json({
      success: true,
      data: {
        joined: filteredJoinedLeagues,
        pending: filteredPendingRequests
      }
    });
  } catch (error) {
    console.error("Error fetching my leagues:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch my leagues" },
      { status: 500 }
    );
  }
}
