"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function LogoutButton({ 
  className, 
  children, 
  variant = "ghost" 
}: LogoutButtonProps) {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
      // TODO: 에러 토스트 표시
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={loading}
      className={className}
      variant={variant}
    >
      {loading ? (
        <LoadingSpinner size="sm" />
      ) : (
        <LogOut className="w-4 h-4 mr-2" />
      )}
      {children || '로그아웃'}
    </Button>
  );
}
