// 도형 정렬 스냅(피그마/PPT식 스마트 가이드) 계산.
// 이동 중 도형의 AABB edge/center 를 형제·도화지 기준선에 흡착시키고, 표시할 가이드선을 돌려준다.
// computeSnap 은 순수 worklet(UI 스레드) — reanimated 드래그 onUpdate 에서 호출.
import type { IShape } from '@entities/shape/types';

/** 스냅 대상 1개의 축정렬 경계(AABB) — 좌/중앙/우, 상/중앙/하. */
export interface ISnapRect {
  left: number;
  cx: number;
  right: number;
  top: number;
  cy: number;
  bottom: number;
}

/** 스냅 결과 — 흡착 반영된 중심 좌표 + 표시할 가이드선(보드 좌표, 없으면 -1). */
export interface ISnapResult {
  cx: number;
  cy: number;
  guideX: number;
  guideY: number;
}

/**
 * 회전 고려한 AABB 산출(JS) — 형제 스냅 대상 목록 생성용.
 * 회전 도형도 화면상 외접 사각형 기준으로 붙게 한다.
 */
export function shapeToSnapRect(s: IShape): ISnapRect {
  const r = (s.rotation * Math.PI) / 180;
  const halfW = (Math.abs(s.width * Math.cos(r)) + Math.abs(s.height * Math.sin(r))) / 2;
  const halfH = (Math.abs(s.width * Math.sin(r)) + Math.abs(s.height * Math.cos(r))) / 2;
  const cx = s.x + s.width / 2;
  const cy = s.y + s.height / 2;
  return { left: cx - halfW, cx, right: cx + halfW, top: cy - halfH, cy, bottom: cy + halfH };
}

/** 도화지 경계·중심을 스냅 대상으로 — 도형을 벽/가운데에 딱 맞추게. */
export function boardSnapRect(boardW: number, boardH: number): ISnapRect {
  return { left: 0, cx: boardW / 2, right: boardW, top: 0, cy: boardH / 2, bottom: boardH };
}

/**
 * 이동 도형(중심 cx/cy, 반폭 halfW·반높이 halfH)을 targets 기준선에 흡착.
 * threshold(보드 단위 = 화면px/scale) 내 가장 가까운 기준선으로 x·y 축 독립 흡착한다.
 * x: 이동 도형의 left/center/right ↔ 대상의 left/center/right 9쌍 비교.
 */
export function computeSnap(
  cx: number,
  cy: number,
  halfW: number,
  halfH: number,
  targets: ISnapRect[],
  threshold: number,
): ISnapResult {
  'worklet';
  const selfX = [cx - halfW, cx, cx + halfW]; // left, center, right
  const selfY = [cy - halfH, cy, cy + halfH]; // top, center, bottom

  let bestDx = threshold;
  let snapCx = cx;
  let guideX = -1;
  let bestDy = threshold;
  let snapCy = cy;
  let guideY = -1;

  for (let i = 0; i < targets.length; i++) {
    const t = targets[i];
    const tX = [t.left, t.cx, t.right];
    const tY = [t.top, t.cy, t.bottom];
    for (let a = 0; a < 3; a++) {
      for (let b = 0; b < 3; b++) {
        const dx = Math.abs(selfX[a] - tX[b]);
        if (dx < bestDx) {
          bestDx = dx;
          snapCx = cx + (tX[b] - selfX[a]);
          guideX = tX[b];
        }
        const dy = Math.abs(selfY[a] - tY[b]);
        if (dy < bestDy) {
          bestDy = dy;
          snapCy = cy + (tY[b] - selfY[a]);
          guideY = tY[b];
        }
      }
    }
  }

  return { cx: snapCx, cy: snapCy, guideX, guideY };
}
