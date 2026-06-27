// Material repository — 인터페이스 + 골격. Phase 2 에서 LocalDataSource 결선.
// UI 는 이 인터페이스만 사용(SQLite 직접 호출 금지).
import type { Material } from '@/types';

export interface MaterialRepository {
  listByShape(shapeId: string): Promise<Material[]>;
  create(material: Material): Promise<Material>;
  update(material: Material): Promise<void>;
  remove(id: string): Promise<void>;
}

const NOT_IMPLEMENTED = 'materialRepository: Phase 2 에서 구현';

// 골격 — Phase 2 에서 materialLocalDataSource 로 실제 구현 교체.
export const materialRepository: MaterialRepository = {
  async listByShape() {
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
