// 도형 저장(생성/갱신) — Phase 1 스텁. 모델-정확한 시그니처.
// 실제 INSERT OR REPLACE 구현은 Phase 1(도형 캔버스)에서.
import type { IShape } from '@entities/shape/types';

export default async function repoShapeSave(_shape: IShape): Promise<void> {
  throw new Error('repoShapeSave: Phase 1 에서 구현');
}
