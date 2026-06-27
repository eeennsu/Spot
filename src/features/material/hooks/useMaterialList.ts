// 도형별 자재 목록 훅 — repository 경유(컴포넌트는 직접 호출 금지).
import { useCallback, useState } from 'react';

import type { IMaterial } from '@entities/material/types';

import repoMaterialList from '../repositories/list_materials';

export function useMaterialList(shapeId: string) {
  const [materials, setMaterials] = useState<IMaterial[]>([]);

  const load = useCallback(async () => {
    setMaterials(await repoMaterialList(shapeId));
  }, [shapeId]);

  return { materials, load };
}
