// 도메인 타입 — Material. 출처: CLAUDE.md 데이터 모델.
// 자재 도형(category==='material')에만 속한다. layerOrder = 랙 안에서 쌓이는 층.

export interface IMaterial {
  id: string;
  shapeId: string; // FK → Shape
  layerOrder: number; // 랙 안 층 순서
  name: string; // 필수
  description?: string;
  imageUri?: string; // 앱 로컬 복사본 경로
}
