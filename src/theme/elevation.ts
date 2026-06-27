// 깊이/그림자 토큰. 출처: DESIGN.md §6 Depth & Elevation.
// 철학: 그림자 거의 안 씀. 깊이는 배경 한 단계 상승(#08090A→#1C1D1F)+1pt 보더로.
// 진짜 그림자는 떠 있는 면(Cmd+K, 드롭다운)에만.
// ⚠ Android 전용 프로젝트 → Android 의 elevation(number)이 실효. shadow* 는 참고용.
import type { ViewStyle } from 'react-native';

import { colors, scrim } from './colors';

/**
 * 레벨별 처리.
 * flat     — 행·리스트·그룹헤더(그림자 없음)
 * hover    — 색만 한 단계 상승(그림자 없음)
 * popover  — 상태/담당자 드롭다운, 라벨 피커
 * command  — Cmd+K 메뉴·작성 모달(가장 강한 그림자)
 */
export const elevation = {
  flat: { elevation: 0 } satisfies ViewStyle,

  // 깊이를 색으로: 배경만 올리고 그림자 없음
  hover: { backgroundColor: colors.surface2, elevation: 0 } satisfies ViewStyle,

  // 팝오버: 부드러운 그림자 + 1pt 보더 (DESIGN: rgba(0,0,0,0.4) 0 8 24)
  popover: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.divider,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 8,
  } satisfies ViewStyle,

  // 커맨드 시트: 크고 깊은 그림자 (DESIGN: rgba(0,0,0,0.6) 0 24 64)
  command: {
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.divider,
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 24 },
    shadowRadius: 64,
    elevation: 24,
  } satisfies ViewStyle,
} as const;

export type ElevationToken = keyof typeof elevation;

/**
 * 스크림 — 사이드바 슬라이드오버·모달 뒤 어둡게.
 */
export const overlay = { backgroundColor: scrim } satisfies ViewStyle;
