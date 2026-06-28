// Things 3 타이포 토큰. 출처: DESIGN.md §3 / DESIGN-expo.md §2.
// 교체 이력: Linear(Inter 400/500/600 + Menlo mono) → Things 3(Inter 400/600/700, mono 제거).
// SF Pro → Inter 대체 매핑: SF Pro Text/Display → Inter-Regular/SemiBold/Bold.
// Platform.select / 'System' / iOS 분기 금지. Inter 직접 사용 (Android 전용).
import type { TextStyle } from 'react-native';

import { colors } from './colors';

/**
 * 폰트 패밀리 상수.
 * useFonts 로딩은 app/_layout.tsx(C 에이전트 소유)가 담당.
 * 굵기 매핑:
 *   400(Regular) → 'Inter-Regular'   (원본: SF Pro Text w400)
 *   600(SemiBold)→ 'Inter-SemiBold'  (원본: SF Pro Text w600)
 *   700(Bold)    → 'Inter-Bold'      (원본: SF Pro Display w700)
 */
export const fontFamily = {
  regular: 'Inter-Regular', // 400 본문·태스크 제목·사이드바
  semibold: 'Inter-SemiBold', // 600 버튼·활성 사이드바·날짜 pill
  bold: 'Inter-Bold', // 700 리스트 제목·프로젝트 제목·섹션 헤딩
} as const;

/**
 * 타이포 계층 — DESIGN.md §3 / DESIGN-expo.md §2.
 * lineHeight: fontSize × 배수 반올림(dp).
 * letterSpacing: pt 그대로(dp ≈ pt on mdpi/hdpi 대상).
 * color 는 역할 기본값. 필요 시 컴포넌트에서 override.
 */
