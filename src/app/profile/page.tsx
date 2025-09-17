"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  User,
  Edit,
  Save,
  Users,
  Calendar,
  LogOut,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TierBadge } from "@/components/ui/tier-badge";
import { PositionTags } from "@/components/ui/position-tags";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

interface UserProfile {
  id: string;
  nickname: string;
  tier: string;
  positions: string[];
  avatar_url: string | null;
  joinedAt: string;
  totalLeagues: number;
  totalMatches: number;
}

const tierOptions = [
  "Unranked",
  "Iron",
  "Bronze",
  "Silver",
  "Gold",
  "Platinum",
  "Emerald",
  "Diamond",
  "Master",
  "Grandmaster",
  "Challenger",
];

const positionOptions = ["Top", "Jungle", "Mid", "ADC", "Support"];

export default function UserProfile() {
  const { user, signOut, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [nicknameError, setNicknameError] = useState<string | null>(null);

  // 프로필 데이터 로드
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // 세션에서 액세스 토큰 가져오기
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const response = await fetch("/api/profile", {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        });
        const data = await response.json();

        if (data.success) {
          // 안전한 기본값으로 프로필 데이터 설정
          setProfile({
            ...data.data,
            positions: data.data.positions || [],
            tier: data.data.tier || "Unranked",
            nickname: data.data.nickname || "사용자",
            avatar_url: data.data.avatar_url || null,
          });
        } else {
          toast({
            title: "오류",
            description: data.error || "프로필을 불러올 수 없습니다",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "오류",
          description: "프로필을 불러오는 중 오류가 발생했습니다",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, toast]);

  const handleEditStart = () => {
    if (profile) {
      setEditingProfile({ ...profile });
      setIsEditing(true);
    }
  };

  const handleEditCancel = () => {
    setEditingProfile(null);
    setIsEditing(false);
    setNicknameError(null);
  };

  const handleSave = async () => {
    if (!editingProfile) return;

    // 닉네임 검증
    if (!editingProfile.nickname || editingProfile.nickname.trim().length < 2) {
      setNicknameError("닉네임은 2자 이상이어야 합니다");
      return;
    }

    if (editingProfile.nickname.length > 20) {
      setNicknameError("닉네임은 20자 이하여야 합니다");
      return;
    }

    setNicknameError(null);
    setIsSaving(true);

    try {
      // 세션에서 액세스 토큰 가져오기
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          nickname: editingProfile.nickname.trim(),
          tier: editingProfile.tier,
          positions: editingProfile.positions,
          avatar_url: editingProfile.avatar_url,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // 안전한 기본값으로 업데이트된 프로필 데이터 설정
        const updatedProfile = {
          ...data.data,
          positions: data.data.positions || [],
          tier: data.data.tier || "Unranked",
          nickname: data.data.nickname || "사용자",
          avatar_url: data.data.avatar_url || null,
        };
        
        setProfile(updatedProfile);
        // AuthContext의 프로필도 업데이트
        updateProfile(updatedProfile);
        setEditingProfile(null);
        setIsEditing(false);
        toast({
          title: "성공",
          description: "프로필이 업데이트되었습니다",
        });
      } else {
        if (data.error.includes("닉네임")) {
          setNicknameError(data.error);
        } else {
          toast({
            title: "오류",
            description: data.error || "프로필 업데이트에 실패했습니다",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "오류",
        description: "프로필 업데이트 중 오류가 발생했습니다",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "로그아웃",
        description: "성공적으로 로그아웃되었습니다",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "오류",
        description: "로그아웃 중 오류가 발생했습니다",
        variant: "destructive",
      });
    }
  };


  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">프로필을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 인증되지 않은 사용자
  if (!user || !profile) {
    return (
      <div className="min-h-screen py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">로그인이 필요합니다</h1>
          <p className="text-muted-foreground mb-6">
            프로필을 보려면 먼저 로그인해주세요
          </p>
          <Button onClick={() => (window.location.href = "/login")}>
            로그인하기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 text-glow">
              프로필 설정
            </h1>
            <p className="text-xl text-muted-foreground">
              내 정보를 관리하세요
            </p>
          </div>

          <div className="flex space-x-3">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleEditCancel}>
                  취소
                </Button>
                <Button variant="hero" onClick={handleSave} disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "저장 중..." : "저장하기"}
                </Button>
              </>
            ) : (
              <Button variant="hero" onClick={handleEditStart}>
                <Edit className="mr-2 h-4 w-4" />
                프로필 편집
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {/* Profile Section */}
          <div className="card-glass p-6">
            <div className="flex items-center space-x-2 mb-6">
              <User className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">프로필</h2>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              <div className="text-center md:text-left">
                <Image
                  src={
                    profile.avatar_url ||
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face"
                  }
                  alt={profile.nickname}
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-full border-4 border-primary/30 mx-auto md:mx-0 mb-4"
                />
              </div>

              <div className="flex-1 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    닉네임
                  </label>
                  {isEditing ? (
                    <div>
                      <Input
                        value={editingProfile?.nickname || ""}
                        onChange={(e) => {
                          setEditingProfile({
                            ...editingProfile!,
                            nickname: e.target.value,
                          });
                          setNicknameError(null);
                        }}
                        placeholder="닉네임을 입력하세요"
                        className={nicknameError ? "border-destructive" : ""}
                      />
                      {nicknameError && (
                        <p className="text-sm text-destructive mt-1">
                          {nicknameError}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-foreground text-lg">
                      {profile.nickname}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    현재 티어
                  </label>
                  {isEditing ? (
                    <select
                      value={editingProfile?.tier || ""}
                      onChange={(e) =>
                        setEditingProfile({
                          ...editingProfile!,
                          tier: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground"
                    >
                      {tierOptions.map((tier) => (
                        <option key={tier} value={tier}>
                          {tier}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <TierBadge
                      tier={
                        (profile.tier || "Unranked") as
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
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    선호 포지션
                  </label>
                  {isEditing ? (
                    <div className="space-y-2">
                      {positionOptions.map((position) => (
                        <label
                          key={position}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            checked={(editingProfile?.positions || []).includes(
                              position
                            )}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEditingProfile({
                                  ...editingProfile!,
                                  positions: [
                                    ...(editingProfile?.positions || []),
                                    position,
                                  ],
                                });
                              } else {
                                setEditingProfile({
                                  ...editingProfile!,
                                  positions: (
                                    editingProfile?.positions || []
                                  ).filter((p) => p !== position),
                                });
                              }
                            }}
                            className="rounded border-border"
                          />
                          <span className="text-foreground">{position}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <PositionTags positions={profile.positions || []} />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="card-glass p-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              계정 정보
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-sm text-muted-foreground mb-1">가입일</div>
                <div className="text-foreground">
                  {profile.joinedAt
                    ? new Date(profile.joinedAt).toLocaleDateString()
                    : "알 수 없음"}
                </div>
              </div>

              <div className="text-center">
                <Users className="h-8 w-8 text-accent mx-auto mb-2" />
                <div className="text-sm text-muted-foreground mb-1">
                  참여중인 리그
                </div>
                <div className="text-foreground">{profile.totalLeagues}개</div>
              </div>

              <div className="text-center">
                <div className="h-8 w-8 text-green-500 mx-auto mb-2 flex items-center justify-center">
                  <span className="text-lg">🎮</span>
                </div>
                <div className="text-sm text-muted-foreground mb-1">
                  생성한 매치
                </div>
                <div className="text-foreground">{profile.totalMatches}개</div>
              </div>
            </div>
          </div>

          {/* Account Management */}
          <div className="card-glass p-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              계정 관리
            </h2>

            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                로그아웃
              </Button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
