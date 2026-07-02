// SQLite 스키마 — CLAUDE.md 데이터 모델(Project → Shape → Material).
// 마이그레이션 배열: index = 적용 후 user_version. 추가 변경은 새 항목을 push.
import { MATERIAL_TABLE } from '@entities/material/consts';
import { PROJECT_TABLE } from '@entities/project/consts';
import { BOARD_HEIGHT, BOARD_WIDTH, SHAPE_TABLE } from '@entities/shape/consts';

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
  // v2 — 자재 별명(alias) 추가.
  `
  ALTER TABLE ${MATERIAL_TABLE} ADD COLUMN alias TEXT;
  CREATE INDEX IF NOT EXISTS idx_material_alias ON ${MATERIAL_TABLE}(alias);
  `,
  // v3 — 자재 별명(단일 텍스트) → 태그(JSON 배열). 기존 alias 는 단일 태그로 이관.
  // tags 는 JSON 배열 문자열로 저장하고, 검색은 LIKE 부분 일치로 처리한다.
  `
  ALTER TABLE ${MATERIAL_TABLE} ADD COLUMN tags TEXT;
  UPDATE ${MATERIAL_TABLE} SET tags = json_array(alias)
    WHERE alias IS NOT NULL AND trim(alias) != '';
  CREATE INDEX IF NOT EXISTS idx_material_tags ON ${MATERIAL_TABLE}(tags);
  `,
  // v4 — 프로젝트별 도화지 크기(board_width/board_height). 기존 행은 기본값으로 채운다.
  `
  ALTER TABLE ${PROJECT_TABLE} ADD COLUMN board_width REAL NOT NULL DEFAULT ${BOARD_WIDTH};
  ALTER TABLE ${PROJECT_TABLE} ADD COLUMN board_height REAL NOT NULL DEFAULT ${BOARD_HEIGHT};
  `,
];
