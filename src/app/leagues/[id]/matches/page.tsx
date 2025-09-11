"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  Play, 
  Plus, 
  MoreVertical,
  Clock,
  Trophy,
  ArrowLeft,
  Calendar,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import { CopyButton } from "@/components/ui/copy-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data for matches
const mockMatches = [
  {
    id: 1,
    title: "주간 토너먼트 결승",
    code: "CHAMP001",
    status: "completed",
    participants: 10,
    maxParticipants: 10,
    createdAt: "2024-02-15T10:00:00Z",
    completedAt: "2024-02-15T10:28:00Z",
    duration: "28분",
    description: "주간 토너먼트 결승전입니다. 모든 멤버가 참여할 수 있습니다.",
    createdBy: "RiftMaster"
  },
  {
    id: 2,
    title: "연습 매치 #47",
    code: "CHAMP002",
    status: "active",
    participants: 8,
    maxParticipants: 10,
    createdAt: "2024-02-15T14:30:00Z",
    completedAt: null,
    duration: "진행중",
    description: "일반 연습 매치입니다. 자유롭게 참여하세요.",
    createdBy: "ProGamer"
  },
  {
    id: 3,
    title: "랭크 매치 #46",
    code: "CHAMP003",
    status: "completed",
    participants: 10,
    maxParticipants: 10,
    createdAt: "2024-02-14T20:00:00Z",
    completedAt: "2024-02-14T20:35:00Z",
    duration: "35분",
    description: "랭크 매치입니다. 실력 향상을 위한 매치입니다.",
    createdBy: "DiamondPlayer"
  },
  {
    id: 4,
    title: "친선 매치 #45",
    code: "CHAMP004",
    status: "pending",
    participants: 0,
    maxParticipants: 10,
    createdAt: "2024-02-14T15:00:00Z",
    completedAt: null,
    duration: "대기중",
    description: "친선 매치입니다. 편안한 분위기에서 즐기세요.",
    createdBy: "PlatinumRiser"
  },
  {
    id: 5,
    title: "토너먼트 준결승",
    code: "CHAMP005",
    status: "completed",
    participants: 10,
    maxParticipants: 10,
    createdAt: "2024-02-13T19:00:00Z",
    completedAt: "2024-02-13T19:42:00Z",
    duration: "42분",
    description: "토너먼트 준결승전입니다.",
    createdBy: "RiftMaster"
  },
  {
    id: 6,
    title: "연습 매치 #46",
    code: "CHAMP006",
    status: "completed",
    participants: 10,
    maxParticipants: 10,
    createdAt: "2024-02-13T16:00:00Z",
    completedAt: "2024-02-13T16:25:00Z",
    duration: "25분",
    description: "연습 매치입니다. 새로운 전략을 시도해보세요.",
    createdBy: "MasterMind"
  },
  {
    id: 7,
    title: "랭크 매치 #45",
    code: "CHAMP007",
    status: "completed",
    participants: 10,
    maxParticipants: 10,
    createdAt: "2024-02-12T21:00:00Z",
    completedAt: "2024-02-12T21:38:00Z",
    duration: "38분",
    description: "랭크 매치입니다. 실력 향상을 위한 매치입니다.",
    createdBy: "GoldClimber"
  },
  {
    id: 8,
    title: "친선 매치 #44",
    code: "CHAMP008",
    status: "completed",
    participants: 8,
    maxParticipants: 10,
    createdAt: "2024-02-12T18:00:00Z",
    completedAt: "2024-02-12T18:22:00Z",
    duration: "22분",
    description: "친선 매치입니다. 편안한 분위기에서 즐기세요.",
    createdBy: "SilverStruggler"
  },
  {
    id: 9,
    title: "연습 매치 #45",
    code: "CHAMP009",
    status: "pending",
    participants: 2,
    maxParticipants: 10,
    createdAt: "2024-02-11T20:00:00Z",
    completedAt: null,
    duration: "대기중",
    description: "연습 매치입니다. 더 많은 참여자를 기다리고 있습니다.",
    createdBy: "BronzeBeginner"
  },
  {
    id: 10,
    title: "토너먼트 8강",
    code: "CHAMP010",
    status: "completed",
    participants: 10,
    maxParticipants: 10,
    createdAt: "2024-02-11T15:00:00Z",
    completedAt: "2024-02-11T15:45:00Z",
    duration: "45분",
    description: "토너먼트 8강전입니다.",
    createdBy: "RiftMaster"
  }
];

