// 도형 채움 팔레트 — 콘텐츠 색(화면의 주인공). UI 크롬 토큰(colors)과 구분.
// 도형 색은 사용자가 고르는 콘텐츠라서 chrome 토큰이 아닌 별도 팔레트로 둔다.
// 컴포넌트는 이 토큰만 참조(하드코딩 금지).

/**
 * 자재 도형 기본 채움 후보 — 또렷하되 흰 방에서 과하지 않게.
 * 첫 값(blue)은 신규 자재 도형 기본색.
 */
export const palette = {
  /** 자재 도형 색 후보(색 피커) */
  shapeFills: [
    '#4F97FF', // blue
    '#34C759', // green
    '#FF9F0A', // orange
    '#FF375F', // pink-red
    '#AF52DE', // purple
    '#5AC8FA', // sky
    '#FFD60A', // yellow
    '#8E8E93', // grey
  ] as const,
  /** 공간 도형 기본 채움 — 중립(한 발 물러남) */
  spaceFill: '#ECECEC',
  /** 자재 도형 기본색 */
  defaultMaterialFill: '#4F97FF',
  /** 도형 위 텍스트 대비 — 밝은/어두운 */
  onFillLight: '#FFFFFF',
  onFillDark: '#1D1D1F',
  /** 선택 외곽선·핸들 — Things blue 와 동일(액션색) */
  handle: '#4F97FF',
} as const;

export type ShapeFill = (typeof palette.shapeFills)[number];

/**
 * 채움색 위 텍스트 대비 자동 선택(YIQ 근사). hex(#RRGGBB) 입력.
 */
export function pickOnFill(hex: string): string {
  const h = hex.replace('#', '');
  if (h.length < 6) return palette.onFillDark;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  // 임계값 128(YIQ 중앙) — 중간 채도 녹색·회색에서도 대비 확보(150은 흰 글자를 골라 저대비였음).
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? palette.onFillDark : palette.onFillLight;
}
