// 안드로이드 네이티브 토스트 — 짧은 액션 피드백(추가/수정 등). Android 전용 앱이라 분기 없음.
import { ToastAndroid } from 'react-native';

/** 화면 하단 짧은 토스트. */
export function utilToast(message: string): void {
  ToastAndroid.show(message, ToastAndroid.SHORT);
}
