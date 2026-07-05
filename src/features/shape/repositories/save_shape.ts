// 도형 저장(생성/갱신) — SQLite 직접 접근(repository 만 허용).
// UPSERT(INSERT … ON CONFLICT DO UPDATE) 사용. INSERT OR REPLACE 는 기존 행을 DELETE 후
// 재삽입하는데, material.shape_id 가 ON DELETE CASCADE 라 도형 재저장(이동·리사이즈·수정)마다
// 그 도형의 자재가 통째로 삭제된다. UPSERT 는 행을 지우지 않으므로 캐스케이드가 발생하지 않는다.
import { getDb } from '@shared/db';

import { SHAPE_TABLE } from '@entities/shape/consts';
import type { IShape } from '@entities/shape/types';

export default async function repoShapeSave(shape: IShape): Promise<void> {
  const now = Date.now();
  // created_at 은 INSERT 시에만 now. 충돌(기존 행) 시 DO UPDATE 에서 제외 → 원래 값 보존.
  getDb().runSync(
    `INSERT INTO ${SHAPE_TABLE}
      (id, project_id, category, type, x, y, width, height, rotation, color, alias, label, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       project_id = excluded.project_id,
       category   = excluded.category,
       type       = excluded.type,
       x          = excluded.x,
       y          = excluded.y,
       width      = excluded.width,
       height     = excluded.height,
       rotation   = excluded.rotation,
       color      = excluded.color,
       alias      = excluded.alias,
       label      = excluded.label,
       updated_at = excluded.updated_at`,
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
      now,
      now,
    ],
  );
}
