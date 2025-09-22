#!/usr/bin/env node

const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

async function measureApiPerformance(endpoint, iterations = 10) {
  const results = [];

  console.log(`🚀 Testing ${endpoint} (${iterations} iterations)...`);

  for (let i = 0; i < iterations; i++) {
    const start = Date.now();

    try {
      const response = await fetch(`${baseUrl}${endpoint}`);
      const duration = Date.now() - start;

      results.push({
        iteration: i + 1,
        duration,
        status: response.status,
        success: response.ok
      });

      if (!response.ok) {
        console.warn(`❌ Request ${i + 1} failed: ${response.status}`);
      }

      // 요청 간 간격
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`❌ Request ${i + 1} error:`, error.message);
      results.push({
        iteration: i + 1,
        duration: Date.now() - start,
        status: 0,
        success: false,
        error: error.message
      });
    }
  }

  // 통계 계산
  const successResults = results.filter(r => r.success);
  const durations = successResults.map(r => r.duration);

  if (durations.length === 0) {
    console.log('❌ All requests failed');
    return;
  }

  durations.sort((a, b) => a - b);

  const stats = {
    endpoint,
    total: results.length,
    success: successResults.length,
    successRate: (successResults.length / results.length * 100).toFixed(1),
    avg: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
    min: durations[0],
    max: durations[durations.length - 1],
    p50: durations[Math.floor(durations.length * 0.5)],
    p95: durations[Math.floor(durations.length * 0.95)],
    p99: durations[Math.floor(durations.length * 0.99)]
  };

  console.log('📊 Results:');
  console.log(`   Success Rate: ${stats.successRate}% (${stats.success}/${stats.total})`);
  console.log(`   Average: ${stats.avg}ms`);
  console.log(`   Min: ${stats.min}ms`);
  console.log(`   Max: ${stats.max}ms`);
  console.log(`   P50: ${stats.p50}ms`);
  console.log(`   P95: ${stats.p95}ms`);
  console.log(`   P99: ${stats.p99}ms`);

  // 성능 경고
  if (stats.avg > 1000) {
    console.log('🚨 WARNING: Average response time > 1000ms');
  } else if (stats.avg > 500) {
    console.log('⚠️  CAUTION: Average response time > 500ms');
  } else {
    console.log('✅ Good performance');
  }

  console.log('');
  return stats;
}

async function runPerformanceTests() {
  console.log('🔥 RYG API Performance Test');
  console.log(`📍 Base URL: ${baseUrl}`);
  console.log('─'.repeat(50));

  const endpoints = [
    '/api/leagues',
    '/api/leagues?scope=my',
    '/api/leagues?search=test&sortBy=members',
    '/api/matches',
    '/api/profile',
  ];

  const allResults = [];

  for (const endpoint of endpoints) {
    const result = await measureApiPerformance(endpoint, 5);
    if (result) {
      allResults.push(result);
    }
  }

  // 전체 요약
  console.log('📈 SUMMARY');
  console.log('─'.repeat(50));

  allResults.forEach(result => {
    const status = result.avg > 1000 ? '🚨' : result.avg > 500 ? '⚠️' : '✅';
    console.log(`${status} ${result.endpoint.padEnd(30)} ${result.avg}ms avg`);
  });

  // 가장 느린 엔드포인트
  const slowest = allResults.sort((a, b) => b.avg - a.avg)[0];
  if (slowest) {
    console.log(`\n🐌 Slowest endpoint: ${slowest.endpoint} (${slowest.avg}ms avg)`);
  }
}

// 실행
if (require.main === module) {
  runPerformanceTests()
    .catch(error => {
      console.error('Performance test failed:', error);
      process.exit(1);
    });
}

module.exports = { measureApiPerformance, runPerformanceTests };