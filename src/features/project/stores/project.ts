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
  error: string | null;
  load: () => Promise<void>;
  addProject: (name: string) => Promise<void>;
  renameProject: (id: string, name: string) => Promise<void>;
  removeProject: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  // 앱 시작 시 항상 load() 하므로 초기값 true — 콜드 스타트 첫 프레임에
  // 가짜 빈 상태("첫 평면도 만들기")가 번쩍이는 것을 막는다.
  loading: true,
  error: null,

  async load() {
    set({ loading: true, error: null });
    try {
      const projects = await repoProjectList();
      set({ projects, error: null });
    } catch (e) {
      // 목록 로드 실패 시 무한 로딩(빈 화면 감옥)에 갇히지 않도록 에러 상태로 빠져나온다.
      console.error('[project] load failed', e);
      set({ error: '평면도를 불러오지 못했어요' });
    } finally {
      set({ loading: false });
    }
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
