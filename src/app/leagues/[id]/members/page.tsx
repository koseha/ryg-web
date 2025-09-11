"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  Users, 
  UserPlus, 
  MoreVertical,
  Crown,
  Star,
  User,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import { RoleBadge } from "@/components/ui/role-badge";
import { TierBadge } from "@/components/ui/tier-badge";
import { PositionTags } from "@/components/ui/position-tags";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data for pending applications
const mockPendingApplications = [
  {
    id: 1,
    name: "NewPlayer",
    email: "newplayer@example.com",
    tier: "Gold",
    positions: ["Mid", "Top"],
    message: "안녕하세요! 리그에 가입하고 싶습니다. 함께 게임하면서 실력을 늘리고 싶어요.",
    appliedAt: "2024-02-15T10:00:00Z",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
  },
  {
    id: 2,
    name: "RisingStar",
    email: "risingstar@example.com",
    tier: "Platinum",
    positions: ["Jungle", "Support"],
    message: "플래티넘 티어에서 더 높은 수준의 게임을 하고 싶습니다.",
    appliedAt: "2024-02-14T15:30:00Z",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face"
  }
];

// Mock data for members
const mockMembers = [
  {
    id: 1,
    name: "RiftMaster",
    email: "riftmaster@example.com",
    tier: "Challenger",
    positions: ["Mid", "Top"],
    role: "Owner",
    status: "active",
    joinedAt: "2024-01-15",
    lastActive: "2024-02-15T14:30:00Z",
    matchesPlayed: 45,
    winRate: 85.2,
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face"
  },
  {
    id: 2,
    name: "ProGamer",
    email: "progamer@example.com",
    tier: "Grandmaster",
    positions: ["Jungle", "Support"],
    role: "Admin",
    status: "active",
    joinedAt: "2024-01-20",
    lastActive: "2024-02-15T12:00:00Z",
    matchesPlayed: 38,
    winRate: 78.9,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
  },
  {
    id: 3,
    name: "DiamondPlayer",
    email: "diamond@example.com",
    tier: "Diamond",
    positions: ["ADC", "Mid"],
    role: "Member",
    status: "active",
    joinedAt: "2024-02-01",
    lastActive: "2024-02-14T20:00:00Z",
    matchesPlayed: 42,
    winRate: 72.1,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
  },
  {
    id: 4,
    name: "PlatinumRiser",
    email: "platinum@example.com",
    tier: "Platinum",
    positions: ["Top", "Jungle"],
    role: "Member",
    status: "active",
    joinedAt: "2024-02-05",
    lastActive: "2024-02-13T18:30:00Z",
    matchesPlayed: 28,
    winRate: 65.4,
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face"
  },
  {
    id: 5,
    name: "GoldClimber",
    email: "gold@example.com",
    tier: "Gold",
    positions: ["Support", "ADC"],
    role: "Member",
    status: "inactive",
    joinedAt: "2024-02-10",
    lastActive: "2024-02-12T15:00:00Z",
    matchesPlayed: 15,
    winRate: 58.3,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face"
  },
  {
    id: 6,
    name: "SilverStruggler",
    email: "silver@example.com",
    tier: "Silver",
    positions: ["Top", "Support"],
    role: "Member",
    status: "active",
    joinedAt: "2024-02-08",
    lastActive: "2024-02-14T16:00:00Z",
    matchesPlayed: 22,
    winRate: 52.1,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face"
  },
  {
    id: 7,
    name: "BronzeBeginner",
    email: "bronze@example.com",
    tier: "Bronze",
    positions: ["Mid", "ADC"],
    role: "Member",
    status: "active",
    joinedAt: "2024-02-12",
    lastActive: "2024-02-15T10:00:00Z",
    matchesPlayed: 8,
    winRate: 45.2,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
  },
  {
    id: 8,
    name: "MasterMind",
    email: "master@example.com",
    tier: "Master",
    positions: ["Jungle", "Mid"],
    role: "Member",
    status: "active",
    joinedAt: "2024-01-25",
    lastActive: "2024-02-15T09:00:00Z",
    matchesPlayed: 35,
    winRate: 81.3,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
  }
];

const roleOptions = [
  { value: "all", label: "모든 역할" },
  { value: "Owner", label: "책임자" },
  { value: "Admin", label: "운영진" },
  { value: "Member", label: "멤버" }
];

