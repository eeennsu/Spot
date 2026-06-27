// SQLite 스키마 — CLAUDE.md 데이터 모델(Project → Shape → Material).
// 마이그레이션 배열: index = 적용 후 user_version. 추가 변경은 새 항목을 push.
import { PROJECT_TABLE } from '@entities/project/consts';
import { SHAPE_TABLE } from '@entities/shape/consts';
import { MATERIAL_TABLE } from '@entities/material/consts';

export const MIGRATIONS: string[] = [
  // v1 — 초기 전체 스키마(project / shape / material).
  `
  CREATE TABLE IF NOT EXISTS ${PROJECT_TABLE} (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ${SHAPE_TABLE} (
    id TEXT PRIMARY KEY NOT NULL,
    project_id TEXT NOT NULL REFERENCES ${PROJECT_TABLE}(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    type TEXT NOT NULL,
    x REAL NOT NULL,
    y REAL NOT NULL,
    width REAL NOT NULL,
    height REAL NOT NULL,
    rotation REAL NOT NULL DEFAULT 0,
    color TEXT NOT NULL,
    alias TEXT,
    label TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_shape_project ON ${SHAPE_TABLE}(project_id);
  CREATE INDEX IF NOT EXISTS idx_shape_alias ON ${SHAPE_TABLE}(alias);

  CREATE TABLE IF NOT EXISTS ${MATERIAL_TABLE} (
    id TEXT PRIMARY KEY NOT NULL,
    shape_id TEXT NOT NULL REFERENCES ${SHAPE_TABLE}(id) ON DELETE CASCADE,
    layer_order INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    image_uri TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_material_shape ON ${MATERIAL_TABLE}(shape_id);
  CREATE INDEX IF NOT EXISTS idx_material_name ON ${MATERIAL_TABLE}(name);
  `,
];
