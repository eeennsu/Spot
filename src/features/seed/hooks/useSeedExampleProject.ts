// 예시 평면도 시드 훅 — 라우트(app)는 repository 직접 호출 금지, 이 훅 경유.
import { useCallback } from 'react';

import { seedExampleProjectIfEmpty } from '../libs/seed_example_project';

export function useSeedExampleProject() {
  /** 프로젝트가 하나도 없을 때만 예시 평면도 1개 생성(중복 없음). */
  return useCallback(() => seedExampleProjectIfEmpty(), []);
}
