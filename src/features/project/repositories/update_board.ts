// 프로젝트 도화지 크기 변경 — SQLite 직접 접근(repository 만 허용).
import { getDb } from '@shared/db';

import { PROJECT_TABLE } from '@entities/project/consts';

export default async function repoProjectUpdateBoard(
  id: string,
  width: number,
  height: number,
): Promise<void> {
  getDb().runSync(
    `UPDATE ${PROJECT_TABLE} SET board_width = ?, board_height = ?, updated_at = ? WHERE id = ?`,
    width,
    height,
    Date.now(),
    id,
  );
}