const statusOptions = [
  { value: "all", label: "모든 상태" },
  { value: "pending", label: "대기중" },
  { value: "active", label: "진행중" },
  { value: "completed", label: "완료" }
];

export default function LeagueMatches() {
  const params = useParams();
  const leagueId = params.id;
  
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newMatchTitle, setNewMatchTitle] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");

  const generateMatchCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const filteredMatches = mockMatches.filter(match => {
    const matchesStatus = statusFilter === "all" || match.status === statusFilter;
    return matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-500 border-green-500/30";
      case "completed":
        return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
      default:
        return "bg-secondary/20 text-secondary-foreground border-secondary/30";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "진행중";
      case "completed":
        return "완료";
      case "pending":
        return "대기중";
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
      case "pending":
        return Clock;
      default:
        return Target;
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Button asChild variant="ghost" size="sm">
                <Link href={`/leagues/${leagueId}/overview`} className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>대시보드로 돌아가기</span>
                </Link>
              </Button>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 text-glow">
              매치 관리
            </h1>
            <p className="text-xl text-muted-foreground">
              리그 매치를 생성하고 관리하세요
            </p>
          </div>
          
          <Button variant="hero" onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            새 매치 생성
          </Button>
        </div>


        {/* Match Status Filter */}
        <div className="card-glass p-6 mb-8">
          <div className="flex flex-wrap gap-3">
            <FilterDropdown
              options={statusOptions}
              value={statusFilter}
              onValueChange={setStatusFilter}
              placeholder="상태"
            />
          </div>
        </div>

        {/* Matches List */}
        <div className="space-y-4">
          {filteredMatches.map((match) => {
            const StatusIcon = getStatusIcon(match.status);
            return (
              <div key={match.id} className="card-glass p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                        <StatusIcon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {match.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(match.status)}`}>
                          {getStatusLabel(match.status)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(match.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span>•</span>
                        <span>생성자: {match.createdBy}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground mb-1">매치 코드</div>
                      <div className="flex items-center space-x-2">
                        <code className="px-3 py-2 bg-secondary rounded-lg font-mono text-sm">
                          {match.code}
                        </code>
                        <CopyButton text={match.code} />
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-48 bg-card border-border" align="end">
                        <DropdownMenuItem className="cursor-pointer">
                          매치 상세보기
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          매치 수정
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          참여자 관리
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-destructive">
                          매치 삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredMatches.length === 0 && (
          <div className="text-center py-16">
            <Play className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-bold mb-2 text-muted-foreground">아직 생성된 매치가 없습니다</h3>
            <p className="text-muted-foreground mb-6">
              첫 매치를 생성해보세요
            </p>
            <Button variant="hero" onClick={() => setShowCreateForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              새 매치 생성하기
            </Button>
          </div>
        )}

        {/* Create Match Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="card-glass p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-foreground mb-6">새 매치 생성</h2>
              
              {!generatedCode ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      매치 제목
                    </label>
                    <input
                      type="text"
                      value={newMatchTitle}
                      onChange={(e) => setNewMatchTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground"
                      placeholder="매치 제목을 입력하세요"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      설명
                    </label>
                    <textarea
                      className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground"
                      rows={3}
                      placeholder="매치 설명을 입력하세요"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      최대 참여자 수
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="10"
                      defaultValue="10"
                      className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="p-4 bg-secondary/20 rounded-lg">
                    <h3 className="text-lg font-semibold text-foreground mb-2">매치 코드 생성 완료!</h3>
                    <div className="flex items-center justify-center space-x-2">
                      <code className="px-4 py-2 bg-secondary rounded-lg font-mono text-lg font-bold">
                        {generatedCode}
                      </code>
                      <CopyButton text={generatedCode} />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateForm(false);
                    setGeneratedCode("");
                    setNewMatchTitle("");
                  }}
                >
                  {generatedCode ? "닫기" : "취소"}
                </Button>
                {!generatedCode && (
                  <Button 
                    variant="hero"
                    onClick={() => setGeneratedCode(generateMatchCode())}
                    disabled={!newMatchTitle.trim()}
                  >
                    매치 생성
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
