"use client";

import { useState } from "react";
import Image from "next/image";
import { User, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockUser = {
  name: "Faker",
  email: "faker@lol.universe",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face"
};

export const UserDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2 p-2">
          <Image
            src={mockUser.avatar}
            alt={mockUser.name}
            width={32}
            height={32}
            className="h-8 w-8 rounded-full border-2 border-primary/30"
          />
          <span className="hidden md:block font-medium">{mockUser.name}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-56 bg-card border-border" align="end">
        <div className="px-3 py-2 border-b border-border">
          <p className="font-medium text-foreground">{mockUser.name}</p>
          <p className="text-sm text-muted-foreground">{mockUser.email}</p>
        </div>
        
        <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer">
          <User className="h-4 w-4" />
          <span>프로필 보기</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-border" />
        
        <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer text-destructive">
          <LogOut className="h-4 w-4" />
          <span>로그아웃</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};