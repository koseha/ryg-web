# CLAUDE.md

이 파일은 이 저장소에서 작업할 때 Claude Code (claude.ai/code)에게 가이드를 제공합니다.

## 개발 명령어

### 핵심 개발 명령어
- `npm run dev` - 개발 서버 시작 (http://localhost:3000)
- `npm run build` - 프로덕션 빌드
- `npm start` - 프로덕션 서버 시작
- `npm run lint` - ESLint 실행

### 필수 요구사항
- Node.js 18.17 이상
- npm 또는 yarn

## 아키텍처 개요

RYG (Record Your Games)는 App Router를 사용하여 구축된 Next.js 15 게이밍 커뮤니티 플랫폼입니다. 사용자가 리그를 생성하고, 게임을 기록하며, 게이밍 커뮤니티를 관리할 수 있는 애플리케이션입니다.

### 기술 스택
- **프레임워크**: Next.js 15 (App Router 사용)
- **언어**: TypeScript (strict 모드)
- **스타일링**: Tailwind CSS (커스텀 게이밍 테마)
- **UI 라이브러리**: Radix UI 기반 shadcn/ui 컴포넌트
- **데이터베이스**: Supabase (PostgreSQL)
- **인증**: Supabase Auth (Google OAuth)

### 주요 디렉토리 구조

```
src/
├── app/                    # Next.js App Router 페이지 및 API 라우트
│   ├── api/               # 백엔드 API 라우트
│   │   ├── leagues/       # 리그 관리 API
│   │   └── auth/          # 인증 콜백
│   ├── leagues/           # 리그 페이지 (/leagues, /leagues/[id])
│   ├── profile/           # 사용자 프로필 페이지
│   └── auth/              # 인증 콜백 페이지
├── components/            # React 컴포넌트
│   ├── Layout/           # 앱 레이아웃 컴포넌트
│   └── ui/               # shadcn/ui 컴포넌트 + 커스텀 확장
├── contexts/             # React 컨텍스트 (AuthContext)
├── hooks/                # 커스텀 React 훅
├── lib/                  # 유틸리티 함수 및 설정
│   └── supabase/         # Supabase 클라이언트 설정
└── assets/               # 정적 자산
```

### 데이터베이스 통합 (Supabase)

앱은 인증과 데이터 저장 모두에 Supabase를 사용합니다:

- **클라이언트 사이드**: `src/lib/supabase/client.ts` - 브라우저 클라이언트
- **서버 사이드**: `src/lib/supabase/server.ts` - SSR 지원 서버 클라이언트
- **미들웨어**: `src/lib/supabase/middleware.ts` - 인증 미들웨어

주요 데이터베이스 테이블:
- `profiles` - 사용자 프로필 정보
- `leagues` - 게이밍 리그
- `league_members` - 역할이 있는 리그 멤버십
- `league_stats` - 리그 통계 (멤버 수, 매치 수)
- `league_join_requests` - 대기 중인 가입 요청

### 인증 플로우

인증은 React Context를 통해 처리됩니다 (`src/contexts/AuthContext.tsx`):
- Google OAuth 통합
- 자동 프로필 가져오기
- 세션 관리
- 미들웨어를 통한 보호된 라우트

### API 아키텍처

API 라우트는 `src/app/api/`에서 REST 규약을 따릅니다:
- `/api/leagues` - 리그 CRUD 작업
- `/api/leagues/[id]/join` - 리그 가입 기능
- `/api/leagues/[id]/settings` - 리그 설정 관리

모든 API 라우트는 데이터베이스 작업에 Supabase 서버 클라이언트를 사용하며 인증 확인을 포함합니다.

### UI 디자인 시스템

앱은 다음과 같은 다크 게이밍 테마를 사용합니다:
- **주요 색상**: 골드 (#FFD700) 액센트
- **배경**: 다크 블루/블랙 게이밍 미학
- **효과**: 커스텀 CSS 클래스를 사용한 글래스모피즘:
  - `card-glass` - 글래스 효과 카드
  - `card-feature` - 기능 소개 카드
  - `btn-hero` - 주요 액션 버튼
  - `text-glow` - 글로우 텍스트 효과

### 상태 관리

- **인증**: React Context (`AuthContext`)
- **컴포넌트 상태**: React 훅 (useState, useEffect)
- **서버 상태**: 직접 API 호출 (외부 상태 관리 라이브러리 없음)

### 개발 참고사항

- TypeScript 경로 매핑 사용 (`@/*` → `./src/*`)
- 미들웨어가 인증 리다이렉트 처리 (`middleware.ts`)
- 필수 환경 변수:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `NEXT_PUBLIC_SITE_URL`
- 클라이언트 사이드 기능이 필요할 때 컴포넌트에 `"use client"` 지시어 사용
- 외부 소스(Unsplash, Google 아바타)에 대한 이미지 최적화 설정

### 테스트 및 품질

- Next.js 규칙이 포함된 ESLint 설정
- TypeScript strict 모드 활성화
- 프로덕션 빌드에서 콘솔 문 제거

## Task Master AI Instructions
**Import Task Master's development workflow commands and guidelines, treat as if import is in the main CLAUDE.md file.**
@./.taskmaster/CLAUDE.md
