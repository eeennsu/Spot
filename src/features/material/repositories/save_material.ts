// 자재 저장(생성/갱신) — Phase 2 스텁. 모델-정확한 시그니처.
import type { IMaterial } from '@entities/material/types';

export default async function repoMaterialSave(_material: IMaterial): Promise<void> {
  throw new Error('repoMaterialSave: Phase 2 에서 구현');
}
