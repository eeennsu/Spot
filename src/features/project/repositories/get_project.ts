// 프로젝트 단건 조회 — SQLite 직접 접근(repository 만 허용).
import { getDb } from '@shared/db';
import { PROJECT_TABLE } from '@entities/project/consts';
import type { IProject } from '@entities/project/types';

import { mapRowToProject, type ProjectRow } from '../libs/map_row';

export default async function repoProjectGet(id: string): Promise<IProject | null> {
  const row = getDb().getFirstSync<ProjectRow>(
    `SELECT * FROM ${PROJECT_TABLE} WHERE id = ?`,
    id,
  );
  return row ? mapRowToProject(row) : null;
}
