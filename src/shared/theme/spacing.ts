// Things 3 간격 토큰. 출처: DESIGN.md §5 Spacing System / DESIGN-expo.md §1.
// 교체 이력: Linear(기준 4, 스케일 4·6·8·12·16·20·24·32·40·56) →
//            Things 3(기준 4, 스케일 4·8·12·16·20·24·32·44·56).
// 변경: sm 6→8, xl5 40→44(터치 타겟), 나머지 동일. 이름 구조 유지.

/**
 * 간격 스케일 (dp). 기준 4pt.
 * Things 철학: 여백이 콘텐츠. 경쟁 앱보다 더 넉넉한 공기.
 * DESIGN.md §5: 4, 8, 12, 16, 20, 24, 32, 44, 56
 */
export const spacing = {
  xs: 4, // 아이콘·텍스트 사이 미세 간격
  sm: 8, // 태그 pill 패딩·행 내부 소간격
  md: 12, // 태스크 행 상하 패딩 (44dp 행 기준)
  lg: 16, // 그룹 내 섹션 간격
  xl: 20, // 화면 좌우 마진 (Things 표준 — 16이 아닌 20)
  xl2: 24, // 섹션 헤딩 상단 패딩·리스트 제목 상단
  xl3: 32, // 주요 블록 간 여백
  xl4: 44, // 터치 타겟 최솟값 / 툴바 높이 기준
  xl5: 56, // Magic-Plus 버튼 지름 / 프로젝트 행 높이
} as const;

export type SpacingToken = keyof typeof spacing;

/**
 * 레이아웃 상수 — Things 3 특유의 너그러운 마진.
 * DESIGN.md §5 Standard margin / §8 Touch Targets.
 */
export const layout = {
  /** 리스트 좌우 인셋 — Things 은 16이 아닌 20pt (넉넉한 여백이 브랜드) */
  screenMargin: 20,
  /** 태스크 행 내부 상하 패딩 */
  rowPadding: 12,
  /** Cmd+K 시트 최대폭 (구 Linear 호환 유지) */
  commandMenuMaxWidth: 560,
  /** 사이드바 슬라이드오버 폭 */
  sidebarWidth: 300,
} as const;
