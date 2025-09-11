import { NextRequest, NextResponse } from 'next/server';

// Mock user data
const mockUsers = [
  {
    id: 1,
    name: "Faker",
    email: "faker@lol.universe",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face",
    role: "admin"
  },
  {
    id: 2,
    name: "RiftMaster",
    email: "riftmaster@lol.universe",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    role: "user"
  }
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, password, name } = body;

    if (action === 'login') {
      // Mock login - in real app, validate credentials
      const user = mockUsers.find(u => u.email === email);
      
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }

      // Mock JWT token
      const token = `mock-jwt-token-${user.id}`;

      return NextResponse.json({
        success: true,
        data: {
          user,
          token
        }
      });
    }

    if (action === 'register') {
      // Mock registration
      if (!email || !password || !name) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields' },
          { status: 400 }
        );
      }

      // Check if user already exists
      const existingUser = mockUsers.find(u => u.email === email);
      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'User already exists' },
          { status: 409 }
        );
      }

      // Create new user
      const newUser = {
        id: mockUsers.length + 1,
        name,
        email,
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face&id=${mockUsers.length + 1}`,
        role: "user"
      };

      mockUsers.push(newUser);

      // Mock JWT token
      const token = `mock-jwt-token-${newUser.id}`;

      return NextResponse.json({
        success: true,
        data: {
          user: newUser,
          token
        }
      }, { status: 201 });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    // Mock token validation
    const userId = token.replace('mock-jwt-token-', '');
    const user = mockUsers.find(u => u.id === parseInt(userId));

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Token validation failed' },
      { status: 500 }
    );
  }
}
