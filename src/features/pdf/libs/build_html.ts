// 평면도 PDF용 HTML(순수 함수). 순수 도화지 캡처 이미지만 — 제목/날짜/테두리 없음.
// 비율 유지: contain 으로 한 페이지 안에 잘림·왜곡 없이 맞춘다.
interface BuildArgs {
  /** 도화지 캡처 data-uri(png) */
  image: string;
}

export default function buildPdfHtml({ image }: BuildArgs): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  html, body { margin: 0; padding: 0; height: 100%; }
  .wrap { display: flex; align-items: center; justify-content: center; width: 100%; height: 100vh; }
  /* max-* 만으로 원본 비율 유지하며 페이지 안에 맞춤(왜곡·잘림 없음). */
  img { max-width: 100%; max-height: 100%; object-fit: contain; display: block; }
</style>
</head>
<body>
  <div class="wrap"><img src="${image}" /></div>
</body>
</html>`;
}
