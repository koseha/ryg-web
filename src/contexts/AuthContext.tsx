"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 초기 세션 확인
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // 인증 상태 변화 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      console.log("Starting Google OAuth...");

      // 클라이언트 사이드에서 직접 OAuth 시작
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error("OAuth error:", error);
        throw new Error(error.message || "OAuth failed");
      }

      if (data.url) {
        console.log("Redirecting to OAuth URL...");
        window.location.href = data.url;
      } else {
        throw new Error("No OAuth URL received");
      }
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);

      // 클라이언트사이드에서 직접 로그아웃 실행
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error(error.message || "로그아웃에 실패했습니다");
      }

      // 로컬 상태 즉시 초기화
      setUser(null);
      setSession(null);

      // 현재 페이지가 홈이 아닌 경우에만 리다이렉트
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      } else {
        // 홈페이지인 경우 새로고침으로 상태 초기화
        window.location.reload();
      }
    } catch (error) {
      console.error("Logout error:", error);
      // 에러가 발생해도 로컬 상태는 초기화
      setUser(null);
      setSession(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
