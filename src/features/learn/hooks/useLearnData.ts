// 학습 데이터 훅 — 프로젝트 자재 행 로드 후 퀴즈 세트 빌드. repository 직접 호출 허용.
import { useCallback, useEffect, useState } from 'react';

import repoMaterialListByProject from '@features/material/repositories/list_project_materials';

import buildQuiz, { type IQuizSet } from '../libs/build_quiz';

const EMPTY: IQuizSet = { position: [], name: [] };

export function useLearnData(projectId: string) {
  const [quiz, setQuiz] = useState<IQuizSet>(EMPTY);
  const [ready, setReady] = useState(false);

  const reload = useCallback(async (): Promise<IQuizSet> => {
    const rows = await repoMaterialListByProject(projectId);
    const set = buildQuiz(rows.map(r => ({ shapeId: r.shapeId, name: r.name })));
    setQuiz(set);
    setReady(true);
    return set;
  }, [projectId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const count = quiz.position.length; // 자재(이름) 수 기준
  return { quiz, ready, count, reload };
}
