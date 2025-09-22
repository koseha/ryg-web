import { useCallback, useRef } from 'react';

interface ApiPerformanceMetrics {
  endpoint: string;
  duration: number;
  timestamp: number;
  status: number;
  success: boolean;
}

export function useApiPerformance() {
  const metricsRef = useRef<ApiPerformanceMetrics[]>([]);

  const measureApiCall = useCallback(async <T>(
    apiCall: () => Promise<Response>,
    endpoint: string
  ): Promise<{ data: T | null; metrics: ApiPerformanceMetrics }> => {
    const start = performance.now();
    let response: Response;
    let success = false;

    try {
      response = await apiCall();
      success = response.ok;

      const duration = performance.now() - start;
      const metrics: ApiPerformanceMetrics = {
        endpoint,
        duration: Math.round(duration * 100) / 100,
        timestamp: Date.now(),
        status: response.status,
        success
      };

      // 메트릭 저장 (최근 100개만)
      metricsRef.current.push(metrics);
      if (metricsRef.current.length > 100) {
        metricsRef.current.shift();
      }

      // 콘솔에 성능 로그
      const emoji = duration > 1000 ? '🐌' : duration > 500 ? '⚠️' : '⚡';
      console.log(`${emoji} API ${endpoint}: ${duration.toFixed(2)}ms`);

      // 느린 API 경고
      if (duration > 2000) {
        console.warn(`🚨 Very slow API detected: ${endpoint} took ${duration.toFixed(2)}ms`);
      }

      let data = null;
      if (response.ok) {
        try {
          data = await response.json();
        } catch {
          console.warn('Failed to parse JSON response');
        }
      }

      return { data, metrics };
    } catch (error) {
      const duration = performance.now() - start;
      const metrics: ApiPerformanceMetrics = {
        endpoint,
        duration: Math.round(duration * 100) / 100,
        timestamp: Date.now(),
        status: 0,
        success: false
      };

      metricsRef.current.push(metrics);
      console.error(`❌ API ${endpoint} failed:`, error);

      return { data: null, metrics };
    }
  }, []);

  const getMetrics = useCallback(() => {
    return metricsRef.current;
  }, []);

  const getStats = useCallback((endpoint?: string) => {
    const metrics = endpoint
      ? metricsRef.current.filter(m => m.endpoint === endpoint)
      : metricsRef.current;

    if (metrics.length === 0) return null;

    const durations = metrics.map(m => m.duration);
    const successCount = metrics.filter(m => m.success).length;

    durations.sort((a, b) => a - b);

    return {
      count: metrics.length,
      successRate: (successCount / metrics.length * 100).toFixed(1),
      avg: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length * 100) / 100,
      min: durations[0],
      max: durations[durations.length - 1],
      p50: durations[Math.floor(durations.length * 0.5)],
      p95: durations[Math.floor(durations.length * 0.95)],
    };
  }, []);

  const clearMetrics = useCallback(() => {
    metricsRef.current = [];
  }, []);

  return {
    measureApiCall,
    getMetrics,
    getStats,
    clearMetrics
  };
}