// 튜토리얼 대상 앵커 — 대상 요소의 화면 좌표를 측정해 store 에 등록한다.
// 반환한 { ref, onLayout } 를 대상 컴포넌트(View/Pressable/Animated.View)에 스프레드.
import { useCallback, useEffect, useRef } from 'react';

import { selectCurrentStep, useTutorialStore } from '../stores/tutorial';
import type { TutorialTargetKey } from '../types';

/** measureInWindow 를 지원하는 최소 인터페이스. */
type Measurable = {
  measureInWindow?: (cb: (x: number, y: number, w: number, h: number) => void) => void;
};

export function useTutorialAnchor(key: TutorialTargetKey) {
  const ref = useRef<Measurable | null>(null);
  const setRect = useTutorialStore(s => s.setRect);
  // 현재 스텝 대상이 이 키인지 — 그때만 측정(불필요한 측정·리렌더 방지).
  const isActiveTarget = useTutorialStore(s => selectCurrentStep(s)?.target === key);

  const measure = useCallback(() => {
    const node = ref.current;
    if (!node?.measureInWindow) return;
    node.measureInWindow((x, y, w, h) => {
      if (w > 0 || h > 0) setRect(key, { x, y, w, h });
    });
  }, [key, setRect]);

  // 대상 스텝 진입 시 측정. 모드 전환·마운트 직후라 한 프레임 뒤 위치가 확정된다.
  useEffect(() => {
    if (!isActiveTarget) return;
    const id = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(id);
  }, [isActiveTarget, measure]);

  // 레이아웃 변경(마운트/모드 전환/리사이즈) 시에도 갱신 — 튜토리얼 활성 중일 때만.
  const onLayout = useCallback(() => {
    if (useTutorialStore.getState().active) measure();
  }, [measure]);

  return { ref, onLayout };
}
