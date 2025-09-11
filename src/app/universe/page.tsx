"use client";

import { useState } from "react";
import { Search, Filter, Users, Calendar, Eye, Crown, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="리그 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-secondary border border-border rounded-lg text-foreground"
              >
                <option value="newest">최신순</option>
                <option value="members">멤버 많은 순</option>
              </select>
              
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
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

              <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{league.memberCount}명 참여중</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(league.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-muted-foreground">생성자: </span>
                  <span className="text-primary font-medium">{league.creator}</span>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/universe/${league.id}`}>
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
