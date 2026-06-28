// 학습 세션 상태(zustand) — 위치/이름 퀴즈 진행·점수. feature 내부 store.
import { create } from 'zustand';

import type { ILearnType, INameQuestion, IPositionQuestion } from '../types';

type AnswerState = 'correct' | 'wrong' | null;

interface LearnState {
  active: boolean;
  type: ILearnType;
  position: IPositionQuestion[];
  name: INameQuestion[];
  index: number;
  score: number;
  answered: AnswerState;
  /** 이름 퀴즈에서 사용자가 고른 보기 */
  picked: string | null;
  finished: boolean;

  start: (type: ILearnType, position: IPositionQuestion[], name: INameQuestion[]) => void;
  answerPosition: (shapeId: string) => void;
  answerName: (choice: string) => void;
  next: () => void;
  stop: () => void;
}

function total(s: Pick<LearnState, 'type' | 'position' | 'name'>): number {
  return s.type === 'position' ? s.position.length : s.name.length;
}

export const useLearnStore = create<LearnState>((set, get) => ({
  active: false,
  type: 'position',
  position: [],
  name: [],
  index: 0,
  score: 0,
  answered: null,
  picked: null,
  finished: false,

  start: (type, position, name) =>
    set({
      active: true,
      type,
      position,
      name,
      index: 0,
      score: 0,
      answered: null,
      picked: null,
      finished: false,
    }),

  answerPosition: shapeId => {
    const s = get();
    if (!s.active || s.type !== 'position' || s.answered) return;
    const q = s.position[s.index];
    if (!q) return;
    const ok = q.correctShapeIds.includes(shapeId);
    set({ answered: ok ? 'correct' : 'wrong', score: s.score + (ok ? 1 : 0) });
  },

  answerName: choice => {
    const s = get();
    if (!s.active || s.type !== 'name' || s.answered) return;
    const q = s.name[s.index];
    if (!q) return;
    const ok = q.correctNames.includes(choice);
    set({ answered: ok ? 'correct' : 'wrong', picked: choice, score: s.score + (ok ? 1 : 0) });
  },

  next: () => {
    const s = get();
    if (s.index + 1 >= total(s)) {
      set({ finished: true });
    } else {
      set({ index: s.index + 1, answered: null, picked: null });
    }
  },

  stop: () =>
    set({ active: false, answered: null, picked: null, finished: false, index: 0, score: 0 }),
}));
