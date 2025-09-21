# RYG (Record Your Games) - Next.js

게임 커뮤니티 플랫폼으로, 게이머들이 리그를 만들고 게임을 기록하며 관리할 수 있는 웹 애플리케이션입니다.

## 🚀 기술 스택

- **Next.js 15** - React 프레임워크 (App Router)
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 스타일링
- **Supabase** - 백엔드 서비스 (인증, 데이터베이스)
- **shadcn/ui** - UI 컴포넌트 라이브러리
- **Radix UI** - 접근성 기반 UI 프리미티브
- **Lucide React** - 아이콘 라이브러리

## ✨ 주요 기능

### 🏠 홈페이지

- 히어로 섹션 with 배경 이미지
- 3가지 핵심 기능 소개
- 애니메이션 효과 (float, glow)
- 반응형 디자인

### 🌌 Universe 페이지

- 리그 검색 및 필터링
- 리그 카드 그리드 레이아웃
- 정렬 옵션 (최신순, 멤버순)
- 빈 상태 처리

### 🏆 My Leagues 페이지

- 사용자 리그 대시보드
- 역할별 권한 표시 (Owner, Admin, Member)
- 리그 생성 모달
- 가입 신청 대기 중인 리그 관리
- 신청 취소 기능

### 🔐 인증 시스템

- Google OAuth 로그인
- Supabase Auth 통합
- 세션 관리
- 프로필 관리

### 🔧 API Routes

- `/api/leagues` - 리그 CRUD 작업 (검색, 필터링, 페이지네이션)
- `/api/leagues/[id]` - 특정 리그 상세 정보
- `/api/matches` - 매치 관리

## 🎨 디자인 시스템

### 테마

- **다크 테마** 기반 (게임 분위기)
- **골드 색상** (`#FFD700`) - 주요 액센트 컬러
- **다크 블루** 배경 - 게임 UI 스타일
- **글래스모피즘** 효과 - 현대적인 UI

### 커스텀 컴포넌트

- `card-glass` - 글래스 효과 카드
- `card-feature` - 기능 소개 카드
- `btn-hero` - 주요 액션 버튼
- `text-glow` - 텍스트 글로우 효과

## 🛠️ 개발 환경 설정

### 필수 요구사항

- Node.js 18.17 이상
- npm 또는 yarn

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 린팅
npm run lint
```

### 개발 서버

개발 서버는 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── leagues/       # 리그 API
│   │   ├── matches/       # 매치 API
│   │   └── profiles/      # 프로필 API
│   ├── auth/              # 인증 페이지
│   ├── universe/          # Universe 페이지
│   ├── leagues/           # My Leagues 페이지
│   ├── profile/           # 프로필 페이지
│   ├── globals.css        # 글로벌 스타일
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 홈페이지
├── components/            # React 컴포넌트
│   ├── Layout/           # 레이아웃 컴포넌트
│   ├── auth/             # 인증 컴포넌트
│   └── ui/               # UI 컴포넌트 (shadcn/ui)
├── contexts/             # React Context
├── hooks/                # 커스텀 훅
├── lib/                  # 유틸리티 함수
│   └── supabase/         # Supabase 클라이언트 설정
└── assets/               # 정적 자산
```

## 🛠️ 환경 설정

### 환경 변수

프로젝트를 실행하기 위해 다음 환경 변수들을 설정해야 합니다:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 🚀 배포

### Vercel (권장)

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel
```

환경 변수를 Vercel 대시보드에서 설정해주세요.

## 📝 라이선스

MIT License
