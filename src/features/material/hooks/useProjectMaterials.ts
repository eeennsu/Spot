// 프로젝트 전체 자재 이름 맵 — shapeId → 층순 이름 배열. Viewer 캔버스 라벨용.
// feature 훅이므로 repository 직접 호출 허용.
import { useCallback, useEffect, useState } from 'react';

import repoMaterialListByProject from '../repositories/list_project_materials';

export function useProjectMaterials(projectId: string) {
  const [namesByShape, setNamesByShape] = useState<Record<string, string[]>>({});

  const reload = useCallback(async () => {
    const rows = await repoMaterialListByProject(projectId);
    const map: Record<string, string[]> = {};
    for (const r of rows) {
      (map[r.shapeId] ??= []).push(r.name);
    }
    setNamesByShape(map);
  }, [projectId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { namesByShape, reload };
}
