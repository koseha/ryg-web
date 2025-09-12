"use client";

import { useState } from "react";
import Image from "next/image";
// import Link from "next/link"; // Removed unused import
import { 
  User, 
  Edit, 
  Save, 
  Users, 
  Calendar,
  LogOut,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TierBadge } from "@/components/ui/tier-badge";
import { PositionTags } from "@/components/ui/position-tags";

// Mock data for user profile
const mockUserProfile = {
  id: 1,
  name: "Faker",
  email: "faker@lol.universe",
  nickname: "Faker",
  tier: "Challenger",
  positions: ["Mid", "Top"],
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face",
  joinedAt: "2024-01-01",
  totalLeagues: 4,
  totalMatches: 156
};

const tierOptions = [
  "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Grandmaster", "Challenger"
];

const positionOptions = [
  "Top", "Jungle", "Mid", "ADC", "Support"
];

export default function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(mockUserProfile);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setIsEditing(false);
  };

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
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                >
                  취소
                </Button>
                <Button 
                  variant="hero" 
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "저장 중..." : "저장하기"}
                </Button>
              </>
            ) : (
              <Button variant="hero" onClick={() => setIsEditing(true)}>
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
                  src={profile.avatar}
                  alt={profile.name}
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-full border-4 border-primary/30 mx-auto md:mx-0 mb-4"
                />
                <p className="text-sm text-muted-foreground">{profile.email}</p>
              </div>
              
              <div className="flex-1 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    닉네임
                  </label>
                  {isEditing ? (
                    <Input
                      value={profile.nickname}
                      onChange={(e) => setProfile({...profile, nickname: e.target.value})}
                      placeholder="닉네임을 입력하세요"
                    />
                  ) : (
                    <p className="text-foreground text-lg">{profile.nickname}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    현재 티어
                  </label>
                  {isEditing ? (
                    <select
                      value={profile.tier}
                      onChange={(e) => setProfile({...profile, tier: e.target.value})}
                      className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground"
                    >
                      {tierOptions.map(tier => (
                        <option key={tier} value={tier}>{tier}</option>
                      ))}
                    </select>
                  ) : (
                    <TierBadge tier={profile.tier as "Challenger" | "Grandmaster" | "Master" | "Diamond" | "Platinum" | "Gold" | "Silver" | "Bronze"} />
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    선호 포지션
                  </label>
                  {isEditing ? (
                    <div className="space-y-2">
                      {positionOptions.map(position => (
                        <label key={position} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={profile.positions.includes(position)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setProfile({...profile, positions: [...profile.positions, position]});
                              } else {
                                setProfile({...profile, positions: profile.positions.filter(p => p !== position)});
                              }
                            }}
                            className="rounded border-border"
                          />
                          <span className="text-foreground">{position}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <PositionTags positions={profile.positions} />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="card-glass p-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">계정 정보</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-sm text-muted-foreground mb-1">가입일</div>
                <div className="text-foreground">{new Date(profile.joinedAt).toLocaleDateString()}</div>
              </div>
              
              <div className="text-center">
                <Users className="h-8 w-8 text-accent mx-auto mb-2" />
                <div className="text-sm text-muted-foreground mb-1">참여중인 리그</div>
                <div className="text-foreground">{profile.totalLeagues}개</div>
              </div>
              
              <div className="text-center">
                <div className="h-8 w-8 text-green-500 mx-auto mb-2 flex items-center justify-center">
                  <span className="text-lg">🎮</span>
                </div>
                <div className="text-sm text-muted-foreground mb-1">생성한 매치</div>
                <div className="text-foreground">{profile.totalMatches}개</div>
              </div>
            </div>
          </div>

          {/* Account Management */}
          <div className="card-glass p-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">계정 관리</h2>
            
            <div className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <LogOut className="mr-2 h-4 w-4" />
                로그아웃
              </Button>
              
              <div className="border-t border-border pt-4">
                <div className="p-4 bg-destructive/10 rounded-lg">
                  <h3 className="text-lg font-medium text-destructive mb-2">계정 삭제</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                  </p>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    계정 삭제
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}