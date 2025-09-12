"use client";

import { useState } from "react";
import { Users, Calendar, Eye, Crown, MapPin, Trophy, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";

const mockLeagues = [
  {
    id: 1,
    name: "Champions Arena",
    description: "Elite league for diamond+ players. Competitive environment with weekly tournaments and coaching sessions.",
    memberCount: 47,
    createdAt: "2024-01-15",
    owner: "RiftMaster",
    region: "NA",
    type: "Plus",
    totalMatches: 156,
    recentMatchDate: "2024-02-15",
    minTier: "Diamond",
  },
  {
    id: 2,
    name: "Casual Rift Runners",
    description: "Friendly community for all skill levels. Focus on fun, learning, and making friends.",
    memberCount: 23,
    createdAt: "2024-02-03",
    owner: "SummonerFun",
    region: "EUW",
    type: "Basic",
    totalMatches: 89,
    recentMatchDate: "2024-02-14",
    minTier: "Bronze",
  },
  {
    id: 3,
    name: "Bronze to Gold Journey",
    description: "Helping players climb from Bronze to Gold through mentorship and practice matches.",
    memberCount: 156,
    createdAt: "2024-01-28",
    owner: "ClimbCoach",
    region: "KR",
    type: "Basic",
    totalMatches: 234,
    recentMatchDate: "2024-02-13",
    minTier: "Bronze",
  },
  {
    id: 4,
    name: "Night Owls League",
    description: "For players who love late-night gaming sessions. Active from 10PM to 4AM EST.",
    memberCount: 89,
    createdAt: "2024-02-10",
    owner: "NocturnalGamer",
    region: "NA",
    type: "Basic",
    totalMatches: 67,
    recentMatchDate: "2024-02-12",
    minTier: "Silver",
  },
  {
    id: 5,
    name: "Pro Academy",
    description: "Training ground for aspiring professional players. Strict requirements and high-level gameplay.",
    memberCount: 12,
    createdAt: "2024-01-05",
    owner: "ProCoach",
    region: "EUW",
    type: "Plus",
    totalMatches: 45,
    recentMatchDate: "2024-02-11",
    minTier: "Master",
  },
  {
    id: 6,
    name: "Weekend Warriors",
    description: "Perfect for busy professionals who can only play on weekends. Organized tournaments every Saturday.",
    memberCount: 67,
    createdAt: "2024-02-01",
    owner: "WeekendGamer",
    region: "NA",
    type: "Basic",
    totalMatches: 123,
    recentMatchDate: "2024-02-10",
    minTier: "Gold",
  },
  {
    id: 7,
    name: "Korean Masters",
    description: "한국 서버 마스터 이상 플레이어들을 위한 리그입니다. 높은 수준의 게임플레이와 전략적 토론을 제공합니다.",
    memberCount: 34,
    createdAt: "2024-01-20",
    owner: "KoreanPro",
    region: "KR",
    type: "Plus",
    totalMatches: 78,
    recentMatchDate: "2024-02-09",
    minTier: "Master",
  },
  {
    id: 8,
    name: "Beginner's Paradise",
    description: "리그 오브 레전드를 처음 시작하는 분들을 위한 친화적인 커뮤니티입니다. 기초부터 차근차근 배워보세요.",
    memberCount: 201,
    createdAt: "2024-01-10",
    owner: "BeginnerGuide",
    region: "KR",
    type: "Basic",
    totalMatches: 345,
    recentMatchDate: "2024-02-08",
    minTier: "Bronze",
  },
  {
    id: 9,
    name: "EUW Elite",
    description: "유럽 서버의 엘리트 플레이어들이 모인 리그입니다. 국제적인 경쟁을 경험해보세요.",
    memberCount: 28,
    createdAt: "2024-01-25",
    owner: "EUWChampion",
    region: "EUW",
    type: "Plus",
    totalMatches: 56,
    recentMatchDate: "2024-02-07",
    minTier: "Grandmaster",
  },
  {
    id: 10,
    name: "Fun & Games",
    description: "진지하지 않고 재미있게 게임을 즐기고 싶은 분들을 위한 리그입니다. 스트레스 없이 즐겨보세요!",
    memberCount: 145,
    createdAt: "2024-02-05",
    owner: "FunGamer",
    region: "NA",
    type: "Basic",
    totalMatches: 189,
    recentMatchDate: "2024-02-06",
    minTier: "Bronze",
  },
  {
    id: 11,
    name: "Japan Rising Stars",
    description: "일본 서버의 신예 플레이어들을 위한 리그입니다. 함께 성장하고 경쟁해보세요.",
    memberCount: 78,
    createdAt: "2024-02-12",
    owner: "JapanGamer",
    region: "JP",
    type: "Basic",
    totalMatches: 45,
    recentMatchDate: "2024-02-14",
    minTier: "Silver",
  },
  {
    id: 12,
    name: "EUNE Champions",
    description: "동유럽 및 북유럽 지역의 챔피언들을 위한 리그입니다.",
    memberCount: 92,
    createdAt: "2024-01-30",
    owner: "EUNEPro",
    region: "EUNE",
    type: "Plus",
    totalMatches: 134,
    recentMatchDate: "2024-02-13",
    minTier: "Diamond",
  },
  {
    id: 13,
    name: "Turkey Gaming Hub",
    description: "튀르키예 지역 게이머들을 위한 활발한 커뮤니티입니다.",
    memberCount: 156,
    createdAt: "2024-02-08",
    owner: "TurkeyGamer",
    region: "TR",
    type: "Basic",
    totalMatches: 89,
    recentMatchDate: "2024-02-15",
    minTier: "Gold",
  },
  {
    id: 14,
    name: "SEA Warriors",
    description: "동남아시아 지역의 전사들을 위한 리그입니다.",
    memberCount: 203,
    createdAt: "2024-01-18",
    owner: "SEAChampion",
    region: "SEA",
    type: "Plus",
    totalMatches: 267,
    recentMatchDate: "2024-02-14",
    minTier: "Platinum",
  },
  {
    id: 15,
    name: "China Elite",
    description: "중국 지역의 엘리트 플레이어들을 위한 리그입니다.",
    memberCount: 45,
    createdAt: "2024-02-01",
    owner: "ChinaPro",
    region: "CN",
    type: "Plus",
    totalMatches: 78,
    recentMatchDate: "2024-02-12",
    minTier: "Master",
  }
];

// 지역별 설명
const regionDescriptions = {
  NA: "북아메리카 지역을 위한 서버입니다.",
  KR: "대한민국 사용자를 위한 서버입니다.",
  JP: "일본 지역 사용자를 위한 서버입니다.",
  EUW: "서유럽 지역을 위한 서버입니다.",
  EUNE: "북유럽 및 동유럽 지역을 위한 서버입니다.",
  TR: "튀르키예 지역 사용자를 위한 서버입니다.",
  SEA: "동남아시아 지역을 위한 서버입니다.",
  CN: "중국 지역을 위한 서버입니다."
};

export default function Universe() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const filteredLeagues = mockLeagues
    .filter(league =>
      league.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      league.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === "members") {
        return b.memberCount - a.memberCount;
      }
      return 0;
    });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Plus":
        return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      case "Basic":
        return "bg-muted/20 text-muted-foreground border-muted/30";
      default:
        return "bg-secondary/20 text-secondary-foreground border-secondary/30";
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Crown className="h-16 w-16 text-primary mx-auto mb-4 animate-glow" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-glow">
            모든 리그 <span className="text-primary">둘러보기</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            전 세계의 멋진 게임 커뮤니티를 발견해보세요
          </p>
        </div>

        {/* Search and Filters */}
        <div className="card-glass p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchInput
                placeholder="리그 검색..."
                value={searchTerm}
                onChange={setSearchTerm}
              />
            </div>
            
            <div className="flex gap-2">
              <FilterDropdown
                options={[
                  { value: "newest", label: "최신순" },
                  { value: "members", label: "멤버 많은 순" }
                ]}
                value={sortBy}
                onValueChange={setSortBy}
                placeholder="정렬"
              />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {filteredLeagues.length}개의 리그를 찾았습니다
          </p>
        </div>

        {/* League Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeagues.map((league, index) => (
            <div
              key={league.id}
              className="card-feature group animate-fade-in flex flex-col h-[320px]"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Crown className="h-5 w-5 text-primary" />
                  <span className={`px-2 py-1 text-xs rounded-full border ${getTypeColor(league.type)}`}>
                    {league.type}
                  </span>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center space-x-1 text-muted-foreground cursor-help">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{league.region}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{regionDescriptions[league.region as keyof typeof regionDescriptions]}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                {league.name}
              </h3>

              {/* Description - Fixed height */}
              <div className="flex-1 mb-3">
                <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed h-[40px]">
                  {league.description}
                </p>
              </div>

              {/* Stats - Fixed height */}
              <div className="space-y-2 mb-4 h-[60px]">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{league.memberCount}명 참여중</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Trophy className="h-4 w-4" />
                    <span>{league.totalMatches}경기 진행됨</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>생성일: {new Date(league.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>최근 매치: {new Date(league.recentMatchDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Footer - Fixed at bottom */}
              <div className="flex items-center justify-between mt-auto">
                <div className="text-sm">
                  <span className="text-muted-foreground">책임자: </span>
                  <span className="text-primary font-medium">{league.owner}</span>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/universe/league/${league.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    자세히 보기
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredLeagues.length === 0 && (
          <div className="text-center py-16">
            <Crown className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-bold mb-2 text-muted-foreground">리그를 찾을 수 없습니다</h3>
            <p className="text-muted-foreground mb-6">
              검색어를 다시 확인하거나 새 리그를 만들어보세요
            </p>
            <Button asChild variant="hero">
              <Link href="/leagues">리그 만들기</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}