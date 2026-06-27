// theme 배럴 — Linear(iOS) 디자인 토큰. 출처: DESIGN.md / DESIGN-expo.md.
// 사용: import { theme } from '@/theme'  또는 개별 import.
export { colors, statusColors, priority, semantic, lightColors, scrim } from './colors';
export type { LinearColor, StatusKey } from './colors';

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

import { colors, statusColors, priority, semantic, lightColors, scrim } from './colors';
import { typography, fontFamily } from './typography';
import { spacing, layout } from './spacing';
import { radius } from './radius';
import { elevation, overlay } from './elevation';
import { duration, spring, motion, haptics } from './motion';

/**
 * 통합 토큰 객체 — 한 번에 쓸 때.
 */
export const theme = {
  colors,
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
