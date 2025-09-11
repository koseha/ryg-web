import { NextRequest, NextResponse } from 'next/server';

// Mock data for leagues
const mockLeagues = [
  {
    id: 1,
    name: "Champions Arena",
    description: "Elite league for diamond+ players. Competitive environment with weekly tournaments and coaching sessions.",
    memberCount: 47,
    createdAt: "2024-01-15",
    creator: "RiftMaster",
    region: "NA",
    type: "Competitive"
  },
  {
    id: 2,
    name: "Casual Rift Runners",
    description: "Friendly community for all skill levels. Focus on fun, learning, and making friends.",
    memberCount: 23,
    createdAt: "2024-02-03",
    creator: "SummonerFun",
    region: "EUW",
    type: "Casual"
  },
  {
    id: 3,
    name: "Bronze to Gold Journey",
    description: "Helping players climb from Bronze to Gold through mentorship and practice matches.",
    memberCount: 156,
    createdAt: "2024-01-28",
    creator: "ClimbCoach",
    region: "KR",
    type: "Educational"
  },
  {
    id: 4,
    name: "Night Owls League",
    description: "For players who love late-night gaming sessions. Active from 10PM to 4AM EST.",
    memberCount: 89,
    createdAt: "2024-02-10",
    creator: "NocturnalGamer",
    region: "NA",
    type: "Casual"
  },
  {
    id: 5,
    name: "Pro Academy",
    description: "Training ground for aspiring professional players. Strict requirements and high-level gameplay.",
    memberCount: 12,
    createdAt: "2024-01-05",
    creator: "ProCoach",
    region: "EUW",
    type: "Professional"
  },
  {
    id: 6,
    name: "Weekend Warriors",
    description: "Perfect for busy professionals who can only play on weekends. Organized tournaments every Saturday.",
    memberCount: 67,
    createdAt: "2024-02-01",
    creator: "WeekendGamer",
    region: "NA",
    type: "Casual"
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'newest';

    let filteredLeagues = [...mockLeagues];

    // Filter by search term
    if (search) {
      filteredLeagues = filteredLeagues.filter(league =>
        league.name.toLowerCase().includes(search.toLowerCase()) ||
        league.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort leagues
    if (sortBy === 'newest') {
      filteredLeagues.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'members') {
      filteredLeagues.sort((a, b) => b.memberCount - a.memberCount);
    }

    return NextResponse.json({
      success: true,
      data: filteredLeagues,
      total: filteredLeagues.length
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leagues' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.description || !body.region || !body.type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new league
    const newLeague = {
      id: mockLeagues.length + 1,
      name: body.name,
      description: body.description,
      memberCount: 1,
      createdAt: new Date().toISOString().split('T')[0],
      creator: body.creator || 'Anonymous',
      region: body.region,
      type: body.type
    };

    // In a real app, you would save to database here
    mockLeagues.push(newLeague);

    return NextResponse.json({
      success: true,
      data: newLeague
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create league' },
      { status: 500 }
    );
  }
}
