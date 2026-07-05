// 도형 캔버스 데이터 훅 — 프로젝트의 도형 배열을 소유하고 영속까지 담당.
// feature 훅이므로 repository 직접 호출 허용(컴포넌트는 이 훅만 사용).
import { useCallback, useEffect, useState } from 'react';

import { palette } from '@shared/theme';
import { utilCreateId } from '@shared/utils/util_id';
import { utilDeleteAppImage } from '@shared/utils/util_image';

import { SHAPE_CATALOG, shapeCatalogOf, type IShapeType } from '@entities/shape/consts';
import type { IShape } from '@entities/shape/types';

import repoShapeDelete from '../repositories/delete_shape';
import repoShapeList from '../repositories/list_shapes';
import repoMaterialImagesByShape from '../repositories/material_images_by_shape';
import repoShapeSave from '../repositories/save_shape';

/** 위치 미지정 시 폴백 배치 좌표(겹침 방지 계단식) */
const SPAWN_BASE = { x: 40, y: 40 };
const SPAWN_STEP = 18;

export function useShapeCanvas(projectId: string) {
  const [shapes, setShapes] = useState<IShape[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    setShapes(await repoShapeList(projectId));
    setLoaded(true);
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  /**
   * 카탈로그 기반 신규 도형 생성 + 즉시 영속.
   * pos 지정 시 그 좌상단에 배치(호출측이 도화지 기준 중앙 아래 등 계산).
   * 미지정 시 계단식 폴백.
   */
  const addShape = useCallback(
    async (type: IShapeType, pos?: { x: number; y: number }): Promise<IShape> => {
      const meta = shapeCatalogOf(type);
      const offset = shapes.length * SPAWN_STEP;
      const shape: IShape = {
        id: utilCreateId(),
        projectId,
        category: meta.category,
        type,
        x: pos?.x ?? SPAWN_BASE.x + offset,
        y: pos?.y ?? SPAWN_BASE.y + offset,
        width: meta.defaultWidth,
        height: meta.defaultHeight,
        rotation: 0,
        color: meta.category === 'space' ? palette.spaceFill : palette.defaultMaterialFill,
        label: meta.defaultLabel,
      };
      setShapes(prev => [...prev, shape]);
      await repoShapeSave(shape);
      return shape;
    },
    [projectId, shapes.length],
  );

  /** 부분 갱신 + 영속(제스처 종료·인스펙터 편집 커밋) */
  const updateShape = useCallback(async (id: string, patch: Partial<IShape>) => {
    let next: IShape | undefined;
    setShapes(prev =>
      prev.map(s => {
        if (s.id !== id) return s;
        next = { ...s, ...patch };
        return next;
      }),
    );
    if (next) await repoShapeSave(next);
  }, []);

  const removeShape = useCallback(async (id: string) => {
    setShapes(prev => prev.filter(s => s.id !== id));
    // 캐스케이드로 자재 행이 사라지기 전에 사진 경로를 먼저 모아두고, 삭제 후 로컬 파일까지 정리(고아 방지).
    const images = await repoMaterialImagesByShape(id);
    await repoShapeDelete(id);
    for (const uri of images) await utilDeleteAppImage(uri);
  }, []);

  return { shapes, loaded, load, addShape, updateShape, removeShape };
}

export { SHAPE_CATALOG };
