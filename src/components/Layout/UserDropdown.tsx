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

  const userAvatar =
    user.user_metadata?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user.user_metadata?.name || user.email || "User"
    )}&background=random`;
  const userName =
    user.user_metadata?.name || user.email?.split("@")[0] || "User";

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center space-x-3 px-3 py-2 hover:bg-accent/50 transition-colors"
        >
          <Image
            src={userAvatar}
            alt={userName}
            width={32}
            height={32}
            className="h-8 w-8 rounded-full border-2 border-primary/20 shadow-sm"
          />
          <span className="hidden md:block font-medium text-sm">
            {userName}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-64 bg-card/95 backdrop-blur-sm border border-border/50 shadow-xl"
        align="end"
      >
        <div className="px-4 py-3 border-b border-border/50">
          <p className="font-semibold text-foreground text-sm">{userName}</p>
          <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
        </div>

        <DropdownMenuItem
          asChild
          className="px-4 py-2.5 hover:bg-accent/50 transition-colors"
        >
          <Link href="/profile" className="flex items-center space-x-3 w-full">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">프로필 보기</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-border/30 my-1" />

        <DropdownMenuItem asChild className="p-0">
          <LogoutButton
            variant="ghost"
            className="w-full justify-start px-4 py-2.5 h-auto text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive transition-colors"
          >
            로그아웃
          </LogoutButton>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
