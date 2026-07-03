// 평면도 PDF용 HTML 빌더(순수 함수). 도형으로 구성된 평면도 캡처 이미지만 담는다.
// (자재 목록은 앱 안에서 열람 — PDF 는 평면도 자체만.)
import { colors, radius, typography } from '@shared/theme';

interface BuildArgs {
  title: string;
  /** 캔버스 캡처 data-uri(png) */
  image: string;
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

export default function buildPdfHtml({ title, image, dateText }: BuildArgs): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  * { box-sizing: border-box; }
  body { font-family: sans-serif; color: ${colors.textPrimary}; margin: 0; padding: 28px; }
  header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 16px; }
  h1 { font-size: ${typography.projectTitle.fontSize}px; margin: 0; }
  .date { color: ${colors.textSecondary}; font-size: ${typography.metadata.fontSize}px; }
  .plan { width: 100%; border: 1px solid ${colors.divider}; border-radius: ${radius.comfortable}px; overflow: hidden; }
  .plan img { width: 100%; display: block; }
</style>
</head>
<body>
  <header>
    <h1>${esc(title)}</h1>
    <span class="date">${esc(dateText)}</span>
  </header>
  <div class="plan"><img src="${image}" /></div>
</body>
</html>`;
}
