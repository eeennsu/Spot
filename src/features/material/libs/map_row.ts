// Material row ↔ 도메인 객체 변환(순수 함수). 스키마와 1:1.
import type { IMaterial } from '@entities/material/types';

export interface MaterialRow {
  id: string;
  shape_id: string;
  layer_order: number;
  name: string;
  description: string | null;
  image_uri: string | null;
  created_at: number;
  updated_at: number;
}

export function mapRowToMaterial(r: MaterialRow): IMaterial {
  return {
    id: r.id,
    shapeId: r.shape_id,
    layerOrder: r.layer_order,
    name: r.name,
    description: r.description ?? undefined,
    imageUri: r.image_uri ?? undefined,
  };
}
