// Project row ↔ 도메인 객체 변환(순수 함수). SQLite 행 매핑은 여기로 흡수.
import type { IProject } from '@entities/project/types';

export interface ProjectRow {
  id: string;
  name: string;
  board_width: number;
  board_height: number;
  created_at: number;
  updated_at: number;
}

export function mapRowToProject(r: ProjectRow): IProject {
  return {
    id: r.id,
    name: r.name,
    boardWidth: r.board_width,
    boardHeight: r.board_height,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}