const tierOptions = [
  { value: "all", label: "모든 티어" },
  { value: "Challenger", label: "챌린저" },
  { value: "Grandmaster", label: "그랜드마스터" },
  { value: "Master", label: "마스터" },
  { value: "Diamond", label: "다이아몬드" },
  { value: "Platinum", label: "플래티넘" },
  { value: "Gold", label: "골드" },
  { value: "Silver", label: "실버" },
  { value: "Bronze", label: "브론즈" }
];

const positionOptions = [
  { value: "all", label: "모든 포지션" },
  { value: "Top", label: "탑" },
  { value: "Jungle", label: "정글" },
  { value: "Mid", label: "미드" },
  { value: "ADC", label: "원딜" },
  { value: "Support", label: "서포터" }
];

export default function LeagueMembers() {
  const params = useParams();
  const leagueId = params.id;
  
  const [roleFilter, setRoleFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");

  const filteredMembers = mockMembers.filter(member => {
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    const matchesTier = tierFilter === "all" || member.tier === tierFilter;
    const matchesPosition = positionFilter === "all" || member.positions.includes(positionFilter);
    
    return matchesRole && matchesTier && matchesPosition;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-500 border-green-500/30";
      case "inactive":
        return "bg-gray-500/20 text-gray-500 border-gray-500/30";
      default:
        return "bg-secondary/20 text-secondary-foreground border-secondary/30";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "활성";
      case "inactive":
        return "비활성";
      default:
        return "알 수 없음";
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Button asChild variant="ghost" size="sm">
                <Link href={`/leagues/${leagueId}/overview`} className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>대시보드로 돌아가기</span>
                </Link>
              </Button>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 text-glow">
              멤버 관리
            </h1>
            <p className="text-xl text-muted-foreground">
              리그 멤버들을 관리하고 모니터링하세요
            </p>
          </div>
          
          <Button variant="hero">
            <UserPlus className="mr-2 h-4 w-4" />
            멤버 초대
          </Button>
        </div>


        {/* Pending Applications Section */}
        {mockPendingApplications.length > 0 && (
          <div className="card-glass p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">가입 신청 관리</h2>
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 rounded-full text-sm">
                {mockPendingApplications.length}건 대기중
              </span>
            </div>
            
            <div className="space-y-4">
              {mockPendingApplications.map((application) => (
                <div key={application.id} className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <img
                      src={application.avatar}
                      alt={application.name}
                      className="h-12 w-12 rounded-full border-2 border-primary/30"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {application.name}
                        </h3>
                        <TierBadge tier={application.tier as any} />
                        <PositionTags positions={application.positions} />
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {application.message}
                      </p>
                      
                      <div className="text-xs text-muted-foreground">
                        신청일: {new Date(application.appliedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="text-green-500 border-green-500/30 hover:bg-green-500/20">
                      승인
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-500 border-red-500/30 hover:bg-red-500/20">
                      거절
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card-glass p-6 mb-8">
          <div className="flex flex-wrap gap-3">
            <FilterDropdown
              options={roleOptions}
              value={roleFilter}
              onValueChange={setRoleFilter}
              placeholder="역할"
            />
            
            <FilterDropdown
              options={tierOptions}
              value={tierFilter}
              onValueChange={setTierFilter}
              placeholder="티어"
            />
            
            <FilterDropdown
              options={positionOptions}
              value={positionFilter}
              onValueChange={setPositionFilter}
              placeholder="포지션"
            />
          </div>
        </div>

        {/* Members List */}
        <div className="space-y-4">
          {filteredMembers.map((member) => (
            <div key={member.id} className="card-glass p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="h-12 w-12 rounded-full border-2 border-primary/30"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {member.name}
                      </h3>
                      <RoleBadge role={member.role as any} />
                    </div>
                    
                    <div className="flex items-center space-x-4 mb-2">
                      <TierBadge tier={member.tier as any} />
                      <PositionTags positions={member.positions} />
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>가입일: {new Date(member.joinedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48 bg-card border-border" align="end">
                      <DropdownMenuItem className="cursor-pointer">
                        프로필 보기
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        역할 변경
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer text-destructive">
                        추방하기
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredMembers.length === 0 && (
          <div className="text-center py-16">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-bold mb-2 text-muted-foreground">멤버를 찾을 수 없습니다</h3>
            <p className="text-muted-foreground mb-6">
              필터를 조정해보세요
            </p>
            <Button variant="hero">
              <UserPlus className="mr-2 h-4 w-4" />
              멤버 초대하기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

