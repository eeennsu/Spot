// 프로젝트 전체 자재(전 필드) — shape JOIN, 도형·층 순. PDF 출력 등 일괄 조회용.
import { getDb } from '@shared/db';

import { MATERIAL_TABLE } from '@entities/material/consts';
import type { IMaterial } from '@entities/material/types';
import { SHAPE_TABLE } from '@entities/shape/consts';

import { mapRowToMaterial, type MaterialRow } from '../libs/map_row';

export default async function repoMaterialFullByProject(projectId: string): Promise<IMaterial[]> {
  return getDb()
    .getAllSync<MaterialRow>(
      `SELECT m.* FROM ${MATERIAL_TABLE} m
       JOIN ${SHAPE_TABLE} s ON m.shape_id = s.id
       WHERE s.project_id = ?
       ORDER BY m.shape_id ASC, m.layer_order ASC`,
      projectId,
    )
    .map(mapRowToMaterial);
}
