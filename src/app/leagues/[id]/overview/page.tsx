"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  Crown, 
  Users, 
  Calendar, 
  Trophy, 
  Play,
  UserPlus
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/components/ui/role-badge";
import { TierBadge } from "@/components/ui/tier-badge";
import { PositionTags } from "@/components/ui/position-tags";

// Mock data for league overview
const mockLeagueOverview = {
  id: 1,
  name: "Champions Arena",
  description: "Elite league for diamond+ players",
  memberCount: 47,
  maxMembers: 100,
  totalMatches: 156,
  activeMatches: 3,
  completedMatches: 153,
  winRate: 68.5,
  averageGameTime: "32분",
  lastActivity: "2024-02-15T14:30:00Z",
  role: "Owner"
};

const mockRecentMatches = [
  {
    id: 1,
    title: "주간 토너먼트 결승",
    code: "CHAMP001",
    status: "completed",
    participants: 10,
    createdAt: "2024-02-15T10:00:00Z",
    duration: "28분"
  },
  {
    id: 2,
    title: "연습 매치 #47",
    code: "CHAMP002",
    status: "active",
    participants: 8,
    createdAt: "2024-02-15T14:30:00Z",
    duration: "진행중"
  },
  {
    id: 3,
    title: "랭크 매치 #46",
    code: "CHAMP003",
    status: "completed",
    participants: 10,
    createdAt: "2024-02-14T20:00:00Z",
    duration: "35분"
  }
];


export default function LeagueOverview() {
  const params = useParams();
  const leagueId = params.id;


  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Crown className="h-8 w-8 text-primary" />
            <RoleBadge role={mockLeagueOverview.role as any} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-glow">
            {mockLeagueOverview.name}
          </h1>
          <p className="text-xl text-muted-foreground">
            {mockLeagueOverview.description}
          </p>
        </div>

        {/* Tab Navigation */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members" asChild>
              <Link href={`/leagues/${leagueId}/members`}>Members</Link>
            </TabsTrigger>
            <TabsTrigger value="matches" asChild>
              <Link href={`/leagues/${leagueId}/matches`}>Matches</Link>
            </TabsTrigger>
            <TabsTrigger value="settings" asChild>
              <Link href={`/leagues/${leagueId}/settings`}>Settings</Link>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card-glass p-6 text-center">
            <Users className="h-8 w-8 text-primary mx-auto mb-3" />
            <div className="text-3xl font-bold text-foreground mb-1">
              {mockLeagueOverview.memberCount}
            </div>
            <div className="text-sm text-muted-foreground">총 멤버 수</div>
          </div>
          
          <div className="card-glass p-6 text-center">
            <Trophy className="h-8 w-8 text-accent mx-auto mb-3" />
            <div className="text-3xl font-bold text-foreground mb-1">
              {mockLeagueOverview.totalMatches}
            </div>
            <div className="text-sm text-muted-foreground">생성된 매치 수</div>
          </div>
          
          <div className="card-glass p-6 text-center">
            <Calendar className="h-8 w-8 text-green-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-foreground mb-1">
              {mockLeagueOverview.activeMatches}
            </div>
            <div className="text-sm text-muted-foreground">이번 달 활동</div>
          </div>
        </div>

        {/* League Information */}
        <div className="card-glass p-6 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">리그 정보</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">설명</h3>
              <p className="text-muted-foreground">{mockLeagueOverview.description}</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">생성일</h3>
                <p className="text-muted-foreground">{new Date(mockLeagueOverview.lastActivity).toLocaleDateString()}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">책임자</h3>
                <p className="text-muted-foreground">RiftMaster</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="card-glass p-6 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">최근 활동 피드</h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-secondary/20 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-foreground">새 멤버가 가입했습니다</p>
                <p className="text-sm text-muted-foreground">2시간 전</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-secondary/20 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-foreground">새 매치가 생성되었습니다</p>
                <p className="text-sm text-muted-foreground">4시간 전</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-secondary/20 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-foreground">매치가 완료되었습니다</p>
                <p className="text-sm text-muted-foreground">6시간 전</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card-glass p-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">빠른 작업</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Button asChild variant="outline" className="h-16 flex-col space-y-2">
              <Link href={`/leagues/${leagueId}/matches`}>
                <Play className="h-6 w-6" />
                <span>매치 생성하기</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-16 flex-col space-y-2">
              <Link href="/universe">
                <UserPlus className="h-6 w-6" />
                <span>멤버 초대하기</span>
              </Link>
            </Button>
          </div>
        </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
