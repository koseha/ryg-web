"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  Crown, 
  Users, 
  Calendar, 
  Trophy, 
  Play,
  UserPlus,
  MoreVertical,
  Save,
  Trash2,
  AlertTriangle,
  Plus,
  Clock,
  Target
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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

// Mock data for league overview
const mockLeagueOverview = {
  id: 1,
  name: "Champions Arena",
  description: "Elite league for diamond+ players",
  memberCount: 47,
  maxMembers: 100,
  totalMatches: 156,
  activeMatches: 3,
  completedMatches: 153,
  winRate: 68.5,
  averageGameTime: "32분",
  lastActivity: "2024-02-15T14:30:00Z",
  role: "Owner"
};

// Mock data for recent matches (removed unused variable)

// Mock data for pending applications
const mockPendingApplications = [
  {
    id: 1,
    name: "NewPlayer",
    email: "newplayer@example.com",
    tier: "Gold",
    positions: ["Mid", "Top"],
    message: "안녕하세요! 리그에 가입하고 싶습니다. 함께 게임하면서 실력을 늘리고 싶어요.",
    appliedAt: "2024-02-15T10:00:00Z",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
  },
  {
    id: 2,
    name: "RisingStar",
    email: "risingstar@example.com",
    tier: "Platinum",
    positions: ["Jungle", "Support"],
    message: "플래티넘 티어에서 더 높은 수준의 게임을 하고 싶습니다.",
    appliedAt: "2024-02-14T15:30:00Z",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face"
  }
];

// Mock data for members
const mockMembers = [
  {
    id: 1,
    name: "RiftMaster",
    email: "riftmaster@example.com",
    tier: "Challenger",
    positions: ["Mid", "Top"],
    role: "Owner",
    status: "active",
    joinedAt: "2024-01-15",
    lastActive: "2024-02-15T14:30:00Z",
    matchesPlayed: 45,
    winRate: 85.2,
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face"
  },
  {
    id: 2,
    name: "ProGamer",
    email: "progamer@example.com",
    tier: "Grandmaster",
    positions: ["Jungle", "Support"],
    role: "Admin",
    status: "active",
    joinedAt: "2024-01-20",
    lastActive: "2024-02-15T12:00:00Z",
    matchesPlayed: 38,
    winRate: 78.9,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
  },
  {
    id: 3,
    name: "DiamondPlayer",
    email: "diamond@example.com",
    tier: "Diamond",
    positions: ["ADC", "Mid"],
    role: "Member",
    status: "active",
    joinedAt: "2024-02-01",
    lastActive: "2024-02-14T20:00:00Z",
    matchesPlayed: 42,
    winRate: 72.1,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
  }
];

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
  }
];

// Mock data for league settings
const mockLeagueSettings = {
  id: 1,
  name: "Champions Arena",
  description: "Elite league for diamond+ players. Competitive environment with weekly tournaments and coaching sessions.",
  rules: [
    "다이아몬드 이상 티어만 가입 가능",
    "주간 토너먼트 참여 필수",
    "게임 내 매너 준수",
    "불참 시 사전 공지 필수"
  ],
  isPublic: true,
  allowMemberInvites: true,
  requireApproval: true,
  minTier: "Diamond",
  maxMembers: 100,
  region: "NA",
  type: "Competitive",
  role: "Owner"
};

const mockAdmins = [
  {
    id: 1,
    name: "RiftMaster",
    email: "riftmaster@example.com",
    role: "Owner",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face"
  },
  {
    id: 2,
    name: "ProGamer",
    email: "progamer@example.com",
    role: "Admin",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
  }
];

const roleOptions = [
  { value: "all", label: "모든 역할" },
  { value: "Owner", label: "책임자" },
  { value: "Admin", label: "운영진" },
  { value: "Member", label: "멤버" }
];

const tierOptions = [
  { value: "all", label: "모든 티어" },
  { value: "Challenger", label: "챌린저" },
  { value: "Grandmaster", label: "그랜드마스터" },
  { value: "Master", label: "마스터" },
  { value: "Diamond", label: "다이아몬드" },
  { value: "Platinum", label: "플래티넘" },
  { value: "Gold", label: "골드" },
  { value: "Silver", label: "실버" },
  { value: "Bronze", label: "브론즈" }
];

const positionOptions = [
  { value: "all", label: "모든 포지션" },
  { value: "Top", label: "탑" },
  { value: "Jungle", label: "정글" },
  { value: "Mid", label: "미드" },
  { value: "ADC", label: "원딜" },
  { value: "Support", label: "서포터" }
];

const statusOptions = [
  { value: "all", label: "모든 상태" },
  { value: "pending", label: "대기중" },
  { value: "active", label: "진행중" },
  { value: "completed", label: "완료" }
];


