// 학습(퀴즈) 타입 — feature 내부. 위치 맞히기 / 이름 맞히기.

export type ILearnType = 'position' | 'name';

/** 위치 맞히기: 자재 이름 제시 → 그 자재가 있는 도형 탭. */
export interface IPositionQuestion {
  name: string;
  /** 정답 도형(같은 이름 자재가 있는 모든 도형) */
  correctShapeIds: string[];
}

/** 이름 맞히기: 도형 하이라이트 → 그 도형 자재 이름 선택. */
export interface INameQuestion {
  shapeId: string;
  /** 그 도형에 실제로 있는 자재 이름들(정답 후보) */
  correctNames: string[];
  /** 객관식 보기(정답 1 + 오답들, 셔플됨) */
  choices: string[];
}
