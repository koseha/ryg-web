import { NextResponse } from "next/server";
import { PerformanceMonitor } from "@/lib/performance";

export async function GET() {
  try {
    const stats = PerformanceMonitor.getAllStats();

    // 느린 쿼리 로깅
    PerformanceMonitor.logSlowQueries(500);

    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error getting performance stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get performance stats" },
      { status: 500 }
    );
  }
}