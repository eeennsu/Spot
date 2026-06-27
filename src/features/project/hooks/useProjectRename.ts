// 프로젝트 이름 변경 훅 — store 경유.
import { useProjectStore } from '../stores/project';

export function useProjectRename() {
  return useProjectStore((s) => s.renameProject);
}
