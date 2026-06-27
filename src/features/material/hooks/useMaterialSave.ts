// 자재 저장 훅 — repository 경유. Phase 2 에서 상태 갱신 결선.
import type { IMaterial } from '@entities/material/types';

import repoMaterialSave from '../repositories/save_material';

export function useMaterialSave() {
  return async (material: IMaterial) => {
    await repoMaterialSave(material);
  };
}
