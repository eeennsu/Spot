// 예시 평면도 정의(순수 데이터, I/O 없음) — 창고 A동 콘셉트.
// 색은 palette 토큰만 참조(하드코딩 금지). 크기는 runner 가 SHAPE_CATALOG 에서 가져온다.
// 좌표(x/y)는 콘텐츠 배치값이라 리터럴로 둔다(도형이 BOARD 안에서 겹치지 않게 손배치).
import { palette } from '@shared/theme';

import type { IShapeType } from '@entities/shape/consts';

import type { SeedImageKey } from './seed_images';

/** 시드 자재 1개(랙 안 한 층). layerOrder 는 배열 순서(0=맨 아래)로 부여된다. */
export interface ISeedMaterial {
  name: string;
  tags: string[];
  description: string;
  imageKey?: SeedImageKey;
}

/** 시드 도형 1개. 자재 도형이면 materials 로 층을 쌓는다. */
export interface ISeedShape {
  type: IShapeType;
  x: number;
  y: number;
  /** 크기 override(dp). 미지정 시 runner 가 SHAPE_CATALOG 기본값 사용. */
  width?: number;
  height?: number;
  color: string;
  /** 구역 별칭(검색 대상) — 일부 자재 도형에만. */
  alias?: string;
  /** 공간 도형 표시 라벨. 미지정 시 runner 가 카탈로그 기본 라벨 사용. */
  label?: string;
  materials?: ISeedMaterial[];
}

export const EXAMPLE_PROJECT_NAME = '예시 평면도 (창고 A동)';

/**
 * 자재 도형 4개(rect·square·L·circle) + 공간 도형 3개(사무실·문·기타).
 * 자재 도형마다 2~3개 층, 4개 자재에 실제 샘플 사진(≥3 요건 충족).
 *
 * 배치 = 실제 창고 A동 평면(도화지 2000×2600 을 벽 안쪽까지 채움). 크기는 랙답게 override.
 * - 상단 보관 구역: 좌열 = 긴 랙 rect(위)·ㄴ자 코너랙 L(아래), 우열 = 파렛트 블록 square(위)·
 *   케이블릴 circle(아래). 사이는 폭 640 지게차 중앙 통로.
 * - 중앙: 상·하차/적재 바닥(빈 공간 = 통로).
 * - 하단 출입 구역: 좌 코너 관리 사무실 · 하단 벽 중앙 정문(주 출입구) · 우 코너 휴게 공간.
 */
export const EXAMPLE_SHAPES: readonly ISeedShape[] = [
  // ── 자재 도형(상단 보관 구역 — 좌·우 2열, 가운데 통로) ──
  {
    // 긴 랙 A — 좌열 상단, 상단 벽에 붙인 가로 랙.
    type: 'rect',
    x: 100,
    y: 140,
    width: 760,
    height: 320,
    color: palette.shapeFills[0], // blue
    alias: 'A',
    materials: [
      {
        name: '스테인리스 볼트 M8',
        tags: ['볼트', 'M8', '스테인리스'],
        description: '직경 8mm 스테인리스 육각 볼트. 한 박스 약 200개.',
        imageKey: 'bolt',
      },
      {
        name: '육각 너트 M8',
        tags: ['너트', 'M8'],
        description: 'M8 볼트용 아연도금 육각 너트.',
      },
      {
        name: '평와셔 모음',
        tags: ['와셔', '평와셔'],
        description: 'M6~M10 평와셔 혼합 보관.',
      },
    ],
  },
  {
    // 파렛트 블록 B — 우열 상단, 상단 벽 우측 코너.
    type: 'square',
    x: 1540,
    y: 140,
    width: 360,
    height: 360,
    color: palette.shapeFills[1], // green
    alias: 'B',
    materials: [
      {
        name: 'VCTF 케이블 2.5sq',
        tags: ['전선', '케이블', '2.5sq'],
        description: '2.5sq 2심 VCTF 전원 케이블 릴.',
        imageKey: 'cable',
      },
      {
        name: '절연 테이프',
        tags: ['테이프', '절연'],
        description: '검정 PVC 절연 테이프 10개 묶음.',
      },
    ],
  },
  {
    // ㄴ자 코너 랙 — 좌열 하단, 좌측 벽을 따라 내려오는 큰 랙.
    type: 'L',
    x: 100,
    y: 580,
    width: 760,
    height: 760,
    color: palette.shapeFills[2], // orange
    materials: [
      {
        name: '투명 실리콘',
        tags: ['실리콘', '실란트', '방수'],
        description: '욕실·창틀용 투명 방수 실리콘 카트리지.',
        imageKey: 'silicone',
      },
      {
        name: '코킹건',
        tags: ['코킹건', '공구'],
        description: '실란트 주입용 수동 코킹건.',
      },
      {
        name: '마스킹 테이프',
        tags: ['마스킹', '테이프'],
        description: '도장 경계용 마스킹 테이프.',
      },
    ],
  },
  {
    // 케이블릴/원형 보관 — 우열 하단(좌열 ㄴ자와 같은 하단선 1340 에 맞춤).
    type: 'circle',
    x: 1500,
    y: 940,
    width: 400,
    height: 400,
    color: palette.shapeFills[4], // purple
    materials: [
      {
        name: '페인트 롤러',
        tags: ['롤러', '도장'],
        description: '중형 벽면 도장용 롤러.',
        imageKey: 'roller',
      },
      {
        name: '도장용 붓 세트',
        tags: ['붓', '도장'],
        description: '평붓·둥근붓 3종 세트.',
      },
    ],
  },

  // ── 공간 도형(하단 출입 구역) — 자재 없음, 라벨만 ──
  {
    // 관리 사무실 — 하단 좌측 코너 방(좌·하단 벽에 딱 붙임).
    type: 'office',
    x: 0,
    y: 2000,
    width: 560,
    height: 600,
    color: palette.spaceFill,
    label: '관리 사무실',
  },
  {
    // 정문 — 하단 벽 중앙(주 출입구, 두 코너방 사이).
    type: 'door',
    x: 850,
    y: 2480,
    width: 300,
    height: 120,
    color: palette.spaceFill,
    label: '정문',
  },
  {
    // 휴게 공간 — 하단 우측 코너 방(우·하단 벽에 딱 붙임).
    type: 'etc',
    x: 1440,
    y: 2000,
    width: 560,
    height: 600,
    color: palette.spaceFill,
    label: '휴게 공간',
  },
];
