// 바텀시트 제어 훅 — open state 대신 ref 주입 방식(woka_app useCommonBottomSheetModal 패턴).
// gorhom BottomSheetModal 은 등록 직후 동기 present() 가 무시될 수 있어 setTimeout(0)으로 다음 틱에 호출한다.
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useCallback, useRef } from 'react';

export function useBottomSheet() {
  const ref = useRef<BottomSheetModal>(null);
  const isOpenRef = useRef(false);

  const present = useCallback(() => {
    isOpenRef.current = true;
    setTimeout(() => ref.current?.present(), 0);
  }, []);

  const dismiss = useCallback(() => {
    if (!isOpenRef.current) return;
    isOpenRef.current = false;
    setTimeout(() => ref.current?.dismiss(), 0);
  }, []);

  return { ref, present, dismiss, isOpenRef };
}
