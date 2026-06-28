// Things 3 깊이·그림자 토큰. 출처: DESIGN.md §6 Depth & Elevation.
// 교체 이력: Linear(다크 배경 + 강한 그림자 0.4~0.6) →
//            Things 3(순백 방 + 거의 flat, 단 하나의 파란 글로우).
// 철학: 행·리스트·캔버스는 완전 flat. 유일한 실제 그림자 = Magic-Plus 파란 글로우.
// Android 전용 → Android elevation(number)이 실효. shadow* 는 iOS 참고용으로 포함.
import type { ViewStyle } from 'react-native';

import { colors, scrim } from './colors';

/**
 * 레벨별 처리. DESIGN.md §6 표.
 *
 * flat      — 행·리스트·캔버스 (그림자 없음, Level 0)
 * selection — 선택 행 tint만, 그림자 없음 (Level 1)
 * magicPlus — 파란 글로우 (Level 2) — 앱 내 유일한 진짜 그림자
 * sheet     — When picker·태그 picker·모달 카드 (Level 3)
 */
export const elevation = {
  /**
   * Flat — 행·리스트·캔버스.
   * DESIGN.md §6: "the white room is flat"
   */
  flat: {
    elevation: 0,
  } satisfies ViewStyle,

  /**
   * Selection — 선택 행. 색 tint만, 그림자 없음.
   * DESIGN.md §6: "Background tint only (rgba(79,151,255,0.10)), no shadow"
   */
  selection: {
    backgroundColor: colors.blueTint,
    elevation: 0,
  } satisfies ViewStyle,

  /**
   * Magic-Plus 파란 글로우 — 앱 내 유일한 의도적 그림자.
   * DESIGN.md §6: "rgba(79,151,255,0.35) 0 8px 20px"
   * DESIGN-expo.md §1 elevation.magicPlus.
   */
  magicPlus: {
    shadowColor: colors.blue, // '#4F97FF'
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12, // Android 근사치
  } satisfies ViewStyle,

  /**
   * Sheet — When picker·태그 picker·모달.
   * DESIGN.md §6: "rgba(0,0,0,0.12) 0 -8px 32px"
   * DESIGN-expo.md §1 elevation.sheet.
   */
  sheet: {
    shadowColor: 'rgba(0,0,0,0.12)',
    shadowOpacity: 1,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: -8 },
    elevation: 8,
  } satisfies ViewStyle,

  // ── 하위 호환 shim (구 Linear 이름) ──────────────────────────────
  /**
   * @deprecated → elevation.flat.
   * 구 Linear hover(배경색 올리기)는 Things 에서 selection 으로 대체.
   */
  hover: {
    backgroundColor: colors.surface2,
    elevation: 0,
  } satisfies ViewStyle,

  /**
   * @deprecated → elevation.sheet.
   * 구 Linear popover.
   */
  popover: {
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.divider,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 8,
  } satisfies ViewStyle,

  /**
   * @deprecated → elevation.sheet.
   * 구 Linear command sheet.
   */
  command: {
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.divider,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 32,
    elevation: 12,
  } satisfies ViewStyle,
} as const;

export type ElevationToken = keyof typeof elevation;

/**
 * 스크림/오버레이 ViewStyle — 사이드바·시트 뒤 배경.
 * DESIGN.md §6 Scrim: rgba(0,0,0,0.2) — Things 는 스크림도 가볍게.
 * DESIGN-expo.md §1 elevation.scrim.
 */
export const overlay = {
  backgroundColor: scrim, // 'rgba(0,0,0,0.2)'
} satisfies ViewStyle;
