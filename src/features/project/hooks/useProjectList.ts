// 프로젝트 목록 훅 — store 경유(앱/위젯/컴포넌트는 repository 직접 호출 금지).
import { useProjectStore } from '../stores/project';

export function useProjectList() {
  const projects = useProjectStore(s => s.projects);
  const loading = useProjectStore(s => s.loading);
  const load = useProjectStore(s => s.load);
  return { projects, loading, load };
}
