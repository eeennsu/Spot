// 프로젝트 생성 훅 — store 경유.
import { useProjectStore } from '../stores/project';

export function useProjectCreate() {
  return useProjectStore((s) => s.addProject);
}
