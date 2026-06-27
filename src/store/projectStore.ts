// 전역 프로젝트 상태(zustand). 영속은 repository 경유 — SQLite 직접 호출 금지.
import { create } from 'zustand';

import { projectRepository } from '@/data';
import type { Project } from '@/types';

interface ProjectState {
  projects: Project[];
  loading: boolean;
  load: () => Promise<void>;
  addProject: (name: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  loading: false,

  async load() {
    set({ loading: true });
    const projects = await projectRepository.list();
    set({ projects, loading: false });
  },

  async addProject(name) {
    await projectRepository.create(name);
    await get().load();
  },
}));
