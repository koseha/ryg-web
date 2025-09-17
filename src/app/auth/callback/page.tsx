"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {

        // Supabase가 자동으로 URL에서 세션을 감지하도록 대기
        // detectSessionInUrl: true 설정으로 자동 처리됨
        setTimeout(async () => {
          try {
            const supabase = createClient();
            const { data: sessionData, error: sessionError } =
              await supabase.auth.getSession();

            if (sessionError) {
              console.error("Session error:", sessionError);
              router.push(
                `/?error=session_error&message=${encodeURIComponent(
                  sessionError.message
                )}`
              );
              return;
            }

            if (sessionData.session) {
              router.push("/");
            } else {
              console.error("No session found after OAuth callback");
              router.push("/?error=no_session");
            }
          } catch (error) {
            console.error("Unexpected error during session check:", error);
            router.push("/?error=unexpected");
          }
        }, 3000); // 3초 대기
      } catch (error) {
        console.error("Unexpected error:", error);
        router.push("/?error=unexpected");
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">로그인 처리 중...</p>
      </div>
    </div>
  );
}
