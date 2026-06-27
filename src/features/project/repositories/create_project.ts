// 프로젝트 생성 — SQLite 직접 접근(repository 만 허용).
import { getDb } from '@shared/db';
import { utilCreateId } from '@shared/utils/util_id';
import { PROJECT_TABLE } from '@entities/project/consts';
import type { IProject } from '@entities/project/types';

export default async function repoProjectCreate(name: string): Promise<IProject> {
  const now = Date.now();
  const project: IProject = {
    id: utilCreateId(),
    name,
    createdAt: now,
    updatedAt: now,
  };
  getDb().runSync(
    `INSERT INTO ${PROJECT_TABLE} (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)`,
    project.id,
    project.name,
    project.createdAt,
    project.updatedAt,
  );
  return project;
}
