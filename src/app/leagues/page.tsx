"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Users, Calendar, Plus, Trophy, Loader2, X, Clock, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RoleBadge } from "@/components/ui/role-badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface UserLeague {
  id: number;
  name: string;
  description: string;
  region: string;
  type: string;
  member_count: number;
  created_at: string;
  updated_at: string;
  owner: {
    id: string;
    nickname: string;
    avatar_url?: string;
  } | null;
  my_role: string;
  joined_at: string;
}

interface PendingRequest {
  id: string;
  league: UserLeague;
  status: string;
  message: string;
  applied_at: string;
}

interface MyLeaguesResponse {
  joined: UserLeague[];
  pending: PendingRequest[];
}

interface CreateLeagueForm {
  name: string;
  description: string;
}

export default function MyLeagues() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [leaguesData, setLeaguesData] = useState<MyLeaguesResponse>({ joined: [], pending: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState<CreateLeagueForm>({
    name: "",
    description: ""
  });
  const [cancellingRequest, setCancellingRequest] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchMyLeagues();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchMyLeagues = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/leagues?scope=my');
      const data = await response.json();
      
      if (data.success) {
        setLeaguesData(data.data);
      } else {
        setError(data.error || 'Failed to fetch leagues');
      }
    } catch {
      setError('Failed to fetch leagues');
    } finally {
      setLoading(false);
    }
  };

  const createLeague = async (formData: CreateLeagueForm) => {
    try {
      setIsCreating(true);
      const response = await fetch('/api/leagues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          region: 'KR',
          type: 'Basic'
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "리그 생성 완료",
          description: `${formData.name} 리그가 성공적으로 생성되었습니다.`,
        });
        setShowCreateModal(false);
        setCreateForm({ name: "", description: "" });
        fetchMyLeagues(); // 리그 목록 새로고침
      } else {
        toast({
          title: "리그 생성 실패",
          description: data.error || "리그 생성에 실패했습니다.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "리그 생성 실패",
        description: "네트워크 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.description.trim()) {
      toast({
        title: "입력 오류",
        description: "리그 이름과 설명을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    createLeague(createForm);
  };

  const cancelJoinRequest = async (leagueId: string) => {
    try {
      setCancellingRequest(leagueId);
      const response = await fetch(`/api/leagues/${leagueId}/join`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "신청 취소 완료",
          description: result.message,
        });
        // 목록 새로고침
        fetchMyLeagues();
      } else {
        toast({
          title: "신청 취소 실패",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "오류 발생",
        description: "네트워크 오류가 발생했습니다",
        variant: "destructive",
      });
    } finally {
      setCancellingRequest(null);
    }
  };



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              로그인이 필요합니다
            </h1>
            <p className="text-muted-foreground mb-6">
              내가 가입한 리그를 보려면 로그인해주세요.
            </p>
            <Link href="/login">
              <Button>로그인하기</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">리그를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              오류가 발생했습니다
            </h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={fetchMyLeagues}>다시 시도</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              내 리그 관리
            </h1>
            <p className="text-muted-foreground">
              가입한 리그 {leaguesData.joined.length}개, 신청 대기 중 {leaguesData.pending.length}개
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              리그 생성
            </Button>
          </div>
        </div>

        {/* Joined Leagues Section */}
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <Trophy className="h-6 w-6 text-yellow-500 mr-3" />
            <h2 className="text-2xl font-bold text-foreground">
              내가 가입한 리그 ({leaguesData.joined.length}개)
            </h2>
          </div>
          
          {leaguesData.joined.length === 0 ? (
            <div className="text-center py-12 bg-muted/20 rounded-lg border border-border">
              <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                가입한 리그가 없습니다
              </h3>
              <p className="text-muted-foreground mb-6">
                새로운 리그를 찾아보거나 만들어보세요!
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/universe">
                  <Button variant="outline">
                    리그 둘러보기
                  </Button>
                </Link>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  리그 생성
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leaguesData.joined.map((league) => (
                <div
                  key={league.id}
                  className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {league.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {league.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <RoleBadge role={league.my_role.toLowerCase() as "owner" | "admin" | "member"} />
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{league.member_count}명</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>가입일: {formatDate(league.joined_at)}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="mr-2">📍</span>
                      <span>{league.region}</span>
                      <span className="mx-2">•</span>
                      <span>{league.type}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      소유자: {league.owner?.nickname || "Unknown"}
                    </div>
                    <Link href={`/leagues/${league.id}`}>
                      <Button size="sm" variant="outline">
                        리그 입장
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Requests Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <Clock className="h-6 w-6 text-blue-500 mr-3" />
            <h2 className="text-2xl font-bold text-foreground">
              가입 신청 대기 중 ({leaguesData.pending.length}개)
            </h2>
          </div>
          
          {leaguesData.pending.length === 0 ? (
            <div className="text-center py-8 bg-muted/10 rounded-lg border border-border">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                대기 중인 신청이 없습니다
              </h3>
              <p className="text-muted-foreground">
                새로운 리그에 가입 신청을 해보세요!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leaguesData.pending.map((request) => (
                <div
                  key={request.id}
                  className="bg-muted/20 border border-border rounded-lg p-6 opacity-90"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {request.league.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {request.league.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        대기 중
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{request.league.member_count}명</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>신청일: {formatDate(request.applied_at)}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="mr-2">📍</span>
                      <span>{request.league.region}</span>
                      <span className="mx-2">•</span>
                      <span>{request.league.type}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      소유자: {request.league.owner?.nickname || "Unknown"}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => cancelJoinRequest(request.league.id.toString())}
                      disabled={cancellingRequest === request.league.id.toString()}
                    >
                      {cancellingRequest === request.league.id.toString() ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          취소 중...
                        </>
                      ) : (
                        <>
                          <UserX className="h-4 w-4 mr-2" />
                          신청 취소
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create League Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="w-full max-w-2xl bg-card rounded-lg shadow-lg border border-border">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-xl font-semibold text-foreground">새 리그 만들기</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowCreateModal(false)}
                  disabled={isCreating}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <form onSubmit={handleCreateSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    리그 이름 *
                  </label>
                  <Input
                    value={createForm.name}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="리그 이름을 입력하세요"
                    disabled={isCreating}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    리그 설명 *
                  </label>
                  <Textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="리그에 대한 설명을 입력하세요"
                    rows={4}
                    disabled={isCreating}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">리그 타입</label>
                  <Input value="Basic" disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground mt-1">현재 Basic 타입으로 고정됩니다</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">지역</label>
                  <Input value="한국 (KR)" disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground mt-1">현재 한국 지역으로 고정됩니다</p>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                    disabled={isCreating}
                  >
                    취소
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        생성 중...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        리그 생성
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}