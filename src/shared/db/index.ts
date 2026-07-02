// SQLite 인프라(도메인 0 의존) — 싱글턴 연결 + 마이그레이션.
// 모든 SQL 쿼리는 features/<domain>/repositories 에서만. 여기는 연결/스키마만.
import * as SQLite from 'expo-sqlite';

import { MIGRATIONS } from './schema';

const DB_NAME = 'spot.db';

let db: SQLite.SQLiteDatabase | null = null;
let migrated = false;

function runMigrations(database: SQLite.SQLiteDatabase): void {
  const row = database.getFirstSync<{ user_version: number }>('PRAGMA user_version');
  const current = row?.user_version ?? 0;
  for (let v = current; v < MIGRATIONS.length; v++) {
    database.withTransactionSync(() => {
      database.execSync(MIGRATIONS[v]);
      database.execSync(`PRAGMA user_version = ${v + 1}`);
    });
  }
}

/**
 * DB 싱글턴. 최초 접근 시 PRAGMA + 마이그레이션 1회 보장.
 * (화면 effect 순서와 무관하게 쿼리 전에 스키마 준비.)
 */
export function getDb(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync(DB_NAME);
    db.execSync('PRAGMA journal_mode = WAL;');
    db.execSync('PRAGMA foreign_keys = ON;');
  }
  if (!migrated) {
    runMigrations(db);
    migrated = true;
  }
  return db;
}

/** 앱 시작 시 명시 호출 — 빈 DB 생성 + 스키마 초기화. */
export function migrate(): void {
  getDb();
}
