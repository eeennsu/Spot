// 검색 결과 타입 — feature 내부 타입(entities 아님: 검색은 동작).
// 자재 이름 매칭 + 도형 별칭 매칭을 한 결과 모양으로 통합.

export type ISearchKind = 'material' | 'alias';

export interface ISearchResult {
  /** 리스트 key(중복 방지) */
  key: string;
  projectId: string;
  /** 전역 검색에서만 채움 */
  projectName?: string;
  /** 이동 대상 도형 */
  shapeId: string;
  /** 도형 식별 표시(별칭 > 라벨) */
  shapeLabel?: string;
  /** 매칭 표시 텍스트(자재명 또는 별칭) */
  matched: string;
  kind: ISearchKind;
}
