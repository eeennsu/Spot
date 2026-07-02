// 도메인 타입 — Project. 출처: CLAUDE.md 데이터 모델.
// 평면도 1개 = 프로젝트(실제 건물의 한 층/구역).

export interface IProject {
  id: string;
  name: string;
  /** 도화지(배치 영역) 크기(dp) — 프로젝트별로 조절. 기본값은 BOARD_WIDTH/HEIGHT. */
  boardWidth: number;
  boardHeight: number;
  createdAt: number; // epoch ms
  updatedAt: number;
}
