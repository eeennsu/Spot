// 모션 토큰. 출처: DESIGN.md §6 Motion / DESIGN-expo.md §5.
// 철학: 거의 즉각(90~240ms). 250ms 넘으면 깨져 보임. 속도가 미감.

/**
 * 지속시간(ms) — ease 기반 전환.
 */
export const duration = {
  commandOpen: 120, // Cmd+K opacity 0→1 + scale 0.96→1
  rowSelect: 90, // 행 선택 색 cross-fade(이동 없음)
  groupCollapse: 150, // 그룹 접기/펼치기 height spring
  statusChange: 150, // 상태 아이콘 morph
  sidebar: 220, // 사이드바 translateX spring
  detailPush: 240, // 디테일 패널 우→슬라이드인
} as const;

export type DurationToken = keyof typeof duration;

/**
 * 스프링 설정 — reanimated withSpring 용.
 * DESIGN 의 (response, damping) 을 reanimated 친화 필드로 변환.
 * response→대략 duration, damping(0~1)→dampingRatio.
 */
export const spring = {
  // 그룹 접기: response 0.3, damping 0.85
  groupCollapse: { duration: 300, dampingRatio: 0.85 },
  // 사이드바 슬라이드오버: response 0.35, damping 0.9
  sidebar: { duration: 350, dampingRatio: 0.9 },
} as const;

export type SpringToken = keyof typeof spring;

/**
 * 진입 스케일 — Cmd+K 시트는 0.96 에서 시작.
 */
export const motion = {
  commandEnterScale: 0.96,
  pressScale: 0.98, // 주요 버튼 pressed
} as const;

/**
 * 햅틱 — expo-haptics.
 * 주요 액션 commit·상태 변경·커맨드 실행 시 Light.
 * 사용: Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
 */
export const haptics = {
  primary: 'light', // ImpactFeedbackStyle.Light 매핑
} as const;
