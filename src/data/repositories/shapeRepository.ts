// Shape repository — 인터페이스 + 골격. Phase 1 에서 LocalDataSource 결선.
// UI 는 이 인터페이스만 사용(SQLite 직접 호출 금지).
import type { Shape } from '@/types';

export interface ShapeRepository {
  listByFloor(floorId: string): Promise<Shape[]>;
  create(shape: Shape): Promise<Shape>;
  update(shape: Shape): Promise<void>;
  remove(id: string): Promise<void>;
}

const NOT_IMPLEMENTED = 'shapeRepository: Phase 1 에서 구현';

// 골격 — Phase 1 에서 shapeLocalDataSource 로 실제 구현 교체.
export const shapeRepository: ShapeRepository = {
  async listByFloor() {
    return [];
  },
  async create() {
    throw new Error(NOT_IMPLEMENTED);
  },
  async update() {
    throw new Error(NOT_IMPLEMENTED);
  },
  async remove() {
    throw new Error(NOT_IMPLEMENTED);
  },
};
