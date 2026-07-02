// 프로젝트 도화지 크기 조회/변경 훅 — repository 경유(컴포넌트 직접 호출 금지).
// 초기값은 DB 로드 전까지 기본 상수. 로드 완료(loaded)를 캔버스 fit 계산이 기다린다.
import { useCallback, useEffect, useState } from 'react';

import { BOARD_HEIGHT, BOARD_WIDTH } from '@entities/shape/consts';

import repoProjectGet from '../repositories/get_project';
import repoProjectUpdateBoard from '../repositories/update_board';

export interface IBoardSize {
  w: number;
  h: number;
}

export function useProjectBoard(projectId: string) {
  const [board, setBoard] = useState<IBoardSize>({ w: BOARD_WIDTH, h: BOARD_HEIGHT });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoaded(false);
    repoProjectGet(projectId).then(p => {
      if (!alive || !p) return;
      setBoard({ w: p.boardWidth, h: p.boardHeight });
      setLoaded(true);
    });
    return () => {
      alive = false;
    };
  }, [projectId]);

  // 낙관적 갱신 후 영속(드래그 종료 시 호출).
  const save = useCallback(
    async (w: number, h: number) => {
      setBoard({ w, h });
      await repoProjectUpdateBoard(projectId, w, h);
    },
    [projectId],
  );

  return { board, loaded, save };
}
