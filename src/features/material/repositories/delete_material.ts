// 자재 삭제 — SQLite 직접 접근(repository 만 허용).
import { getDb } from '@shared/db';
import { MATERIAL_TABLE } from '@entities/material/consts';

export default async function repoMaterialDelete(id: string): Promise<void> {
  getDb().runSync(`DELETE FROM ${MATERIAL_TABLE} WHERE id = ?`, id);
}
