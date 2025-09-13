"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
}

export function LogoutButton({
  className,
  children,
  variant = "ghost",
}: LogoutButtonProps) {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await signOut();
      // 성공 토스트는 AuthContext에서 처리하지 않음 (리다이렉트로 인해 표시되지 않을 수 있음)
    } catch (error) {
      console.error("Logout failed:", error);
      toast({
        title: "로그아웃 실패",
        description:
          error instanceof Error
            ? error.message
            : "로그아웃 중 오류가 발생했습니다",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={loading}
      className={`flex items-center space-x-2 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive ${
        className || ""
      }`}
      variant={variant}
    >
      {loading ? <LoadingSpinner size="sm" /> : <LogOut className="w-4 h-4" />}
      <span className="font-medium">{children || "로그아웃"}</span>
    </Button>
  );
}
