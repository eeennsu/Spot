// Linear 타이포 토큰. 출처: DESIGN.md §3 / DESIGN-expo.md §2.
// Inter 400/500/600 만. 식별자·단축키는 mono(Menlo). 카운트엔 tabular-nums.
import type { TextStyle } from 'react-native';

import { colors } from './colors';

/**
 * 폰트 패밀리 — expo-font 로 로드한 Inter 3종 + 시스템 mono.
 * weight 대신 패밀리로 굵기 고정(가변폰트 일관성).
 */
export const fontFamily = {
  regular: 'Inter-Regular', // 400 본문
  medium: 'Inter-Medium', // 500 제목·행
  semibold: 'Inter-SemiBold', // 600 헤더·주요 버튼
  mono: 'Menlo', // 식별자·단축키(SF Mono 대체)
} as const;

const base = { color: colors.textPrimary } satisfies TextStyle;

/**
 * 타이포 계층 — DESIGN.md §3 표 그대로.
 * lineHeight 는 px(배수×크기 반올림), letterSpacing 은 pt.
 */
export const typography = {
  // 화면 대제목 "Inbox" 28/600/-0.4
  titleLarge: { ...base, fontFamily: fontFamily.semibold, fontSize: 28, lineHeight: 34, letterSpacing: -0.4 },
  // 뷰 제목 "Cycle 14" 22/600/-0.3
  viewTitle: { ...base, fontFamily: fontFamily.semibold, fontSize: 22, lineHeight: 28, letterSpacing: -0.3 },
  // 섹션 헤더 17/600/-0.2
  section: { ...base, fontFamily: fontFamily.semibold, fontSize: 17, lineHeight: 22, letterSpacing: -0.2 },
  // 이슈 제목(행 주 텍스트) 15/500/-0.1
  issueTitle: { ...base, fontFamily: fontFamily.medium, fontSize: 15, lineHeight: 20, letterSpacing: -0.1 },
  // 본문·코멘트 15/400
  body: { ...base, fontFamily: fontFamily.regular, fontSize: 15, lineHeight: 23 },
  // 메타(담당자·"2d"·"3h ago") 13/400
  metadata: { fontFamily: fontFamily.regular, fontSize: 13, lineHeight: 18, color: colors.textSecondary },
  // 라벨 pill 12/500
  labelPill: { ...base, fontFamily: fontFamily.medium, fontSize: 12, lineHeight: 12 },
  // Cmd+K 행 14/500/-0.1
  commandRow: { ...base, fontFamily: fontFamily.medium, fontSize: 14, lineHeight: 18, letterSpacing: -0.1 },
  // 사이드바 항목 14/500/-0.1
  sidebarItem: { ...base, fontFamily: fontFamily.medium, fontSize: 14, lineHeight: 18, letterSpacing: -0.1 },
  // 메타 카운트 "12 issues" 12/400 + tabular
  metaCount: { fontFamily: fontFamily.regular, fontSize: 12, lineHeight: 16, color: colors.textSecondary, fontVariant: ['tabular-nums'] as TextStyle['fontVariant'] },
  // 주요 버튼 14/600/-0.1 (흰 글자)
  buttonPrimary: { color: '#FFFFFF', fontFamily: fontFamily.semibold, fontSize: 14, lineHeight: 14, letterSpacing: -0.1 },
  // 보조/고스트 버튼 14/500
  buttonSecondary: { ...base, fontFamily: fontFamily.medium, fontSize: 14, lineHeight: 14 },
  // 작은 대문자 라벨 "TODO" 11/600/0.4 UPPER
  tiny: { fontFamily: fontFamily.semibold, fontSize: 11, lineHeight: 13, letterSpacing: 0.4, textTransform: 'uppercase', color: colors.textSecondary },
  // 식별자 "ENG-1423" mono 13/500 + tabular
  monoId: { fontFamily: fontFamily.mono, fontSize: 13, lineHeight: 17, color: colors.textSecondary, fontVariant: ['tabular-nums'] as TextStyle['fontVariant'] },
  // 단축키 "⌘K" mono 12
  monoShortcut: { fontFamily: fontFamily.mono, fontSize: 12, lineHeight: 14, color: colors.textSecondary },
} satisfies Record<string, TextStyle>;

export type TypographyToken = keyof typeof typography;
