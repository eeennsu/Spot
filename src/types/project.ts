// 도메인 타입 — Project / Floor. 출처: CLAUDE.md 데이터 모델.
// 인프라 필드(id/FK/timestamp)만 추가, 도메인 필드는 모델 그대로.

/** 평면도 1개 = 프로젝트. */
export interface Project {
  id: string;
  name: string;
  createdAt: number; // epoch ms
  updatedAt: number;
}

/**
 * 층 — 옵션·복수. 데이터 모델상 Shape 의 부모.
 * 실제 층 전환 UI 는 Phase 5. Phase 0~1 은 기본 층 1개로 동작.
 */
export interface Floor {
  id: string;
  projectId: string; // FK → Project
  name: string;
  index: number; // 정렬 순서
  createdAt: number;
  updatedAt: number;
}
