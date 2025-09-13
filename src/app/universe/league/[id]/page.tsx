"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  Crown,
  Users,
  Calendar,
  MapPin,
  ArrowLeft,
  UserPlus,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/components/ui/role-badge";
import { TierBadge } from "@/components/ui/tier-badge";
import { PositionTags } from "@/components/ui/position-tags";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

// Types
interface LeagueDetails {
  id: number;
  name: string;
  description: string;
  rules: string[];
  member_count: number;
  created_at: string;
  owner: {
    id: string;
    name: string;
    avatar: string | null;
    tier: string;
    positions: string[];
  } | null;
  region: string;
  type: string;
  recent_members: Array<{
    id: string;
    name: string;
    tier: string;
    positions: string[];
    role: string;
    joinedAt: string;
    avatar: string | null;
    winRate: number;
    matchesPlayed: number;
  }>;
}

// 지역별 설명
const regionDescriptions = {
  NA: "북아메리카 지역을 위한 서버입니다.",
  KR: "대한민국 사용자를 위한 서버입니다.",
  JP: "일본 지역 사용자를 위한 서버입니다.",
  EUW: "서유럽 지역을 위한 서버입니다.",
  EUNE: "북유럽 및 동유럽 지역을 위한 서버입니다.",
  TR: "튀르키예 지역 사용자를 위한 서버입니다.",
  SEA: "동남아시아 지역을 위한 서버입니다.",
  CN: "중국 지역을 위한 서버입니다.",
};

export default function LeagueDetail() {
  const params = useParams();
  const { toast } = useToast();
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [leagueData, setLeagueData] = useState<LeagueDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinForm, setJoinForm] = useState({
    tier: "",
    positions: [] as string[],
    message: "",
  });

  // Fetch league data
  useEffect(() => {
    const fetchLeagueData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/leagues/${params.id}`);
        const result = await response.json();

        if (result.success) {
          setLeagueData(result.data);
        } else {
          setError(result.error || "리그 정보를 불러올 수 없습니다");
        }
      } catch {
        setError("리그 정보를 불러오는 중 오류가 발생했습니다");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchLeagueData();
    }
  }, [params.id]);

  // Handle join form submission
  const handleJoinSubmit = async () => {
    if (!joinForm.tier || joinForm.positions.length === 0) {
      toast({
        title: "입력 오류",
        description: "티어와 포지션을 모두 선택해주세요",
        variant: "destructive",
      });
      return;
    }

    try {
      setJoinLoading(true);
      const response = await fetch(`/api/leagues/${params.id}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(joinForm),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "가입 신청 완료",
          description: result.message || "가입 신청이 완료되었습니다",
        });
        setShowJoinForm(false);
        setJoinForm({ tier: "", positions: [], message: "" });
      } else {
        toast({
          title: "가입 신청 실패",
          description: result.error || "가입 신청 중 오류가 발생했습니다",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "가입 신청 실패",
        description: "가입 신청 중 오류가 발생했습니다",
        variant: "destructive",
      });
    } finally {
      setJoinLoading(false);
    }
  };

  // Handle position selection
  const handlePositionToggle = (position: string) => {
    setJoinForm((prev) => ({
      ...prev,
      positions: prev.positions.includes(position)
        ? prev.positions.filter((p) => p !== position)
        : [...prev.positions, position],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>리그 정보를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (error || !leagueData) {
    return (
      <div className="min-h-screen py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">오류 발생</h2>
          <p className="text-muted-foreground mb-6">
            {error || "리그 정보를 찾을 수 없습니다"}
          </p>
          <Button asChild>
            <Link href="/universe">리그 목록으로 돌아가기</Link>
          </Button>
        </div>
      </div>
    );
  }

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
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full border ${getTypeColor(
                    leagueData.type
                  )}`}
                >
                  {leagueData.type}
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center space-x-1 text-muted-foreground cursor-help">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{leagueData.region}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {
                          regionDescriptions[
                            leagueData.region as keyof typeof regionDescriptions
                          ]
                        }
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-glow">
                {leagueData.name}
              </h1>

              <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                {leagueData.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{leagueData.member_count}명 참여중</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    생성일:{" "}
                    {new Date(leagueData.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Crown className="h-4 w-4" />
                  <span>책임자: {leagueData.owner?.name || "Unknown"}</span>
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
            </div>
          </div>
        </div>

        {/* Rules */}
        <div className="card-glass p-6 mb-8">
          <h3 className="text-xl font-bold text-foreground mb-4">리그 규칙</h3>
          <ul className="space-y-2">
            {leagueData.rules && leagueData.rules.length > 0 ? (
              leagueData.rules.map((rule, index) => (
                <li
                  key={index}
                  className="flex items-start space-x-2 text-muted-foreground"
                >
                  <span className="text-primary mt-1">•</span>
                  <span>{rule}</span>
                </li>
              ))
            ) : (
              <li className="text-muted-foreground">등록된 규칙이 없습니다.</li>
            )}
          </ul>
        </div>

        {/* Operating Team */}
        <div className="card-glass p-6 mb-8">
          <h3 className="text-xl font-bold text-foreground mb-4">운영진</h3>

          <div className="space-y-4">
            {leagueData.recent_members.map((member) => (
              <div
                key={member.id}
                className="flex items-center space-x-4 p-4 bg-secondary/20 rounded-lg"
              >
                <Image
                  src={member.avatar || "/default-avatar.png"}
                  alt={member.name}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full border-2 border-primary/30"
                />
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-foreground">
                      {member.name}
                    </span>
                    <RoleBadge
                      role={member.role as "Owner" | "Admin" | "Member"}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <TierBadge
                      tier={
                        member.tier as
                          | "Challenger"
                          | "Grandmaster"
                          | "Master"
                          | "Diamond"
                          | "Platinum"
                          | "Gold"
                          | "Silver"
                          | "Bronze"
                      }
                    />
                    <PositionTags positions={member.positions} />
                  </div>
                </div>
              </div>
            ))}
            {leagueData.recent_members.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                운영진 정보가 없습니다.
              </p>
            )}
          </div>
        </div>

        {/* Join Application Modal */}
        {showJoinForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="card-glass p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                가입 신청
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    티어 선택 (필수)
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground"
                    value={joinForm.tier}
                    onChange={(e) =>
                      setJoinForm((prev) => ({ ...prev, tier: e.target.value }))
                    }
                  >
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
                    {["Top", "Jungle", "Mid", "ADC", "Support"].map(
                      (position) => (
                        <label
                          key={position}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            className="rounded border-border"
                            checked={joinForm.positions.includes(position)}
                            onChange={() => handlePositionToggle(position)}
                          />
                          <span className="text-foreground">{position}</span>
                        </label>
                      )
                    )}
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
                    value={joinForm.message}
                    onChange={(e) =>
                      setJoinForm((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowJoinForm(false)}
                  disabled={joinLoading}
                >
                  취소
                </Button>
                <Button
                  variant="hero"
                  onClick={handleJoinSubmit}
                  disabled={joinLoading}
                >
                  {joinLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      신청 중...
                    </>
                  ) : (
                    "가입 신청"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
