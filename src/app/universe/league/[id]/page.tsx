"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  Crown, 
  Users, 
  Calendar, 
  MapPin, 
  ArrowLeft, 
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/components/ui/role-badge";
import { TierBadge } from "@/components/ui/tier-badge";
import { PositionTags } from "@/components/ui/position-tags";
import { CopyButton } from "@/components/ui/copy-button";

// Mock data for league details
const mockLeagueDetails = {
  id: 1,
  name: "Champions Arena",
  description: "Elite league for diamond+ players. Competitive environment with weekly tournaments and coaching sessions. Join us for high-level gameplay and strategic discussions.",
  rules: [
    "다이아몬드 이상 티어만 가입 가능",
    "주간 토너먼트 참여 필수",
    "게임 내 매너 준수",
    "불참 시 사전 공지 필수"
  ],
  memberCount: 47,
  maxMembers: 100,
  createdAt: "2024-01-15",
  creator: "RiftMaster",
  region: "NA",
  type: "Competitive",
  isPublic: true,
};

const mockRecentMembers = [
  {
    id: 1,
    name: "RiftMaster",
    tier: "Challenger",
    positions: ["Mid", "Top"],
    role: "Owner",
    joinedAt: "2024-01-15",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face",
    winRate: 85.2,
    matchesPlayed: 45
  },
  {
    id: 2,
    name: "ProGamer",
    tier: "Grandmaster",
    positions: ["Jungle", "Support"],
    role: "Admin",
    joinedAt: "2024-01-20",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    winRate: 78.9,
    matchesPlayed: 38
  },
  {
    id: 3,
    name: "DiamondPlayer",
    tier: "Diamond",
    positions: ["ADC", "Mid"],
    role: "Member",
    joinedAt: "2024-02-01",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    winRate: 72.1,
    matchesPlayed: 42
  },
  {
    id: 4,
    name: "PlatinumRiser",
    tier: "Platinum",
    positions: ["Top", "Jungle"],
    role: "Member",
    joinedAt: "2024-02-05",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
    winRate: 65.4,
    matchesPlayed: 28
  },
  {
    id: 5,
    name: "GoldClimber",
    tier: "Gold",
    positions: ["Support", "ADC"],
    role: "Member",
    joinedAt: "2024-02-10",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
    winRate: 58.3,
    matchesPlayed: 15
  }
];

export default function LeagueDetail() {
  const params = useParams();
  // const leagueId = params.id; // Removed unused variable
  const [showJoinForm, setShowJoinForm] = useState(false);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Competitive":
        return "bg-destructive/20 text-destructive border-destructive/30";
      case "Professional":
        return "bg-primary/20 text-primary border-primary/30";
      case "Educational":
        return "bg-accent/20 text-accent border-accent/30";
      default:
        return "bg-secondary/20 text-secondary-foreground border-secondary/30";
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm">
            <Link href="/universe" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>리그 목록으로 돌아가기</span>
            </Link>
          </Button>
        </div>

        {/* League Header */}
        <div className="card-glass p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <Crown className="h-8 w-8 text-primary" />
                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getTypeColor(mockLeagueDetails.type)}`}>
                  {mockLeagueDetails.type}
                </span>
                <div className="flex items-center space-x-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{mockLeagueDetails.region}</span>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-glow">
                {mockLeagueDetails.name}
              </h1>

              <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                {mockLeagueDetails.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{mockLeagueDetails.memberCount}/{mockLeagueDetails.maxMembers}명 참여중</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>생성일: {new Date(mockLeagueDetails.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Crown className="h-4 w-4" />
                  <span>생성자: {mockLeagueDetails.creator}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-4">
              <Button 
                variant="hero" 
                size="lg" 
                onClick={() => setShowJoinForm(true)}
                className="text-lg px-8 py-4"
              >
                <UserPlus className="mr-2 h-5 w-5" />
                가입 신청하기
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">리그 코드</p>
                <div className="flex items-center space-x-2">
                  <code className="px-3 py-2 bg-secondary rounded-lg font-mono text-sm">
                    {mockLeagueDetails.id.toString().padStart(6, '0')}
                  </code>
                  <CopyButton text={mockLeagueDetails.id.toString().padStart(6, '0')} />
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Rules */}
        <div className="card-glass p-6 mb-8">
          <h3 className="text-xl font-bold text-foreground mb-4">리그 규칙</h3>
          <ul className="space-y-2">
            {mockLeagueDetails.rules.map((rule, index) => (
              <li key={index} className="flex items-start space-x-2 text-muted-foreground">
                <span className="text-primary mt-1">•</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Operating Team */}
        <div className="card-glass p-6 mb-8">
          <h3 className="text-xl font-bold text-foreground mb-4">운영진</h3>
          
          <div className="space-y-4">
            {mockRecentMembers.slice(0, 3).map((member) => (
              <div key={member.id} className="flex items-center space-x-4 p-4 bg-secondary/20 rounded-lg">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="h-10 w-10 rounded-full border-2 border-primary/30"
                />
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-foreground">{member.name}</span>
                    <RoleBadge role={member.role as "Owner" | "Admin" | "Member"} />
                  </div>
                  <div className="flex items-center space-x-2">
                    <TierBadge tier={member.tier as "Challenger" | "Grandmaster" | "Master" | "Diamond" | "Platinum" | "Gold" | "Silver" | "Bronze"} />
                    <PositionTags positions={member.positions} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>


        {/* Join Application Modal */}
        {showJoinForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="card-glass p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-foreground mb-6">가입 신청</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    티어 선택 (필수)
                  </label>
                  <select className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground">
                    <option value="">티어를 선택하세요</option>
                    <option value="Bronze">브론즈</option>
                    <option value="Silver">실버</option>
                    <option value="Gold">골드</option>
                    <option value="Platinum">플래티넘</option>
                    <option value="Diamond">다이아몬드</option>
                    <option value="Master">마스터</option>
                    <option value="Grandmaster">그랜드마스터</option>
                    <option value="Challenger">챌린저</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    포지션 선택 (필수, 다중 선택)
                  </label>
                  <div className="space-y-2">
                    {["Top", "Jungle", "Mid", "ADC", "Support"].map(position => (
                      <label key={position} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          className="rounded border-border"
                        />
                        <span className="text-foreground">{position}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    신청 메시지 (선택)
                  </label>
                  <textarea
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground"
                    rows={3}
                    placeholder="가입 신청 메시지를 입력하세요"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setShowJoinForm(false)}
                >
                  취소
                </Button>
                <Button variant="hero">
                  가입 신청
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
