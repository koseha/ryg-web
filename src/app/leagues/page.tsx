"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Users, Calendar, Plus, Trophy, Loader2, X } from "lucide-react";
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

interface CreateLeagueForm {
  name: string;
  description: string;
}

export default function MyLeagues() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [leagues, setLeagues] = useState<UserLeague[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState<CreateLeagueForm>({
    name: "",
    description: ""
  });

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
        setLeagues(data.data);
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
              내가 가입한 리그
            </h1>
            <p className="text-muted-foreground">
              현재 {leagues.length}개의 리그에 가입되어 있습니다
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              리그 생성
            </Button>
          </div>
        </div>

        {/* Leagues Grid */}
        {leagues.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              가입한 리그가 없습니다
            </h2>
            <p className="text-muted-foreground mb-6">
              새로운 리그를 만들어보세요!
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              리그 생성
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leagues.map((league) => (
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
                      리그 보기
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

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