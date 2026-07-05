// 자재 저장(생성/갱신) — SQLite 직접 접근(repository 만 허용).
// UPSERT 사용(INSERT OR REPLACE 는 DELETE+재삽입이라 rowid 가 바뀌고 향후 자식 FK 가 생기면
// 캐스케이드 위험 — shape 저장과 동일 규약으로 통일).
import { getDb } from '@shared/db';

import { MATERIAL_TABLE } from '@entities/material/consts';
import type { IMaterial } from '@entities/material/types';

export default async function repoMaterialSave(material: IMaterial): Promise<void> {
  const now = Date.now();
  // created_at 은 INSERT 시에만 now. 충돌 시 DO UPDATE 에서 제외 → 원래 값 보존.
  getDb().runSync(
    `INSERT INTO ${MATERIAL_TABLE}
      (id, shape_id, layer_order, name, description, tags, image_uri, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       shape_id    = excluded.shape_id,
       layer_order = excluded.layer_order,
       name        = excluded.name,
       description = excluded.description,
       tags        = excluded.tags,
       image_uri   = excluded.image_uri,
       updated_at  = excluded.updated_at`,
    [
      material.id,
      material.shapeId,
      material.layerOrder,
      material.name,
      material.description ?? null,
      material.tags?.length ? JSON.stringify(material.tags) : null,
      material.imageUri ?? null,
      now,
      now,
    ],
  );
}
