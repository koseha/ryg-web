import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id: leagueId } = await params;

    // Get league details
    const { data: league, error: leagueError } = await supabase
      .from("leagues")
      .select(
        `
        *,
        profiles!leagues_owner_id_fkey (
          id,
          nickname,
          avatar_url,
          tier,
          positions
        )
      `
      )
      .eq("id", leagueId)
      .single();

    if (leagueError) {
      return NextResponse.json(
        { success: false, error: leagueError.message },
        { status: 404 }
      );
    }

    // Get member count
    const { count: memberCount, error: memberCountError } = await supabase
      .from("league_members")
      .select("*", { count: "exact", head: true })
      .eq("league_id", leagueId);

    if (memberCountError) {
      console.error("Error fetching member count:", memberCountError);
    }

    // Get only Owner and Admin members (not regular members)
    const { data: members, error: membersError } = await supabase
      .from("league_members")
      .select(
        `
        *,
        profiles!league_members_user_id_fkey (
          id,
          nickname,
          avatar_url,
          tier,
          positions
        )
      `
      )
      .eq("league_id", leagueId)
      .in("role", ["owner", "admin"])
      .order("joined_at", { ascending: false });

    if (membersError) {
      console.error("Error fetching members:", membersError);
    }

    // Format the response
    const response = {
      ...league,
      member_count: memberCount || 0,
      owner: league.profiles
        ? {
            id: league.profiles.id,
            name: league.profiles.nickname,
            avatar: league.profiles.avatar_url,
            tier: league.profiles.tier,
            positions: league.profiles.positions,
          }
        : null,
      recent_members:
        members?.map((member) => ({
          id: member.profiles?.id || member.user_id,
          name: member.profiles?.nickname || "Unknown",
          tier: member.profiles?.tier || "Unranked",
          positions: member.profiles?.positions || [],
          role: member.role,
          joinedAt: member.joined_at,
          avatar: member.profiles?.avatar_url || null,
          winRate: 0, // TODO: Calculate from matches
          matchesPlayed: 0, // TODO: Calculate from matches
        })) || [],
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error fetching league details:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch league details" },
      { status: 500 }
    );
  }
}
