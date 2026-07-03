// 햅틱 유틸 — expo-haptics 래퍼. @shared/theme 의 haptics 토큰(문자열)으로 impact 발생.
// Android 전용. 실패해도 조용히 무시(핵심 기능 아님, 기기/설정에 따라 미지원 가능).
import * as Haptics from 'expo-haptics';

import { haptics } from '@shared/theme';

type HapticKey = keyof typeof haptics; // 'soft' | 'medium' | 'light' | 'primary'

/** 가벼운/중간 임팩트 — 선택·추가·경계 도달·스냅 등 즉각 피드백. */
export function utilHaptic(key: HapticKey = 'light'): void {
  const style = haptics[key]; // 'Soft' | 'Medium' | 'Light'
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle[style]).catch(() => {});
}

/** 성공/경고/에러 알림 햅틱 — 삭제 완료·저장·실패 안내. */
export function utilHapticNotify(type: 'success' | 'warning' | 'error' = 'success'): void {
  const map = { success: 'Success', warning: 'Warning', error: 'Error' } as const;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType[map[type]]).catch(() => {});
}
