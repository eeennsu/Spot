// 프로젝트 삭제 훅 — store 경유.
import { useProjectStore } from '../stores/project';

export function useProjectDelete() {
  return useProjectStore(s => s.removeProject);
}
