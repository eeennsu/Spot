// 튜토리얼 전역 UI 상태(zustand) — 활성/스텝/측정된 대상 사각형. 영속 아님.
// 모드 전환·도형 선택 같은 앱 로직은 데이터를 아는 ProjectCanvas 쪽 effect 에서 처리.
import { create } from 'zustand';

import { TUTORIAL_STEPS } from '../consts';
import type { TutorialEvent, TutorialRect, TutorialStep } from '../types';

interface TutorialState {
  active: boolean;
  index: number;
  steps: TutorialStep[];
  /** 대상 키 → 화면 좌표(측정값). 스텝 전환/모드 변화로 갱신된다. */
  rects: Record<string, TutorialRect | undefined>;
  start: () => void;
  stop: () => void;
  next: () => void;
  prev: () => void;
  setRect: (key: string, rect: TutorialRect) => void;
  /** 실제 사용자 액션 알림 — 현재 스텝의 advanceOn 과 일치하면 자동 진행. */
  notify: (event: TutorialEvent) => void;
}

export const useTutorialStore = create<TutorialState>((set, get) => ({
  active: false,
  index: 0,
  steps: TUTORIAL_STEPS,
  rects: {},
  start: () => set({ active: true, index: 0, rects: {} }),
  stop: () => set({ active: false, index: 0 }),
  next: () => {
    const { index, steps } = get();
    if (index >= steps.length - 1) {
      set({ active: false, index: 0 });
      return;
    }
    set({ index: index + 1 });
  },
  prev: () => set(s => ({ index: Math.max(0, s.index - 1) })),
  setRect: (key, rect) => set(s => ({ rects: { ...s.rects, [key]: rect } })),
  notify: event => {
    const { active, index, steps } = get();
    if (!active) return;
    if (steps[index]?.advanceOn === event) get().next();
  },
}));

/** 현재 스텝(비활성 시 null). 셀렉터로 쓰기 편하게. */
export const selectCurrentStep = (s: TutorialState): TutorialStep | null =>
  s.active ? (s.steps[s.index] ?? null) : null;
