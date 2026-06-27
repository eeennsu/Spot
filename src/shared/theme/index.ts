// Things 3 테마 배럴. 출처: DESIGN.md / DESIGN-expo.md.
// 교체 이력: Linear 다크 팔레트(src/theme/) → Things 3 라이트 팔레트(src/shared/theme/).
// export 표면은 구 src/theme/index.ts 와 동일하게 유지 — C 에이전트가 @shared/theme 에서 import.

export {
  colors,
  darkColors,
  statusColors,
  priority,
  semantic,
  lightColors,
  scrim,
} from './colors';
export type { ThingsColor, StatusKey } from './colors';

// 하위 호환: LinearColor → ThingsColor alias
export type { ThingsColor as LinearColor } from './colors';

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

// ── 통합 theme 객체 ────────────────────────────────────────────────
import {
  colors,
  darkColors,
  statusColors,
  priority,
  semantic,
  lightColors,
  scrim,
} from './colors';
import { typography, fontFamily } from './typography';
import { spacing, layout } from './spacing';
import { radius } from './radius';
import { elevation, overlay } from './elevation';
import { duration, spring, motion, haptics } from './motion';

/**
 * 통합 토큰 객체 — 한 번에 쓸 때.
 * import { theme } from '@shared/theme'
 */
export const theme = {
  colors,
  darkColors,
  statusColors,
  priority,
  semantic,
  lightColors,
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
} as const;

export type Theme = typeof theme;