export default function LeagueOverview() {
  const params = useParams();
  const leagueId = params.id;
  
  // State for different tabs
  const [roleFilter, setRoleFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newMatchTitle, setNewMatchTitle] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [settings, setSettings] = useState(mockLeagueSettings);
  const [rules, setRules] = useState(settings.rules);
  const [newRule, setNewRule] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Filter functions
  const filteredMembers = mockMembers.filter(member => {
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    const matchesTier = tierFilter === "all" || member.tier === tierFilter;
    const matchesPosition = positionFilter === "all" || member.positions.includes(positionFilter);
    return matchesRole && matchesTier && matchesPosition;
  });

  const filteredMatches = mockMatches.filter(match => {
    const matchesStatus = statusFilter === "all" || match.status === statusFilter;
    return matchesStatus;
  });

  // Helper functions
  const generateMatchCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

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

  const addRule = () => {
    if (newRule.trim()) {
      setRules([...rules, newRule.trim()]);
      setNewRule("");
    }
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const handleDeleteLeague = async () => {
    console.log("Deleting league...");
  };


  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Crown className="h-8 w-8 text-primary" />
            <RoleBadge role={mockLeagueOverview.role as "Owner" | "Admin" | "Member"} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-glow">
            {mockLeagueOverview.name}
          </h1>
          <p className="text-xl text-muted-foreground">
            {mockLeagueOverview.description}
          </p>
        </div>

        {/* Tab Navigation */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card-glass p-6 text-center">
            <Users className="h-8 w-8 text-primary mx-auto mb-3" />
            <div className="text-3xl font-bold text-foreground mb-1">
              {mockLeagueOverview.memberCount}
            </div>
            <div className="text-sm text-muted-foreground">총 멤버 수</div>
          </div>
          
          <div className="card-glass p-6 text-center">
            <Trophy className="h-8 w-8 text-accent mx-auto mb-3" />
                <div className="text-3xl font-bold text-foreground mb-1">
              {mockLeagueOverview.totalMatches}
                </div>
            <div className="text-sm text-muted-foreground">생성된 매치 수</div>
                </div>
          
          <div className="card-glass p-6 text-center">
            <Calendar className="h-8 w-8 text-green-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-foreground mb-1">
              {mockLeagueOverview.activeMatches}
                </div>
            <div className="text-sm text-muted-foreground">이번 달 활동</div>
              </div>
        </div>

        {/* League Information */}
        <div className="card-glass p-6 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">리그 정보</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">설명</h3>
              <p className="text-muted-foreground">{mockLeagueOverview.description}</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">생성일</h3>
                <p className="text-muted-foreground">{new Date(mockLeagueOverview.lastActivity).toLocaleDateString()}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">책임자</h3>
                <p className="text-muted-foreground">RiftMaster</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="card-glass p-6 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">최근 활동 피드</h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-secondary/20 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-foreground">새 멤버가 가입했습니다</p>
                <p className="text-sm text-muted-foreground">2시간 전</p>
              </div>
              </div>
              
            <div className="flex items-center space-x-3 p-3 bg-secondary/20 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-foreground">새 매치가 생성되었습니다</p>
                <p className="text-sm text-muted-foreground">4시간 전</p>
                      </div>
                    </div>
            
            <div className="flex items-center space-x-3 p-3 bg-secondary/20 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-foreground">매치가 완료되었습니다</p>
                <p className="text-sm text-muted-foreground">6시간 전</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
          <div className="card-glass p-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">빠른 작업</h2>
          <div className="grid md:grid-cols-2 gap-4">
              <Button asChild variant="outline" className="h-16 flex-col space-y-2">
                <Link href={`/leagues/${leagueId}/matches`}>
                  <Play className="h-6 w-6" />
                <span>매치 생성하기</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-16 flex-col space-y-2">
              <Link href="/universe">
                  <UserPlus className="h-6 w-6" />
                <span>멤버 초대하기</span>
                </Link>
              </Button>
          </div>
        </div>
          </TabsContent>

          <TabsContent value="members">
            <div className="space-y-6">
              {/* Pending Applications */}
              {mockPendingApplications.length > 0 && (
                <div className="card-glass p-6">
                  <h2 className="text-2xl font-bold text-foreground mb-6">가입 신청 대기중</h2>
                  
                  <div className="space-y-4">
                    {mockPendingApplications.map((application) => (
                      <div key={application.id} className="p-4 bg-secondary/20 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <img
                              src={application.avatar}
                              alt={application.name}
                              className="w-12 h-12 rounded-full"
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-lg font-medium text-foreground">{application.name}</h3>
                                <TierBadge tier={application.tier as "Challenger" | "Grandmaster" | "Master" | "Diamond" | "Platinum" | "Gold" | "Silver" | "Bronze"} />
                                <PositionTags positions={application.positions} />
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{application.email}</p>
                              <p className="text-sm text-foreground mb-3">{application.message}</p>
                              <p className="text-xs text-muted-foreground">
                                신청일: {new Date(application.appliedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              승인
                            </Button>
                            <Button size="sm" variant="outline">
                              거절
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Members List */}
              <div className="card-glass p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">멤버 목록</h2>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    멤버 초대
                  </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
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
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMembers.map((member) => (
                      <div key={member.id} className="p-4 bg-secondary/20 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-10 h-10 rounded-full"
                            />
                            <div>
                              <h3 className="font-medium text-foreground">{member.name}</h3>
                              <p className="text-sm text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>프로필 보기</DropdownMenuItem>
                              <DropdownMenuItem>메시지 보내기</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-500">멤버 제거</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <TierBadge tier={member.tier as "Challenger" | "Grandmaster" | "Master" | "Diamond" | "Platinum" | "Gold" | "Silver" | "Bronze"} />
                            <RoleBadge role={member.role as "Owner" | "Admin" | "Member"} />
                          </div>
                          <PositionTags positions={member.positions} />
                          <p className="text-xs text-muted-foreground">
                            가입일: {member.joinedAt}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">멤버가 없습니다</h3>
                    <p className="text-muted-foreground">필터를 조정해보세요</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="matches">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">매치 관리</h2>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  새 매치 생성
                </Button>
              </div>

              {/* Create Match Form */}
              {showCreateForm && (
                <div className="card-glass p-6">
                  <h3 className="text-xl font-bold text-foreground mb-4">새 매치 생성</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        매치 제목
                      </label>
                      <Input
                        value={newMatchTitle}
                        onChange={(e) => setNewMatchTitle(e.target.value)}
                        placeholder="매치 제목을 입력하세요"
                      />
                    </div>
                    
                    <div className="flex space-x-4">
                      <Button
                        onClick={() => {
                          setGeneratedCode(generateMatchCode());
                        }}
                        variant="outline"
                      >
                        코드 생성
                      </Button>
                      {generatedCode && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">매치 코드:</span>
                          <code className="px-2 py-1 bg-secondary rounded text-sm font-mono">
                            {generatedCode}
                          </code>
                          <CopyButton text={generatedCode} />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button onClick={() => setShowCreateForm(false)}>
                        생성
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowCreateForm(false);
                          setNewMatchTitle("");
                          setGeneratedCode("");
                        }}
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
                              <h3 className="text-lg font-medium text-foreground">{match.title}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(match.status)}`}>
                                {getStatusLabel(match.status)}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                              <span>코드: {match.code}</span>
                              <span>참가자: {match.participants}/{match.maxParticipants}</span>
                              <span>생성자: {match.createdBy}</span>
                              <span>생성일: {new Date(match.createdAt).toLocaleDateString()}</span>
                            </div>
                            
                            {match.description && (
                              <p className="text-sm text-foreground mb-3">{match.description}</p>
                            )}
                            
                            <div className="flex items-center space-x-4 text-sm">
                              <span className="text-muted-foreground">
                                {match.status === "completed" ? "완료일" : "상태"}: {match.duration}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <CopyButton text={match.code} />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>상세 보기</DropdownMenuItem>
                                <DropdownMenuItem>편집</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-500">삭제</DropdownMenuItem>
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
                  <h3 className="text-lg font-medium text-foreground mb-2">매치가 없습니다</h3>
                  <p className="text-muted-foreground">아직 생성된 매치가 없습니다</p>
                  <p className="text-sm text-muted-foreground">첫 매치를 생성해보세요</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">리그 설정</h2>
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
                <h3 className="text-xl font-bold text-foreground mb-4">기본 정보</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      리그 이름
                    </label>
                    <Input
                      value={settings.name}
                      onChange={(e) => setSettings({...settings, name: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      설명
                    </label>
                    <Textarea
                      value={settings.description}
                      onChange={(e) => setSettings({...settings, description: e.target.value})}
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Rules */}
              <div className="card-glass p-6">
                <h3 className="text-xl font-bold text-foreground mb-4">규칙</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    {rules.map((rule, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-sm text-foreground flex-1">{rule}</span>
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
                      onKeyPress={(e) => e.key === 'Enter' && addRule()}
                    />
                    <Button onClick={addRule} variant="outline">
                      추가
                    </Button>
                  </div>
                </div>
              </div>

              {/* Operating Team */}
              <div className="card-glass p-6">
                <h3 className="text-xl font-bold text-foreground mb-4">운영진</h3>
                
                <div className="space-y-3">
                  {mockAdmins.map((admin) => (
                    <div key={admin.id} className="flex items-center space-x-3 p-3 bg-secondary/20 rounded-lg">
                      <img
                        src={admin.avatar}
                        alt={admin.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{admin.name}</h4>
                        <p className="text-sm text-muted-foreground">{admin.email}</p>
                      </div>
                      <RoleBadge role={admin.role as "Owner" | "Admin" | "Member"} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger Zone */}
              <div className="card-glass p-6 border-red-500/20">
                <h3 className="text-xl font-bold text-red-500 mb-4">위험 구역</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg">
                    <div>
                      <h4 className="font-medium text-foreground">리그 삭제</h4>
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
                            정말로 이 리그를 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 
                            모든 멤버, 매치, 설정이 영구적으로 삭제됩니다.
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
