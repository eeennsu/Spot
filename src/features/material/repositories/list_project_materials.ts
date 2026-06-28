// 프로젝트 전체 자재 요약 — shape JOIN. Viewer 캔버스 라벨/검색에 사용.
// SQLite 직접 접근(repository 만 허용).
import { getDb } from '@shared/db';

import { MATERIAL_TABLE } from '@entities/material/consts';
import { SHAPE_TABLE } from '@entities/shape/consts';

export interface IProjectMaterialRow {
  shapeId: string;
  name: string;
  layerOrder: number;
}

export default async function repoMaterialListByProject(
  projectId: string,
): Promise<IProjectMaterialRow[]> {
  return getDb()
    .getAllSync<{ shape_id: string; name: string; layer_order: number }>(
      `SELECT m.shape_id, m.name, m.layer_order
       FROM ${MATERIAL_TABLE} m
       JOIN ${SHAPE_TABLE} s ON m.shape_id = s.id
       WHERE s.project_id = ?
       ORDER BY m.layer_order ASC`,
      projectId,
    )
    .map(r => ({ shapeId: r.shape_id, name: r.name, layerOrder: r.layer_order }));
}
