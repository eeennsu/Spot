// ── 통합 theme 객체 ────────────────────────────────────────────────
import { colors, darkColors, scrim } from './colors';
import { elevation, overlay } from './elevation';
import { duration, spring, motion, haptics } from './motion';
import { palette } from './palette';
import { radius } from './radius';
import { spacing, layout } from './spacing';
import { typography, fontFamily } from './typography';

// Things 3 테마 배럴. 출처: DESIGN.md / DESIGN-expo.md.
// 교체 이력: Linear 다크 팔레트(src/theme/) → Things 3 라이트 팔레트(src/shared/theme/).

export { colors, darkColors, scrim } from './colors';
export type { ThingsColor } from './colors';

export { typography, fontFamily } from './typography';
export type { TypographyToken } from './typography';

export { spacing, layout } from './spacing';
export type { SpacingToken } from './spacing';

export { radius } from './radius';
export type { RadiusToken } from './radius';

export { elevation, overlay } from './elevation';
export type { ElevationToken } from './elevation';

export { duration, spring, motion, haptics } from './motion';
export type { DurationToken, SpringToken } from './motion';

export { palette, pickOnFill } from './palette';
export type { ShapeFill } from './palette';

/**
 * 통합 토큰 객체 — 한 번에 쓸 때.
 * import { theme } from '@shared/theme'
 */
export const theme = {
  colors,
  darkColors,
  scrim,
  typography,
  fontFamily,
  spacing,
  layout,
  radius,
  elevation,
  overlay,
  duration,
  spring,
  motion,
  haptics,
  palette,
} as const;

export type Theme = typeof theme;
