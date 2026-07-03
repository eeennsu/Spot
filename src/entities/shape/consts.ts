// Shape 도메인 상수 — 테이블명·크기·도형 카탈로그. 하드코딩 금지(여기 참조).
import type { IShapeCategory, IShapeMaterialType, IShapeSpaceType } from './types';

export const SHAPE_TABLE = 'shape' as const;

/** 리사이즈 최소 변 길이(dp) */
export const SHAPE_MIN_SIZE = 40 as const;
/** 리사이즈 최대 변 길이(dp) — 폭주 방지 */
export const SHAPE_MAX_SIZE = 2000 as const;

/** 회전 스냅 스텝(도) — 드래그 종료 시 이 배수로 흡착 */
export const SHAPE_ROTATE_STEP = 15 as const;
/** 카디널(0/90/180/270) 흡착 임계값(도) — 이 안이면 직각으로 딱 붙음 */
export const SHAPE_ROTATE_SNAP_THRESHOLD = 7 as const;

/**
 * 도화지(평면도 배치 영역) 기본 크기(dp) — 신규 프로젝트 생성 시 초기값.
 * 무한 캔버스가 아니라 "크기 제한 있는 공간"임을 사용자에게 보여주는 기준.
 * 실제 크기는 프로젝트별로 DB(project.board_width/board_height)에 저장한다.
 */
export const BOARD_WIDTH = 2000 as const;
export const BOARD_HEIGHT = 2600 as const;

/** 도화지 리사이즈 최소/최대 변 길이(dp) — 폭주 방지 */
export const BOARD_MIN_SIZE = 400 as const;
export const BOARD_MAX_SIZE = 4000 as const;

/** 도형 종류 키 */
export type IShapeType = IShapeMaterialType | IShapeSpaceType;

/** 팔레트/생성 메타 한 항목 */
export interface IShapeCatalogItem {
  category: IShapeCategory;
  type: IShapeType;
  /** 팔레트 표시명(한국어) */
  labelKo: string;
  defaultWidth: number;
  defaultHeight: number;
  /** 정사각형·원처럼 1:1 고정 여부 */
  lockAspect: boolean;
  /** 공간 도형 기본 표시 라벨(자재 도형은 없음) */
  defaultLabel?: string;
}

/**
 * 도형 7종 카탈로그 — 자재 4 + 공간 3.
 * 생성 시 기본 크기/비율고정/라벨의 단일 진실 소스.
 */
export const SHAPE_CATALOG: readonly IShapeCatalogItem[] = [
  // ── 자재 도형 (자재를 layer 로 담음) ──
  {
    category: 'material',
    type: 'rect',
    labelKo: '직사각형',
    defaultWidth: 252,
    defaultHeight: 168,
    lockAspect: false,
  },
  {
    category: 'material',
    type: 'square',
    labelKo: '정사각형',
    defaultWidth: 200,
    defaultHeight: 200,
    lockAspect: true,
  },
  {
    category: 'material',
    type: 'L',
    labelKo: 'ㄴ자',
    defaultWidth: 238,
    defaultHeight: 238,
    lockAspect: false,
  },
  {
    category: 'material',
    type: 'circle',
    labelKo: '원',
    defaultWidth: 200,
    defaultHeight: 200,
    lockAspect: true,
  },
  // ── 공간 도형 (자재 없음, 라벨만) ──
  {
    category: 'space',
    type: 'door',
    labelKo: '문',
    defaultWidth: 165,
    defaultHeight: 92,
    lockAspect: false,
    defaultLabel: '문',
  },
  {
    category: 'space',
    type: 'office',
    labelKo: '사무실',
    defaultWidth: 290,
    defaultHeight: 186,
    lockAspect: false,
    defaultLabel: '사무실',
  },
  {
    category: 'space',
    type: 'etc',
    labelKo: '기타',
    defaultWidth: 238,
    defaultHeight: 168,
    lockAspect: false,
    defaultLabel: '기타',
  },
] as const;

/** type → 카탈로그 항목 조회 */
export function shapeCatalogOf(type: IShapeType): IShapeCatalogItem {
  const item = SHAPE_CATALOG.find(c => c.type === type);
  if (!item) throw new Error(`알 수 없는 도형 type: ${type}`);
  return item;
}

/** 1:1 고정 도형인가 */
export function isAspectLocked(type: IShapeType): boolean {
  return shapeCatalogOf(type).lockAspect;
}
