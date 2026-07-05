// 프로젝트 전체 자재 사진 로컬 경로 목록 — 프로젝트 삭제 시 파일 정리용(FK 캐스케이드 전에 조회).
// shape/material 테이블을 JOIN 하지만 도메인 상수(entities)만 참조 → feature→feature 의존 아님.
import { getDb } from '@shared/db';

import { MATERIAL_TABLE } from '@entities/material/consts';
import { SHAPE_TABLE } from '@entities/shape/consts';

export default async function repoMaterialImagesByProject(projectId: string): Promise<string[]> {
  return getDb()
    .getAllSync<{ image_uri: string }>(
      `SELECT m.image_uri
       FROM ${MATERIAL_TABLE} m
       JOIN ${SHAPE_TABLE} s ON m.shape_id = s.id
       WHERE s.project_id = ? AND m.image_uri IS NOT NULL`,
      projectId,
    )
    .map(r => r.image_uri);
}
