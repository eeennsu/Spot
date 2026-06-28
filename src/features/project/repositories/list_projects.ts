// 프로젝트 목록 조회 — SQLite 직접 접근(repository 만 허용).
import { getDb } from '@shared/db';

import { PROJECT_TABLE } from '@entities/project/consts';
import type { IProject } from '@entities/project/types';

import { mapRowToProject, type ProjectRow } from '../libs/map_row';

export default async function repoProjectList(): Promise<IProject[]> {
  return getDb()
    .getAllSync<ProjectRow>(`SELECT * FROM ${PROJECT_TABLE} ORDER BY created_at DESC`)
    .map(mapRowToProject);
}
