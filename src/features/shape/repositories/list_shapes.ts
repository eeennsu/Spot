// 프로젝트별 도형 목록 — SQLite 직접 접근(repository 만 허용).
import { getDb } from '@shared/db';
import { SHAPE_TABLE } from '@entities/shape/consts';
import type { IShape } from '@entities/shape/types';

import { mapRowToShape, type ShapeRow } from '../libs/map_row';

export default async function repoShapeList(projectId: string): Promise<IShape[]> {
  return getDb()
    .getAllSync<ShapeRow>(
      `SELECT * FROM ${SHAPE_TABLE} WHERE project_id = ? ORDER BY created_at ASC`,
      projectId,
    )
    .map(mapRowToShape);
}
