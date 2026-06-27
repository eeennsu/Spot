// Project LocalDataSource — SQLite 직접 접근(여기서만). 행 ↔ 도메인 매핑.
import type { Project } from '@/types';

import { getDb } from '../db';

interface ProjectRow {
  id: string;
  name: string;
  created_at: number;
  updated_at: number;
}

function toProject(r: ProjectRow): Project {
  return { id: r.id, name: r.name, createdAt: r.created_at, updatedAt: r.updated_at };
}

export const projectLocalDataSource = {
  list(): Project[] {
    return getDb()
      .getAllSync<ProjectRow>('SELECT * FROM project ORDER BY created_at DESC')
      .map(toProject);
  },

  getById(id: string): Project | null {
    const r = getDb().getFirstSync<ProjectRow>('SELECT * FROM project WHERE id = ?', id);
    return r ? toProject(r) : null;
  },

  insert(p: Project): void {
    getDb().runSync(
      'INSERT INTO project (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)',
      p.id,
      p.name,
      p.createdAt,
      p.updatedAt,
    );
  },
};
