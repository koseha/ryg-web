"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Calendar,
  Eye,
  Crown,
  MapPin,
  Trophy,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LoginButton } from "@/components/auth/LoginButton";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

// API 타입 정의
interface League {
  id: string;
  name: string;
  description: string;
  member_count: number;
  match_count: number;
  last_matched_at: string | null;
  created_at: string;
  updated_at: string;
  owner_id: string;
  owner: {
    id: string;
    nickname: string;
    avatar_url: string | null;
  } | null;
  region: string;
  type: string;
  rules: string[];
  accepting: boolean;
}

interface ApiResponse {
  success: boolean;
  data: League[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
    totalPages: number;
  };
}

// API 함수
const fetchLeagues = async (params: {
  search?: string;
  sortBy?: string;
  region?: string;
  type?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse> => {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set("search", params.search);
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.region) searchParams.set("region", params.region);
  if (params.type) searchParams.set("type", params.type);
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());

  const response = await fetch(`/api/leagues?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch leagues");
  }

  return response.json();
};

// Mock data removed - now using API

// 지역별 설명
const regionDescriptions = {
  BR: "브라질 지역을 위한 서버입니다.",
  EUNE: "북유럽 및 동유럽 지역을 위한 서버입니다.",
  EUW: "서유럽 지역을 위한 서버입니다.",
  JP: "일본 지역 사용자를 위한 서버입니다.",
  LAN: "라틴 아메리카 북부 지역을 위한 서버입니다.",
  LAS: "라틴 아메리카 남부 지역을 위한 서버입니다.",
  NA: "북아메리카 지역을 위한 서버입니다.",
  OCE: "오세아니아 지역을 위한 서버입니다.",
  PBE: "공개 베타 환경 서버입니다.",
  RU: "러시아 지역을 위한 서버입니다.",
  TR: "튀르키예 지역 사용자를 위한 서버입니다.",
  KR: "대한민국 사용자를 위한 서버입니다.",
  PH: "필리핀 지역을 위한 서버입니다.",
  SG: "싱가포르 지역을 위한 서버입니다.",
  TH: "태국 지역을 위한 서버입니다.",
  TW: "대만 지역을 위한 서버입니다.",
  VN: "베트남 지역을 위한 서버입니다.",
};

export default function Universe() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [region] = useState("");
  const [type] = useState("");
  const [leagues, setLeagues] = useState<League[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 리그 데이터 로드
  const loadLeagues = useCallback(
    async (page = 1, reset = false) => {
      try {
        if (reset) {
          setIsLoading(true);
          setError(null);
        } else {
          setIsLoadingMore(true);
        }

        const response = await fetchLeagues({
          search: searchTerm || undefined,
          sortBy,
          region: region || undefined,
          type: type || undefined,
          page,
          limit: 12,
        });

        if (response.success) {
          if (reset) {
            setLeagues(response.data);
          } else {
            setLeagues((prev) => [...prev, ...response.data]);
          }
          setCurrentPage(response.pagination.page);
          setTotal(response.pagination.total);
          setHasMore(response.pagination.hasMore);
        } else {
          setError("리그를 불러오는데 실패했습니다.");
        }
      } catch (err) {
        setError("리그를 불러오는데 실패했습니다.");
        console.error("Error loading leagues:", err);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [searchTerm, sortBy, region, type]
  );

  // 초기 로드
  useEffect(() => {
    loadLeagues(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, sortBy, region, type]); // loadLeagues를 dependencies에서 제외하여 무한 루프 방지

  const handleLoadMore = async () => {
    if (hasMore && !isLoadingMore) {
      await loadLeagues(currentPage + 1, false);
    }
  };

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
                  { value: "members", label: "멤버 많은 순" },
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
            {leagues.length}개 표시 중 (총 {total}개)
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">리그를 불러오는 중...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => loadLeagues(1, true)} variant="outline">
              다시 시도
            </Button>
          </div>
        )}

        {/* League Cards */}
        {!isLoading && !error && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leagues.map((league, index) => (
              <div
                key={league.id}
                className="card-feature group animate-fade-in flex flex-col h-[320px]"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Crown className="h-5 w-5 text-primary" />
                    <span
                      className={`px-2 py-1 text-xs rounded-full border ${getTypeColor(
                        league.type
                      )}`}
                    >
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
                        <p>
                          {
                            regionDescriptions[
                              league.region as keyof typeof regionDescriptions
                            ]
                          }
                        </p>
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
                      <span>{league.member_count}명 참여중</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Trophy className="h-4 w-4" />
                      <span>{league.match_count}경기 진행됨</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        생성일:{" "}
                        {new Date(league.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        최근 매치: {league.last_matched_at 
                          ? new Date(league.last_matched_at).toLocaleDateString()
                          : "없음"
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer - Fixed at bottom */}
                <div className="flex items-center justify-between mt-auto">
                  <div className="text-sm">
                    <span className="text-muted-foreground">책임자: </span>
                    <span className="text-primary font-medium">
                      {league.owner?.nickname || "알 수 없음"}
                    </span>
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
        )}

        {/* Empty State */}
        {!isLoading && !error && leagues.length === 0 && (
          <div className="text-center py-16">
            <Crown className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-bold mb-2 text-muted-foreground">
              리그를 찾을 수 없습니다
            </h3>
            <p className="text-muted-foreground mb-6">
              {user
                ? "검색어를 다시 확인하거나 새 리그를 만들어보세요"
                : "로그인하여 리그를 만들거나 참여해보세요"}
            </p>
            {user ? (
              <Button asChild variant="hero">
                <Link href="/leagues">리그 만들기</Link>
              </Button>
            ) : (
              <LoginButton variant="hero" className="px-8 py-3">
                로그인
              </LoginButton>
            )}
          </div>
        )}

        {/* Load More Button */}
        {!isLoading && !error && hasMore && (
          <div className="text-center mt-12">
            <Button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              variant="outline"
              size="lg"
              className="px-8 py-3"
            >
              {isLoadingMore ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  로딩 중...
                </>
              ) : (
                <>더보기</>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
