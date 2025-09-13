"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface LoginButtonProps {
  className?: string;
  children?: React.ReactNode;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "hero";
}

export function LoginButton({
  className,
  children,
  variant = "outline",
}: LoginButtonProps) {
  const router = useRouter();

  const handleLoginClick = () => {
    router.push("/login");
  };

  return (
    <Button onClick={handleLoginClick} className={className} variant={variant}>
      {children || "로그인"}
    </Button>
  );
}
