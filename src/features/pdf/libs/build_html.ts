// 평면도 PDF용 HTML 빌더(순수 함수). 캡처 이미지 + 도형별 자재 목록.
import type { IMaterial } from '@entities/material/types';

export interface IPdfSection {
  /** 도형 식별(별칭/라벨) */
  title: string;
  materials: IMaterial[];
}

interface BuildArgs {
  title: string;
  /** 캔버스 캡처 data-uri(png) */
  image: string;
  sections: IPdfSection[];
  /** 출력 일시 표시 문자열 */
  dateText: string;
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default function buildPdfHtml({ title, image, sections, dateText }: BuildArgs): string {
  const sectionsHtml = sections
    .map(sec => {
      const items = sec.materials.length
        ? sec.materials
            .map(
              (m, i) => `
              <li>
                <span class="layer">${i + 1}층</span>
                <span class="mname">${esc(m.name)}</span>
                ${m.description ? `<span class="mdesc">${esc(m.description)}</span>` : ''}
              </li>`,
            )
            .join('')
        : '<li class="muted">등록된 자재 없음</li>';
      return `
        <section class="rack">
          <h3>${esc(sec.title)}</h3>
          <ul>${items}</ul>
        </section>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, 'Inter', sans-serif; color: #1D1D1F; margin: 0; padding: 28px; }
  header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 16px; }
  h1 { font-size: 24px; margin: 0; }
  .date { color: #8A8A8E; font-size: 13px; }
  .plan { width: 100%; border: 1px solid #ECECEC; border-radius: 12px; overflow: hidden; margin-bottom: 24px; }
  .plan img { width: 100%; display: block; }
  h2.section-title { font-size: 17px; border-bottom: 1px solid #ECECEC; padding-bottom: 6px; }
  .rack { margin-bottom: 16px; page-break-inside: avoid; }
  .rack h3 { font-size: 15px; margin: 12px 0 6px; color: #4F97FF; }
  ul { list-style: none; margin: 0; padding: 0; }
  li { padding: 6px 0; border-bottom: 1px solid #F5F6F8; font-size: 14px; }
  .layer { display: inline-block; min-width: 32px; color: #8A8A8E; font-size: 12px; }
  .mname { font-weight: 600; }
  .mdesc { display: block; color: #8A8A8E; font-size: 13px; margin-left: 32px; }
  .muted { color: #C7C7CC; }
</style>
</head>
<body>
  <header>
    <h1>${esc(title)}</h1>
    <span class="date">${esc(dateText)}</span>
  </header>
  <div class="plan"><img src="${image}" /></div>
  <h2 class="section-title">자재 목록</h2>
  ${sectionsHtml || '<p class="muted">자재 도형이 없습니다.</p>'}
</body>
</html>`;
}
