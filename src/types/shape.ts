// 도메인 타입 — Shape. 출처: CLAUDE.md 데이터 모델.
// 도메인 필드(type/x/y/width/height/color/rotation/alias)는 모델 그대로.

export type ShapeType = 'rect' | 'L';

/**
 * 도형 — ㅁ(rect) / ㄴ(L).
 * 좌표/크기는 캔버스 기준 px. rotation 은 degree(기본 0).
 * alias 는 구역 별칭("A","B") — 검색 대상(Phase 4).
 */
export interface Shape {
  id: string;
  floorId: string; // FK → Floor
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string; // hex
  rotation: number; // degree
  alias: string | null;
  createdAt: number;
  updatedAt: number;
}
