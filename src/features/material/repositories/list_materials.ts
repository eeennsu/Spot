// 도형별 자재 목록 — SQLite 직접 접근(repository 만 허용). layerOrder 순.
import { getDb } from '@shared/db';
import { MATERIAL_TABLE } from '@entities/material/consts';
import type { IMaterial } from '@entities/material/types';

import { mapRowToMaterial, type MaterialRow } from '../libs/map_row';

export default async function repoMaterialList(shapeId: string): Promise<IMaterial[]> {
  return getDb()
    .getAllSync<MaterialRow>(
      `SELECT * FROM ${MATERIAL_TABLE} WHERE shape_id = ? ORDER BY layer_order ASC`,
      shapeId,
    )
    .map(mapRowToMaterial);
}
