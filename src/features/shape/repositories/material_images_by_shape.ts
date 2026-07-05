// 도형에 속한 자재 사진 로컬 경로 목록 — 도형 삭제 시 파일 정리용(FK 캐스케이드 전에 조회).
// material 테이블을 읽지만 도메인 상수(entities)만 참조하므로 feature→feature 의존이 아니다.
import { getDb } from '@shared/db';

import { MATERIAL_TABLE } from '@entities/material/consts';

export default async function repoMaterialImagesByShape(shapeId: string): Promise<string[]> {
  return getDb()
    .getAllSync<{ image_uri: string }>(
      `SELECT image_uri FROM ${MATERIAL_TABLE} WHERE shape_id = ? AND image_uri IS NOT NULL`,
      shapeId,
    )
    .map(r => r.image_uri);
}
