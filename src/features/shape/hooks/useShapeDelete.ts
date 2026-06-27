// 도형 삭제 훅 — repository 경유. Phase 1 에서 상태 갱신 결선.
import repoShapeDelete from '../repositories/delete_shape';

export function useShapeDelete() {
  return async (id: string) => {
    await repoShapeDelete(id);
  };
}
