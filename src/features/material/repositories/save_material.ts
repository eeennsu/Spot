// 자재 저장(생성/갱신) — SQLite 직접 접근(repository 만 허용). INSERT OR REPLACE.
import { getDb } from '@shared/db';
import { MATERIAL_TABLE } from '@entities/material/consts';
import type { IMaterial } from '@entities/material/types';

export default async function repoMaterialSave(material: IMaterial): Promise<void> {
  const now = Date.now();
  const db = getDb();
  const prev = db.getFirstSync<{ created_at: number }>(
    `SELECT created_at FROM ${MATERIAL_TABLE} WHERE id = ?`,
    material.id,
  );
  const createdAt = prev?.created_at ?? now;
  db.runSync(
    `INSERT OR REPLACE INTO ${MATERIAL_TABLE}
      (id, shape_id, layer_order, name, description, image_uri, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      material.id,
      material.shapeId,
      material.layerOrder,
      material.name,
      material.description ?? null,
      material.imageUri ?? null,
      createdAt,
      now,
    ],
  );
}
