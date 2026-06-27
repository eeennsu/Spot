// Material LocalDataSource — 골격. Phase 2 에서 CRUD 구현.
// 행 타입·매퍼만 미리 정의(스키마와 1:1). SQL 은 여기서만.
import type { Material } from '@/types';

export interface MaterialRow {
  id: string;
  shape_id: string;
  cell_id: string | null;
  image_uri: string | null;
  name: string | null;
  description: string | null;
  created_at: number;
  updated_at: number;
}

export function toMaterial(r: MaterialRow): Material {
  return {
    id: r.id,
    shapeId: r.shape_id,
    cellId: r.cell_id,
    imageUri: r.image_uri,
    name: r.name,
    description: r.description,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

// Phase 2: listByShape / insert / update / deleteById 를 getDb() 로 구현.
