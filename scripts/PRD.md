# RYG 개발 PRD

## 서비스 개요
- **서비스명**: Record Your Games (RYG)
- **목적**: 게임 리그 생성, 매치 관리, 커뮤니티 서비스
- **UI**: 한국어, 다크 테마, 모던 디자인

## 페이지 구조

### 메인 네비게이션
- **Home**: 랜딩 페이지
- **Universe**: 리그 탐색 
- **League**: 가입된 리그 관리

### 상세 페이지
1. `/` - 홈페이지 (랜딩)
2. `/universe/list` - 리그 목록
3. `/universe/league/:id` - 리그 상세 (공개 정보)
4. `/league` - 내 리그 목록
5. `/league/:id/overview` - 리그 대시보드 개요
6. `/league/:id/members` - 멤버 관리
7. `/league/:id/matches` - 매치 관리
8. `/league/:id/settings` - 리그 설정 (운영진+)
9. `/profile` - 사용자 프로필

## 핵심 기능

### 인증/프로필
- Google OAuth 로그인
- 닉네임, 티어, 포지션 관리

### 리그 관리
- 리그 생성/수정/삭제
- 리그 검색/정렬
- 가입 신청/승인/거절
- 권한: 책임자/운영진/멤버

### 가입 신청
- **필수**: 티어 선택 (브론즈~챌린저)
- **필수**: 포지션 다중선택 (탑/정글/미드/원딜/서포터)
- **선택**: 신청 메시지

### 매치 관리
- 매치 생성 (제목 + 6자리 랜덤코드)
- 상태 관리 (생성됨/진행중/완료)
- 코드 복사 기능
- 운영진 이상만 생성/수정 가능

### 멤버 관리
- 멤버 목록 (프로필/닉네임/티어/포지션/역할/가입일)
- 필터링 (역할/티어/포지션별)
- 검색, 무한스크롤
- 역할 변경/추방 (책임자만)

## 데이터 구조

### Users
- id, email, nickname, tier, positions[], profile_image

### Leagues  
- id, name, description, rules, creator_id

### League_Members
- league_id, user_id, role, status, tier, positions[], message, joined_at

### Matches
- id, league_id, title, match_code, status, created_by

## UI 컴포넌트
- LoadingSpinner, ConfirmModal, Toast, EmptyState
- UserAvatar, RoleBadge, TierBadge, PositionTags
- CopyButton, SearchInput, FilterDropdown

## 권한 체계
- **책임자**: 모든 권한
- **운영진**: 매치생성, 리그설정수정, 멤버승인
- **멤버**: 조회만

## 특이사항
- 리그 상세페이지: 티어/포지션 분포 차트
- 가입신청카드: 스크롤 따라 이동
- 멤버목록: 무한스크롤
- 매치코드: 6자리 랜덤 생성
- 모든 리그는 공개