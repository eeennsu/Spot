// 도형 편집기 전역 UI 상태(zustand) — 모드/선택. 영속 데이터 아님.
// feature 내부 store(도메인 결합). shared/stores 금지(역방향).
import { create } from 'zustand';

export type IEditorMode = 'viewer' | 'edit';

interface EditorState {
  mode: IEditorMode;
  /** 현재 선택된 도형 id(Edit 에서 핸들/인스펙터 노출) */
  selectedShapeId: string | null;
  setMode: (mode: IEditorMode) => void;
  toggleMode: () => void;
  select: (id: string | null) => void;
  reset: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  mode: 'viewer',
  selectedShapeId: null,
  setMode: (mode) => set((s) => ({ mode, selectedShapeId: mode === 'viewer' ? null : s.selectedShapeId })),
  toggleMode: () =>
    set((s) => {
      const next = s.mode === 'viewer' ? 'edit' : 'viewer';
      return { mode: next, selectedShapeId: next === 'viewer' ? null : s.selectedShapeId };
    }),
  select: (id) => set({ selectedShapeId: id }),
  reset: () => set({ mode: 'viewer', selectedShapeId: null }),
}));
