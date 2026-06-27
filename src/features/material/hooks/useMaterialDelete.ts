// 자재 삭제 훅 — repository 경유. Phase 2 에서 상태 갱신 결선.
import repoMaterialDelete from '../repositories/delete_material';

export function useMaterialDelete() {
  return async (id: string) => {
    await repoMaterialDelete(id);
  };
}
