// 도메인 타입 — Shape. 출처: CLAUDE.md 데이터 모델.
// 도형의 부모는 Project(projectId).

/** 도형 분류 — 자재 도형 / 공간 도형. */
export type IShapeCategory = 'material' | 'space';

/** 자재 도형 형태 — ㅁ/정사각/ㄴ/원. */
export type IShapeMaterialType = 'rect' | 'square' | 'L' | 'circle';

/** 공간 도형 형태 — 문/사무실/기타. */
export type IShapeSpaceType = 'door' | 'office' | 'etc';

/**
 * 도형.
 * 좌표/크기는 캔버스 기준 px. rotation 은 degree(기본 0). color 는 hex.
 * alias 는 구역 별칭("A","B") — 검색 대상.
 * label 은 공간 도형 표시 텍스트(door="문" 등). 자재 도형은 Material 을 layer 로 쌓는다.
 */
export interface IShape {
  id: string;
  projectId: string; // FK → Project
  category: IShapeCategory;
  type: IShapeMaterialType | IShapeSpaceType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // degree
  color: string; // hex
  alias?: string;
  label?: string;
}
