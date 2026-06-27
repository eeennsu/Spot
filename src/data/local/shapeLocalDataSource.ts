// Shape LocalDataSource — 골격. Phase 1 에서 CRUD 구현.
// 행 타입·매퍼만 미리 정의(스키마와 1:1). SQL 은 여기서만.
import type { Shape, ShapeType } from '@/types';

export interface ShapeRow {
  id: string;
  floor_id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  rotation: number;
  alias: string | null;
  created_at: number;
  updated_at: number;
}

export function toShape(r: ShapeRow): Shape {
  const type: ShapeType = r.type === 'L' ? 'L' : 'rect';
  return {
    id: r.id,
    floorId: r.floor_id,
    type,
    x: r.x,
    y: r.y,
    width: r.width,
    height: r.height,
    color: r.color,
    rotation: r.rotation,
    alias: r.alias,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

// Phase 1: listByFloor / insert / update / deleteById 를 getDb() 로 구현.
