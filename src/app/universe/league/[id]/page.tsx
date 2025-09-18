"use client";

import { useState, useEffect, useCallback } from "react";
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
  id: string;
  name: string;
  description: string;
  rules: string[];
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
    tier: string;
    positions: string[];
  } | null;
  region: string;
  type: string;
  accepting: boolean;
  user_join_request?: {
    id: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
  } | null;
  recent_members: Array<{
    id: string;
    user_id: string;
    nickname: string;
    tier: string;
    positions: string[];
    role: string;
    joined_at: string;
    avatar_url: string | null;
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
    message: "",
  });
  const [joinRequestStatus, setJoinRequestStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');

  // Fetch league data
  const fetchLeagueData = useCallback(async () => {
    if (!params?.id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/leagues/${params.id}`);
      const result = await response.json();

      if (result.success) {
        setLeagueData(result.data);
        // 가입 신청 상태 설정
        if (result.data.user_join_request) {
          setJoinRequestStatus(result.data.user_join_request.status);
        } else {
          setJoinRequestStatus('none');
        }
      } else {
        setError(result.error || "리그 정보를 불러올 수 없습니다");
      }
    } catch (err) {
      console.error("Error fetching league data:", err);
      setError("리그 정보를 불러오는 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  }, [params?.id]);

  useEffect(() => {
    fetchLeagueData();
  }, [fetchLeagueData]);

  // 페이지 포커스 시 상태 재확인
  useEffect(() => {
    const handleFocus = () => {
      if (params?.id && leagueData) {
        // 간단한 상태 재확인을 위해 리그 데이터 다시 로드
        fetchLeagueData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [params?.id, leagueData, fetchLeagueData]);

  // Handle join form submission
  const handleJoinSubmit = async () => {
    if (!joinForm.message.trim()) {
      toast({
        title: "입력 오류",
        description: "가입 메시지를 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    if (!params?.id) {
      toast({
        title: "오류",
        description: "리그 ID를 찾을 수 없습니다",
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
        setJoinForm({ message: "" });
        setJoinRequestStatus('pending'); // 로컬 상태 업데이트
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


  if (loading || !params?.id) {
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

  const getJoinButtonState = () => {
    if (joinRequestStatus === 'pending') {
      return {
        text: "신청 대기 중",
        disabled: true,
        variant: "secondary" as const,
        icon: <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      };
    }
    if (joinRequestStatus === 'approved') {
      return {
        text: "가입 완료",
        disabled: true,
        variant: "default" as const,
        icon: <UserPlus className="mr-2 h-4 w-4" />
      };
    }
    if (joinRequestStatus === 'rejected') {
      return {
        text: "다시 신청하기",
        disabled: false,
        variant: "hero" as const,
        icon: <UserPlus className="mr-2 h-4 w-4" />
      };
    }
    return {
      text: "가입 신청하기",
      disabled: false,
      variant: "hero" as const,
      icon: <UserPlus className="mr-2 h-4 w-4" />
    };
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
                  <span>책임자: {leagueData.owner?.nickname || "알 수 없음"}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-4">
              {(() => {
                const buttonState = getJoinButtonState();
                return (
                  <Button
                    variant={buttonState.variant}
                    size="lg"
                    onClick={() => setShowJoinForm(true)}
                    disabled={buttonState.disabled}
                    className="text-lg px-8 py-4"
                  >
                    {buttonState.icon}
                    {buttonState.text}
                  </Button>
                );
              })()}
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
                  src={member.avatar_url || "/default-avatar.png"}
                  alt={member.nickname}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full border-2 border-primary/30"
                />
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-foreground">
                      {member.nickname}
                    </span>
                    <RoleBadge
                      role={member.role as "owner" | "admin" | "member"}
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
                          | "Emerald"
                          | "Platinum"
                          | "Gold"
                          | "Silver"
                          | "Bronze"
                          | "Iron"
                          | "Unranked"
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
                    신청 메시지 (필수)
                  </label>
                  <textarea
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground"
                    rows={3}
                    placeholder="가입 신청 메시지를 입력하세요"
                    value={joinForm.message}
                    onChange={(e) =>
                      setJoinForm({ message: e.target.value })
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
