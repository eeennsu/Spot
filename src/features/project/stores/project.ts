// 프로젝트 전역 상태(zustand) — feature 내부이므로 repository 직접 호출 허용.
// 영속은 repository 경유. (shared/stores 에 두면 shared→features 역방향 위반이라 여기 둔다.)
import { create } from 'zustand';

import type { IProject } from '@entities/project/types';

import repoProjectCreate from '../repositories/create_project';
import repoProjectDelete from '../repositories/delete_project';
import repoProjectList from '../repositories/list_projects';
import repoProjectRename from '../repositories/rename_project';

interface ProjectState {
  projects: IProject[];
  loading: boolean;
  load: () => Promise<void>;
  addProject: (name: string) => Promise<void>;
  renameProject: (id: string, name: string) => Promise<void>;
  removeProject: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  loading: false,

  async load() {
    set({ loading: true });
    const projects = await repoProjectList();
    set({ projects, loading: false });
  },

  async addProject(name) {
    await repoProjectCreate(name);
    await get().load();
  },

  async renameProject(id, name) {
    await repoProjectRename(id, name);
    await get().load();
  },

  async removeProject(id) {
    await repoProjectDelete(id);
    await get().load();
  },
}));
