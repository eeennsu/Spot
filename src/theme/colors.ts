// Linear(iOS) 색 토큰. 출처: DESIGN.md §2 / DESIGN-expo.md §1.
// 규칙: 보라(purple)는 주요 액션·포커스·선택에만. 두 번째 강조색 금지.

/**
 * 핵심 팔레트 — DESIGN-expo.md 의 colors 와 동일한 키(문서 컴포넌트 호환).
 * 캔버스는 #08090A(준-OLED 블랙), #121212 아님.
 */
export const colors = {
  canvas: '#08090A', // 기본 배경
  surface1: '#141516', // 행/시트/팝오버
  surface2: '#1C1D1F', // 모달/hover/active
  surface3: '#232428', // pressed/입력 채움
  divider: '#23252A', // 1pt 헤어라인

  textPrimary: '#F7F8F8', // 제목·기본 텍스트
  textSecondary: '#8A8F98', // 식별자·메타·타임스탬프
  textTertiary: '#5C5F6A', // 비활성·placeholder

  purple: '#5E6AD2', // 주요 액션·포커스·선택
  purplePressed: '#4F58B8', // pressed
  purpleTint: 'rgba(94,106,210,0.14)', // 선택 배경·포커스 wash

  progress: '#F2C94C', // 진행중 amber(=warning)
  success: '#4CB782', // 완료·성공 토스트
  error: '#EB5757', // 파괴적 액션·동기화 실패
} as const;

export type LinearColor = keyof typeof colors;

/**
 * 상태 아이콘 색 — DESIGN.md §2 Status System.
 * 색은 StatusGlyph(커스텀 SVG)에서 stroke/fill 로 사용.
 */
export const statusColors = {
  backlog: colors.textSecondary, // 점선 빈 원
  todo: colors.textSecondary, // 얇은 실선 원
  inProgress: colors.progress, // 반쯤 채운 원
  inReview: colors.purple, // 보라 링
  done: colors.purple, // 채운 원 + 체크
  canceled: colors.textTertiary, // 회색 채움 + ✕
} as const;

export type StatusKey = keyof typeof statusColors;

/**
 * 우선순위 — DESIGN.md §2 Priority.
 * urgent = amber 사각 + 빨강 점, 나머지는 회색 막대(채움/흐림).
 */
export const priority = {
  urgent: colors.progress,
  urgentDot: colors.error,
  bar: colors.textSecondary, // 채워진 막대
  barDim: 'rgba(92,95,106,0.4)', // 미설정 막대
} as const;

/**
 * 시맨틱 별칭 — 의미로 색을 부를 때.
 */
export const semantic = {
  warning: colors.progress, // 연체·주의
  error: colors.error,
  success: colors.success,
} as const;

/**
 * 라이트 모드(제한적). 다크 우선, opt-in 시에만.
 * DESIGN.md §2 Light Mode.
 */
export const lightColors = {
  canvas: '#FFFFFF',
  surface1: '#F4F5F8',
  textPrimary: '#08090A',
  textSecondary: '#6B6F76',
  purple: colors.purple,
} as const;

/**
 * 스크림/오버레이 — 사이드바·모달 뒤 어둡게.
 * DESIGN.md §6 Depth & Elevation.
 */
export const scrim = 'rgba(0,0,0,0.5)' as const;
