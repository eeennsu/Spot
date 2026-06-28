// 프로젝트 이름 변경 — SQLite 직접 접근(repository 만 허용).
import { getDb } from '@shared/db';

import { PROJECT_TABLE } from '@entities/project/consts';

export default async function repoProjectRename(id: string, name: string): Promise<void> {
  getDb().runSync(
    `UPDATE ${PROJECT_TABLE} SET name = ?, updated_at = ? WHERE id = ?`,
    name,
    Date.now(),
    id,
  );
}
