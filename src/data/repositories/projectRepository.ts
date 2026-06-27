// Project repository — UI 는 이 인터페이스만 사용(SQLite 직접 호출 금지).
// 로컬은 동기지만 인터페이스는 async(나중에 동기화 계층 대비).
import * as Crypto from 'expo-crypto';

import type { Project } from '@/types';

import { projectLocalDataSource } from '../local/projectLocalDataSource';

export interface ProjectRepository {
  list(): Promise<Project[]>;
  getById(id: string): Promise<Project | null>;
  create(name: string): Promise<Project>;
}

export const projectRepository: ProjectRepository = {
  async list() {
    return projectLocalDataSource.list();
  },

  async getById(id) {
    return projectLocalDataSource.getById(id);
  },

  async create(name) {
    const now = Date.now();
    const project: Project = {
      id: Crypto.randomUUID(),
      name,
      createdAt: now,
      updatedAt: now,
    };
    projectLocalDataSource.insert(project);
    return project;
  },
};
