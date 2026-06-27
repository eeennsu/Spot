// 도메인 타입 — Cell / Material. 출처: CLAUDE.md 데이터 모델.
// 골격(skeleton). 칸 기하/자재 세부는 Phase 2·5 에서 확장(모델 변경 필요시 먼저 보고).

/**
 * 칸 — 한 도형 안 여러 구획(옵션·복수). Phase 5.
 * 기하(위치/크기) 필드는 Phase 5 설계 시 추가(데이터모델 변경 → 사전 보고).
 */
export interface Cell {
  id: string;
  shapeId: string; // FK → Shape
  createdAt: number;
  updatedAt: number;
}

/**
 * 자재 — 이미지·이름·설명 전부 옵션. Phase 2.
 * cellId 가 있으면 칸별 자재(Phase 5), 없으면 도형 직속.
 */
export interface Material {
  id: string;
  shapeId: string; // FK → Shape
  cellId: string | null; // FK → Cell (옵션)
  imageUri: string | null; // 앱 로컬 복사본 경로
  name: string | null;
  description: string | null;
  createdAt: number;
  updatedAt: number;
}
