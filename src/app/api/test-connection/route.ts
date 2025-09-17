import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    // 1. 기본 연결 테스트 - auth.users 테이블 확인 (기본 제공)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // 2. 프로젝트 정보 확인
    const { error: projectError } = await supabase
      .from("profiles")
      .select("count")
      .limit(1);

    // profiles 테이블이 없어도 연결은 성공한 것으로 간주
    const connectionStatus = authError ? "Failed" : "OK";
    const tableStatus = projectError
      ? "No custom tables yet"
      : "Custom tables exist";

    return NextResponse.json({
      success: true,
      message: "Supabase connection test completed!",
      data: {
        connection: connectionStatus,
        auth: user ? "User authenticated" : "No user authenticated",
        tables: tableStatus,
        timestamp: new Date().toISOString(),
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
          ? "Configured"
          : "Not configured",
      },
    });
  } catch (error) {
    console.error("Test connection error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Unexpected error occurred",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
