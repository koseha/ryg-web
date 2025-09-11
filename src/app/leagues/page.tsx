"use client";

import Link from "next/link";
import { Crown, Users, Calendar, Plus, Trophy, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/components/ui/role-badge";

const mockUserLeagues = [
  {
    id: 1,
    name: "Champions Arena",
    role: "Owner",
    memberCount: 47,
    lastActivity: "2024-02-15",
    recentMatches: 12,
    status: "active",
    description: "Elite league for diamond+ players",
    totalMatches: 156,
    winRate: 78.5,
    region: "NA",
    type: "Competitive"
  },
  {
    id: 2,
    name: "Weekend Warriors",
    role: "Admin",
    memberCount: 67,
    lastActivity: "2024-02-14",
    recentMatches: 8,
    status: "active",
    description: "Perfect for busy professionals",
    totalMatches: 123,
    winRate: 65.2,
    region: "NA",
    type: "Casual"
  },
  {
    id: 3,
    name: "Bronze to Gold Journey",
    role: "Member",
    memberCount: 156,
    lastActivity: "2024-02-13",
    recentMatches: 25,
    status: "active",
    description: "Helping players climb from Bronze to Gold",
    totalMatches: 234,
    winRate: 72.1,
    region: "KR",
    type: "Educational"
  },
  {
    id: 4,
    name: "Korean Masters",
    role: "Member",
    memberCount: 34,
    lastActivity: "2024-02-12",
    recentMatches: 5,
    status: "active",
    description: "한국 서버 마스터 이상 플레이어들을 위한 리그",
    totalMatches: 78,
    winRate: 68.9,
    region: "KR",
    type: "Competitive"
  },
  {
    id: 5,
    name: "Fun & Games",
    role: "Member",
    memberCount: 145,
    lastActivity: "2024-02-11",
    recentMatches: 18,
    status: "active",
    description: "진지하지 않고 재미있게 게임을 즐기고 싶은 분들을 위한 리그",
    totalMatches: 189,
    winRate: 55.3,
    region: "NA",
    type: "Casual"
  }
];

export default function MyLeagues() {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Owner":
        return Crown;
      case "Admin":
        return Star;
      default:
        return Users;
    }
  };

  // Show empty state if no leagues (you can toggle this for demo)
  const showEmptyState = false;

  if (showEmptyState) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="container mx-auto">
          <div className="text-center py-20">
            <div className="animate-float mb-8">
              <Trophy className="h-24 w-24 text-muted-foreground mx-auto mb-4 opacity-50" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-muted-foreground">
              가입된 리그가 없습니다
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              아직 가입한 리그가 없습니다. 공개 리그를 살펴보고 시작해보세요!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="hero">
                <Link href="/universe">
                  리그 살펴보러 가기
                  <Crown className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button variant="outline">
                새 리그 만들기
                <Plus className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-glow">
              내 <span className="text-primary">리그</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              내가 참여한 게임 커뮤니티를 관리하세요
            </p>
          </div>
          
          <Button variant="hero">
            <Plus className="h-5 w-5 mr-2" />
            새 리그 만들기
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card-glass p-6 text-center">
            <Crown className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">{mockUserLeagues.length}</div>
            <div className="text-muted-foreground">활성 리그</div>
          </div>
          
          <div className="card-glass p-6 text-center">
            <Users className="h-8 w-8 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">
              {mockUserLeagues.reduce((sum, league) => sum + league.memberCount, 0)}
            </div>
            <div className="text-muted-foreground">총 멤버 수</div>
          </div>
          
          <div className="card-glass p-6 text-center">
            <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">
              {mockUserLeagues.reduce((sum, league) => sum + league.recentMatches, 0)}
            </div>
            <div className="text-muted-foreground">최근 매치</div>
          </div>
        </div>

        {/* League Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockUserLeagues.map((league, index) => {
            const RoleIcon = getRoleIcon(league.role);
            
            return (
              <div
                key={league.id}
                className="card-feature group animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <RoleIcon className="h-5 w-5 text-primary" />
                    <RoleBadge role={league.role as any} />
                  </div>
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>

                <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                  {league.name}
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{league.memberCount}명</span>
                    </div>
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Trophy className="h-4 w-4" />
                      <span>{league.recentMatches}경기</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>최근 활동: {new Date(league.lastActivity).toLocaleDateString()}</span>
                  </div>
                </div>

                <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <Link href={`/leagues/${league.id}/overview`}>
                    대시보드로 이동
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 text-center">
          <div className="card-glass p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-foreground">더 확장할 준비가 되셨나요?</h2>
            <p className="text-muted-foreground mb-6">
              새 리그를 만들거나 더 많은 커뮤니티를 발견해보세요
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero">
                <Plus className="mr-2 h-5 w-5" />
                새 리그 만들기
              </Button>
              
              <Button asChild variant="outline">
                <Link href="/universe">
                  <Crown className="mr-2 h-5 w-5" />
                  리그 살펴보기
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
