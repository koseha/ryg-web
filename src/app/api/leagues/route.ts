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

    // Build query with filters
    let query = supabase.from("leagues").select("*", { count: "exact" });

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
      query = query.order("member_count", { ascending: false });
    } else if (sortBy === "name") {
      query = query.order("name", { ascending: true });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const total = count || 0;
    const hasMore = offset + limit < total;

    return NextResponse.json({
      success: true,
      data: data || [],
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
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const offset = (page - 1) * limit;

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // 내가 가입한 리그 조회
    const { data, error, count } = await supabase
      .from("league_members")
      .select(`
        *,
        leagues (*)
      `, { count: "exact" })
      .eq("user_id", user.id)
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // 데이터 변환
    const transformedData = await Promise.all(
      data?.map(async (member) => {
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

        return {
          id: member.leagues?.id,
          name: member.leagues?.name,
          description: member.leagues?.description,
          region: member.leagues?.region,
          type: member.leagues?.type,
          member_count: member.leagues?.member_count,
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

    const filteredData = transformedData.filter(league => league.id);

    const total = count || 0;
    const hasMore = offset + limit < total;

    return NextResponse.json({
      success: true,
      data: filteredData,
      pagination: {
        page,
        limit,
        total,
        hasMore,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching my leagues:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch my leagues" },
      { status: 500 }
    );
  }
}
