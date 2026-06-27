// 간격 토큰. 출처: DESIGN.md §5 Spacing System.
// 기준 4pt, 스케일 [4,6,8,12,16,20,24,32,40,56].

/**
 * 간격 스케일 — 밀도가 제품. 행 사이 여백은 0(구분은 hover/헤더로).
 */
export const spacing = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xl2: 20,
  xl3: 24,
  xl4: 32,
  xl5: 40,
  xl6: 56,
} as const;

export type SpacingToken = keyof typeof spacing;

/**
 * 자주 쓰는 레이아웃 상수 — DESIGN.md §5.
 */
export const layout = {
  screenMargin: 16, // 리스트 좌우 인셋
  rowPadding: 8, // 행 내부 패딩
  commandMenuMaxWidth: 560, // Cmd+K 시트 최대폭
  sidebarWidth: 280, // 슬라이드오버 사이드바
} as const;
