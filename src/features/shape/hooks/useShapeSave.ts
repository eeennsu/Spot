// 도형 저장 훅 — repository 경유. Phase 1 에서 상태 갱신 결선.
import type { IShape } from '@entities/shape/types';

import repoShapeSave from '../repositories/save_shape';

export function useShapeSave() {
  return async (shape: IShape) => {
    await repoShapeSave(shape);
  };
}
