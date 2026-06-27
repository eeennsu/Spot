// 도형 저장(생성/갱신) — SQLite 직접 접근(repository 만 허용). INSERT OR REPLACE.
import { getDb } from '@shared/db';
import { SHAPE_TABLE } from '@entities/shape/consts';
import type { IShape } from '@entities/shape/types';

export default async function repoShapeSave(shape: IShape): Promise<void> {
  const now = Date.now();
  const db = getDb();
  // created_at 은 최초 1회만. 기존 행이 있으면 보존.
  const prev = db.getFirstSync<{ created_at: number }>(
    `SELECT created_at FROM ${SHAPE_TABLE} WHERE id = ?`,
    shape.id,
  );
  const createdAt = prev?.created_at ?? now;
  db.runSync(
    `INSERT OR REPLACE INTO ${SHAPE_TABLE}
      (id, project_id, category, type, x, y, width, height, rotation, color, alias, label, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      shape.id,
      shape.projectId,
      shape.category,
      shape.type,
      shape.x,
      shape.y,
      shape.width,
      shape.height,
      shape.rotation,
      shape.color,
      shape.alias ?? null,
      shape.label ?? null,
      createdAt,
      now,
    ],
  );
}
