// 프로젝트별 도형 목록 훅 — repository 경유(컴포넌트는 직접 호출 금지).
import { useCallback, useState } from 'react';

import type { IShape } from '@entities/shape/types';

import repoShapeList from '../repositories/list_shapes';

export function useShapeList(projectId: string) {
  const [shapes, setShapes] = useState<IShape[]>([]);

  const load = useCallback(async () => {
    setShapes(await repoShapeList(projectId));
  }, [projectId]);

  return { shapes, load };
}
