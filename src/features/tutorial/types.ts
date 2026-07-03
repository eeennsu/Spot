// 캔버스 튜토리얼(코치마크) 타입. 영속 데이터 아님(전역 UI 흐름 상태).
// tutorial 은 데이터 도메인이 아니라 UI 안내 feature 라 entities 대신 여기 둔다.

/** 스포트라이트 대상 키 — 캔버스 내부 요소만(헤더 버튼은 중앙 안내로 처리). */
export type TutorialTargetKey = 'palette' | 'inspector' | 'boardHandle' | 'fabLearn' | 'fabPdf';

/** 측정된 요소의 화면(window) 좌표 사각형. */
export interface TutorialRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** 한 스텝 정의. */
export interface TutorialStep {
  id: string;
  title: string;
  body: string;
  /** 이 스텝을 보여줄 모드. 진입 시 자동 전환(실제 화면 변화를 유저가 목격). */
  mode?: 'viewer' | 'edit';
  /** 스포트라이트 대상. 없으면 화면 중앙 안내 카드. */
  target?: TutorialTargetKey;
  /** true면 하이라이트된 실제 요소를 눌러볼 수 있다(pass-through). */
  interactive?: boolean;
  /** 진입 시 사이드이펙트(인스펙터 노출용 첫 도형 선택 등). */
  effect?: 'selectFirstShape';
  /** 이 액션이 실제로 일어나면 자동으로 다음 스텝(게임 느낌). */
  advanceOn?: 'shapeAdded';
  /** 대상이 헤더(캔버스 밖)일 때 방향 힌트. */
  point?: 'topRight';
}

export type TutorialEvent = 'shapeAdded';
