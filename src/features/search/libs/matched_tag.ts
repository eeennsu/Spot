// 검색 시 매칭된 태그 라벨 산출(순수 함수). tags 는 JSON 배열 문자열.
// 질의에 부분 일치하는 첫 태그를 돌려준다. 파싱 실패 시 질의 자체를 표시.

export function matchedTagLabel(tagsRaw: string | null, query: string): string {
  const q = query.trim().toLowerCase();
  try {
    const arr = JSON.parse(tagsRaw ?? '');
    if (Array.isArray(arr)) {
      const hit = arr.find(
        (t): t is string => typeof t === 'string' && t.toLowerCase().includes(q),
      );
      if (hit) return `태그 "${hit}"`;
    }
  } catch {
    // noop — 아래 기본값 사용
  }
  return `태그 "${query.trim()}"`;
}
