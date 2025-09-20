"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Crown,
  Users,
  Calendar,
  Trophy,
  Play,
  MoreVertical,
  Save,
  Trash2,
  AlertTriangle,
  Plus,
  Target,
  Eye,
  LogOut,
  Loader2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/components/ui/role-badge";
import { TierBadge } from "@/components/ui/tier-badge";
import { PositionTags } from "@/components/ui/position-tags";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import { CopyButton } from "@/components/ui/copy-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// 타입 정의
interface LeagueMember {
  id: string;
  user_id: string;
  nickname: string;
  avatar_url: string | null;
  tier: string;
  positions: string[];
  role: string;
  joined_at: string;
}

interface JoinRequest {
  id: string;
  user_id: string;
  nickname: string;
  avatar_url: string | null;
  tier: string;
  positions: string[];
  message: string;
  status: string;
  applied_at: string;
}

interface Match {
  id: string;
  title: string;
  description: string | null;
  status: string;
  code: string | null;
  created_at: string;
  completed_at: string | null;
  created_by: string;
}

interface LeagueSettings {
  id: string;
  name: string;
  description: string | null;
  rules: string[];
  accepting: boolean;
  region: string;
  type: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  user_role: string;
  // 통계 데이터 추가
  member_count: number;
  match_count: number;
  last_matched_at: string | null;
}

interface LeagueActivity {
  id: string;
  activity_type: string;
  title: string;
  description: string;
  target_id: string | null;
  target_type: string | null;
  metadata: Record<string, unknown>;
  is_visible: boolean;
  created_at: string;
}

interface UserProfile {
  id: string;
  nickname: string;
  avatar_url: string | null;
  tier: string;
  positions: string[];
  joined_at: string;
  total_leagues: number;
  total_matches: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

const roleOptions = [
  { value: "all", label: "모든 역할" },
  { value: "owner", label: "책임자" },
  { value: "admin", label: "운영진" },
  { value: "member", label: "멤버" },
];

const tierOptions = [
  { value: "all", label: "모든 티어" },
  { value: "Challenger", label: "챌린저" },
  { value: "Grandmaster", label: "그랜드마스터" },
  { value: "Master", label: "마스터" },
  { value: "Diamond", label: "다이아몬드" },
  { value: "Emerald", label: "에메랄드" },
  { value: "Platinum", label: "플래티넘" },
  { value: "Gold", label: "골드" },
  { value: "Silver", label: "실버" },
  { value: "Bronze", label: "브론즈" },
  { value: "Iron", label: "아이언" },
  { value: "Unranked", label: "언랭크" },
];

const positionOptions = [
  { value: "all", label: "모든 포지션" },
  { value: "Top", label: "탑" },
  { value: "Jungle", label: "정글" },
  { value: "Mid", label: "미드" },
  { value: "ADC", label: "원딜" },
  { value: "Support", label: "서포터" },
];

const statusOptions = [
  { value: "all", label: "모든 상태" },
  { value: "active", label: "진행중" },
  { value: "completed", label: "완료" },
];

export default function LeaguePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const leagueId = params.id;

