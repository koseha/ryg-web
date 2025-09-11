import { NextRequest, NextResponse } from 'next/server';

// Mock data for matches
const mockMatches = [
  {
    id: 1,
    leagueId: 1,
    code: "CHAMP2024001",
    status: "active",
    createdAt: "2024-02-15T10:00:00Z",
    participants: 8,
    maxParticipants: 10,
    description: "Weekly Championship Match"
  },
  {
    id: 2,
    leagueId: 2,
    code: "CASUAL2024001",
    status: "completed",
    createdAt: "2024-02-14T15:30:00Z",
    participants: 5,
    maxParticipants: 5,
    description: "Casual Friday Match"
  },
  {
    id: 3,
    leagueId: 3,
    code: "EDUC2024001",
    status: "active",
    createdAt: "2024-02-13T20:00:00Z",
    participants: 6,
    maxParticipants: 8,
    description: "Learning Session Match"
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('leagueId');
    const status = searchParams.get('status');

    let filteredMatches = [...mockMatches];

    // Filter by league ID
    if (leagueId) {
      filteredMatches = filteredMatches.filter(match => 
        match.leagueId === parseInt(leagueId)
      );
    }

    // Filter by status
    if (status) {
      filteredMatches = filteredMatches.filter(match => 
        match.status === status
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredMatches,
      total: filteredMatches.length
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.leagueId || !body.description) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate match code
    const leaguePrefix = body.leagueId === 1 ? 'CHAMP' : 
                        body.leagueId === 2 ? 'CASUAL' : 
                        body.leagueId === 3 ? 'EDUC' : 'MATCH';
    const timestamp = new Date().getTime().toString().slice(-6);
    const matchCode = `${leaguePrefix}${timestamp}`;

    // Create new match
    const newMatch = {
      id: mockMatches.length + 1,
      leagueId: body.leagueId,
      code: matchCode,
      status: 'active',
      createdAt: new Date().toISOString(),
      participants: 0,
      maxParticipants: body.maxParticipants || 10,
      description: body.description
    };

    // In a real app, you would save to database here
    mockMatches.push(newMatch);

    return NextResponse.json({
      success: true,
      data: newMatch
    }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to create match' },
      { status: 500 }
    );
  }
}
