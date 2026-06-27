// Things 3 모서리 반경 토큰. 출처: DESIGN.md §5 Border Radius Scale.
// 교체 이력: Linear(none 0, sm 6, md 8, lg 12, full 9999) →
//            Things 3(sharp 0, soft 8, standard 10, comfortable 14, circle 9999).
// 기존 none/sm/md/lg/full 이름은 shim으로 유지(하위 호환).

/**
 * 반경 스케일 (dp). DESIGN.md §5.
 *
 * sharp       — 헤어라인 구분선 (0)
 * soft        — 선택 행 하이라이트·세그먼트 컨트롤 (8)
 * standard    — 검색 필드·채운 버튼·시트 내부 카드 (10)
 * comfortable — 하단 시트 (When picker, 태그 picker) (14)
 * circle      — 체크박스·Magic-Plus·파이 링 (9999)
 */
export const radius = {
  sharp: 0,
  soft: 8,
  standard: 10,
  comfortable: 14,
  circle: 9999,

  // ── 하위 호환 shim (구 Linear 이름) ──────────────────────────────
  /** @deprecated → sharp */
  none: 0,
  /** @deprecated → soft */
  sm: 8,
  /** @deprecated → standard */
  md: 10,
  /** @deprecated → comfortable */
  lg: 14,
  /** @deprecated → circle */
  full: 9999,
} as const;

export type RadiusToken = keyof typeof radius;