  // 상태 관리
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leagueSettings, setLeagueSettings] = useState<LeagueSettings | null>(
    null
  );
  const [members, setMembers] = useState<LeagueMember[]>([]);
  const [membersPagination, setMembersPagination] =
    useState<PaginationInfo | null>(null);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersStats, setMembersStats] = useState<{
    totalMembers: number;
    adminCount: number;
  } | null>(null);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [activities, setActivities] = useState<LeagueActivity[]>([]);

  // 프로필 모달 상태
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(
    null
  );
  const [profileLoading, setProfileLoading] = useState(false);

  // 필터 상태
  const [roleFilter, setRoleFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // 데이터 로딩 함수들
  const fetchLeagueSettings = useCallback(async () => {
    try {
      const response = await fetch(`/api/leagues/${leagueId}/settings`);
      const result = await response.json();

      if (result.success) {
        setLeagueSettings(result.data);
        setRules(result.data.rules || []);
      } else {
        setError(result.error);
      }
    } catch {
      setError("리그 설정을 불러오는데 실패했습니다");
    }
  }, [leagueId]);

  const fetchMembers = useCallback(
    async (
      page: number = 1,
      append: boolean = false,
      filters?: { role?: string; tier?: string; position?: string }
    ) => {
      try {
        setMembersLoading(true);

        // 필터 파라미터 구성
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "10",
        });

        if (filters?.role && filters.role !== "all") {
          params.append("role", filters.role);
        }
        if (filters?.tier && filters.tier !== "all") {
          params.append("tier", filters.tier);
        }
        if (filters?.position && filters.position !== "all") {
          params.append("position", filters.position);
        }

        const response = await fetch(
          `/api/leagues/${leagueId}/members?${params.toString()}`
        );
        const result = await response.json();

        if (result.success) {
          if (append) {
            // 기존 데이터에 추가
            setMembers((prev) => [...prev, ...result.data.members]);
          } else {
            // 새로 로드
            setMembers(result.data.members);
          }
          setMembersPagination(result.data.pagination);
          setMembersStats(result.data.stats);
        } else {
          console.error("Failed to fetch members:", result.error);
        }
      } catch (err) {
        console.error("Error fetching members:", err);
      } finally {
        setMembersLoading(false);
      }
    },
    [leagueId]
  );

  // 더보기 버튼 핸들러
  const loadMoreMembers = useCallback(() => {
    if (membersPagination?.hasMore && !membersLoading) {
      fetchMembers(membersPagination.page + 1, true, {
        role: roleFilter,
        tier: tierFilter,
        position: positionFilter,
      });
    }
  }, [
    membersPagination,
    membersLoading,
    fetchMembers,
    roleFilter,
    tierFilter,
    positionFilter,
  ]);

  const fetchJoinRequests = useCallback(async () => {
    try {
      const response = await fetch(`/api/leagues/${leagueId}/join-requests`);
      const result = await response.json();

      if (result.success) {
        setJoinRequests(result.data);
      } else {
        console.error("Failed to fetch join requests:", result.error);
      }
    } catch (err) {
      console.error("Error fetching join requests:", err);
    }
  }, [leagueId]);

  const fetchMatches = useCallback(async () => {
    try {
      const response = await fetch(`/api/leagues/${leagueId}/matches`);
      const result = await response.json();

      if (result.success) {
        setMatches(result.data);
      } else {
        console.error("Failed to fetch matches:", result.error);
      }
    } catch (err) {
      console.error("Error fetching matches:", err);
    }
  }, [leagueId]);

  const fetchActivities = useCallback(async () => {
    try {
      const response = await fetch(`/api/leagues/${leagueId}/activities`);
      const result = await response.json();

      if (result.success) {
        setActivities(result.data);
      } else {
        console.error("Failed to fetch activities:", result.error);
      }
    } catch (err) {
      console.error("Error fetching activities:", err);
    }
  }, [leagueId]);

  // 프로필 조회 함수
  const fetchUserProfile = useCallback(
    async (userId: string) => {
      try {
        setProfileLoading(true);
        const response = await fetch(`/api/profiles/${userId}`);
        const result = await response.json();

        if (result.success) {
          setSelectedProfile(result.data);
          setShowProfileModal(true);
        } else {
          toast({
            title: "프로필 조회 실패",
            description: result.error,
            variant: "destructive",
            duration: 3000,
          });
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        toast({
          title: "오류 발생",
          description: "프로필을 불러오는 중 오류가 발생했습니다",
          variant: "destructive",
          duration: 3000,
        });
      } finally {
        setProfileLoading(false);
      }
    },
    [toast]
  );

  // 초기 데이터 로딩
  useEffect(() => {
    const loadData = async () => {
      if (!user || !leagueId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        await Promise.all([
          fetchLeagueSettings(),
          fetchMembers(),
          fetchJoinRequests(),
          fetchMatches(),
          fetchActivities(),
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, leagueId]); // fetch 함수들을 dependencies에서 제외하여 무한 루프 방지

  // 공유 링크 생성
  useEffect(() => {
    if (typeof window !== "undefined" && leagueId) {
      setShareLink(`${window.location.origin}/universe/league/${leagueId}`);
    }
  }, [leagueId]);

  // 필터 변경 시 멤버 목록 다시 로드
  useEffect(() => {
    if (leagueId) {
      fetchMembers(1, false, {
        role: roleFilter,
        tier: tierFilter,
        position: positionFilter,
      });
    }
  }, [roleFilter, tierFilter, positionFilter, leagueId, fetchMembers]);

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

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case "member_joined":
        return { icon: "🎉", color: "bg-green-500" };
      case "league_created":
        return { icon: "🔥", color: "bg-orange-500" };
      default:
        return { icon: "📝", color: "bg-blue-500" };
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "방금 전";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)}일 전`;
    return date.toLocaleDateString();
  };

  // State for different tabs
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newMatchTitle, setNewMatchTitle] = useState("");
  const [newMatchDescription, setNewMatchDescription] = useState("");
  const [isCreatingMatch, setIsCreatingMatch] = useState(false);
  const [rules, setRules] = useState<string[]>([]);
  const [newRule, setNewRule] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // API에서 이미 필터링된 데이터를 사용하므로 별도 필터링 불필요
  const filteredMembers = members;

  const filteredMatches = useMemo(() => {
    return matches
      .filter((match) => {
        const matchesStatus =
          statusFilter === "all" || match.status === statusFilter;
        return matchesStatus;
      })
      .sort((a, b) => {
        // 상태별 정렬: 진행 중 > 완료
        const statusOrder = { active: 0, completed: 1 };
        return (
          statusOrder[a.status as keyof typeof statusOrder] -
          statusOrder[b.status as keyof typeof statusOrder]
        );
      });
  }, [matches, statusFilter]);

  // Helper functions

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-500 border-green-500/30";
      case "completed":
        return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      default:
        return "bg-secondary/20 text-secondary-foreground border-secondary/30";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "planned":
        return "생성됨";
      case "completed":
        return "완료";
      default:
        return "알 수 없음";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return Play;
      case "completed":
        return Trophy;
      default:
        return Target;
    }
  };

  const addRule = () => {
    if (newRule.trim()) {
      setRules([...rules, newRule.trim()]);
      setNewRule("");
    }
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleCreateMatch = async () => {
    if (!newMatchTitle.trim()) {
      toast({
        title: "입력 오류",
        description: "매치 제목을 입력해주세요",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsCreatingMatch(true);

    try {
      const response = await fetch(`/api/leagues/${leagueId}/matches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newMatchTitle,
          description: newMatchDescription || null,
          region: "NA",
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "매치 생성 완료",
          description: result.message,
          duration: 3000,
        });
        setShowCreateForm(false);
        setNewMatchTitle("");
        setNewMatchDescription("");
        fetchMatches(); // 매치 목록 새로고침
      } else {
        toast({
          title: "매치 생성 실패",
          description: result.error,
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch {
      toast({
        title: "오류 발생",
        description: "매치 생성 중 오류가 발생했습니다",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsCreatingMatch(false);
    }
  };

  const handleSave = async () => {
    if (!leagueSettings) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/leagues/${leagueId}/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: leagueSettings.name,
          description: leagueSettings.description,
          rules: rules,
          accepting: leagueSettings.accepting,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "설정 저장 완료",
          description: result.message,
          duration: 3000,
        });
        fetchLeagueSettings(); // 설정 새로고침
      } else {
        toast({
          title: "설정 저장 실패",
          description: result.error,
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch {
      toast({
        title: "오류 발생",
        description: "설정 저장 중 오류가 발생했습니다",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLeague = async () => {
    try {
      const response = await fetch(`/api/leagues/${leagueId}/settings`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "리그 삭제 완료",
          description: result.message,
          duration: 3000,
        });
        router.push("/leagues"); // 리그 목록으로 이동
      } else {
        toast({
          title: "리그 삭제 실패",
          description: result.error,
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch {
      toast({
        title: "오류 발생",
        description: "리그 삭제 중 오류가 발생했습니다",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const handleLeaveLeague = async () => {
    try {
      setLeaving(true);
      const response = await fetch(`/api/leagues/${leagueId}/leave`, {
        method: "POST",
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "리그 탈퇴 완료",
          description: result.message,
          duration: 3000,
        });
        router.push("/leagues"); // 리그 목록으로 이동
      } else {
        toast({
          title: "리그 탈퇴 실패",
          description: result.error,
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch {
      toast({
        title: "오류 발생",
        description: "리그 탈퇴 중 오류가 발생했습니다",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLeaving(false);
      setShowLeaveDialog(false);
    }
  };

  const handleRoleChange = async (
    memberId: string,
    newRole: "admin" | "member"
  ) => {
    try {
      const response = await fetch(`/api/leagues/${leagueId}/members`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberId,
          newRole,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "역할 변경 완료",
          description: result.message,
          duration: 3000,
        });
        fetchMembers(); // 멤버 목록 새로고침
      } else {
        toast({
          title: "역할 변경 실패",
          description: result.error,
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch {
      toast({
        title: "오류 발생",
        description: "역할 변경 중 오류가 발생했습니다",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const handleTransferOwnership = (adminId: string) => {
    setSelectedAdminId(adminId);
    setShowTransferDialog(true);
  };

  const handleJoinRequest = async (
    requestId: string,
    action: "approve" | "reject"
  ) => {
    try {
      const response = await fetch(`/api/leagues/${leagueId}/join-requests`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId,
          action,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: action === "approve" ? "가입 승인 완료" : "가입 거부 완료",
          description: result.message,
          duration: 3000,
        });
        fetchJoinRequests(); // 가입 신청 목록 새로고침
        fetchMembers(); // 멤버 목록 새로고침
      } else {
        toast({
          title: "처리 실패",
          description: result.error,
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch {
      toast({
        title: "오류 발생",
        description: "가입 신청 처리 중 오류가 발생했습니다",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const response = await fetch(
        `/api/leagues/${leagueId}/members?memberId=${memberId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (result.success) {
        toast({
          title: "멤버 제거 완료",
          description: result.message,
          duration: 3000,
        });
        fetchMembers(); // 멤버 목록 새로고침
      } else {
        toast({
          title: "멤버 제거 실패",
          description: result.error,
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch {
      toast({
        title: "오류 발생",
        description: "멤버 제거 중 오류가 발생했습니다",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const confirmTransferOwnership = async () => {
    if (!selectedAdminId) return;

    try {
      const response = await fetch(
        `/api/leagues/${leagueId}/transfer-ownership`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newOwnerId: selectedAdminId,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast({
          title: "책임자 위임 완료",
          description: result.message,
          duration: 3000,
        });

        // 데이터 새로고침
        await Promise.all([
          fetchLeagueSettings(),
          fetchMembers(),
          fetchActivities(),
        ]);
      } else {
        toast({
          title: "책임자 위임 실패",
          description: result.error,
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Error transferring ownership:", error);
      toast({
        title: "오류 발생",
        description: "책임자 위임 중 오류가 발생했습니다",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setShowTransferDialog(false);
      setSelectedAdminId(null);
    }
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">리그 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              오류가 발생했습니다
            </h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>다시 시도</Button>
          </div>
        </div>
      </div>
    );
  }

  // 리그 설정이 없는 경우
  if (!leagueSettings) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              리그를 찾을 수 없습니다
            </h1>
            <p className="text-muted-foreground mb-6">
              요청하신 리그가 존재하지 않거나 접근 권한이 없습니다.
            </p>
            <Button asChild>
              <Link href="/leagues">내 리그로 돌아가기</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Crown className="h-8 w-8 text-primary flex-shrink-0" />
            <RoleBadge
              role={
                leagueSettings.user_role.toLowerCase() as
                  | "owner"
                  | "admin"
                  | "member"
              }
            />
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full border ${getTypeColor(
                leagueSettings.type
              )}`}
            >
              {leagueSettings.type}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-glow break-words">
              {leagueSettings.name}
            </h1>
            <CopyButton
              text={shareLink}
              className="self-start sm:self-center"
              tooltipText="리그 소개 링크"
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-8 h-auto">
            <TabsTrigger
              value="overview"
              className="text-xs sm:text-sm py-2 px-3"
            >
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">개요</span>
            </TabsTrigger>
            <TabsTrigger
              value="members"
              className="text-xs sm:text-sm py-2 px-3"
            >
              <span className="hidden sm:inline">Members</span>
              <span className="sm:hidden">멤버</span>
            </TabsTrigger>
            <TabsTrigger
              value="matches"
              className="text-xs sm:text-sm py-2 px-3"
            >
              <span className="hidden sm:inline">Matches</span>
              <span className="sm:hidden">매치</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="text-xs sm:text-sm py-2 px-3"
            >
              <span className="hidden sm:inline">Settings</span>
              <span className="sm:hidden">설정</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
              <div className="card-glass p-4 sm:p-6 text-center">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary mx-auto mb-3" />
                <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                  {leagueSettings?.member_count || 0}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  총 멤버 수
                </div>
              </div>

              <div className="card-glass p-4 sm:p-6 text-center">
                <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-accent mx-auto mb-3" />
                <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                  {leagueSettings?.match_count || 0}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  생성된 매치 수
                </div>
              </div>

              <div className="card-glass p-4 sm:p-6 text-center sm:col-span-2 lg:col-span-1">
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 mx-auto mb-3" />
                <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                  {joinRequests.length}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  대기 중인 신청
                </div>
              </div>
            </div>

            {/* League Information */}
            <div className="card-glass p-6 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                리그 정보
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    설명
                  </h3>
                  <p className="text-muted-foreground">
                    {leagueSettings.description || "설명이 없습니다"}
                  </p>
                </div>

                {/* Rules */}
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-3">
                    리그 규칙
                  </h3>
                  {leagueSettings.rules && leagueSettings.rules.length > 0 ? (
                    <ul className="space-y-2">
                      {leagueSettings.rules.map((rule, index) => (
                        <li
                          key={index}
                          className="flex items-start space-x-2 text-muted-foreground"
                        >
                          <span className="text-primary mt-1">•</span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">
                      설정된 규칙이 없습니다
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      생성일
                    </h3>
                    <p className="text-muted-foreground">
                      {new Date(leagueSettings.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      지역
                    </h3>
                    <p className="text-muted-foreground">
                      {leagueSettings.region}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="card-glass p-6 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                최근 활동 피드
              </h2>

              <div className="space-y-4">
                {activities.length > 0 ? (
                  activities.map((activity) => {
                    const { color } = getActivityIcon(activity.activity_type);
                    return (
                      <div
                        key={activity.id}
                        className="flex items-center space-x-3 p-3 bg-secondary/20 rounded-lg"
                      >
                        <div className={`w-2 h-2 ${color} rounded-full`}></div>
                        <div className="flex-1">
                          <p className="text-foreground">{activity.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {activity.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTimeAgo(activity.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      아직 활동이 없습니다
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      리그 활동이 시작되면 여기에 표시됩니다
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="members">
            <div className="space-y-6">
              {/* Pending Applications */}
              {joinRequests.length > 0 && (
                <div className="card-glass p-6">
                  <h2 className="text-2xl font-bold text-foreground mb-6">
                    가입 신청 대기중
                  </h2>

                  <div className="space-y-4">
                    {joinRequests.map((request) => (
                      <div
                        key={request.id}
                        className="p-4 bg-secondary/20 rounded-lg"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div className="flex items-start space-x-4">
                            <Image
                              src={request.avatar_url || "/default-avatar.png"}
                              alt={request.nickname}
                              width={48}
                              height={48}
                              className="w-12 h-12 rounded-full flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                <h3 className="text-lg font-medium text-foreground">
                                  {request.nickname}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                  <TierBadge
                                    tier={
                                      request.tier as
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
                                  <PositionTags positions={request.positions} />
                                </div>
                              </div>
                              <p className="text-sm text-foreground mb-3 break-words">
                                {request.message}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                신청일:{" "}
                                {new Date(
                                  request.applied_at
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2 lg:flex-shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full sm:w-auto"
                              onClick={() => fetchUserProfile(request.user_id)}
                              disabled={profileLoading}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              프로필 보기
                            </Button>
                            {leagueSettings.user_role === "owner" ||
                            leagueSettings.user_role === "admin" ? (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 sm:flex-none"
                                  onClick={() =>
                                    handleJoinRequest(request.id, "approve")
                                  }
                                >
                                  승인
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 sm:flex-none"
                                  onClick={() =>
                                    handleJoinRequest(request.id, "reject")
                                  }
                                >
                                  거절
                                </Button>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Members Stats */}
              {membersStats && (
                <div className="card-glass p-6 mb-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    멤버 현황
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-4 bg-secondary/20 rounded-lg">
                      <Users className="h-8 w-8 text-primary" />
                      <div>
                        <div className="text-2xl font-bold text-foreground">
                          {membersStats.totalMembers}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          총 멤버 수
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-4 bg-secondary/20 rounded-lg">
                      <Crown className="h-8 w-8 text-yellow-500" />
                      <div>
                        <div className="text-2xl font-bold text-foreground">
                          {membersStats.adminCount}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          운영진 수
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Members List */}
              <div className="card-glass p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">
                    멤버 목록
                  </h2>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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

                {/* Members Grid */}
                {filteredMembers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMembers.map((member) => (
                      <div
                        key={member.id}
                        className="p-4 bg-secondary/20 rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <Image
                              src={member.avatar_url || "/default-avatar.png"}
                              alt={member.nickname}
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-full flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <h3 className="font-medium text-foreground truncate">
                                {member.nickname}
                              </h3>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => fetchUserProfile(member.user_id)}
                              disabled={profileLoading}
                              className="flex-shrink-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="flex-shrink-0"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>프로필 보기</DropdownMenuItem>
                                {leagueSettings.user_role === "owner" && (
                                  <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
                                      역할 변경
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleRoleChange(member.id, "admin")
                                        }
                                        disabled={member.role === "owner"}
                                      >
                                        운영자
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleRoleChange(member.id, "member")
                                        }
                                        disabled={member.role === "owner"}
                                      >
                                        멤버
                                      </DropdownMenuItem>
                                    </DropdownMenuSubContent>
                                  </DropdownMenuSub>
                                )}
                                {(leagueSettings.user_role === "owner" ||
                                  leagueSettings.user_role === "admin") &&
                                  member.role !== "owner" && (
                                    <DropdownMenuItem
                                      className="text-red-500"
                                      onClick={() =>
                                        handleRemoveMember(member.id)
                                      }
                                    >
                                      멤버 제거
                                    </DropdownMenuItem>
                                  )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
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
                            <RoleBadge
                              role={
                                member.role.toLowerCase() as
                                  | "owner"
                                  | "admin"
                                  | "member"
                              }
                            />
                          </div>
                          <PositionTags positions={member.positions} />
                          <p className="text-xs text-muted-foreground">
                            가입일:{" "}
                            {new Date(member.joined_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      멤버가 없습니다
                    </h3>
                    <p className="text-muted-foreground">필터를 조정해보세요</p>
                  </div>
                )}

                {/* 더보기 버튼 */}
                {membersPagination?.hasMore && (
                  <div className="flex justify-center mt-6">
                    <Button
                      onClick={loadMoreMembers}
                      disabled={membersLoading}
                      variant="outline"
                    >
                      {membersLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                          로딩 중...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          더보기 ({membersPagination.total - members.length}명
                          더)
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="matches">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">
                  매치 관리
                </h2>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />새 매치 생성
                </Button>
              </div>

              {/* Create Match Form */}
              {showCreateForm && (
                <div className="card-glass p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      새 매치 생성
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      1. 매치 생성 시 Riot API를 통해 토너먼트 코드가 자동으로
                      발급됩니다.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      2. 생성 후 일주일 내에 경기가 진행되지 않으면 매치가
                      자동으로 삭제됩니다.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      3. 코드를 참가자들에게 공유하여 게임을 진행해주세요.
                    </p>
                    {isCreatingMatch && (
                      <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>
                          Riot API를 통해 토너먼트 코드를 생성하고 있습니다...
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        매치 제목
                      </label>
                      <Input
                        value={newMatchTitle}
                        onChange={(e) => setNewMatchTitle(e.target.value)}
                        placeholder="매치 제목을 입력하세요"
                        disabled={isCreatingMatch}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        매치 설명 (선택사항)
                      </label>
                      <Input
                        value={newMatchDescription}
                        onChange={(e) => setNewMatchDescription(e.target.value)}
                        placeholder="매치 설명을 입력하세요"
                        disabled={isCreatingMatch}
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        onClick={handleCreateMatch}
                        disabled={isCreatingMatch}
                      >
                        {isCreatingMatch ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            생성 중...
                          </>
                        ) : (
                          "매치 생성"
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowCreateForm(false);
                          setNewMatchTitle("");
                          setNewMatchDescription("");
                        }}
                        disabled={isCreatingMatch}
                      >
                        취소
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Filters */}
              <div className="flex flex-wrap gap-4">
                <FilterDropdown
                  options={statusOptions}
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                  placeholder="상태"
                />
              </div>

              {/* Matches List */}
              {filteredMatches.length > 0 ? (
                <div className="grid gap-4">
                  {filteredMatches.map((match) => {
                    const StatusIcon = getStatusIcon(match.status);
                    return (
                      <div key={match.id} className="card-glass p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <StatusIcon className="h-5 w-5 text-primary" />
                              <h3 className="text-lg font-medium text-foreground">
                                {match.title}
                              </h3>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                  match.status
                                )}`}
                              >
                                {getStatusLabel(match.status)}
                              </span>
                            </div>

                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                              <span>생성자: {match.created_by}</span>
                              <span>
                                생성일:{" "}
                                {new Date(
                                  match.created_at
                                ).toLocaleDateString()}
                              </span>
                            </div>

                            {match.description && (
                              <p className="text-sm text-foreground mb-3">
                                {match.description}
                              </p>
                            )}

                            <div className="flex items-center space-x-4 text-sm">
                              <span className="text-muted-foreground">
                                {match.status === "completed" &&
                                match.completed_at
                                  ? `완료일: ${new Date(
                                      match.completed_at
                                    ).toLocaleDateString()}`
                                  : "상태: 생성됨"}
                              </span>
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            {match.code && (
                              <CopyButton text={match.code} size="sm" />
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>상세 보기</DropdownMenuItem>
                                <DropdownMenuItem>편집</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-500">
                                  삭제
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    매치가 없습니다
                  </h3>
                  <p className="text-muted-foreground">
                    아직 생성된 매치가 없습니다
                  </p>
                  <p className="text-sm text-muted-foreground">
                    첫 매치를 생성해보세요
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings">
            {leagueSettings.user_role === "owner" ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-foreground">
                    리그 설정
                  </h2>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        저장 중...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        저장
                      </>
                    )}
                  </Button>
                </div>

                {/* Basic Information */}
                <div className="card-glass p-6">
                  <h3 className="text-xl font-bold text-foreground mb-4">
                    기본 정보
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        리그 이름
                      </label>
                      <Input
                        value={leagueSettings?.name || ""}
                        onChange={(e) =>
                          setLeagueSettings((prev) =>
                            prev ? { ...prev, name: e.target.value } : null
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        설명
                      </label>
                      <Textarea
                        value={leagueSettings?.description || ""}
                        onChange={(e) =>
                          setLeagueSettings((prev) =>
                            prev
                              ? { ...prev, description: e.target.value }
                              : null
                          )
                        }
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* Rules */}
                <div className="card-glass p-6">
                  <h3 className="text-xl font-bold text-foreground mb-4">
                    규칙
                  </h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      {rules.map((rule, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <span className="text-sm text-foreground flex-1">
                            {rule}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeRule(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="flex space-x-2">
                      <Input
                        value={newRule}
                        onChange={(e) => setNewRule(e.target.value)}
                        placeholder="새 규칙을 입력하세요"
                        onKeyPress={(e) => e.key === "Enter" && addRule()}
                      />
                      <Button onClick={addRule} variant="outline">
                        추가
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Operating Team */}
                <div className="card-glass p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-foreground">
                      운영진
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {members
                      .filter((member) =>
                        ["owner", "admin"].includes(member.role)
                      )
                      .map((admin) => (
                        <div
                          key={admin.id}
                          className="flex items-center space-x-3 p-3 bg-secondary/20 rounded-lg"
                        >
                          <Image
                            src={admin.avatar_url || "/default-avatar.png"}
                            alt={admin.nickname}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">
                              {admin.nickname}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {admin.tier} • {admin.positions.join(", ")}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RoleBadge
                              role={
                                admin.role.toLowerCase() as
                                  | "owner"
                                  | "admin"
                                  | "member"
                              }
                            />
                            {admin.role === "admin" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleTransferOwnership(admin.user_id)
                                }
                                className="text-orange-500 border-orange-500 hover:bg-orange-500/10"
                              >
                                <Crown className="h-4 w-4 mr-1" />
                                책임자 위임
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Owner Leave Section */}
                <div className="card-glass p-6 border-orange-500/20">
                  <h3 className="text-xl font-bold text-orange-500 mb-4">
                    리그 탈퇴
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-orange-500/10 rounded-lg">
                      <div>
                        <h4 className="font-medium text-foreground">
                          책임자 탈퇴
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          책임자는 먼저 다른 운영진에게 책임자를 위임한 후
                          탈퇴할 수 있습니다.
                        </p>
                      </div>

                      <AlertDialog
                        open={showLeaveDialog}
                        onOpenChange={setShowLeaveDialog}
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="text-orange-500 border-orange-500 hover:bg-orange-500/10"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            리그 탈퇴
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center space-x-2">
                              <LogOut className="h-5 w-5 text-orange-500" />
                              <span>책임자 탈퇴 확인</span>
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              책임자는 먼저 다른 운영진에게 책임자를 위임한 후
                              탈퇴할 수 있습니다.
                              <br />
                              <br />
                              <strong>탈퇴 조건:</strong>
                              <br />• 다른 운영진(admin)이 있어야 합니다
                              <br />• 먼저 책임자를 다른 운영진에게 위임해야
                              합니다
                              <br />• 위임 후에는 일반 운영진이 되어 탈퇴할 수
                              있습니다
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>취소</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                setShowLeaveDialog(false);
                                toast({
                                  title: "위임 필요",
                                  description:
                                    "먼저 다른 운영진에게 책임자를 위임해주세요.",
                                  variant: "destructive",
                                  duration: 5000,
                                });
                              }}
                              className="bg-orange-500 hover:bg-orange-600"
                            >
                              확인
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="card-glass p-6 border-red-500/20">
                  <h3 className="text-xl font-bold text-red-500 mb-4">
                    위험 구역
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg">
                      <div>
                        <h4 className="font-medium text-foreground">
                          리그 삭제
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          리그를 삭제하면 모든 데이터가 영구적으로 삭제됩니다.
                        </p>
                      </div>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            리그 삭제
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center space-x-2">
                              <AlertTriangle className="h-5 w-5 text-red-500" />
                              <span>리그 삭제 확인</span>
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              정말로 이 리그를 삭제하시겠습니까? 이 작업은
                              되돌릴 수 없으며, 모든 멤버, 매치, 설정이
                              영구적으로 삭제됩니다.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>취소</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteLeague}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              삭제
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center py-16">
                  <Crown className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-2xl font-bold mb-2 text-muted-foreground">
                    접근 권한이 없습니다
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    리그 설정은 책임자(Owner)만 접근할 수 있습니다.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    리그 설정이 필요하시면 책임자에게 문의하세요.
                  </p>
                </div>

                {/* 리그 탈퇴 섹션 (admin, member만) */}
                {leagueSettings.user_role === "admin" ||
                leagueSettings.user_role === "member" ? (
                  <div className="card-glass p-6 border-orange-500/20">
                    <h3 className="text-xl font-bold text-orange-500 mb-4">
                      리그 탈퇴
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-orange-500/10 rounded-lg">
                        <div>
                          <h4 className="font-medium text-foreground">
                            리그에서 탈퇴하기
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            리그에서 탈퇴하면 더 이상 멤버가 아니며, 모든 권한이
                            제거됩니다.
                          </p>
                        </div>

                        <AlertDialog
                          open={showLeaveDialog}
                          onOpenChange={setShowLeaveDialog}
                        >
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="text-orange-500 border-orange-500 hover:bg-orange-500/10"
                            >
                              <LogOut className="h-4 w-4 mr-2" />
                              리그 탈퇴
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center space-x-2">
                                <LogOut className="h-5 w-5 text-orange-500" />
                                <span>리그 탈퇴 확인</span>
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                정말로 이 리그에서 탈퇴하시겠습니까?
                                <br />
                                <br />
                                <strong>주의사항:</strong>
                                <br />• 탈퇴 후에는 리그 멤버가 아닙니다
                                <br />• 모든 권한과 접근이 제거됩니다
                                <br />• 다시 가입하려면 새로 신청해야 합니다
                                <br />• 생성한 매치는 리그에 남아있습니다
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>취소</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleLeaveLeague}
                                disabled={leaving}
                                className="bg-orange-500 hover:bg-orange-600"
                              >
                                {leaving ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    탈퇴 중...
                                  </>
                                ) : (
                                  "탈퇴"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* Ownership Transfer Confirmation Dialog */}
            <AlertDialog
              open={showTransferDialog}
              onOpenChange={setShowTransferDialog}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center space-x-2">
                    <Crown className="h-5 w-5 text-orange-500" />
                    <span>책임자 위임 확인</span>
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    정말로 이 운영진에게 책임자 권한을 위임하시겠습니까?
                    <br />
                    <br />
                    <strong>주의사항:</strong>
                    <br />• 위임 후에는 본인이 일반 운영진이 됩니다
                    <br />• 책임자 권한은 위임받은 운영진에게로 이전됩니다
                    <br />• 이 작업은 되돌릴 수 없습니다
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={() => {
                      setShowTransferDialog(false);
                      setSelectedAdminId(null);
                    }}
                  >
                    취소
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={confirmTransferOwnership}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    책임자 위임
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </TabsContent>
        </Tabs>
      </div>

      {/* 프로필 모달 */}
      {showProfileModal && selectedProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* 헤더 */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">프로필</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowProfileModal(false);
                    setSelectedProfile(null);
                  }}
                >
                  ✕
                </Button>
              </div>

              {/* 프로필 정보 */}
              <div className="space-y-6">
                {/* 아바타 및 기본 정보 */}
                <div className="text-center">
                  <Image
                    src={selectedProfile.avatar_url || "/default-avatar.png"}
                    alt={selectedProfile.nickname}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full mx-auto mb-4"
                  />
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {selectedProfile.nickname}
                  </h3>
                </div>

                {/* 티어 및 포지션 */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      티어
                    </h4>
                    <TierBadge
                      tier={
                        selectedProfile.tier as
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
                  </div>

                  {selectedProfile.positions &&
                    selectedProfile.positions.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">
                          포지션
                        </h4>
                        <PositionTags positions={selectedProfile.positions} />
                      </div>
                    )}
                </div>

                {/* 통계 정보 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-secondary/20 rounded-lg">
                    <div className="text-2xl font-bold text-foreground">
                      {selectedProfile.total_leagues}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      참여 리그
                    </div>
                  </div>
                  <div className="text-center p-4 bg-secondary/20 rounded-lg">
                    <div className="text-2xl font-bold text-foreground">
                      {selectedProfile.total_matches}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      생성 매치
                    </div>
                  </div>
                </div>

                {/* 가입일 */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    가입일
                  </h4>
                  <p className="text-foreground">
                    {new Date(selectedProfile.joined_at).toLocaleDateString(
                      "ko-KR",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
              </div>

              {/* 닫기 버튼 */}
              <div className="mt-6 pt-6 border-t border-border">
                <Button
                  onClick={() => {
                    setShowProfileModal(false);
                    setSelectedProfile(null);
                  }}
                  className="w-full"
                >
                  닫기
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
