"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Crown, Users, Calendar, Plus, Trophy, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/components/ui/role-badge";
import { useAuth } from "@/contexts/AuthContext";

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

export default function MyLeagues() {
  const { user } = useAuth();
  const [leagues, setLeagues] = useState<UserLeague[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err) {
      setError('Failed to fetch leagues');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Owner":
        return <Crown className="h-4 w-4" />;
      case "Admin":
        return <Star className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
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
              내가 가입한 리그
            </h1>
            <p className="text-muted-foreground">
              현재 {leagues.length}개의 리그에 가입되어 있습니다
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link href="/universe">
              <Button variant="outline" className="mr-3">
                <Plus className="h-4 w-4 mr-2" />
                리그 찾기
              </Button>
            </Link>
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
              새로운 리그를 찾아서 가입해보세요!
            </p>
            <Link href="/universe">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                리그 찾기
              </Button>
            </Link>
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
                    <RoleBadge role={league.my_role as "Owner" | "Admin" | "Member"} />
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
      </div>
    </div>
  );
}