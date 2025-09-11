"use client";

import { useState } from "react";
import { Users, Calendar, Eye, Crown, MapPin, Trophy, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import Link from "next/link";

const mockLeagues = [
  {
    id: 1,
    name: "Champions Arena",
    description: "Elite league for diamond+ players. Competitive environment with weekly tournaments and coaching sessions.",
    memberCount: 47,
    createdAt: "2024-01-15",
    creator: "RiftMaster",
    region: "NA",
    type: "Competitive",
    totalMatches: 156,
    recentMatchDate: "2024-02-15",
    minTier: "Diamond",
    isPublic: true
  },
  {
    id: 2,
    name: "Casual Rift Runners",
    description: "Friendly community for all skill levels. Focus on fun, learning, and making friends.",
    memberCount: 23,
    createdAt: "2024-02-03",
    creator: "SummonerFun",
    region: "EUW",
    type: "Casual",
    totalMatches: 89,
    recentMatchDate: "2024-02-14",
    minTier: "Bronze",
    isPublic: true
  },
  {
    id: 3,
    name: "Bronze to Gold Journey",
    description: "Helping players climb from Bronze to Gold through mentorship and practice matches.",
    memberCount: 156,
    createdAt: "2024-01-28",
    creator: "ClimbCoach",
    region: "KR",
    type: "Educational",
    totalMatches: 234,
    recentMatchDate: "2024-02-13",
    minTier: "Bronze",
    isPublic: true
  },
  {
    id: 4,
    name: "Night Owls League",
    description: "For players who love late-night gaming sessions. Active from 10PM to 4AM EST.",
    memberCount: 89,
    createdAt: "2024-02-10",
    creator: "NocturnalGamer",
    region: "NA",
    type: "Casual",
    totalMatches: 67,
    recentMatchDate: "2024-02-12",
    minTier: "Silver",
    isPublic: true
  },
  {
    id: 5,
    name: "Pro Academy",
    description: "Training ground for aspiring professional players. Strict requirements and high-level gameplay.",
    memberCount: 12,
    createdAt: "2024-01-05",
    creator: "ProCoach",
    region: "EUW",
    type: "Professional",
    totalMatches: 45,
    recentMatchDate: "2024-02-11",
    minTier: "Master",
    isPublic: true
  },
  {
    id: 6,
    name: "Weekend Warriors",
    description: "Perfect for busy professionals who can only play on weekends. Organized tournaments every Saturday.",
    memberCount: 67,
    createdAt: "2024-02-01",
    creator: "WeekendGamer",
    region: "NA",
    type: "Casual",
    totalMatches: 123,
    recentMatchDate: "2024-02-10",
    minTier: "Gold",
    isPublic: true
  },
  {
    id: 7,
    name: "Korean Masters",
    description: "한국 서버 마스터 이상 플레이어들을 위한 리그입니다. 높은 수준의 게임플레이와 전략적 토론을 제공합니다.",
    memberCount: 34,
    createdAt: "2024-01-20",
    creator: "KoreanPro",
    region: "KR",
    type: "Competitive",
    totalMatches: 78,
    recentMatchDate: "2024-02-09",
    minTier: "Master",
    isPublic: true
  },
  {
    id: 8,
    name: "Beginner's Paradise",
    description: "리그 오브 레전드를 처음 시작하는 분들을 위한 친화적인 커뮤니티입니다. 기초부터 차근차근 배워보세요.",
    memberCount: 201,
    createdAt: "2024-01-10",
    creator: "BeginnerGuide",
    region: "KR",
    type: "Educational",
    totalMatches: 345,
    recentMatchDate: "2024-02-08",
    minTier: "Bronze",
    isPublic: true
  },
  {
    id: 9,
    name: "EUW Elite",
    description: "유럽 서버의 엘리트 플레이어들이 모인 리그입니다. 국제적인 경쟁을 경험해보세요.",
    memberCount: 28,
    createdAt: "2024-01-25",
    creator: "EUWChampion",
    region: "EUW",
    type: "Professional",
    totalMatches: 56,
    recentMatchDate: "2024-02-07",
    minTier: "Grandmaster",
    isPublic: true
  },
  {
    id: 10,
    name: "Fun & Games",
    description: "진지하지 않고 재미있게 게임을 즐기고 싶은 분들을 위한 리그입니다. 스트레스 없이 즐겨보세요!",
    memberCount: 145,
    createdAt: "2024-02-05",
    creator: "FunGamer",
    region: "NA",
    type: "Casual",
    totalMatches: 189,
    recentMatchDate: "2024-02-06",
    minTier: "Bronze",
    isPublic: true
  }
];

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
              className="card-feature group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Crown className="h-5 w-5 text-primary" />
                  <span className={`px-2 py-1 text-xs rounded-full border ${getTypeColor(league.type)}`}>
                    {league.type}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{league.region}</span>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                {league.name}
              </h3>

              <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">
                {league.description}
              </p>

              <div className="space-y-2 mb-6">
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

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-muted-foreground">생성자: </span>
                  <span className="text-primary font-medium">{league.creator}</span>
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