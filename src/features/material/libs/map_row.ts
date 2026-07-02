// Material row ↔ 도메인 객체 변환(순수 함수). 스키마와 1:1.
import type { IMaterial } from '@entities/material/types';

export interface MaterialRow {
  id: string;
  shape_id: string;
  layer_order: number;
  name: string;
  description: string | null;
  tags: string | null; // JSON 배열 문자열(예: '["볼트","M8"]')
  image_uri: string | null;
  created_at: number;
  updated_at: number;
}

/** DB의 JSON 태그 문자열 → string[]. 비거나 깨지면 undefined. */
function parseTags(raw: string | null): string[] | undefined {
  if (!raw) return undefined;
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return undefined;
    const tags = arr.filter((t): t is string => typeof t === 'string' && t.trim() !== '');
    return tags.length ? tags : undefined;
  } catch {
    return undefined;
  }
}

export function mapRowToMaterial(r: MaterialRow): IMaterial {
  return {
    id: r.id,
    shapeId: r.shape_id,
    layerOrder: r.layer_order,
    name: r.name,
    description: r.description ?? undefined,
    tags: parseTags(r.tags),
    imageUri: r.image_uri ?? undefined,
  };
}
