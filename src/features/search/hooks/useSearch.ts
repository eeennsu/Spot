// 검색 훅 — query 변화에 디바운스 후 repository 실행. projectId 주면 프로젝트 내, 없으면 전역.
import { useEffect, useState } from 'react';

import repoSearchGlobal from '../repositories/search_global';
import repoSearchProject from '../repositories/search_project';
import type { ISearchResult } from '../types';

const DEBOUNCE_MS = 200;

export function useSearch(query: string, projectId?: string) {
  const [results, setResults] = useState<ISearchResult[]>([]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    let alive = true;
    const t = setTimeout(async () => {
      const r = projectId ? await repoSearchProject(projectId, q) : await repoSearchGlobal(q);
      if (alive) setResults(r);
    }, DEBOUNCE_MS);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [query, projectId]);

  return { results };
}
