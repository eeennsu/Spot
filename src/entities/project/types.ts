// 도메인 타입 — Project. 출처: CLAUDE.md 데이터 모델.
// 평면도 1개 = 프로젝트(실제 건물의 한 층/구역).

export interface IProject {
  id: string;
  name: string;
  createdAt: number; // epoch ms
  updatedAt: number;
}
