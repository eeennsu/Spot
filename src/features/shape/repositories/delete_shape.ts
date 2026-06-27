// 도형 삭제 — SQLite 직접 접근(repository 만 허용).
// material 은 FK ON DELETE CASCADE 로 함께 삭제된다.
import { getDb } from '@shared/db';
import { SHAPE_TABLE } from '@entities/shape/consts';

export default async function repoShapeDelete(id: string): Promise<void> {
  getDb().runSync(`DELETE FROM ${SHAPE_TABLE} WHERE id = ?`, id);
}
