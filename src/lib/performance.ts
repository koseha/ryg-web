// API 성능 측정 유틸리티
export class PerformanceMonitor {
  private static measurements: Map<string, number[]> = new Map();

  static startTiming(label: string): () => number {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.recordMeasurement(label, duration);
      return duration;
    };
  }

  static recordMeasurement(label: string, duration: number) {
    if (!this.measurements.has(label)) {
      this.measurements.set(label, []);
    }
    const measurements = this.measurements.get(label)!;
    measurements.push(duration);

    // 최근 100개 측정값만 유지
    if (measurements.length > 100) {
      measurements.shift();
    }
  }

  static getStats(label: string) {
    const measurements = this.measurements.get(label) || [];
    if (measurements.length === 0) return null;

    const sorted = [...measurements].sort((a, b) => a - b);
    const avg = measurements.reduce((a, b) => a + b, 0) / measurements.length;
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];

    return {
      count: measurements.length,
      avg: Math.round(avg * 100) / 100,
      min: Math.round(sorted[0] * 100) / 100,
      max: Math.round(sorted[sorted.length - 1] * 100) / 100,
      p50: Math.round(p50 * 100) / 100,
      p95: Math.round(p95 * 100) / 100,
      p99: Math.round(p99 * 100) / 100,
    };
  }

  static getAllStats() {
    const allStats: Record<string, ReturnType<typeof PerformanceMonitor.getStats>> = {};
    for (const [label] of this.measurements) {
      allStats[label] = this.getStats(label);
    }
    return allStats;
  }

  static logSlowQueries(threshold = 1000) {
    for (const [label, measurements] of this.measurements) {
      const recent = measurements.slice(-10);
      const slow = recent.filter(m => m > threshold);
      if (slow.length > 0) {
        console.warn(`⚠️ Slow API detected: ${label}`, {
          slowCount: slow.length,
          avgSlow: slow.reduce((a, b) => a + b, 0) / slow.length,
          threshold
        });
      }
    }
  }
}

// API 라우트용 성능 측정 래퍼
export function withPerformanceMonitoring<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  label: string
) {
  return async (...args: T): Promise<R> => {
    const endTiming = PerformanceMonitor.startTiming(label);
    try {
      const result = await fn(...args);
      const duration = endTiming();

      if (duration > 500) {
        console.warn(`🐌 Slow API: ${label} took ${duration.toFixed(2)}ms`);
      }

      return result;
    } catch (error) {
      endTiming();
      throw error;
    }
  };
}