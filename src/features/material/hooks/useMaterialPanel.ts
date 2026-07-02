// 자재 패널 데이터 훅 — 한 도형(랙)의 자재(층) 목록 소유 + CRUD + 순서변경.
// feature 훅이므로 repository 직접 호출 허용(컴포넌트는 이 훅만 사용).
import { useCallback, useEffect, useState } from 'react';

import { utilCreateId } from '@shared/utils/util_id';
import { utilDeleteAppImage } from '@shared/utils/util_image';

import { DEFAULT_MATERIAL_NAME } from '@entities/material/consts';
import type { IMaterial } from '@entities/material/types';

import repoMaterialDelete from '../repositories/delete_material';
import repoMaterialList from '../repositories/list_materials';
import repoMaterialSave from '../repositories/save_material';

export function useMaterialPanel(shapeId: string) {
  const [materials, setMaterials] = useState<IMaterial[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    setMaterials(await repoMaterialList(shapeId));
    setLoaded(true);
  }, [shapeId]);

  useEffect(() => {
    load();
  }, [load]);

  /** 새 자재(층)을 맨 위에 쌓는다(layerOrder = 다음 값). 이름 기본값으로 즉시 생성. */
  const addMaterial = useCallback(async (): Promise<IMaterial> => {
    const nextOrder = materials.reduce((m, x) => Math.max(m, x.layerOrder), -1) + 1;
    const material: IMaterial = {
      id: utilCreateId(),
      shapeId,
      layerOrder: nextOrder,
      name: DEFAULT_MATERIAL_NAME,
    };
    await repoMaterialSave(material);
    setMaterials(prev => [...prev, material]);
    return material;
  }, [materials, shapeId]);

  const updateMaterial = useCallback(async (id: string, patch: Partial<IMaterial>) => {
    let next: IMaterial | undefined;
    setMaterials(prev =>
      prev.map(m => {
        if (m.id !== id) return m;
        next = { ...m, ...patch };
        return next;
      }),
    );
    if (next) await repoMaterialSave(next);
  }, []);

  const removeMaterial = useCallback(
    async (id: string) => {
      const target = materials.find(m => m.id === id);
      setMaterials(prev => prev.filter(m => m.id !== id));
      await repoMaterialDelete(id);
      await utilDeleteAppImage(target?.imageUri);
    },
    [materials],
  );

  /** 층 순서 이동(up=위로). layerOrder 를 0..n 으로 재정렬해 저장. */
  const move = useCallback(
    async (id: string, dir: 'up' | 'down') => {
      const sorted = [...materials].sort((a, b) => a.layerOrder - b.layerOrder);
      const i = sorted.findIndex(m => m.id === id);
      const j = dir === 'up' ? i - 1 : i + 1;
      if (i < 0 || j < 0 || j >= sorted.length) return;
      [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
      const renumbered = sorted.map((m, idx) => ({ ...m, layerOrder: idx }));
      setMaterials(renumbered);
      for (const m of renumbered) await repoMaterialSave(m);
    },
    [materials],
  );

  return { materials, loaded, load, addMaterial, updateMaterial, removeMaterial, move };
}
