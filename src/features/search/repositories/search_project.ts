// 프로젝트 내 검색 — 현재 프로젝트의 자재 이름 + 도형 별칭(부분 일치).
import { getDb } from '@shared/db';

import { MATERIAL_TABLE } from '@entities/material/consts';
import { SHAPE_TABLE } from '@entities/shape/consts';

import type { ISearchResult } from '../types';

export default async function repoSearchProject(
  projectId: string,
  query: string,
): Promise<ISearchResult[]> {
  const q = query.trim();
  if (!q) return [];
  const like = `%${q}%`;
  const db = getDb();

  const materials = db.getAllSync<{
    id: string;
    name: string;
    shape_id: string;
    alias: string | null;
    label: string | null;
  }>(
    `SELECT m.id, m.name, m.shape_id, s.alias, s.label
     FROM ${MATERIAL_TABLE} m
     JOIN ${SHAPE_TABLE} s ON m.shape_id = s.id
     WHERE s.project_id = ? AND m.name LIKE ?
     ORDER BY m.name ASC`,
    projectId,
    like,
  );

  const aliases = db.getAllSync<{
    id: string;
    alias: string;
    label: string | null;
  }>(
    `SELECT s.id, s.alias, s.label
     FROM ${SHAPE_TABLE} s
     WHERE s.project_id = ? AND s.alias IS NOT NULL AND s.alias LIKE ?
     ORDER BY s.alias ASC`,
    projectId,
    like,
  );

  return [
    ...materials.map<ISearchResult>(r => ({
      key: `m:${r.id}`,
      projectId,
      shapeId: r.shape_id,
      shapeLabel: r.alias ?? r.label ?? undefined,
      matched: r.name,
      kind: 'material',
    })),
    ...aliases.map<ISearchResult>(r => ({
      key: `a:${r.id}`,
      projectId,
      shapeId: r.id,
      shapeLabel: r.alias ?? r.label ?? undefined,
      matched: `별칭 "${r.alias}"`,
      kind: 'alias',
    })),
  ];
}
