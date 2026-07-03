// 캔버스 튜토리얼 스텝 정의 — 자연스러운 사용 순서(Edit → Viewer).
// 문구는 한국어, "쓰기 쉬운가/흐름이 매끄러운가" 기준으로 짧고 친절하게.
import type { TutorialStep } from './types';

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'intro',
    title: '캔버스 사용법 익히기',
    body: '실제로 눌러보며 배우는 짧은 안내예요. 언제든 건너뛸 수 있어요.',
    mode: 'viewer',
  },
  {
    id: 'edit-toggle',
    title: '① 편집 모드 켜기',
    body: '오른쪽 위 “편집”을 누르면 도형을 배치·수정할 수 있어요. 다음을 누르면 편집 모드로 전환돼요.',
    mode: 'viewer',
    point: 'topRight',
  },
  {
    id: 'palette',
    title: '② 도형 추가',
    body: '아래 팔레트에서 도형을 골라 탭하면 캔버스에 추가돼요. 직접 하나 눌러보세요.',
    mode: 'edit',
    target: 'palette',
    interactive: true,
    advanceOn: 'shapeAdded',
  },
  {
    id: 'move-resize',
    title: '③ 옮기고 크기 바꾸기',
    body: '도형을 손가락으로 끌어 옮기고, 선택하면 나오는 모서리 손잡이로 크기를 바꿔요.',
    mode: 'edit',
  },
  {
    id: 'inspector',
    title: '④ 색·이름·자재',
    body: '도형을 탭하면 아래 패널이 열려요. 색과 이름을 바꾸고, 자재 랙이면 자재를 층으로 쌓아 관리해요.',
    mode: 'edit',
    target: 'inspector',
    effect: 'selectFirstShape',
  },
  {
    id: 'board-handle',
    title: '⑤ 도화지 크기',
    body: '배치 영역(도화지)은 오른쪽 아래 손잡이로 늘리거나 줄여요.',
    mode: 'edit',
    target: 'boardHandle',
  },
  {
    id: 'done',
    title: '⑥ 편집 끝내기',
    body: '다 됐으면 오른쪽 위 “완료”로 보기 모드로 돌아가요. 다음을 누르면 전환돼요.',
    mode: 'edit',
    point: 'topRight',
  },
  {
    id: 'viewer-tap',
    title: '⑦ 자재 열람·확대',
    body: '보기 모드에서 도형을 탭하면 등록된 자재를 볼 수 있어요. 두 손가락으로 확대·이동, 더블탭으로 원위치예요.',
    mode: 'viewer',
  },
  {
    id: 'search',
    title: '⑧ 검색',
    body: '오른쪽 위 검색으로 자재 이름·별칭을 찾아 해당 도형으로 바로 이동해요.',
    mode: 'viewer',
    point: 'topRight',
  },
  {
    id: 'learn',
    title: '⑨ 학습 모드',
    body: '“학습”으로 도형 위치·이름 맞히기 퀴즈를 풀며 익혀요.',
    mode: 'viewer',
    target: 'fabLearn',
  },
  {
    id: 'pdf',
    title: '⑩ PDF 내보내기',
    body: '“PDF”로 현재 평면도를 이미지로 담아 문서로 내보내요.',
    mode: 'viewer',
    target: 'fabPdf',
  },
  {
    id: 'outro',
    title: '준비 끝!',
    body: '이제 자유롭게 써보세요. 상단 “?” 버튼으로 언제든 이 안내를 다시 볼 수 있어요.',
    mode: 'viewer',
  },
];
