// 프로젝트 삭제 — SQLite 직접 접근(repository 만 허용).
// shape/material 은 FK ON DELETE CASCADE 로 함께 삭제.
import { getDb } from '@shared/db';
import { PROJECT_TABLE } from '@entities/project/consts';

export default async function repoProjectDelete(id: string): Promise<void> {
  getDb().runSync(`DELETE FROM ${PROJECT_TABLE} WHERE id = ?`, id);
}
