// 프로젝트 단건 조회 훅 — repository 경유(컴포넌트 직접 호출 금지).
import { useCallback, useEffect, useState } from 'react';

import type { IProject } from '@entities/project/types';

import repoProjectGet from '../repositories/get_project';

export function useProjectGet(id: string) {
  const [project, setProject] = useState<IProject | null>(null);

  const load = useCallback(async () => {
    setProject(await repoProjectGet(id));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return { project, reload: load };
}
