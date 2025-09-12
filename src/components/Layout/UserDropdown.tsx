"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { LogoutButton } from "@/components/auth/LogoutButton";

export const UserDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const userAvatar = user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.name || user.email || 'User')}&background=random`;
  const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'User';

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2 p-2">
          <Image
            src={userAvatar}
            alt={userName}
            width={32}
            height={32}
            className="h-8 w-8 rounded-full border-2 border-primary/30"
          />
          <span className="hidden md:block font-medium">{userName}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-56 bg-card border-border" align="end">
        <div className="px-3 py-2 border-b border-border">
          <p className="font-medium text-foreground">{userName}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        
        <DropdownMenuItem asChild className="flex items-center space-x-2 cursor-pointer">
          <Link href="/profile">
            <User className="h-4 w-4" />
            <span>프로필 보기</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-border" />
        
        <DropdownMenuItem asChild className="flex items-center space-x-2 cursor-pointer text-destructive">
          <LogoutButton variant="ghost" className="w-full justify-start p-0 h-auto">
            <span>로그아웃</span>
          </LogoutButton>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};