// SQLite 스키마 — CLAUDE.md 데이터 모델 전체(Project→Floor→Shape→Cell/Material).
// 마이그레이션 배열: index = 적용 후 user_version. 추가 변경은 새 항목을 push.

export const MIGRATIONS: string[] = [
  // v1 — 초기 전체 스키마.
  `
  CREATE TABLE IF NOT EXISTS project (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS floor (
    id TEXT PRIMARY KEY NOT NULL,
    project_id TEXT NOT NULL REFERENCES project(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    idx INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_floor_project ON floor(project_id);

  CREATE TABLE IF NOT EXISTS shape (
    id TEXT PRIMARY KEY NOT NULL,
    floor_id TEXT NOT NULL REFERENCES floor(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    x REAL NOT NULL,
    y REAL NOT NULL,
    width REAL NOT NULL,
    height REAL NOT NULL,
    color TEXT NOT NULL,
    rotation REAL NOT NULL DEFAULT 0,
    alias TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_shape_floor ON shape(floor_id);
  CREATE INDEX IF NOT EXISTS idx_shape_alias ON shape(alias);

  CREATE TABLE IF NOT EXISTS cell (
    id TEXT PRIMARY KEY NOT NULL,
    shape_id TEXT NOT NULL REFERENCES shape(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_cell_shape ON cell(shape_id);

  CREATE TABLE IF NOT EXISTS material (
    id TEXT PRIMARY KEY NOT NULL,
    shape_id TEXT NOT NULL REFERENCES shape(id) ON DELETE CASCADE,
    cell_id TEXT REFERENCES cell(id) ON DELETE SET NULL,
    image_uri TEXT,
    name TEXT,
    description TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_material_shape ON material(shape_id);
  CREATE INDEX IF NOT EXISTS idx_material_name ON material(name);
  `,
];
