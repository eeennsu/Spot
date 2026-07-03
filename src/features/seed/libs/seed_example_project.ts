// 예시 평면도 시드 — 앱 최초 실행 시 1회. 프로젝트가 하나도 없을 때만 생성(idempotent).
// FSD: 여러 도메인 저장은 각 feature repository 경유(SQLite 직접 접근 금지).
import { utilCreateId } from '@shared/utils/util_id';

import type { IMaterial } from '@entities/material/types';
import { shapeCatalogOf } from '@entities/shape/consts';
import type { IShape } from '@entities/shape/types';

import repoMaterialSave from '@features/material/repositories/save_material';
import repoProjectCreate from '@features/project/repositories/create_project';
import repoProjectList from '@features/project/repositories/list_projects';
import repoShapeSave from '@features/shape/repositories/save_shape';

import { EXAMPLE_PROJECT_NAME, EXAMPLE_SHAPES } from './example_data';
import { copySeedImage, type SeedImageKey } from './seed_images';

/** EXAMPLE_SHAPES 에서 쓰인 이미지 키들을 앱 로컬로 복사해 key→uri 맵을 만든다. */
async function copyUsedImages(): Promise<Record<string, string>> {
  const keys = new Set<SeedImageKey>();
  for (const shape of EXAMPLE_SHAPES) {
    for (const material of shape.materials ?? []) {
      if (material.imageKey) keys.add(material.imageKey);
    }
  }
  const map: Record<string, string> = {};
  for (const key of keys) {
    map[key] = await copySeedImage(key);
  }
  return map;
}

// 동시 호출 가드(예: dev StrictMode 재마운트) — 진행 중이면 같은 작업을 공유해
// 두 호출이 각각 빈 DB 를 보고 중복 시드하는 경합을 막는다.
let inFlight: Promise<void> | null = null;

/**
 * 예시 평면도를 1회 시드한다(idempotent).
 * - 이미 프로젝트가 있으면 아무것도 하지 않음(중복 생성 금지).
 * - 동시 호출은 같은 promise 를 공유 → 경합으로 인한 중복 방지.
 */
export function seedExampleProjectIfEmpty(): Promise<void> {
  if (!inFlight) inFlight = runSeed();
  return inFlight;
}

/**
 * 실제 시드 본체.
 * - 이미지 복사를 먼저 끝낸 뒤 DB 쓰기 → 중간 실패 시 부분 시드가 남지 않는다.
 */
async function runSeed(): Promise<void> {
  const existing = await repoProjectList();
  if (existing.length > 0) return;

  const imageUriByKey = await copyUsedImages();

  const project = await repoProjectCreate(EXAMPLE_PROJECT_NAME);

  for (const spec of EXAMPLE_SHAPES) {
    const meta = shapeCatalogOf(spec.type);
    const shapeId = utilCreateId();
    const shape: IShape = {
      id: shapeId,
      projectId: project.id,
      category: meta.category,
      type: spec.type,
      x: spec.x,
      y: spec.y,
      width: spec.width ?? meta.defaultWidth,
      height: spec.height ?? meta.defaultHeight,
      rotation: 0,
      color: spec.color,
      alias: spec.alias,
      label: spec.label ?? meta.defaultLabel,
    };
    await repoShapeSave(shape);

    const materials = spec.materials ?? [];
    for (let i = 0; i < materials.length; i++) {
      const m = materials[i];
      const material: IMaterial = {
        id: utilCreateId(),
        shapeId,
        layerOrder: i, // 배열 순서 = 아래→위 층
        name: m.name,
        description: m.description,
        tags: m.tags,
        imageUri: m.imageKey ? imageUriByKey[m.imageKey] : undefined,
      };
      await repoMaterialSave(material);
    }
  }
}