export const typography = {
  // ── 대제목 ──────────────────────────────────────────────────────
  /**
   * 리스트 대제목 "Today" / "Upcoming" — 챕터 제목처럼.
   * DESIGN-expo.md §2 listTitle / DESIGN.md §3 List Title (Large) 28/700/1.2/+0.3
   */
  listTitle: {
    fontFamily: fontFamily.bold,
    fontWeight: '700' as const,
    fontSize: 28,
    lineHeight: 34, // 28 × 1.2 ≈ 34
    letterSpacing: 0.3,
    color: colors.textPrimary,
  } satisfies TextStyle,

  /**
   * 프로젝트 상세 화면 히어로 제목.
   * DESIGN-expo.md §2 projectTitle / DESIGN.md §3 Project Title 24/700/1.2/+0.3
   */
  projectTitle: {
    fontFamily: fontFamily.bold,
    fontWeight: '700' as const,
    fontSize: 24,
    lineHeight: 29, // 24 × 1.2 ≈ 29
    letterSpacing: 0.3,
    color: colors.textPrimary,
  } satisfies TextStyle,

  // ── 섹션 / 행 ───────────────────────────────────────────────────
  /**
   * 프로젝트 내 섹션 헤딩 + 헤어라인 구분선.
   * DESIGN-expo.md §2 heading / DESIGN.md §3 Section Heading 17/700/1.3/-0.2
   */
  heading: {
    fontFamily: fontFamily.bold,
    fontWeight: '700' as const,
    fontSize: 17,
    lineHeight: 22, // 17 × 1.3 ≈ 22
    letterSpacing: -0.2,
    color: colors.textPrimary,
  } satisfies TextStyle,

  /**
   * 태스크 행 기본 텍스트 — 산문처럼 읽히는 크기.
   * DESIGN-expo.md §2 taskTitle / DESIGN.md §3 Task Title 17/400/1.35/-0.2
   */
  taskTitle: {
    fontFamily: fontFamily.regular,
    fontWeight: '400' as const,
    fontSize: 17,
    lineHeight: 23, // 17 × 1.35 ≈ 23
    letterSpacing: -0.2,
    color: colors.textPrimary,
  } satisfies TextStyle,

  // ── 본문·부제 ────────────────────────────────────────────────────
  /**
   * 메모·설명 본문.
   * DESIGN-expo.md §2 body / DESIGN.md §3 Body/Notes 15/400/1.45/-0.1
   */
  body: {
    fontFamily: fontFamily.regular,
    fontWeight: '400' as const,
    fontSize: 15,
    lineHeight: 22, // 15 × 1.45 ≈ 22
    letterSpacing: -0.1,
    color: colors.textPrimary,
  } satisfies TextStyle,

  /**
   * 행 부제목 — 프로젝트명·영역 부제.
   * DESIGN-expo.md §2 subtitle / DESIGN.md §3 List Row Subtitle 14/400/1.35/-0.1
   */
  subtitle: {
    fontFamily: fontFamily.regular,
    fontWeight: '400' as const,
    fontSize: 14,
    lineHeight: 19, // 14 × 1.35 ≈ 19
    letterSpacing: -0.1,
    color: colors.textSecondary,
  } satisfies TextStyle,

  /**
   * 날짜·태그·카운트 등 메타 정보.
   * DESIGN-expo.md §2 metadata / DESIGN.md §3 Metadata 13/400/1.3/0
   */
  metadata: {
    fontFamily: fontFamily.regular,
    fontWeight: '400' as const,
    fontSize: 13,
    lineHeight: 17, // 13 × 1.3 ≈ 17
    letterSpacing: 0,
    color: colors.textSecondary,
  } satisfies TextStyle,

  // ── 액션 / 인터랙션 ─────────────────────────────────────────────
  /**
   * 주요 버튼 — 채운 버튼·확인 액션.
   * DESIGN-expo.md §2 button / DESIGN.md §3 Button (Primary) 17/600/-0.2
   */
  button: {
    fontFamily: fontFamily.semibold,
    fontWeight: '600' as const,
    fontSize: 17,
    lineHeight: 17,
    letterSpacing: -0.2,
    color: colors.textPrimary,
  } satisfies TextStyle,

  /**
   * 사이드바 행 — 비활성 상태 기본값(활성 시 컴포넌트에서 semibold override).
   * DESIGN-expo.md §2 sidebar / DESIGN.md §3 Sidebar Item 16/400/1.3/-0.1
   */
  sidebar: {
    fontFamily: fontFamily.regular,
    fontWeight: '400' as const,
    fontSize: 16,
    lineHeight: 21, // 16 × 1.3 ≈ 21
    letterSpacing: -0.1,
    color: colors.textPrimary,
  } satisfies TextStyle,

  /**
   * 날짜 pill chip — "오늘", "내일" 예약 날짜.
   * DESIGN-expo.md §2 datePill / DESIGN.md §3 Date Pill 13/600/1.0/0
   */
  datePill: {
    fontFamily: fontFamily.semibold,
    fontWeight: '600' as const,
    fontSize: 13,
    lineHeight: 13,
    letterSpacing: 0,
    color: colors.blue,
  } satisfies TextStyle,

  /**
   * 사이드바 카운트 배지 — tabular 숫자.
   * DESIGN-expo.md §2 count / DESIGN.md §3 Count/Meta 15/400/1.0/0
   */
  count: {
    fontFamily: fontFamily.regular,
    fontWeight: '400' as const,
    fontSize: 15,
    lineHeight: 15,
    letterSpacing: 0,
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'] as TextStyle['fontVariant'],
  } satisfies TextStyle,

  /**
   * 소형 대문자 라벨 — "THIS EVENING" 섹션 구분.
   * DESIGN-expo.md §2 tinyUpper / DESIGN.md §3 Tiny Label (UPPER) 12/700/1.2/+0.5
   */
  tinyUpper: {
    fontFamily: fontFamily.bold,
    fontWeight: '700' as const,
    fontSize: 12,
    lineHeight: 14, // 12 × 1.2 ≈ 14
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
    color: colors.textSecondary,
  } satisfies TextStyle,
} satisfies Record<string, TextStyle>;

export type TypographyToken = keyof typeof typography;
