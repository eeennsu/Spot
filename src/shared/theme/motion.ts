// Things 3 모션 토큰. 출처: DESIGN.md §6 Motion / DESIGN-expo.md §5.
// 교체 이력: Linear(즉각 90~240ms, 속도가 미감) →
//            Things 3(soft spring, 150~300ms, 완료 순간이 시그니처).
// 기존 duration / spring / motion / haptics export 이름 유지(C 에이전트 호환).

/**
 * 지속시간(ms) — Things 3 시그니처 전환.
 * DESIGN.md §6 Motion.
 */
export const duration = {
  /** 체크박스 원형 채움 center-out (DESIGN.md: ~180ms) */
  checkboxFill: 180,
  /** 완료 행 페이드아웃·높이 축소 (DESIGN.md: 250ms) */
  rowFade: 250,
  /** 섹션 헤딩 접기/펼치기 ease-in-out (DESIGN.md: 200ms) */
  heading: 200,
  /** 파이 프로그레스 호 전진 (DESIGN.md: 300ms) */
  pie: 300,
  /** 사이드바 슬라이드오버 spring (DESIGN.md: ~240ms) */
  sidebar: 240,

  // ── 하위 호환 shim (구 Linear 이름) ──────────────────────────────
  /** @deprecated → 해당 Things 이름 사용. 구 Cmd+K open 120ms → checkboxFill 근사 */
  commandOpen: 180,
  /** @deprecated → checkboxFill / rowFade */
  rowSelect: 180,
  /** @deprecated → heading */
  groupCollapse: 200,
  /** @deprecated (상태 아이콘 morph — Things에 없음) */
  statusChange: 200,
  /** @deprecated → sidebar */
  detailPush: 240,
} as const;

export type DurationToken = keyof typeof duration;

/**
 * 스프링 설정 — reanimated withSpring 용.
 * DESIGN.md §6: (response, damping) → reanimated 친화 필드.
 * duration(ms) ≈ response × 1000, dampingRatio = damping.
 * DESIGN-expo.md §5 Springs.
 */
export const spring = {
  /**
   * 체크박스 완료 체크 스프링.
   * DESIGN.md: response 0.3, damping 0.6 → 탄성 있는 바운스.
   */
  check: { duration: 300, dampingRatio: 0.6 },

  /**
   * Magic-Plus 탭 스케일 스프링.
   * DESIGN.md: response 0.25, damping 0.7.
   */
  magicPlus: { duration: 250, dampingRatio: 0.7 },

  /**
   * 사이드바 슬라이드오버.
   * DESIGN.md: response 0.35, damping 0.9 → 빠르고 안정적.
   */
  sidebar: { duration: 350, dampingRatio: 0.9 },

  // ── 하위 호환 shim ────────────────────────────────────────────────
  /** @deprecated → spring.check */
  groupCollapse: { duration: 300, dampingRatio: 0.85 },
} as const;

export type SpringToken = keyof typeof spring;

/**
 * 진입·인터랙션 스케일 상수.
 * DESIGN.md §4 Magic-Plus pressed = 0.94 / DESIGN-expo.md §5.
 */
export const motion = {
  /** Magic-Plus 탭 pressed 스케일 (DESIGN.md §4: 0.94) */
  magicPlusPressScale: 0.94,
  /** Magic-Plus 드래그 lift 스케일 (DESIGN.md §6: 1.05) */
  magicPlusLiftScale: 1.05,
  /** Today 별 bounce 피크 스케일 (DESIGN.md §4: 1.15) */
  starBounceScale: 1.15,
  /** 주요 버튼 pressed 스케일 */
  pressScale: 0.96,
  /** @deprecated → magicPlusPressScale */
  commandEnterScale: 0.96,
} as const;

/**
 * 햅틱 매핑 — expo-haptics ImpactFeedbackStyle 이름 문자열.
 * 사용: Haptics.impactAsync(Haptics.ImpactFeedbackStyle[haptics.soft])
 * DESIGN.md §4 / DESIGN-expo.md §5.
 *
 * soft   — 체크박스 토글 (ImpactFeedbackStyle.Soft)
 * medium — Magic-Plus 탭 (ImpactFeedbackStyle.Medium)
 * light  — 스케줄 스와이프 커밋 (ImpactFeedbackStyle.Light)
 */
export const haptics = {
  /** 체크박스 토글 */
  soft: 'Soft',
  /** Magic-Plus 탭·드래그 릴리즈 */
  medium: 'Medium',
  /** 스와이프 커밋·가벼운 확인 */
  light: 'Light',
  /** @deprecated → haptics.light */
  primary: 'Light',
} as const;
