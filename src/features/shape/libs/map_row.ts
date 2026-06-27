// Shape row ↔ 도메인 객체 변환(순수 함수). 스키마와 1:1.
import type {
  IShape,
  IShapeCategory,
  IShapeMaterialType,
  IShapeSpaceType,
} from '@entities/shape/types';

export interface ShapeRow {
  id: string;
  project_id: string;
  category: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  color: string;
  alias: string | null;
  label: string | null;
  created_at: number;
  updated_at: number;
}

export function mapRowToShape(r: ShapeRow): IShape {
  const category: IShapeCategory = r.category === 'space' ? 'space' : 'material';
  return {
    id: r.id,
    projectId: r.project_id,
    category,
    type: r.type as IShapeMaterialType | IShapeSpaceType,
    x: r.x,
    y: r.y,
    width: r.width,
    height: r.height,
    rotation: r.rotation,
    color: r.color,
    alias: r.alias ?? undefined,
    label: r.label ?? undefined,
  };
}
