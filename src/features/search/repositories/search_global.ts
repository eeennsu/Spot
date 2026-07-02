// 전역 검색 — 모든 프로젝트의 자재 이름 + 자재 태그 + 도형 별칭(부분 일치). repository 만 SQLite 접근.
import { getDb } from '@shared/db';

import { MATERIAL_TABLE } from '@entities/material/consts';
import { PROJECT_TABLE } from '@entities/project/consts';
import { SHAPE_TABLE } from '@entities/shape/consts';

import { matchedTagLabel } from '../libs/matched_tag';
import type { ISearchResult } from '../types';

export default async function repoSearchGlobal(query: string): Promise<ISearchResult[]> {
  const q = query.trim();
  if (!q) return [];
  const like = `%${q}%`;
  const db = getDb();

  const materials = db.getAllSync<{
    id: string;
    name: string;
    shape_id: string;
    project_id: string;
    project_name: string;
    alias: string | null;
    label: string | null;
  }>(
    `SELECT m.id, m.name, m.shape_id, s.project_id, p.name AS project_name, s.alias, s.label
     FROM ${MATERIAL_TABLE} m
     JOIN ${SHAPE_TABLE} s ON m.shape_id = s.id
     JOIN ${PROJECT_TABLE} p ON s.project_id = p.id
     WHERE m.name LIKE ?
     ORDER BY m.name ASC`,
    like,
  );

  // 자재 태그 매칭 — tags(JSON 배열 문자열) 부분 일치. 이름 매칭과 중복은 제외.
  const tagged = db.getAllSync<{
    id: string;
    name: string;
    tags: string;
    shape_id: string;
    project_id: string;
    project_name: string;
    alias: string | null;
    label: string | null;
  }>(
    `SELECT m.id, m.name, m.tags, m.shape_id, s.project_id, p.name AS project_name, s.alias, s.label
     FROM ${MATERIAL_TABLE} m
     JOIN ${SHAPE_TABLE} s ON m.shape_id = s.id
     JOIN ${PROJECT_TABLE} p ON s.project_id = p.id
     WHERE m.tags IS NOT NULL AND m.tags LIKE ? AND m.name NOT LIKE ?
     ORDER BY m.name ASC`,
    like,
    like,
  );

  const aliases = db.getAllSync<{
    id: string;
    project_id: string;
    project_name: string;
    alias: string;
    label: string | null;
  }>(
    `SELECT s.id, s.project_id, p.name AS project_name, s.alias, s.label
     FROM ${SHAPE_TABLE} s
     JOIN ${PROJECT_TABLE} p ON s.project_id = p.id
     WHERE s.alias IS NOT NULL AND s.alias LIKE ?
     ORDER BY s.alias ASC`,
    like,
  );

  return [
    ...materials.map<ISearchResult>(r => ({
      key: `m:${r.id}`,
      projectId: r.project_id,
      projectName: r.project_name,
      shapeId: r.shape_id,
      shapeLabel: r.alias ?? r.label ?? undefined,
      matched: r.name,
      kind: 'material',
    })),
    ...tagged.map<ISearchResult>(r => ({
      key: `t:${r.id}`,
      projectId: r.project_id,
      projectName: r.project_name,
      shapeId: r.shape_id,
      shapeLabel: r.alias ?? r.label ?? undefined,
      matched: matchedTagLabel(r.tags, q),
      kind: 'tag',
    })),
    ...aliases.map<ISearchResult>(r => ({
      key: `a:${r.id}`,
      projectId: r.project_id,
      projectName: r.project_name,
      shapeId: r.id,
      shapeLabel: r.alias ?? r.label ?? undefined,
      matched: `별칭 "${r.alias}"`,
      kind: 'alias',
    })),
  ];
}
