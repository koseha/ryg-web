"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  Settings, 
  Save, 
  ArrowLeft, 
  Trash2, 
  AlertTriangle,
  Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RoleBadge } from "@/components/ui/role-badge";
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

const tierOptions = [
  "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Grandmaster", "Challenger"
];

const regionOptions = [
  "NA", "EUW", "EUNE", "KR", "JP", "BR", "LAN", "LAS", "OCE", "RU", "TR"
];

const typeOptions = [
  "Competitive", "Casual", "Educational", "Professional"
];

export default function LeagueSettings() {
  const params = useParams();
  const leagueId = params.id;
  
  const [settings, setSettings] = useState(mockLeagueSettings);
  const [rules, setRules] = useState(settings.rules);
  const [newRule, setNewRule] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // 권한 체크 - 일반 멤버는 접근 불가
  if (settings.role === "Member") {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center py-20">
            <h1 className="text-4xl font-bold text-muted-foreground mb-4">404</h1>
            <p className="text-xl text-muted-foreground">접근 권한이 없습니다.</p>
            <p className="text-muted-foreground mt-2">리그 설정은 운영진 이상만 접근할 수 있습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    // Show success message
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

  const handleDeleteLeague = async () => {
    // Handle league deletion
    console.log("Deleting league...");
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-4xl">
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
              리그 설정
            </h1>
            <p className="text-xl text-muted-foreground">
              리그 정보와 권한을 관리하세요
            </p>
          </div>
          
          <Button 
            variant="hero" 
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "저장 중..." : "저장하기"}
          </Button>
        </div>

        <div className="space-y-8">
          {/* Basic Information */}
          <div className="card-glass p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Settings className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">기본 정보</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  리그 이름
                </label>
                <Input
                  value={settings.name}
                  onChange={(e) => setSettings({...settings, name: e.target.value})}
                  placeholder="리그 이름을 입력하세요"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  리그 설명
                </label>
                <Textarea
                  value={settings.description}
                  onChange={(e) => setSettings({...settings, description: e.target.value})}
                  placeholder="리그 설명을 입력하세요"
                  rows={4}
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    리그 타입
                  </label>
                  <select
                    value={settings.type}
                    onChange={(e) => setSettings({...settings, type: e.target.value})}
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground"
                  >
                    {typeOptions.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    지역
                  </label>
                  <select
                    value={settings.region}
                    onChange={(e) => setSettings({...settings, region: e.target.value})}
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground"
                  >
                    {regionOptions.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  최대 멤버 수
                </label>
                <Input
                  type="number"
                  value={settings.maxMembers}
                  onChange={(e) => setSettings({...settings, maxMembers: parseInt(e.target.value)})}
                  min="10"
                  max="1000"
                />
              </div>
            </div>
          </div>

          {/* Rules */}
          <div className="card-glass p-6">
            <div className="flex items-center space-x-2 mb-6">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <h2 className="text-2xl font-bold text-foreground">규칙</h2>
            </div>
            
            <div className="space-y-4">
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
              
              <div className="space-y-2">
                {rules.map((rule, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                    <span className="text-foreground">{rule}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRule(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Administrators */}
          <div className="card-glass p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Crown className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">운영진 관리</h2>
            </div>
            
            <div className="space-y-4">
              {mockAdmins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <img
                      src={admin.avatar}
                      alt={admin.name}
                      className="h-10 w-10 rounded-full border-2 border-primary/30"
                    />
                    <div>
                      <div className="font-medium text-foreground">{admin.name}</div>
                      <div className="text-sm text-muted-foreground">{admin.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RoleBadge role={admin.role as any} />
                    {admin.role === "Owner" && (
                      <Button variant="ghost" size="sm" disabled>
                        <Crown className="h-4 w-4" />
                      </Button>
                    )}
                    {admin.role === "Admin" && (
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone - Owner only */}
          {settings.role === "Owner" && (
            <div className="card-glass p-6 border-destructive/20">
              <div className="flex items-center space-x-2 mb-6">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <h2 className="text-2xl font-bold text-destructive">위험 구역</h2>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-destructive/10 rounded-lg">
                  <h3 className="text-lg font-medium text-destructive mb-2">리그 삭제</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    리그를 삭제하면 모든 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                  </p>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        리그 삭제
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>리그를 삭제하시겠습니까?</AlertDialogTitle>
                        <AlertDialogDescription>
                          이 작업은 되돌릴 수 없습니다. 리그와 관련된 모든 데이터가 영구적으로 삭제됩니다.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteLeague}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          삭제
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
