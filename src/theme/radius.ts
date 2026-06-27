// 모서리 반경 토큰. 출처: DESIGN.md §5 Border Radius Scale.

/**
 * 반경 스케일.
 * none  — 구분선·풀블리드 행
 * sm    — 라벨 pill·아이콘버튼 hover·드롭다운
 * md    — 버튼·입력·상태 pill
 * lg    — Cmd+K 시트·모달
 * full  — 아바타·워크스페이스 아이콘(원)
 */
export const radius = {
  none: 0,
  sm: 6,
  md: 8,
  lg: 12,
  full: 9999,
} as const;

export type RadiusToken = keyof typeof radius;
