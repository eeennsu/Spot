// Things 3 색 토큰. 출처: DESIGN.md §2 / DESIGN-expo.md §1.
// 교체 이력: Linear 다크 팔레트 → Things 3 라이트 팔레트.
// 기본은 라이트(흰 방). 다크는 darkColors 로 보조 정의.

/**
 * 라이트 팔레트 — Things 3 "흰 방" (기본).
 * DESIGN.md §2 Canvas & Surface (Light — primary).
 */
export const colors = {
  // ── 캔버스·표면 ───────────────────────────────
  /** 앱 배경 — 순백 (DESIGN.md §2) */
  canvas: '#FFFFFF',
  /** 그룹 섹션 배경·검색 필드·거의 없는 리프트 (DESIGN.md §2 Surface 1) */
  surface1: '#F5F6F8',
  /** 눌린 행·세그먼트 컨트롤 (DESIGN.md §2 Surface 2) */
  surface2: '#ECECEC',
  /** 1pt 헤어라인 구분선 (DESIGN.md §2 Divider) */
  divider: '#ECECEC',

  // ── 텍스트 ────────────────────────────────────
  /** 제목·기본 텍스트 — 순검정에 가까운 잉크 (DESIGN.md §2) */
  textPrimary: '#1D1D1F',
  /** 메모·날짜·메타·프로젝트 부제 (DESIGN.md §2) */
  textSecondary: '#8A8A8E',
  /** 비활성·placeholder·완료 취소선 텍스트 (DESIGN.md §2 Text Tertiary) */
  textTertiary: '#C7C7CC',

  // ── 주요 액션 — Things Blue ───────────────────
  /**
   * 활성 선택·주요 액션·Magic-Plus·체크박스 완료 채움.
   * DESIGN.md §2 Things Blue.
   */
  blue: '#4F97FF',
  /** pressed 상태 (DESIGN.md §2 Blue Pressed) */
  bluePressed: '#3D7FE0',
  /** 선택 행 wash·포커스 배경 (DESIGN.md §2 Blue Tint) */
  blueTint: 'rgba(79,151,255,0.10)',

  // ── Today 강조 — 단 하나의 따뜻한 색 ──────────
  /**
   * Today 리스트 별·오늘 예정 마커.
   * DESIGN.md §2 Today Yellow — 앱 전체에서 유일한 따뜻한 액센트.
   */
  today: '#FFD60A',
  /** pressed 상태 (DESIGN.md §2 Yellow Pressed) */
  todayPressed: '#E6BE00',

  // ── 시맨틱 ────────────────────────────────────
  /** 기한 초과 태스크·마감 플래그 (DESIGN.md §2 Deadline Red) */
  deadline: '#FF3B30',
  /** 체크박스 테두리 미완료 (= textTertiary) (DESIGN.md §2 Checkbox Border) */
  checkboxBorder: '#C7C7CC',
} as const;

export type ThingsColor = keyof typeof colors;

// ── 다크 모드 보조 ────────────────────────────────
/**
 * 다크 모드 — 기본은 라이트. opt-in 시에만.
 * Things Blue / Today Yellow 은 동일 값 유지.
 * DESIGN.md §2 Dark Mode.
 */
export const darkColors = {
  darkCanvas: '#1C1C1E',
  darkSurface: '#2C2C2E',
  darkDivider: '#38383A',
  darkTextPrimary: '#F2F2F7',
  darkTextSecondary: '#98989F',
} as const;

// ── 하위 호환 re-export (C 에이전트가 기존 이름으로 참조할 수 있음) ──
/**
 * @deprecated 구 Linear 팔레트 호환 shim.
 * statusColors / priority / semantic / lightColors 는 Things 3 에서 개념이 다름.
 * 기존 코드가 참조하는 동안만 유지. 새 코드는 colors 직접 사용.
 */
export const statusColors = {
  backlog: colors.textSecondary,
  todo: colors.textSecondary,
  inProgress: colors.today,
  inReview: colors.blue,
  done: colors.blue,
  canceled: colors.textTertiary,
} as const;

export type StatusKey = keyof typeof statusColors;

export const priority = {
  urgent: colors.today,
  urgentDot: colors.deadline,
  bar: colors.textSecondary,
  barDim: 'rgba(196,196,200,0.4)',
} as const;

export const semantic = {
  warning: colors.today,
  error: colors.deadline,
  success: colors.blue,
} as const;

export const lightColors = {
  canvas: colors.canvas,
  surface1: colors.surface1,
  textPrimary: colors.textPrimary,
  textSecondary: colors.textSecondary,
  blue: colors.blue,
} as const;

/**
 * 스크림/오버레이 색 — 사이드바·시트 뒤 부드러운 어둠.
 * DESIGN.md §6: Things 은 스크림도 가볍게 (≈0.2).
 */
export const scrim = 'rgba(0,0,0,0.2)' as const;
